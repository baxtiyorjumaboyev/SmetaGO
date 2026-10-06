"""Telefon raqami bilan kirish va parolni tiklash (telefon yoki login orqali).

Tiklash:
  1. Foydalanuvchi telefon yoki loginni yozadi (/parol-tiklash/).
  2. Hisob Telegram'ga ulangan va bot sozlangan bo'lsa — 6 xonali kod Telegram'ga yuboriladi; kod shu brauzer
     sessiyasiga bog'langan, 10 daqiqa amal qiladi, 5 marta xato kiritilsa bekor bo'ladi.
  3. Aks holda — so'rov administratorga (admin → "Parolni tiklash so'rovlari"), u parolni yangilab beradi.
Javob har doim bir xil: hisob bor-yo'qligi oshkor bo'lmaydi. So'rovlar soni cheklangan (qiymat va sessiya bo'yicha).
"""
import hashlib
import hmac
import json
import logging
import re
import secrets
import time
import urllib.request

from django import forms
from django.conf import settings
from django.contrib.auth import get_user_model, login
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.forms import SetPasswordForm
from django.core.cache import cache
from django.shortcuts import redirect, render

from .i18n import tr
from .models import Profile, ResetRequest

log = logging.getLogger(__name__)
CODE_TTL = 10 * 60
CODE_TRIES = 5
LIMIT_PER_HOUR = 3


def normalize_phone(value):
    """'+998 90 123-45-67', '998901234567', '901234567' -> '998901234567'; noto'g'ri bo'lsa None."""
    digits = re.sub(r"\D", "", str(value or ""))
    if len(digits) == 9:
        digits = "998" + digits
    return digits if len(digits) == 12 and digits.startswith("998") else None


class LoginBackend(ModelBackend):
    """Kirish: login yoki telefon raqami. Avval login sifatida, topilmasa — telefon sifatida tekshiriladi."""

    def authenticate(self, request, username=None, password=None, **kw):
        user = super().authenticate(request, username=username, password=password, **kw)
        if user is None and username:
            phone = normalize_phone(username)
            prof = Profile.objects.select_related("user").filter(phone=phone).first() if phone else None
            if prof:
                user = super().authenticate(request, username=prof.user.get_username(), password=password, **kw)
        return user


def _find_user(method, value):
    User = get_user_model()
    if method == "phone":
        prof = Profile.objects.select_related("user").filter(phone=value).first()
        user = prof.user if prof else None
    else:
        user = User.objects.filter(username__iexact=value).first()
    return user if user and user.is_active else None


def _code_hash(code, salt):
    return hmac.new(settings.SECRET_KEY.encode(), f"{salt}:{code}".encode(), hashlib.sha256).hexdigest()


def send_telegram_code(chat_id, code):
    """Bot orqali kod yuborish. Muvaffaqiyatli bo'lsa True (bot sozlanmagan yoki xato — False)."""
    token = settings.TELEGRAM_BOT_TOKEN
    if not token:
        return False
    text = tr("SmetaGo: parolni tiklash kodi — {0}. Kod 10 daqiqa amal qiladi. Siz so'ramagan bo'lsangiz, e'tibor bermang.", code)
    req = urllib.request.Request(f"https://api.telegram.org/bot{token}/sendMessage",
                                 data=json.dumps({"chat_id": chat_id, "text": text}).encode(),
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=8) as r:
            return json.loads(r.read()).get("ok") is True
    except Exception:  # tarmoq, bot bloklangan va h.k. — administrator yo'liga o'tiladi
        log.warning("Telegram kod yuborilmadi", exc_info=True)
        return False


def _limited(request, key):
    """Soatiga LIMIT_PER_HOUR tadan ko'p so'rov — rad (qiymat va sessiya bo'yicha alohida)."""
    if not request.session.session_key:
        request.session.save()
    hit = False
    for k in (f"rr:v:{key}", f"rr:s:{request.session.session_key}"):
        n = cache.get(k, 0)
        if n >= LIMIT_PER_HOUR:
            hit = True
        cache.set(k, n + 1, 3600)
    return hit


class ResetRequestForm(forms.Form):
    method = forms.ChoiceField(choices=ResetRequest.METHODS, initial="phone")
    phone = forms.CharField(required=False, max_length=32)
    login = forms.CharField(required=False, max_length=64)

    def clean(self):
        d = super().clean()
        if d.get("method") == "phone":
            phone = normalize_phone(d.get("phone"))
            if not phone:
                self.add_error("phone", tr("Telefon raqamini to'liq kiriting: +998 90 123 45 67"))
            d["value"] = phone
        else:
            value = (d.get("login") or "").strip()
            if not value:
                self.add_error("login", tr("Loginni kiriting."))
            d["value"] = value
        return d


def reset_request(request):
    form = ResetRequestForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        method, value = form.cleaned_data["method"], form.cleaned_data["value"]
        if _limited(request, f"{method}:{value.lower()}"):
            form.add_error(None, tr("Juda ko'p urinish. Bir soatdan keyin qayta urinib ko'ring."))
        else:
            user = _find_user(method, value)
            tg = getattr(user, "telegram", None) if user else None
            sent = False
            if tg and settings.TELEGRAM_BOT_TOKEN:
                code, salt = f"{secrets.randbelow(10**6):06d}", secrets.token_hex(8)
                sent = send_telegram_code(tg.tg_id, code)
                if sent:
                    request.session["pw_reset"] = {"uid": user.pk, "salt": salt, "hash": _code_hash(code, salt),
                                                   "exp": time.time() + CODE_TTL, "tries": 0}
            if not sent:
                ResetRequest.objects.create(user=user, method=method, identifier=value[:64])
            return redirect("password_reset_done")
    return render(request, "registration/parol_tiklash.html", {"form": form})


def reset_done(request):
    """So'rov qabul qilindi: Telegram kodi (bot sozlangan bo'lsa) yoki administrator javobi."""
    st = request.session.get("pw_reset")
    form = SetPasswordForm(get_user_model()(), request.POST or None)  # faqat maydonlar uchun
    error = ""
    if request.method == "POST":
        if not st or st["exp"] < time.time() or st["tries"] >= CODE_TRIES:
            request.session.pop("pw_reset", None)
            error = tr("Kod eskirgan yoki noto'g'ri. Qaytadan so'rov yuboring.")
        elif not hmac.compare_digest(_code_hash(request.POST.get("code", "").strip(), st["salt"]), st["hash"]):
            st["tries"] += 1
            request.session["pw_reset"] = st
            error = tr("Kod noto'g'ri. Qolgan urinishlar: {0}", CODE_TRIES - st["tries"])
        else:
            user = get_user_model().objects.get(pk=st["uid"])
            form = SetPasswordForm(user, request.POST)
            if form.is_valid():
                form.save()
                request.session.pop("pw_reset", None)
                ResetRequest.objects.filter(user=user, handled=False).update(handled=True)
                login(request, user, backend="django.contrib.auth.backends.ModelBackend")
                return redirect("password_reset_complete")
    return render(request, "registration/parol_tiklash_yuborildi.html", {
        "form": form, "error": error, "code_mode": bool(settings.TELEGRAM_BOT_TOKEN)})


def reset_complete(request):
    return render(request, "registration/parol_tiklash_tayyor.html")
