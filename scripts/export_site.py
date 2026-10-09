import os
import sys
import shutil
import re

REPO_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if REPO_DIR not in sys.path:
    sys.path.insert(0, REPO_DIR)

import django
from django.test import Client

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

out_dir = "_site"
if os.path.exists(out_dir):
    shutil.rmtree(out_dir)
os.makedirs(out_dir, exist_ok=True)

# 1. Collect static files
from django.core.management import call_command
call_command("collectstatic", "--noinput")

# Copy staticfiles to _site/static
shutil.copytree("staticfiles", os.path.join(out_dir, "static"), dirs_exist_ok=True)

# 2. Render pages via Django test Client
client = Client()

pages = {
    "/": "index.html",
    "/app/": "app/index.html",
    "/namuna/": "namuna/index.html",
    "/yordam/": "yordam/index.html",
    "/maxfiylik/": "maxfiylik/index.html",
}

for url, out_path in pages.items():
    res = client.get(url)
    html = res.content.decode("utf-8")
    
    # Adapt links and static paths for GitHub Pages subpath /SmetaGO/
    if "<base" not in html:
        html = re.sub(r'<head>', '<head>\n<base href="/SmetaGO/">', html, count=1, flags=re.IGNORECASE)
    
    html = html.replace('href="/static/', 'href="static/')
    html = html.replace('src="/static/', 'src="static/')
    html = html.replace('href="/manifest.webmanifest"', 'href="manifest.webmanifest"')
    html = html.replace('href="/app/"', 'href="app/"')
    html = html.replace('href="/app/?tab=beton"', 'href="app/?tab=beton"')
    html = html.replace('href="/namuna/"', 'href="namuna/"')
    html = html.replace('href="/yordam/"', 'href="yordam/"')
    html = html.replace('href="/maxfiylik/"', 'href="maxfiylik/"')
    html = html.replace('data-register="/app/"', 'data-register="app/"')
    html = html.replace('action="/i18n/setlang/"', 'action="javascript:void(0);"')
    
    full_path = os.path.join(out_dir, out_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(html)

# Also create app.html directly at root for convenience
if os.path.exists(os.path.join(out_dir, "app/index.html")):
    shutil.copy(os.path.join(out_dir, "app/index.html"), os.path.join(out_dir, "app.html"))

# 404.html fallback pointing to index.html
shutil.copy(os.path.join(out_dir, "index.html"), os.path.join(out_dir, "404.html"))

# .nojekyll so GitHub Pages serves all assets
with open(os.path.join(out_dir, ".nojekyll"), "w") as f:
    f.write("")

# Copy pwa / manifest / sw if present
try:
    res = client.get("/manifest.webmanifest")
    with open(os.path.join(out_dir, "manifest.webmanifest"), "wb") as f:
        f.write(res.content)
except Exception:
    pass

try:
    res = client.get("/sw.js")
    with open(os.path.join(out_dir, "sw.js"), "wb") as f:
        f.write(res.content)
except Exception:
    pass

print(f"Export completed successfully into '{out_dir}'.")
