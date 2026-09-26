/* SmetaGo service worker (smeta/pwa.py beradi, /sw.js). Versiya: {{ version }}
 * - statik fayllar: avval kesh (versiya almashsa kesh yangilanadi)
 * - sahifalar: avval tarmoq, internet yo'q bo'lsa — oxirgi ochilgan nusxa, u ham yo'q bo'lsa — /offline/
 * - API, admin, til almashtirish: faqat tarmoq (keshlanmaydi)
 * - Google Fonts: keshdan beriladi, fonda yangilanadi
 */
const VERSION = "{{ version }}";
const STATIC_CACHE = "smetago-static-" + VERSION;
const PAGE_CACHE = "smetago-pages-v1";
const FONT_CACHE = "smetago-fonts-v1";
const PRECACHE = {{ precache|safe }};

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then((c) => c.addAll(PRECACHE.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("smetago-static-") && k !== STATIC_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (e) => {
  // chiqishda (logout) foydalanuvchi sahifalari qurilmada qolmasin
  if (e.data && e.data.type === "clear-pages") e.waitUntil(caches.delete(PAGE_CACHE));
});

const NETWORK_ONLY = ["/api/", "/admin/", "/i18n/", "/sw.js"];

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === location.origin) {
    if (NETWORK_ONLY.some((p) => url.pathname.startsWith(p))) return;
    if (url.pathname.startsWith("/static/")) { e.respondWith(cacheFirst(req)); return; }
    if (req.mode === "navigate") { e.respondWith(networkFirstPage(req)); return; }
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith(staleWhileRevalidate(req, FONT_CACHE));
  }
});

async function cacheFirst(req) {
  const cache = await caches.open(STATIC_CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) cache.put(req, res.clone());
  return res;
}

async function networkFirstPage(req) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const res = await fetch(req);
    // yo'naltirishlar (masalan, kirish sahifasiga) va xatolar keshlanmaydi
    if (res.ok && !res.redirected) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return (await cache.match(req, { ignoreSearch: true }))
      || (await caches.match("/offline/"))
      || new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
}

async function staleWhileRevalidate(req, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  const net = fetch(req).then((res) => { if (res.ok || res.type === "opaque") cache.put(req, res.clone()); return res; }).catch(() => hit);
  return hit || net;
}
