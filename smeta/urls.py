from django.contrib.auth import views as auth_views
from django.urls import path

from . import views

urlpatterns = [
    path("", views.obyekt_list, name="obyekt_list"),
    path("obyekt/yangi/", views.obyekt_create, name="obyekt_create"),
    path("obyekt/<int:pk>/", views.obyekt_app, name="obyekt_app"),
    path("obyekt/<int:pk>/nusxa/", views.obyekt_copy, name="obyekt_copy"),
    path("obyekt/<int:pk>/ochirish/", views.obyekt_delete, name="obyekt_delete"),
    path("api/obyekt/<int:pk>/state/", views.obyekt_state, name="obyekt_state"),
    path("api/obyekt/<int:pk>/excel/", views.obyekt_excel, name="obyekt_excel"),
    path("kirish/", auth_views.LoginView.as_view(), name="login"),
    path("chiqish/", auth_views.LogoutView.as_view(), name="logout"),
    path("royxatdan-otish/", views.register, name="register"),
]
