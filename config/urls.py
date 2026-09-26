from django.contrib import admin
from django.urls import include, path

from smeta import pwa

urlpatterns = [
    # PWA: ildizdan berilishi shart (service worker butun saytni boshqarishi uchun)
    path("sw.js", pwa.service_worker, name="service_worker"),
    path("manifest.webmanifest", pwa.manifest, name="manifest"),
    path("offline/", pwa.offline, name="offline"),
    path("admin/", admin.site.urls),
    path("i18n/", include("django.conf.urls.i18n")),  # set_language: UZ / RU tugmalari
    path("", include("smeta.urls")),
]
