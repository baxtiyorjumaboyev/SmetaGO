from django.conf import settings


def site(request):
    """Shablonlar uchun umumiy bayroqlar."""
    return {
        # "Parolni unutdingizmi?" faqat xat yuborish sozlangan bo'lsa ko'rsatiladi
        "email_ready": bool(settings.EMAIL_HOST),
        # "Telegram orqali kirish" — bot tokeni va nomi berilgan bo'lsa
        "tg_bot": settings.TELEGRAM_BOT_NAME if settings.TELEGRAM_BOT_TOKEN else "",
    }
