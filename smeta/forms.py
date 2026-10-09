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
        import re
        from .recovery import normalize_phone

        raw = self.cleaned_data.get("phone", "").strip()
        if not raw:
            return None
        if re.search(r"[a-zA-Zа-яА-ЯёЁ]", raw):
            raise forms.ValidationError(tr("Telefon raqamida harflar kiritilishi mumkin emas. Faqat raqamlar kiriting."))
        if not re.fullmatch(r"^\+?[\d\s\-\(\)\.]+$", raw):
            raise forms.ValidationError(tr("Telefon raqamida noto'g'ri belgilar bor. Namuna: +998 90 123 45 67"))
        phone = normalize_phone(raw)
        if not phone:
            raise forms.ValidationError(tr("Telefon raqamini to'liq kiriting: +998 90 123 45 67"))
        op = phone[3:5] if len(phone) >= 5 else ""
        valid_ops = {"90", "91", "93", "94", "95", "97", "98", "99", "88", "33", "77", "50", "55", "71", "78", "20"}
        if op not in valid_ops:
            raise forms.ValidationError(tr("O'zbekiston operator kodi noto'g'ri. Namuna: +998 90 123 45 67"))
        if Profile.objects.filter(phone=phone).exists():
            raise forms.ValidationError(tr("Bu telefon raqami bilan hisob allaqachon bor."))
        return phone

    @transaction.atomic
    def save(self, commit=True):
        user = super().save(commit=commit)
        if commit:
            Profile.objects.create(user=user, phone=self.cleaned_data.get("phone"))
        return user
