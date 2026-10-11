from django.conf import settings

from .guest import is_guest
from .pwa import THEME_DARK, THEME_LIGHT


def site(request):
    """Barcha shablonlar uchun umumiy qiymatlar (yagona context processor)."""
    return {
        # "Telegram orqali kirish" — bot tokeni va nomi berilgan bo'lsa
        "tg_bot": settings.TELEGRAM_BOT_NAME if settings.TELEGRAM_BOT_TOKEN else "",
        # o'rnatilgan ilovada holat paneli rangi (theme-color)
        "pwa_theme_light": THEME_LIGHT,
        "pwa_theme_dark": THEME_DARK,
        # loginsiz avtomatik hisob: "Chiqish" ko'rsatilmaydi (chiqsa obyektlariga qaytib kira olmaydi)
        "is_guest": is_guest(request.user),
    }
