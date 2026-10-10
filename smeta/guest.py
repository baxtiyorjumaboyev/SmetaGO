"""Loginsiz ishlash: mehmonga birinchi saqlashda avtomatik hisob ochiladi.

Hisob faqat obyekt yaratilganda (POST) ochiladi — oddiy sahifa ko'rish yoki botlar bazada hisob qoldirmaydi.
Mehmon hisobi parolsiz, sessiya cookie'si bilan bog'langan; shu brauzerda bir yil saqlanadi.
"""
import secrets

from django.contrib.auth import get_user_model, login

GUEST_PREFIX = "mehmon-"
GUEST_SESSION_AGE = 365 * 24 * 3600


def is_guest(user):
    return user.is_authenticated and user.username.startswith(GUEST_PREFIX)


def ensure_user(request):
    """Kirgan foydalanuvchini qaytaradi; mehmon bo'lsa — yangi parolsiz hisob ochib, sessiyaga kiritadi."""
    if request.user.is_authenticated:
        return request.user
    user = get_user_model().objects.create_user(GUEST_PREFIX + secrets.token_hex(5))  # parol — ishlatilmaydi
    login(request, user, backend="django.contrib.auth.backends.ModelBackend")
    request.session.set_expiry(GUEST_SESSION_AGE)
    return user
