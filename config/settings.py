"""SmetaGo — Django sozlamalari.

Ishlab chiqish uchun standart qiymatlar yetarli. Serverga joylashda muhit
o'zgaruvchilarini bering: DJANGO_SECRET_KEY, DJANGO_DEBUG=0, DJANGO_ALLOWED_HOSTS.
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY", "dev-faqat-lokal-uchun-o-zgartiring-smetago"
)
DEBUG = os.environ.get("DJANGO_DEBUG", "1") == "1"
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "127.0.0.1,localhost,*").split(",")
CSRF_TRUSTED_ORIGINS = [
    o for o in os.environ.get("DJANGO_CSRF_TRUSTED_ORIGINS", "").split(",") if o
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "smeta",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "smeta.i18n.LanguageMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# Serverda statik fayllarni whitenoise beradi (DEBUG=0). Lokal muhitda o'rnatilmagan
# bo'lsa — o'tkazib yuboriladi, runserver statikani o'zi beradi.
try:
    import whitenoise  # noqa: F401
    MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")
except ImportError:
    pass

# Teskari proksi (Caddy/nginx) orqasida: HTTPS ni X-Forwarded-Proto dan bilamiz.
if os.environ.get("DJANGO_BEHIND_PROXY") == "1":
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    SESSION_COOKIE_SECURE = CSRF_COOKIE_SECURE = True
    # brauzer bu domenga faqat HTTPS orqali kirsin (subdomenlarsiz — umumiy nip.io/boshqa saytlarga ta'sir yo'q).
    # HTTP -> HTTPS yo'naltirishni Caddy qiladi, shuning uchun SECURE_SSL_REDIRECT kerak emas.
    SECURE_HSTS_SECONDS = 60 * 60 * 24 * 365
    # W005/W021 (subdomenlar, preload) ataylab yoqilmaydi: domen (nip.io) bizniki emas
    SILENCED_SYSTEM_CHECKS = ["security.W008", "security.W005", "security.W021"]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.template.context_processors.i18n",
                "smeta.context.site",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "uz"
LANGUAGES = [("uz", "O'zbekcha"), ("ru", "Русский")]
LANGUAGE_COOKIE_AGE = 60 * 60 * 24 * 365
TIME_ZONE = "Asia/Tashkent"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Email (parolni tiklash havolasi). Serverda .env orqali: DJANGO_EMAIL_HOST, DJANGO_EMAIL_PORT,
# DJANGO_EMAIL_HOST_USER, DJANGO_EMAIL_HOST_PASSWORD, DJANGO_EMAIL_USE_SSL / _TLS, DJANGO_DEFAULT_FROM_EMAIL.
# EMAIL_HOST berilmasa — xat yuborilmaydi, terminalga (konsolga) chiqariladi.
EMAIL_HOST = os.environ.get("DJANGO_EMAIL_HOST", "")
if EMAIL_HOST:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    EMAIL_PORT = int(os.environ.get("DJANGO_EMAIL_PORT", "587"))
    EMAIL_HOST_USER = os.environ.get("DJANGO_EMAIL_HOST_USER", "")
    EMAIL_HOST_PASSWORD = os.environ.get("DJANGO_EMAIL_HOST_PASSWORD", "")
    EMAIL_USE_SSL = os.environ.get("DJANGO_EMAIL_USE_SSL") == "1"
    EMAIL_USE_TLS = not EMAIL_USE_SSL and os.environ.get("DJANGO_EMAIL_USE_TLS", "1") == "1"
    EMAIL_TIMEOUT = 20
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = os.environ.get("DJANGO_DEFAULT_FROM_EMAIL", "SmetaGo <noreply@smetago.local>")
PASSWORD_RESET_TIMEOUT = 60 * 60 * 24  # tiklash havolasi 24 soat amal qiladi

# Telegram orqali kirish (Login Widget). Serverda .env: DJANGO_TELEGRAM_BOT_TOKEN, DJANGO_TELEGRAM_BOT_NAME
# (botning @ siz nomi). BotFather'da /setdomain — sayt domeni. Berilmasa, tugma ko'rinmaydi.
TELEGRAM_BOT_TOKEN = os.environ.get("DJANGO_TELEGRAM_BOT_TOKEN", "")
TELEGRAM_BOT_NAME = os.environ.get("DJANGO_TELEGRAM_BOT_NAME", "").lstrip("@")

LOGIN_URL = "login"
LOGIN_REDIRECT_URL = "obyekt_list"
LOGOUT_REDIRECT_URL = "obyekt_list"  # mehmon uchun bu bosh sahifa (sayt)
