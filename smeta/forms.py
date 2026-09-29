from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class RegisterForm(UserCreationForm):
    """Ro'yxatdan o'tish: faqat login va parol (email so'ralmaydi — foydalanuvchi talabi, 2026-09-29).
    Parolni unutganda: Telegram orqali kirish yoki admin parolni yangilaydi."""

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("username",)
