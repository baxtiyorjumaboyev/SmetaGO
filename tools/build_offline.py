"""SmetaGo oflayn ilovasini bitta HTML faylga yig'adi: offline/SmetaGo.html

Fayl serversiz ishlaydi (telefon brauzerida yoki Android APK ichida):
CSS, JavaScript (i18n, data, calc, app + offline/src/store.js), logotip va ma'lumotnoma
(katalog, narxlar, xona turlari — o'zbekcha va ruscha) faylning ichiga joylanadi.

Versiya: mazmun o'zgarganda offline/version.json dagi "version" oshadi (aks holda o'zgarmaydi) —
telefondagi APK shu orqali yangilanishni o'zi yuklab oladi.

Ma'lumotnoma manbasi:
  python tools/build_offline.py                 # ishlab turgan saytdan (admin panelda tahrirlangan eng so'nggi narxlar)
  python tools/build_offline.py --local         # shu kompyuterdagi bazadan (db.sqlite3)
  python tools/build_offline.py --url https://...
"""
import argparse
import base64
import hashlib
import html
import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATIC = ROOT / "smeta" / "static" / "smeta"
SRC = ROOT / "offline" / "src"
OUT = ROOT / "offline" / "SmetaGo.html"
# Android ilova shu faylni GitHub'dan tekshiradi: versiya oshgan bo'lsa yangi SmetaGo.html ni yuklab oladi (sha256 bilan)
VERSION_FILE = ROOT / "offline" / "version.json"
DEFAULT_URL = "https://smetago.169-58-130-201.nip.io"


def ref_from_site(base, lang):
    """Namuna sahifasidagi <script id="smeta-ref"> — sayt bergan ma'lumotnoma."""
    req = urllib.request.Request(base.rstrip("/") + "/namuna/", headers={"Cookie": f"django_language={lang}", "User-Agent": "SmetaGo-build"})
    page = urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
    m = re.search(r'<script id="smeta-ref" type="application/json">(.*?)</script>', page, re.S)
    if not m:
        raise SystemExit(f"{base}: smeta-ref topilmadi ({lang})")
    return json.loads(html.unescape(m.group(1)) if "&quot;" in m.group(1) else m.group(1))


def ref_from_db(lang):
    sys.path.insert(0, str(ROOT))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
    import django
    django.setup()
    from smeta.malumotnoma import build_reference
    return build_reference(lang)


def safe_script(text, name):
    """<script> ichida "</script" bo'lmasligi kerak — aks holda HTML parser skriptni shu yerda yopadi."""
    fixed = re.sub(r"</(script)", r"<\\/\1", text, flags=re.I)
    if fixed != text:
        print(f"  {name}: '</script' ekranlandi")
    return fixed


def json_for_script(obj):
    # JSON <script type="application/json"> ichida: "<" ni < qilamiz (</script> xavfi yo'q)
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("<", "\\u003c")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--local", action="store_true", help="ma'lumotnomani lokal bazadan olish")
    ap.add_argument("--url", default=DEFAULT_URL, help="ma'lumotnoma olinadigan sayt")
    a = ap.parse_args()

    if a.local:
        refs = {l: ref_from_db(l) for l in ("uz", "ru")}
    else:
        refs = {l: ref_from_site(a.url, l) for l in ("uz", "ru")}
    for l, r in refs.items():
        print(f"ma'lumotnoma {l}: katalog {sum(len(g['items']) for g in r['catalog'])} element, narxlar {len(r['prices'])}")

    # qator oxirlari doim LF: fayl baytlari (sha256) Windows'da ham, GitHub'da ham bir xil bo'lsin
    read = lambda p: p.read_text(encoding="utf-8").replace("\r\n", "\n")
    logo = "data:image/svg+xml;base64," + base64.b64encode((STATIC / "icons" / "logo.svg").read_bytes().replace(b"\r\n", b"\n")).decode()
    parts = {
        "/*@@PREFS_JS@@*/": safe_script(read(STATIC / "js" / "prefs.js"), "prefs.js"),
        "/*@@CSS@@*/": read(STATIC / "css" / "style.css").replace("</style", "<\\/style"),
        "/*@@I18N_JS@@*/": safe_script(read(STATIC / "js" / "i18n.js"), "i18n.js"),
        "/*@@DATA_JS@@*/": safe_script(read(STATIC / "js" / "data.js"), "data.js"),
        "/*@@CALC_JS@@*/": safe_script(read(STATIC / "js" / "calc.js"), "calc.js"),
        "/*@@STORE_JS@@*/": safe_script(read(SRC / "store.js"), "store.js"),
        "/*@@APP_JS@@*/": safe_script(read(STATIC / "js" / "app.js"), "app.js"),
        "@@REF_UZ@@": json_for_script(refs["uz"]),
        "@@REF_RU@@": json_for_script(refs["ru"]),
        "@@LOGO@@": logo,
    }
    out = read(SRC / "shell.html")
    for k, v in parts.items():
        assert out.count(k) == 1, k
        out = out.replace(k, v)
    # Google Fonts (internet) — oflayn ilovada kerak emas, tizim shriftlari ishlaydi
    out = re.sub(r"@import url\([^)]*fonts\.googleapis[^)]*\);?", "", out)
    # versiya: mazmun (versiya yozuvisiz) o'zgargandagina oshadi
    content_sha = hashlib.sha256(out.encode("utf-8")).hexdigest()
    try:
        prev = json.loads(VERSION_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        prev = {}
    if prev.get("content_sha") == content_sha and OUT.exists():
        print(f"o'zgarish yo'q — versiya {prev.get('version')} qoldi")
        return
    version = max(int(time.time()), int(prev.get("version", 0)) + 1)
    label = time.strftime("%Y-%m-%d %H:%M", time.gmtime(version + 5 * 3600))  # Toshkent vaqti
    out = out.replace("@@VERSION@@", str(version)).replace("@@VERSION_LABEL@@", label)
    data = out.encode("utf-8")
    OUT.write_bytes(data)
    meta = {"version": version, "label": label, "sha256": hashlib.sha256(data).hexdigest(), "content_sha": content_sha, "size": len(data)}
    VERSION_FILE.write_bytes((json.dumps(meta, indent=1) + "\n").encode("utf-8"))
    print(f"tayyor: {OUT.relative_to(ROOT)} ({len(data) // 1024} KB), versiya {version} ({label})")


if __name__ == "__main__":
    main()
