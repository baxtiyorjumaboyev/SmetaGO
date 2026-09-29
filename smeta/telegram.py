"""Telegram orqali kirish (Telegram Login Widget).

Telegram foydalanuvchini tasdiqlagach, brauzerni `auth_url` ga ma'lumot bilan yuboradi:
id, first_name, last_name, username, photo_url, auth_date, hash. `hash` — bot tokeni bilan imzo:
    secret = SHA256(token);  hash = HMAC_SHA256(secret, "kalit=qiymat" qatorlari, alifbo tartibida, "\n" bilan)
Imzo mos kelmasa yoki ma'lumot eski bo'lsa (24 soatdan ortiq) — rad etiladi.
https://core.telegram.org/widgets/login#checking-authorization
"""
import hashlib
import hmac
import time

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import get_user_model, login
from django.db import transaction
from django.http import HttpResponseForbidden, HttpResponseNotFound
from django.shortcuts import redirect

from .i18n import tr
from .models import TelegramAccount

MAX_AGE = 60 * 60 * 24


def verify(data, token, now=None):
    """Telegram ma'lumoti imzosini tekshiradi. To'g'ri bo'lsa — ma'lumot (hash siz), aks holda None."""
    data = {k: v for k, v in data.items()}
    received = data.pop("hash", "")
    if not received or not token or "id" not in data or "auth_date" not in data:
        return None
    check = "\n".join(f"{k}={data[k]}" for k in sorted(data))
    secret = hashlib.sha256(token.encode()).digest()
    expected = hmac.new(secret, check.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, received):
        return None
    try:
        age = (now or time.time()) - int(data["auth_date"])
        int(data["id"])
    except ValueError:
        return None
    if age > MAX_AGE or age < -300:
        return None
    return data


def _new_username(data):
    User = get_user_model()
    base = (data.get("username") or f"tg{data['id']}")[:140]
    name, i = base, 1
    while User.objects.filter(username__iexact=name).exists():
        i += 1
        name = f"{base}{i}"
    return name


def telegram_auth(request, nonce):
    """Widget qaytaradigan manzil: kirish, yangi hisob yoki (kirgan bo'lsa) hisobga Telegram'ni ulash.

    `nonce` — tugma ko'rsatilganda shu sessiyaga yozilgan bir martalik kalit (templatetags/smeta_auth.py).
    U mos kelmasa rad etiladi: aks holda begona tayyorlagan havola (imzosi to'g'ri bo'lsa ham) kirgan
    foydalanuvchiga boshqa odamning Telegramini ulab yuborardi (hisobni egallash) yoki login CSRF bo'lardi.
    """
    if not settings.TELEGRAM_BOT_TOKEN:
        return HttpResponseNotFound()
    expected = request.session.pop("tg_nonce", None)
    owner = request.session.pop("tg_nonce_uid", None)
    uid = request.user.pk if request.user.is_authenticated else None
    if not expected or not hmac.compare_digest(str(nonce), expected) or owner != uid:
        return HttpResponseForbidden(tr("Havola eskirgan yoki boshqa sahifadan ochilgan. Sahifani yangilab, qaytadan urinib ko'ring."))
    data = verify(request.GET.dict(), settings.TELEGRAM_BOT_TOKEN)
    if data is None:
        return HttpResponseForbidden(tr("Telegram ma'lumoti tasdiqlanmadi. Qaytadan urinib ko'ring."))
    tg_id = int(data["id"])
    info = {"username": data.get("username", "")[:64], "first_name": data.get("first_name", "")[:128]}
    acct = TelegramAccount.objects.select_related("user").filter(tg_id=tg_id).first()

    if request.user.is_authenticated:  # mavjud hisobga ulash
        if acct and acct.user_id != request.user.pk:
            messages.error(request, tr("Bu Telegram boshqa hisobga ulangan."))
        elif not acct and hasattr(request.user, "telegram"):
            messages.error(request, tr("Hisobingizga boshqa Telegram ulangan."))
        else:
            TelegramAccount.objects.update_or_create(tg_id=tg_id, defaults={"user": request.user, **info})
            messages.success(request, tr("Telegram hisobingizga ulandi."))
        return redirect("obyekt_list")

    if acct:
        if not acct.user.is_active:
            return HttpResponseForbidden(tr("Hisob o'chirilgan."))
        for k, v in info.items():
            setattr(acct, k, v)
        acct.save()
        user = acct.user
    else:  # birinchi kirish — yangi hisob (paroli yo'q, faqat Telegram orqali)
        User = get_user_model()
        with transaction.atomic():
            user = User(username=_new_username(data), first_name=info["first_name"][:150],
                        last_name=data.get("last_name", "")[:150])
            user.set_unusable_password()
            user.save()
            TelegramAccount.objects.create(user=user, tg_id=tg_id, **info)
    login(request, user, backend="django.contrib.auth.backends.ModelBackend")
    return redirect("obyekt_list")
