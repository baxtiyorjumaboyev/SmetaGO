from django.conf import settings

from .pwa import THEME_DARK, THEME_LIGHT


def site(request):
    """Barcha shablonlar uchun umumiy qiymatlar (yagona context processor)."""
    return {
        # "Parolni unutdingizmi?" faqat xat yuborish sozlangan bo'lsa ko'rsatiladi
        "email_ready": bool(settings.EMAIL_HOST),
        # "Telegram orqali kirish" — bot tokeni va nomi berilgan bo'lsa
        "tg_bot": settings.TELEGRAM_BOT_NAME if settings.TELEGRAM_BOT_TOKEN else "",
        # o'rnatilgan ilovada holat paneli rangi (theme-color)
        "pwa_theme_light": THEME_LIGHT,
        "pwa_theme_dark": THEME_DARK,
    }
