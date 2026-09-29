from django.contrib.auth import views as auth_views
from django.urls import path, reverse_lazy

from . import telegram, views

# Parolni tiklash: email -> bir martalik havola -> yangi parol (Django'ning o'z mexanizmi)
R = "registration/"

urlpatterns = [
    path("", views.obyekt_list, name="obyekt_list"),
    path("obyekt/yangi/", views.obyekt_create, name="obyekt_create"),
    path("namuna/", views.demo, name="demo"),
    path("yordam/", views.help_page, name="help"),
    path("maxfiylik/", views.privacy_page, name="privacy"),
    path("obyekt/<int:pk>/", views.obyekt_app, name="obyekt_app"),
    path("obyekt/<int:pk>/nusxa/", views.obyekt_copy, name="obyekt_copy"),
    path("obyekt/<int:pk>/ochirish/", views.obyekt_delete, name="obyekt_delete"),
    path("api/obyekt/<int:pk>/state/", views.obyekt_state, name="obyekt_state"),
    path("api/obyekt/<int:pk>/excel/", views.obyekt_excel, name="obyekt_excel"),
    path("api/excel/", views.demo_excel, name="demo_excel"),
    path("kirish/", auth_views.LoginView.as_view(), name="login"),
    path("chiqish/", auth_views.LogoutView.as_view(), name="logout"),
    path("kirish/telegram/<str:nonce>/", telegram.telegram_auth, name="telegram_auth"),
    path("royxatdan-otish/", views.register, name="register"),
    path("parol-tiklash/", auth_views.PasswordResetView.as_view(
        template_name=R + "parol_tiklash.html",
        email_template_name=R + "parol_tiklash_email.txt",
        subject_template_name=R + "parol_tiklash_mavzu.txt",
        success_url=reverse_lazy("password_reset_done")), name="password_reset"),
    path("parol-tiklash/yuborildi/", auth_views.PasswordResetDoneView.as_view(
        template_name=R + "parol_tiklash_yuborildi.html"), name="password_reset_done"),
    path("parol-tiklash/<uidb64>/<token>/", auth_views.PasswordResetConfirmView.as_view(
        template_name=R + "parol_tiklash_yangi.html",
        success_url=reverse_lazy("password_reset_complete")), name="password_reset_confirm"),
    path("parol-tiklash/tayyor/", auth_views.PasswordResetCompleteView.as_view(
        template_name=R + "parol_tiklash_tayyor.html"), name="password_reset_complete"),
]
