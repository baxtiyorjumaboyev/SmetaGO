# SmetaGo — ishni davom ettirish uchun to'liq ma'lumot (Cloud.md)

Bu fayl loyihani boshqa muhitda (boshqa cloud, boshqa kompyuter, yangi AI sessiyasi) davom ettirish uchun yozilgan. Bu yerda nima qilingani, qanday ishga tushirilishi, arxitektura qoidalari, ishlash tartibi va ochiq vazifalar bor. Foydalanuvchi uchun qo'llanma — `README.md`.

- **Repozitoriya:** https://github.com/baxtiyorjumaboyev/SmetaGO (public, branch `main`)
- **Holat (2026-09-26):** 19 ta unit test va brauzer (e2e) tekshiruvlari o'tadi.
- **Stack:** Python 3.10+ (sinovda 3.14), Django 5.2, SQLite, toza HTML/CSS/JS (freymvork va build vositasi yo'q).

---

## 1. Loyiha nima

SmetaGo — smetachi, PTO mutaxassisi, pudratchi va nazoratchi uchun veb-ilova. Foydalanuvchi obyektga borib xonalarni o'lchaydi (uzunlik, en, balandlik, eshik, deraza) va xonadagi narsalarni katalogdan tanlaydi. Ilova material hajmi, narxi va ish haqini hisoblab, tayyor smeta chiqaradi. Beton kalkulyatori (M150–M400) va 3 manbali narxlar bazasi ham bor.

Endi u bir vaqtda:
- **sayt** — mehmon uchun bosh sahifa (landing), ro'yxatdan o'tish, kirish;
- **ilova (PWA)** — telefon yoki kompyuterga o'rnatiladi, internetsiz ishlaydi;
- **ikki tilli** (o'zbekcha / ruscha) va **ikki rejimli** (kunduzgi / tungi), yashil-qora dizayn.

---

## 2. Ishlar tarixi (nima, qaysi tartibda qilingan)

| # | Bosqich | Commit | Qisqacha |
| --- | --- | --- | --- |
| 0 | Boshlang'ich holat | — | `smetago-project/` — statik MVP (v0.2): `index.html`, `js/app.js`, `js/data.js`, `css/style.css`, `docs/`. Ma'lumot faqat `localStorage` da. **Bu papkaga tegilmagan**, tarix uchun turibdi. |
| 1 | Django backend | `6c51e3e` | Foydalanuvchi hisoblari, obyektlar (yaratish / nusxa / o'chirish), smeta holati serverda (`GET/PUT` API). |
| 2 | Ma'lumotnoma bazaga | `6c51e3e` | Katalog (7 guruh, 53 element, 33 tur), 18 material narxi, 8 xona turi `data.js` dan bazaga o'tkazildi, admin panelda tahrirlanadi. "Markaziy narxlarni yuklash" tugmasi. |
| 3 | Dizayn + tillar | `cabdfb0` | Yashil-qora palitra, kunduzgi/tungi rejim tugmasi, UZ/RU tugmalari. Butun interfeys ruschaga tarjima qilindi, katalog uchun ruscha nomlar bazada. |
| 4 | Sayt + PWA | `b6d432b` | Manifest, service worker, ikonkalar, "Ilovani o'rnatish" tugmasi, oflayn navbat (internetsiz tahrirlash → aloqa tiklanganda yuborish), mehmonlar uchun landing sahifa. |
| 5 | Excel (.xlsx) | (keyingi commit) | Foydalanuvchi talabi: **eng muhim funksiya**. "Excel yuklab olish" (pastki qatorda doim + Smeta bo'limida), ikki varaq: "Smeta" va "Xonalar". Ilova ichida "Excel ko'rinishi" (standart) — fayl bilan aynan bir xil. O'ng tepadagi "Ilovani o'rnatish" tugmasi **foydalanuvchi so'rovi bilan olib tashlandi** (landing'dagi o'rnatish bo'limi qoldi). Narxlar pastidagi "Soatlik stavka…" matni **so'rov bilan olib tashlandi**. Eski "Excel uchun nusxa olish" (TSV) o'rniga haqiqiy fayl. |

Har bir bosqichda hisob-kitob natijasi asl statik versiya bilan solishtirildi: namunaviy obyekt uchun **materiallar 60 001 184, ish haqi 5 887 945, jami 69 183 585 so'm** — tiyinigacha bir xil. Hisoblash mantig'iga o'zgartirish kiritsangiz, shu raqamlar bilan tekshiring.

---

## 3. Ishga tushirish (yangi muhitda)

```bash
git clone https://github.com/baxtiyorjumaboyev/SmetaGO.git
cd SmetaGO
python -m venv .venv
# Linux/macOS:  source .venv/bin/activate
# Windows:      .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate          # jadvallar + ma'lumotnoma (o'zbekcha va ruscha) avtomatik yuklanadi
python manage.py createsuperuser  # admin panel uchun
python manage.py runserver        # http://127.0.0.1:8000
python manage.py test smeta       # 17 ta test
```

- `db.sqlite3` repoda yo'q (`.gitignore`). Har bir yangi muhitda `migrate` bazani noldan yaratadi. Foydalanuvchilar va obyektlar ko'chmaydi. Kerak bo'lsa: `python manage.py dumpdata smeta auth.user > backup.json` / `loaddata`.
- Migratsiyalar `0003` va `0005` ma'lumotnomani `smeta/seed/malumotnoma.json` va `smeta/seed/ru.json` dan yuklaydi. Bu faqat jadvallar bo'sh bo'lganda yoki ruscha maydon bo'sh bo'lganda sodir bo'ladi.

### Muhit o'zgaruvchilari (serverda majburiy)

| O'zgaruvchi | Standart (faqat lokal) | Serverda |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | `dev-faqat-lokal-...` | uzun tasodifiy qator |
| `DJANGO_DEBUG` | `1` | `0` |
| `DJANGO_ALLOWED_HOSTS` | `127.0.0.1,localhost,*` | `smetago.uz` (domen) |
| `DJANGO_CSRF_TRUSTED_ORIGINS` | bo'sh | `https://smetago.uz` |

Serverga joylashda: `python manage.py collectstatic`, gunicorn + nginx (yoki PythonAnywhere / Render / Railway). Statik fayllar uchun `whitenoise` qo'shish tavsiya etiladi (hali qo'shilmagan). **PWA faqat HTTPS da o'rnatiladi va oflayn ishlaydi** (`localhost` istisno).

---

## 4. Fayl xaritasi

```
SmetaGO/
├── manage.py, requirements.txt (Django>=5.0,<6.0), .gitignore
├── README.md                    # foydalanuvchi uchun qo'llanma
├── Cloud.md                     # shu fayl
├── config/
│   ├── settings.py              # LANGUAGES uz/ru, LanguageMiddleware, context processors (i18n, pwa)
│   ├── urls.py                  # /sw.js, /manifest.webmanifest, /offline/, /admin/, /i18n/, smeta.urls
│   └── wsgi.py
├── smeta/                       # yagona Django ilovasi
│   ├── models.py                # Obyekt + CatalogGroup/CatalogItem/CatalogVariant/Material/RoomType (*_ru maydonlari bilan)
│   ├── views.py                 # ro'yxat/landing, yaratish, ilova sahifasi, nusxa, o'chirish, state API, ro'yxatdan o'tish
│   ├── urls.py
│   ├── admin.py                 # ma'lumotnoma admini (kalit yaratilgandan keyin faqat o'qiladi)
│   ├── malumotnoma.py           # build_reference(lang) — bazadan frontend formatiga; load_seed / load_ru
│   ├── i18n.py                  # Python RU lug'ati, tr(), LanguageMiddleware
│   ├── pwa.py                   # manifest, service worker (versiya = fayllar hash'i), offline
│   ├── excel.py                 # build_workbook(): varaq modeli -> .xlsx (openpyxl)
│   ├── templatetags/smeta_i18n.py   # {% t "o'zbekcha matn" %}
│   ├── seed/malumotnoma.json    # asl data.js dan olingan ma'lumotnoma
│   ├── seed/ru.json             # ruscha nomlar (kalit bo'yicha)
│   ├── migrations/0001..0005
│   ├── tests.py                 # 17 ta test
│   ├── templates/smeta/
│   │   ├── base.html            # oddiy sahifalar skeleti (header, prefs, userbar)
│   │   ├── _head.html           # umumiy <head>: manifest, theme-color, ikonkalar, prefs.js, pwa.js, CSS
│   │   ├── _prefs.html          # Oflayn belgisi, O'rnatish tugmasi, UZ|RU, rejim tugmasi
│   │   ├── app.html             # smeta ilovasi (xonalar/beton/narxlar/smeta) — JS bilan chiziladi
│   │   ├── obyekt_list.html     # obyektlar ro'yxati
│   │   ├── landing.html         # mehmon uchun bosh sahifa (sayt)
│   │   ├── offline.html         # internet yo'q + keshda yo'q sahifa
│   │   └── sw.js                # service worker shabloni
│   ├── templates/registration/  # login.html, register.html
│   └── static/smeta/
│       ├── css/style.css        # barcha uslublar; ranglar :root tokenlarida
│       ├── js/prefs.js          # kunduzgi/tungi rejim (<head> da sinxron)
│       ├── js/pwa.js            # SW ro'yxatdan o'tkazish, o'rnatish, oflayn belgisi
│       ├── js/i18n.js           # LANG, RU lug'ati, tr(), U() birliklar, lab(), qLabel()
│       ├── js/data.js           # FLOOR/WALL/CEIL, MIX, REGIONS, QUARTERS + zaxira katalog (REF bo'lmasa)
│       ├── js/app.js            # asosiy mantiq: holat S, hisob, chizish, hodisalar, oflayn navbat
│       └── icons/               # icon.svg, maskable.svg, *.png (192, 512, maskable, apple-touch, favicon)
└── smetago-project/smetago-project/   # asl statik MVP (tegilmaydi); docs/ ichida formulalar va arxitektura
```

Hisob formulalari: `smetago-project/smetago-project/docs/HISOB-QOIDALARI.md`. Frontend arxitekturasi (holat `S`, `data-*` atributlari, chizish qoidasi): `.../docs/ARXITEKTURA.md`. Ular hanuz amal qiladi.

---

## 5. Arxitektura va buzmaslik kerak bo'lgan qoidalar

### 5.1 Ma'lumot oqimi
1. `GET /obyekt/<id>/` → `app.html`. Ichiga ikkita JSON joylanadi: `#smeta-state` (obyekt holati `S`) va `#smeta-ref` (`build_reference(lang)` — joriy tildagi katalog, narxlar, xona turlari). `window.SMETAGO = {saveUrl, csrf, name, updated}`.
2. Skriptlar tartibi: `i18n.js` → `data.js` → `app.js`. **Tartibni o'zgartirmang.**
3. `app.js` `S` ni o'zgartiradi. `save()` 700 ms dan keyin `PUT /api/obyekt/<id>/state/` yuboradi (JSON, `v: 1` majburiy, CSRF header bilan). Server `S.obj.name` dan obyekt nomini oladi.
4. `index.html` ni to'g'ridan-to'g'ri ochish (Djangosiz) hali ishlaydi: `SERVER` yo'q bo'lsa, `localStorage` (`smetago-v1`) ishlatiladi.

### 5.2 Invariantlar
- **Holatda kalitlar har doim o'zbekcha**: xona turi (`room.type = "Mehmonxona"`), birlik (`"dona"`, `"m²"`), material guruhi (`"Pol"`), hudud (`"Toshkent sh."`), chorak (`"2026-yil III chorak"`). Tarjima faqat ko'rsatishda: `tr()`, `U()`, `rtLabel()`, `qLabel()`. Shu sabab tilni istalgan payt almashtirish obyektni buzmaydi. Hisoblash mantiqi ham shu kalitlarga tayanadi (masalan, `pp.u==="dona"`).
- **Katalog elementi `key` va material `key`** yaratilgandan keyin o'zgarmaydi: ular saqlangan obyektlarda (`item.cid`) va `data.js` dagi `FLOOR/WALL/CEIL` (`pid`, `pl`) da ishlatiladi. Admin'da faqat o'qiladi.
- **Xonaga qo'shilgan element** o'z nusxasini saqlaydi (nom, narx, soat). Ma'lumotnoma o'zgarsa, eski smetalar o'zgarmaydi. Katalog elementi nomi ko'rsatishda joriy tildan olinadi (`itemName()`); variant (turi) qo'shilgan paytdagi tilda qoladi.
- **Holat versiyasi `v: 1`.** Tuzilma o'zgarsa — `v: 2` va `app.js` da migratsiya kodi (qarang: `docs/ARXITEKTURA.md` 5-bo'lim). Server `v != 1` ni rad etadi (`views.obyekt_state`) — birga yangilang.
- Admin elementni o'chirsa, ilova buzilmasligi kerak: `mkItem` `null` qaytaradi, `ROOM_DEFAULT` va `.filter(Boolean)` bu holatni ushlaydi.
- Frontendda foydalanuvchi matni HTML'ga faqat `esc()` orqali qo'yiladi.

### 5.3 Tillar (UZ/RU)
- Til cookie'da (`django_language`), Django'ning `set_language` ko'rinishi (`/i18n/setlang/`) yozadi. `smeta.i18n.LanguageMiddleware` brauzerning `Accept-Language`'ini **ataylab** hisobga olmaydi: standart til — o'zbekcha.
- **Kalit — o'zbekcha matnning o'zi.** JS: `tr("Xona qo'shish")`, `tr("{0} xona", n)`. Shablon: `{% t "Obyektlar" %}`, `{% t "{0} xona" o.rooms_count %}`. Lug'atlar: `static/smeta/js/i18n.js` (`RU`) va `smeta/i18n.py` (`RU`). Tarjima yo'q bo'lsa, o'zbekchasi chiqadi.
- Yangi matn qo'shsangiz, ruscha tarjimani lug'atga ham yozing. `{% t %}` ichidagi matnda apostrof bo'lsa, qo'sh qo'shtirnoq ishlating: `{% t "O'chirish" %}`.
- Ma'lumotnoma tarjimasi bazada: `name_ru`, `label_ru`, `sources_ru`. `build_reference("ru")` bo'sh maydon uchun o'zbekchasini beradi.
- Django'ning o'z xabarlari (parol talablari va h.k.) uz/ru tarjimalari bilan keladi.

### 5.4 Dizayn va rejim
- Ranglar `css/style.css` boshidagi `:root` tokenlarida: `--accent` (yashil), `--ink`, `--bar` / `--on-bar` / `--bar-accent` (qora pastki qator). Tungi palitra **ikki joyda**: `@media (prefers-color-scheme: dark)` va `:root[data-theme="dark"]`. Yangi rangni ikkalasiga ham yozing.
- Rejim tanlovi brauzerda (`localStorage` `smetago-theme`), `prefs.js` `<head>` da sinxron yuklanadi (sahifa miltillamasligi uchun). `theme-color` meta ham shu yerda yangilanadi.
- Telefon chegaralari: 1180px, 760px, 400px. `.mobonly` / `.deskonly`.

### 5.5 Excel (.xlsx)
- **Bitta varaq modeli, ikki ishlatilish.** `app.js` dagi `sheetSmeta()` va `sheetRooms()` modelni quradi (katak: `{v, f: "money"|"dec2"|"int", s: "title"|"meta"|"head"|"group"|"sub"|"total"|"grand"|"b"}`, varaq: `{name, cols, rows, freeze, table:[boshi, oxiri]}`).
  - `viewSheet()` — ilova ichidagi "Excel ko'rinishi" (ustun harflari, qator raqamlari, varaq yorliqlari; rejimdan qat'i nazar oq "qog'oz").
  - `downloadXlsx()` → `POST /api/obyekt/<id>/excel/` → `smeta/excel.py` `build_workbook()` (openpyxl) → fayl. Nom: `Smeta - <obyekt> - dd.mm.yyyy.xlsx`.
  - Shu sabab ko'rinish va fayl doim bir xil. Ustun/qator qo'shsangiz — faqat modelni o'zgartiring.
- Hisob brauzerda qoladi; server faqat yozadi (hisobni Python'da takrorlamang).
- Faylda qiymatlar son sifatida yoziladi (formulalar emas) — telefon/Telegram ko'rgichlarida ham ko'rinishi uchun. Pul formati `#,##0`, miqdor `0.00`.
- Xavfsizlik: faqat egasi; o'lcham chegaralari (5 varaq, 20000 qator, 40 ustun); `=` bilan boshlanadigan matn formula bo'lib bajarilmaydi (`data_type="s"`).
- Internet kerak (oflayn bo'lsa toast). `openpyxl` — `requirements.txt` da.
- Sinov: yangi obyekt, 2 xona → fayldagi JAMI va har xona summasi ilova bilan aynan mos (uz va ru).

### 5.6 PWA
- `/sw.js` Django view (`pwa.service_worker`) orqali **ildizdan** beriladi — butun saytni boshqarishi uchun. `Cache-Control: no-cache`.
- SW versiyasi `smeta/static/smeta/**` va `smeta/templates/**` fayllari mazmunidan hash qilinadi. Istalgan statik fayl o'zgarsa, SW yangilanadi va eski statik kesh o'chadi. Qo'lda versiya oshirish shart emas.
- Strategiyalar: `/static/` — avval kesh; sahifalar — avval tarmoq, internet bo'lmasa kesh, u ham bo'lmasa `/offline/`; `/api/`, `/admin/`, `/i18n/` — faqat tarmoq; Google Fonts — keshdan, fonda yangilanadi.
- Oldindan keshlanadigan fayllar ro'yxati — `pwa.PRECACHE_STATIC`. Yangi JS/CSS fayl qo'shsangiz, shu ro'yxatga ham qo'shing (test barcha fayllar mavjudligini tekshiradi).
- **Oflayn navbat** (`app.js`): har saqlashdan oldin `localStorage["smetago-pending:<saveUrl>"] = {ts, state}` yoziladi. Muvaffaqiyatli bo'lsa o'chiriladi. Sahifa ochilganda navbat serverdagi nusxadan (`SMETAGO.updated`) yangiroq bo'lsa, o'sha ishlatiladi. `online` hodisasida va har 30 soniyada qayta yuboriladi. `window.smetagoNet(bool)` "Oflayn" belgisini boshqaradi.
- Chiqishda (`form[data-logout]`) SW'ga `clear-pages` xabari yuboriladi — sahifalar keshi o'chadi.
- Ikonkalar: `icon.svg` va `maskable.svg` manba. PNG'lar Playwright bilan chizilgan (qarang: 7-bo'lim).

---

## 6. Ishlash tartibi (foydalanuvchi talablari — albatta amal qiling)

1. **Foydalanuvchi bilan o'zbek tilida gaplashing.** Kod izohlari ham o'zbekcha (mavjud uslubda).
2. **Har bir tugallangan o'zgarishdan keyin GitHub'ga yuklang** — foydalanuvchining doimiy talabi (2026-09-26). Tartib:
   - `python manage.py test smeta` — o'tmasa, **yuklamang**, avval foydalanuvchiga ayting;
   - `git status` — `db.sqlite3`, `.env`, `.venv`, parol yoki kalit tushib qolmaganini tekshiring (**repo public**);
   - `git add -A && git commit -F <xabar-fayli> && git push`;
   - javobda commit hash va havolani ayting.
3. Commit xabarlari o'zbekcha: birinchi qator — qisqa sarlavha, keyin `- ` bilan ro'yxat.
4. Hisoblash mantig'iga tegsangiz — namunaviy obyekt summasini 2-bo'limdagi raqamlar bilan solishtiring.
5. Qaytarib bo'lmaydigan yoki tashqariga chiqadigan amallardan oldin (repo sozlamalari, o'chirish, serverga joylash) foydalanuvchidan so'rang.

### Windows'ga xos tuzoqlar (asl muhit Windows 10, PowerShell 5.1 edi)
- `Get-Content -Raw` BOMsiz UTF-8 faylni noto'g'ri o'qiydi va qayta yozganda `m²`, `—`, kirill harflarini buzadi. Fayllarni editor/Edit vositasi bilan tahrirlang yoki `[IO.File]::ReadAllText/WriteAllText(..., UTF8Encoding($false))` ishlating.
- Ko'p qatorli commit xabarini argument sifatida bermang — `git commit -F fayl.txt`.
- `python -c "..."` ichidagi qo'shtirnoqlar buziladi — skriptni faylga yozib, `manage.py shell -c "exec(open(r'...').read())"` qiling.
- `gh auth setup-git` bajarilgan bo'lishi kerak, aks holda `git push` parol so'raydi. Yangi muhitda: `gh auth login`, keyin `gh auth setup-git`.
- Linux/macOS cloud'da bu tuzoqlar yo'q.

---

## 7. Testlar

### Unit testlar — `python manage.py test smeta` (19 ta)
Tekshiradi:
- ro'yxatdan o'tish va kirish; mehmonga landing, kirganga ro'yxat;
- obyekt yaratish, saqlash, nusxa olish, o'chirish; noto'g'ri holat rad etilishi; begona obyektga kirib bo'lmasligi (404); CSRF;
- ma'lumotnoma `seed` bilan bir xilligi; admin o'zgarishlarining ilovaga yetishi; admin sahifalari;
- til: standart o'zbekcha, ruschaga o'tish, ruscha ma'lumotnoma, bo'sh ruscha nom → o'zbekcha;
- PWA: manifest (maydonlar, ikonkalar mavjudligi, tili), service worker (precache fayllari mavjud), oflayn sahifa, ilova sahifasida PWA teglari;
- Excel: fayl tuzilishi (varaqlar, uslublar, formatlar, muzlatish), `=` matni formula emas, noto'g'ri ma'lumot 400, begona obyekt 404.

### Brauzer (e2e) sinovlari — repoda yo'q, qayta yozish oson
Playwright bilan (`pip install playwright`, o'rnatilgan Chrome: `p.chromium.launch(channel="chrome")`; cloud'da `playwright install chromium`) quyidagilar tekshirilgan:
1. Landing ochiladi; `Page.getAppManifest` — xatosiz; SW faol va sahifani boshqaradi.
2. `Page.getInstallabilityErrors` — oddiy (persistent) profilda **bo'sh**. Playwright'ning oddiy konteksti inkognito, u yerda faqat `in-incognito` chiqadi — bu normal.
3. `beforeinstallprompt` → "Ilovani o'rnatish" tugmasi ko'rinadi.
4. Kirish → namunaviy obyekt → `context.set_offline(True)` → reload: sahifa keshdan ochiladi, `#r-L` ni 5 → 6 qilish; "Oflayn" belgisi va toast; `localStorage` da `smetago-pending:*`; qayta ochilganda 6 saqlanib qolgan; ro'yxat keshdan; keshda yo'q sahifa → oflayn sahifa.
5. `set_offline(False)` → navbat bo'shaydi → `GET /api/obyekt/<id>/state/` da `L == "6"`.
6. Tungi rejim → `theme-color` = `#101512`; JS xatolari yo'q.
7. Ikkala tilda barcha bo'limlarni ochib, ruscha rejimda o'zbekcha matn qolmaganini tekshirish (matn tugunlari va `placeholder` / `aria-label` / `title` atributlari).

**Tuzoq:** Playwright'ning oflayn emulyatsiyasida reload'dan keyin `navigator.onLine` noto'g'ri `true` qaytaradi. Shuning uchun "Oflayn" belgisi saqlash so'rovi natijasiga ham bog'langan (`smetagoNet`). Headless Chrome oynasi taxminan 500px'dan tor bo'lmaydi: mobil skrinshotni Playwright viewport (390×844) yoki 390px iframe orqali oling.

---

## 8. Ochiq vazifalar va keyingi qadamlar

| Ustuvorlik | Vazifa | Izoh |
| --- | --- | --- |
| 1 | **Serverga joylash (HTTPS + domen)** | PWA'ni telefonga o'rnatish uchun shart. Taklif: PythonAnywhere yoki Render. `whitenoise`, `DEBUG=0`, maxfiy kalit, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, `collectstatic`. Ishlab chiqarishda SQLite o'rniga PostgreSQL ko'rib chiqilsin. Domen `.uz` — cctld.uz ro'yxatidagi registrator orqali. |
| 2 | **Hamkorni qo'shish** | Foydalanuvchi `ikrombekmurodov7@gmail.com` egasini repoga qo'shmoqchi. Bu pochta bilan GitHub hisobi topilmadi (pochta yashirin). **GitHub login kerak** — foydalanuvchidan so'rang, taxmin qilmang. Keyin: `gh api -X PUT repos/baxtiyorjumaboyev/SmetaGO/collaborators/<login> -f permission=push`. |
| 3 | PDF yuklab olish | Excel tayyor (5.5). PDF hali yo'q. |
| 4 | Play Market | Serverga joylangach, PWA'ni TWA (Bubblewrap / PWABuilder) bilan paketlash; `assetlinks.json` kerak. |
| 5 | Davlat standarti (ShNQ) smeta formati, resurs kodlari | Yo'l xaritasi 1.0. |
| 6 | Narx integratsiyalari | Rasmiy resurs narxlari bazasi, birja, "Gloter" — ochiq savollar `docs/YOL-XARITASI.md` da. |
| — | Mayda narsalar | `9000/12000/18000 BTU` turlarining ruscha nomi bo'sh (ikkala tilda bir xil, muammo emas). Litsenziya fayli yo'q (public repo — foydalanuvchi xohlasa MIT qo'shiladi). Commit tarixidagi pochta ochiq — xohlasa GitHub `noreply` pochtasiga o'tkazish mumkin. |

### Ma'lum cheklovlar
- Narxlar namunaviy. Beton retseptlari ma'lumotnoma uchun (СНиП 82-02-95, ГОСТ 7473-2010).
- Foydalanuvchi o'zi yozgan nomlar (xona, obyekt, o'z elementi) yozilgan tilida qoladi.
- Oflayn rejimda faqat avval ochilgan obyektlar ishlaydi. Yangi obyekt yaratish, nusxa olish, o'chirish va tilni almashtirish internet talab qiladi (forma yuborilmaydi, ogohlantirish chiqadi).
- Bir obyektni ikki qurilmada bir vaqtda tahrirlash: oxirgi saqlangan yutadi (birlashtirish yo'q).

---

## 9. Hisob va kirish ma'lumotlari

- GitHub: `baxtiyorjumaboyev`. Repo commit muallifi repo-local `git config` da sozlangan. Yangi muhitda `git config user.name` / `user.email` ni qayta sozlang (foydalanuvchidan so'rang).
- Parollar, tokenlar va `SECRET_KEY` bu faylda **yo'q va bo'lmasligi kerak** — repo public.
