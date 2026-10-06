from django.contrib.auth import views as auth_views
from django.urls import path, reverse_lazy

from . import telegram, views


def _reset(view, template, **kw):
    """Parolni tiklash sahifasi (Django'ning o'z mexanizmi): email -> bir martalik havola -> yangi parol."""
    return view.as_view(template_name=f"registration/parol_tiklash{template}.html", **kw)


urlpatterns = [
    # 1. Ommaviy sahifalar
    path("", views.obyekt_list, name="obyekt_list"),  # mehmonga — sayt, kirganga — boshqaruv paneli
    path("namuna/", views.demo, name="demo"),
    path("yordam/", views.help_page, name="help"),
    path("maxfiylik/", views.privacy_page, name="privacy"),

    # 2. Kabinet
    path("loyihalar/", views.loyihalar, name="loyihalar"),
    path("obyekt/<int:pk>/", views.obyekt_app, name="obyekt_app"),

    # 3. Obyekt amallari (POST)
    path("obyekt/yangi/", views.obyekt_create, name="obyekt_create"),
    path("obyekt/<int:pk>/nusxa/", views.obyekt_copy, name="obyekt_copy"),
    path("obyekt/<int:pk>/ochirish/", views.obyekt_delete, name="obyekt_delete"),

    # 4. API
    path("api/obyekt/<int:pk>/state/", views.obyekt_state, name="obyekt_state"),
    path("api/obyekt/<int:pk>/excel/", views.obyekt_excel, name="obyekt_excel"),
    path("api/excel/", views.demo_excel, name="demo_excel"),

    # 5. Hisob
    path("kirish/", views.Login.as_view(), name="login"),
    path("chiqish/", auth_views.LogoutView.as_view(), name="logout"),
    path("royxatdan-otish/", views.register, name="register"),
    path("kirish/telegram/<str:nonce>/", telegram.telegram_auth, name="telegram_auth"),
    # parolni tiklash — faqat emaili bor (admin qo'shgan) hisoblar uchun, xat yuborish sozlangan bo'lsa
    path("parol-tiklash/", _reset(auth_views.PasswordResetView, "",
         email_template_name="registration/parol_tiklash_email.txt",
         subject_template_name="registration/parol_tiklash_mavzu.txt",
         success_url=reverse_lazy("password_reset_done")), name="password_reset"),
    path("parol-tiklash/yuborildi/", _reset(auth_views.PasswordResetDoneView, "_yuborildi"), name="password_reset_done"),
    path("parol-tiklash/<uidb64>/<token>/", _reset(auth_views.PasswordResetConfirmView, "_yangi",
         success_url=reverse_lazy("password_reset_complete")), name="password_reset_confirm"),
    path("parol-tiklash/tayyor/", _reset(auth_views.PasswordResetCompleteView, "_tayyor"), name="password_reset_complete"),
]
