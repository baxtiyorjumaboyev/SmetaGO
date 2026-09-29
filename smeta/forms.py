from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from .i18n import tr


class RegisterForm(UserCreationForm):
    """Ro'yxatdan o'tish: email majburiy — parolni unutganda tiklash havolasi shunga yuboriladi."""

    email = forms.EmailField(required=True)

    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("username", "email")

    def clean_email(self):
        email = self.cleaned_data["email"].strip()
        if User.objects.filter(email__iexact=email).exists():
            raise forms.ValidationError(tr("Bu email bilan hisob allaqachon bor."))
        return email
