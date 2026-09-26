"""PWA: manifest, service worker va oflayn sahifa.

Service worker ildizdan (/sw.js) beriladi, shunda butun saytni (scope "/") boshqaradi.
Uning versiyasi statik fayllar va shablonlar mazmunidan hisoblanadi: istalgan fayl
o'zgarsa sw.js ham o'zgaradi, brauzer yangi versiyani o'rnatib, eski keshni tozalaydi.
"""
import hashlib
import json
from pathlib import Path

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.template.loader import render_to_string
from django.templatetags.static import static
from django.views.decorators.cache import never_cache

from .i18n import current_lang, tr

APP_DIR = Path(__file__).resolve().parent
STATIC_DIR = APP_DIR / "static" / "smeta"

# Oflayn ishlash uchun oldindan keshlanadigan statik fayllar
PRECACHE_STATIC = [
    "smeta/css/style.css",
    "smeta/js/prefs.js",
    "smeta/js/pwa.js",
    "smeta/js/i18n.js",
    "smeta/js/data.js",
    "smeta/js/app.js",
    "smeta/icons/icon-192.png",
    "smeta/icons/icon.svg",
]

THEME_LIGHT = "#ffffff"
THEME_DARK = "#101512"
BACKGROUND = "#0c140f"


def _version():
    h = hashlib.sha256()
    files = sorted(STATIC_DIR.rglob("*")) + sorted((APP_DIR / "templates").rglob("*"))
    for f in files:
        if f.is_file():
            h.update(f.relative_to(APP_DIR).as_posix().encode())
            h.update(f.read_bytes())
    return h.hexdigest()[:12]


def manifest(request):
    lang = current_lang()
    icons = STATIC_DIR / "icons"
    data = {
        "id": "/",
        "name": "SmetaGo — " + tr("smeta kalkulyatori", lang=lang),
        "short_name": "SmetaGo",
        "description": tr("Xonalarni o'lchang, katalogdan tanlang — material, narx va ish haqi bilan tayyor smeta.", lang=lang),
        "lang": lang,
        "dir": "ltr",
        "start_url": "/?manba=ilova",
        "scope": "/",
        "display": "standalone",
        "orientation": "any",
        "background_color": BACKGROUND,
        "theme_color": BACKGROUND,
        "categories": ["business", "productivity", "utilities"],
        "icons": [
            {"src": static(f"smeta/icons/{name}"), "sizes": size, "type": "image/png", "purpose": purpose}
            for name, size, purpose in (
                ("icon-192.png", "192x192", "any"),
                ("icon-512.png", "512x512", "any"),
                ("maskable-192.png", "192x192", "maskable"),
                ("maskable-512.png", "512x512", "maskable"),
            )
            if (icons / name).exists()
        ],
        "shortcuts": [
            {"name": tr("Obyektlar", lang=lang), "url": "/?manba=ilova",
             "icons": [{"src": static("smeta/icons/icon-192.png"), "sizes": "192x192"}]},
        ],
    }
    resp = JsonResponse(data, json_dumps_params={"ensure_ascii": False})
    resp["Content-Type"] = "application/manifest+json"
    return resp


@never_cache
def service_worker(request):
    precache = [static(p) for p in PRECACHE_STATIC] + ["/offline/"]
    js = render_to_string("smeta/sw.js", {
        "version": _version(),
        "precache": json.dumps(precache),
    })
    resp = HttpResponse(js, content_type="application/javascript; charset=utf-8")
    resp["Service-Worker-Allowed"] = "/"
    return resp


def offline(request):
    return render(request, "smeta/offline.html")


PWA_CONTEXT = {"pwa_theme_light": THEME_LIGHT, "pwa_theme_dark": THEME_DARK}


def pwa_context(request):
    """Shablonlar uchun: theme-color qiymatlari (context processor)."""
    return PWA_CONTEXT
