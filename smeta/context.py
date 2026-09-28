from django.conf import settings


def site(request):
    """Shablonlar uchun umumiy bayroqlar."""
    # "Parolni unutdingizmi?" faqat xat yuborish sozlangan bo'lsa ko'rsatiladi
    return {"email_ready": bool(settings.EMAIL_HOST)}
