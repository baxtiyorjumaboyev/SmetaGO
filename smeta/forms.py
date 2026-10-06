from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.db import transaction

from .i18n import tr
from .models import Profile


class RegisterForm(UserCreationForm):
    """Ro'yxatdan o'tish: login, parol va ixtiyoriy telefon raqami (email so'ralmaydi — foydalanuvchi talabi).
    Telefon bilan keyin kirish ham mumkin; parolni unutganda shu raqam orqali tiklash so'rovi yuboriladi."""

    phone = forms.CharField(required=False, max_length=32)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("username",)

    def clean_phone(self):
        from .recovery import normalize_phone

        raw = self.cleaned_data.get("phone", "").strip()
        if not raw:
            return None
        phone = normalize_phone(raw)
        if not phone:
            raise forms.ValidationError(tr("Telefon raqamini to'liq kiriting: +998 90 123 45 67"))
        if Profile.objects.filter(phone=phone).exists():
            raise forms.ValidationError(tr("Bu telefon raqami bilan hisob allaqachon bor."))
        return phone

    @transaction.atomic
    def save(self, commit=True):
        user = super().save(commit=commit)
        if commit:
            Profile.objects.create(user=user, phone=self.cleaned_data.get("phone"))
        return user
