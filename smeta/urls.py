from django.contrib.auth import views as auth_views
from django.urls import path

from . import recovery, telegram, views


urlpatterns = [
    # 1. Ommaviy sahifalar
    path("", views.obyekt_list, name="obyekt_list"),  # mehmonga — sayt, kirganga — boshqaruv paneli
    path("app/", views.demo, name="app"),
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
    # parolni tiklash — telefon yoki login orqali: Telegram kodi yoki administratorga so'rov (smeta/recovery.py)
    path("parol-tiklash/", recovery.reset_request, name="password_reset"),
    path("parol-tiklash/yuborildi/", recovery.reset_done, name="password_reset_done"),
    path("parol-tiklash/tayyor/", recovery.reset_complete, name="password_reset_complete"),
]
