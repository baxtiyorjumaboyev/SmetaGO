import secrets

from django import template
from django.urls import reverse

register = template.Library()


@register.simple_tag(takes_context=True)
def tg_auth_url(context):
    """Telegram widget qaytadigan manzil, sessiyaga bog'langan bir martalik kalit bilan.

    Kalit (nonce) va uni olgan foydalanuvchi sessiyada saqlanadi; /kirish/telegram/<nonce>/ faqat shu
    sessiyada, shu foydalanuvchi uchun qabul qilinadi — begona tayyorlagan havola orqali boshqa odamning
    Telegramini hisobga ulash yoki boshqa hisobga kiritib qo'yish (login CSRF) mumkin emas.
    """
    request = context["request"]
    uid = request.user.pk if request.user.is_authenticated else None
    nonce = request.session.get("tg_nonce")
    if not nonce or request.session.get("tg_nonce_uid") != uid:
        nonce = secrets.token_urlsafe(24)
        request.session["tg_nonce"] = nonce
        request.session["tg_nonce_uid"] = uid
    return request.build_absolute_uri(reverse("telegram_auth", args=[nonce]))
