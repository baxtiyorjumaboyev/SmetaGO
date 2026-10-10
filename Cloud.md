# SmetaGo — ishni davom ettirish uchun to'liq ma'lumot (Cloud.md)

Bu fayl loyihani boshqa muhitda (boshqa cloud, boshqa kompyuter, yangi AI sessiyasi) davom ettirish uchun yozilgan. Bu yerda nima qilingani, qanday ishga tushirilishi, arxitektura qoidalari, ishlash tartibi va ochiq vazifalar bor. Foydalanuvchi uchun qo'llanma — `README.md`.

- **Repozitoriya:** https://github.com/baxtiyorjumaboyev/SmetaGO (public, branch `main`)
- **Holat (2026-09-29):** 22 ta unit test va brauzer (e2e) tekshiruvlari o'tadi.
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
| 5 | Excel (.xlsx) | `f189a9a` | Foydalanuvchi talabi: **eng muhim funksiya**. "Excel yuklab olish" (pastki qatorda doim + Smeta bo'limida), ikki varaq: "Smeta" va "Xonalar". Ilova ichida "Excel ko'rinishi" (standart) — fayl bilan aynan bir xil. O'ng tepadagi "Ilovani o'rnatish" tugmasi **foydalanuvchi so'rovi bilan olib tashlandi** (landing'dagi o'rnatish bo'limi qoldi). Narxlar pastidagi "Soatlik stavka…" matni **so'rov bilan olib tashlandi**. Eski "Excel uchun nusxa olish" (TSV) o'rniga haqiqiy fayl. |
| 6 | Yangi sayt dizayni | (keyingi commit) | Foydalanuvchi bergan Claude Design skrinshotlari bo'yicha: bosh qismda **jonli kalkulyator** (xona turi, ± o'lchamlar, qoplamalar, chizma, qatorlar, jami), "Uch qadam", "Kim uchun", yashil chaqiruv, pastki qator. Dizayndagi haqiqatga to'g'ri kelmaydigan va'dalar **ataylab o'zgartirildi**: PDF → Excel (PDF yo'q), "3 ta obyektgacha bepul" → "cheklanmagan" (limit yo'q), "joriy bozor narxlari" → "3 manbali narxlar bazasi", Telegram havolasi qo'yilmadi (manzil noma'lum). Qo'shildi: `/namuna/` (ro'yxatdan o'tmasdan to'liq ilova + Excel), `/yordam/`, `/maxfiylik/`, kalkulyator qoralamasi → ro'yxatdan o'tgach yangi obyektga, ma'lumotnoma keshi. |

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
│   ├── views.py                 # 5 bo'lim: ommaviy sahifalar · kabinet · obyekt amallari · API (state, Excel) · hisob
│   ├── urls.py
│   ├── admin.py                 # ma'lumotnoma admini (kalit yaratilgandan keyin faqat o'qiladi)
│   ├── malumotnoma.py           # build_reference(lang) + cached_reference — faqat sayt ishlashi uchun (kesh bilan)
│   ├── i18n.py                  # Python RU lug'ati, tr(), LanguageMiddleware
│   ├── pwa.py                   # manifest, service worker (versiya = fayllar hash'i), offline
│   ├── excel.py                 # build_workbook(): varaq modeli -> .xlsx (openpyxl)
│   ├── templatetags/smeta_i18n.py   # {% t "o'zbekcha matn" %}
│   ├── context.py               # yagona context processor: email_ready, tg_bot, theme-color
│   ├── seed/__init__.py         # load_seed / load_ru / sync_materials — FAQAT migratsiyalar uchun
│   ├── seed/malumotnoma.json    # asl data.js dan olingan ma'lumotnoma
│   ├── seed/ru.json             # ruscha nomlar (kalit bo'yicha)
│   ├── migrations/0001..0005
│   ├── tests.py                 # 17 ta test
│   ├── templates/smeta/
│   │   ├── base.html            # oddiy sahifalar skeleti (header, prefs, userbar)
│   │   ├── _head.html           # umumiy <head>: manifest, theme-color, ikonkalar, prefs.js, pwa.js, CSS
│   │   ├── _prefs.html          # Oflayn belgisi, O'rnatish tugmasi, UZ|RU, rejim tugmasi
│   │   ├── app.html             # smeta ilovasi (xonalar/beton/narxlar/smeta) — JS bilan chiziladi
│   │   ├── obyekt_list.html     # boshqaruv paneli; har karta data-panel="…", "Panellar" menyusi (js/panels.js)
│   │   ├── landing.html         # mehmon uchun bosh sahifa (sayt, jonli kalkulyator)
│   │   ├── yordam.html, maxfiylik.html  # FAQ va maxfiylik (faktlarga asoslangan)
│   │   ├── offline.html         # internet yo'q + keshda yo'q sahifa
│   │   └── sw.js                # service worker shabloni
│   ├── templates/registration/  # login.html, register.html
│   └── static/smeta/
│       ├── css/style.css        # barcha uslublar; ranglar :root tokenlarida
│       ├── js/prefs.js          # kunduzgi/tungi rejim (<head> da sinxron)
│       ├── js/pwa.js            # SW ro'yxatdan o'tkazish, o'rnatish, oflayn belgisi
│       ├── js/i18n.js           # LANG, RU lug'ati, tr(), U() birliklar, lab(), qLabel()
│       ├── js/data.js           # FLOOR/WALL/CEIL, MIX, REGIONS, QUARTERS + zaxira katalog (REF bo'lmasa)
│       ├── js/calc.js           # hisob yadrosi (roomCalc, lineTotals…), planSvg (o'lcham chiziqli reja), stepInput (+/−) — ilova va bosh sahifa uchun umumiy
│       ├── js/app.js            # ilova: holat S, chizish, hodisalar, oflayn navbat, Excel, namuna rejimi, qoralama
│       ├── js/landing.js        # bosh sahifadagi jonli kalkulyator (xona turi tugmalari, ±, qoplamalar, reja, qatorlar, jami)
│       └── icons/               # icon.svg, maskable.svg, *.png (192, 512, maskable, apple-touch, favicon)
└── smetago-project/smetago-project/   # asl statik MVP (tegilmaydi); docs/ ichida formulalar va arxitektura
```

Hisob formulalari: `smetago-project/smetago-project/docs/HISOB-QOIDALARI.md`. Frontend arxitekturasi (holat `S`, `data-*` atributlari, chizish qoidasi): `.../docs/ARXITEKTURA.md`. Ular hanuz amal qiladi.

---

## 5. Arxitektura va buzmaslik kerak bo'lgan qoidalar

### 5.1 Ma'lumot oqimi
1. `GET /obyekt/<id>/` → `app.html`. Ichiga ikkita JSON joylanadi: `#smeta-state` (obyekt holati `S`) va `#smeta-ref` (`build_reference(lang)` — joriy tildagi katalog, narxlar, xona turlari). `window.SMETAGO = {saveUrl, csrf, name, updated}`.
2. Skriptlar tartibi: `i18n.js` → `data.js` → `calc.js` → `app.js` (bosh sahifada `app.js` o'rniga `landing.js`). **Tartibni o'zgartirmang.** Hisob mantig'i faqat `calc.js` da — bosh sahifa va ilova bir xil raqam chiqaradi.
   Dizayn: **bosh sahifa** (`landing.html`, `body.site`) — to'q/yorug' "chizma" uslubi, LIVE kalkulyator (`landing.js`). **Ichki sahifalar** (tizimga kirgan foydalanuvchi, `body.in`) — dashboard uslubi: yashil gradient yuqori panel (`--hdr1/--hdr2`), avatar (`.uchip`), oq kartalar. **"Asosiy"** (`obyekt_list.html` + `dashboard.js`): KPI, obyektlar grafigi, xarajatlar tarkibi, bo'limlar donut (`line.cat`: pol/devor/shift/element/beton), eng katta obyektlar — summalar `buildSmeta()` bilan (ilova bilan bir xil). `calc.js` da: `normState()`, `buildSmeta()`, `roomCalc()`, `planSvg()` va h.k.
   JetBrains Mono raqamlar, `--dim` rangli o'lcham chiziqlari. Telefonda: pastki panel (`#bnav`), +/− (`stepper()`), 18 px inputlar.
   **Palitra — lime** (2026-09-29): tungi aksent `#b5e86a`, kunduzgi `#4d7c0f` (oq fonda matn kontrasti ≥ 4.5), yuqori panel `--hdr1/2` to'q zaytun; Excel ham shu ranglarda.
   **3D xona** (`room3d.js`, kutubxonasiz canvas): `Room3D(canvas,{autoRotate,onDims})` → `set({L,W,H,doors,windows})`. Yaqin devorlar kesilgan, lime o'lcham chiziqlari, sichqoncha/barmoq bilan aylantirish, o'lcham o'zgarsa silliq o'tadi; ekrandan tashqarida va `prefers-reduced-motion` da to'xtaydi. Ishlatiladi: kirish sahifalari (`registration/_auth.html` + `auth.js`, demo o'lchamlarni almashtiradi), bosh sahifa kalkulyatori (`landing.js`), ilova Xonalar bo'limi (`app.js` `room3d()`; `render()` da yangi canvas, eskisi `destroy()`).
   **Kirish sahifalari** (login, ro'yxat, parol tiklash) — `registration/_auth.html` asosida: yorug' uslub, "Eslab qolish"; maydonlar `registration/_field.html` (ikonka, parolni ko'rsatish).
   **Kirish va parolni tiklash** (`smeta/recovery.py`, 2026-10-06): kirish — login **yoki telefon** (`LoginBackend`, `AUTHENTICATION_BACKENDS`; `login()` chaqirganda `backend=` ko'rsating). Telefon — `Profile.phone` (`998XXXXXXXXX`, ro'yxatdan o'tishda ixtiyoriy, unikal). "Parolni unutdingizmi?" → `/parol-tiklash/` (Telefon | Login tablari): hisob Telegram'ga ulangan va bot bor bo'lsa — 6 xonali kod Telegram'ga (sessiyaga bog'langan, 10 daqiqa, 5 urinish); aks holda `ResetRequest` → admin "Parolni tiklash so'rovlari" (yonida "Parolni o'zgartirish →"). Javob hisob bor-yo'qligidan qat'i nazar bir xil; soatiga 3 so'rov (qiymat va sessiya bo'yicha, `cache`). Email orqali tiklash olib tashlandi.
   **Soddalik qoidasi** (foydalanuvchi talabi, 2026-10-06: "hech narsa tushunmaydigan odam ham tushunsin"): Xonalar bo'limi — tepada `guide()` (4 qadam, ✓ har kiritishda yangilanadi, × bilan yopiladi → `S.ui.noGuide`); bloklar raqamlangan (`sec()`: raqam + sarlavha + bir qatorlik tushuntirish); murakkab maydonlar (qoplama o'lchami, kafel, plintus) `<details id="adv">` ichida, holati `S.ui.adv`. **"+ O'zim qo'shaman" har joyda:** qoplama yonida (`ownFinish` → `openCustom({name,unit:"m²",qty})`), eshik turida "Boshqa (o'zim yozaman)…" (`d.own=true`, matn maydoni), katalog har ro'yxatining boshida va "Xonadagi narsalar" sarlavhasida. Boshqaruv panelida "3 qadamda smeta" (`data-panel="start"`). Yangi funksiya qo'shsangiz — shu tartibda: oddiy tushuntirish, ro'yxatda yo'q bo'lsa qo'lda kiritish yo'li.
   - **Formulalar faqat `calc.js` da.** Bosh sahifa kalkulyatori ham shu funksiyalarni chaqiradi — saytdagi summa ilovadagi bilan aynan bir xil (e2e sinovda tekshiriladi). Formulani boshqa joyga nusxalamang.
   - **Namuna** (`/namuna/`, `o=None`): `window.SMETAGO` yo'q, `SMETAGO_DEMO` bor → holat `localStorage["smetago-namuna"]`, Excel `POST /api/excel/` (anonim, CSRF bilan, hech narsa saqlanmaydi). `?tab=smeta` bo'limni ochadi.
   - **Qoralama:** `landing.js` "Saqlash" da `localStorage["smetago-draft"]` ({ts, room}) yozadi → obyektlar ro'yxatida banner → yangi **bo'sh** obyekt ochilganda `applyDraft()` birinchi xonaga qo'yadi va o'chiradi (7 kun amal qiladi).
   - **Ro'yxatdan o'tish** — faqat login va parol, email **so'ralmaydi** (foydalanuvchi talabi, 2026-09-29). Parolni unutgan: Telegram orqali kirish yoki admin panelda parolni yangilash; email orqali tiklash faqat emaili bor (admin qo'shgan) hisoblar uchun.
   - **Telegram orqali kirish** (`smeta/telegram.py`, `TelegramAccount`): Login Widget → `GET /kirish/telegram/?id=…&hash=…`; imzo `HMAC-SHA256(SHA256(token))` bilan tekshiriladi, 24 soatdan eski ma'lumot rad etiladi. Birinchi kirish — yangi hisob (parolsiz), kirgan foydalanuvchi uchun — hisobga ulash ("Asosiy"da tugma). Sozlama: `.env` da `DJANGO_TELEGRAM_BOT_TOKEN`, `DJANGO_TELEGRAM_BOT_NAME`; BotFather'da `/setdomain` = sayt domeni. Token bo'lmasa tugma ko'rinmaydi.
   - **Ma'lumotnoma keshi:** `cached_reference(lang)` (5 daqiqa); admin'da saqlash/o'chirish signal bilan darhol tozalaydi. `QuerySet.update()` signal bermaydi — ma'lumotnomani shunday o'zgartirsangiz `invalidate_reference()` ni chaqiring.
3. `app.js` `S` ni o'zgartiradi. `save()` 700 ms dan keyin `PUT /api/obyekt/<id>/state/` yuboradi (JSON, `v: 1` majburiy, CSRF header bilan). Server `S.obj.name` dan obyekt nomini oladi.
4. `index.html` ni to'g'ridan-to'g'ri ochish (Djangosiz) hali ishlaydi: `SERVER` yo'q bo'lsa, `localStorage` (`smetago-v1`) ishlatiladi.

### 5.2 Invariantlar
- **Holatda kalitlar har doim o'zbekcha**: xona turi (`room.type = "Mehmonxona"`), birlik (`"dona"`, `"m²"`), material guruhi (`"Pol"`), hudud (`"Toshkent sh."`), chorak (`"2026-yil III chorak"`). Tarjima faqat ko'rsatishda: `tr()`, `U()`, `rtLabel()`, `qLabel()`. Shu sabab tilni istalgan payt almashtirish obyektni buzmaydi. Hisoblash mantiqi ham shu kalitlarga tayanadi (masalan, `pp.u==="dona"`).
- **Eshik** — `{t, w, h, q}`: turi (`DOOR_TYPES` dagi o'zbekcha nom, bo'sh = tanlanmagan), eni, bo'yi va soni (bo'sh = 1). `eni × soni` plintusdan, `eni × bo'yi × soni` devordan ayiriladi. Eshik/deraza yonida m² ko'rsatiladi (`updOpenings`).
- **Qoplama o'lchami** — xonada ixtiyoriy `fL/fW` (pol), `wL/wW/wH` (devor), `cL/cW` (shift). Bo'sh bo'lsa xonaning `L/W/H` olinadi (`roomCalc` → `dim()`). Plintus pol perimetridan hisoblanadi. Smeta qatorida aniq o'lchov va zaxira alohida yoziladi: `20,00 m² + 10% = 22,00 m²`.
- **Shift `shift_boyoq`** kaliti endi "Suv emulsiyali bo'yoq" (kalit eski obyektlar uchun saqlangan). Yangi materiallar (`relin`, `shift_moyli`, `shift_akril`, `plastik_shift`) mavjud bazalarga `0007` migratsiyasi (`sync_materials`) orqali qo'shiladi; seed'ga material qo'shsangiz, xuddi shunday migratsiya yozing. Eski obyektlarda eshik faqat eni edi (`"0,9"`) — yuklanganda `mkDoor("", eni)` ga aylantiriladi (bo'yi `DOOR_H`), shuning uchun `v` o'zgarmadi. Eshik turi hozircha narxga ta'sir qilmaydi.
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

### 5.4b Boshqaruv paneli: "Panellar" menyusi (2026-10-06)
- Foydalanuvchi talabi: boshqaruv panelidagi har bir kartani o'zi yoqib-o'chirib tanlay olsin.
- Belgilash: karta — `data-panel="kalit"`, menyuda `<input data-panel-toggle="kalit">` (`<details data-panels-menu>`). Mantiq — `static/smeta/js/panels.js` (umumiy: boshqa sahifaga ham shu atributlar bilan qo'shiladi).
- Yashirilganlar `localStorage["smetago-panels:<uid>:<sahifa>"]` da (foydalanuvchi va sahifa bo'yicha). O'ng/chap ustun bo'shasa, ikkinchisi to'liq kenglikka o'tadi (CSS `:has`).
- **CSS nomlari:** yon panel — `aside.sb`; element qo'shish oynasining tanasi ham `.sb` ("sheet body"). Yon panel qoidalarini faqat `aside.sb` ga yozing — avval `.sb{height:100vh}` oynani buzib, "Xonaga qo'shish" tugmasini ekrandan chiqarib yuborgan edi.

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

### Unit testlar — `python manage.py test smeta` (22 ta)
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
| 1 | ~~Serverga joylash~~ — **bajarildi (2026-09-28)**, qarang: 9-bo'lim | Qolgani: o'z domeni (`.uz`, cctld.uz registratori orqali) va kerak bo'lsa SQLite o'rniga PostgreSQL. |
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

## 9. Server (production)

- **Manzil:** https://smetago.169-58-130-201.nip.io — server `169.58.130.201` (Ubuntu 24.04). **Server umumiy**: unda 30+ boshqa loyiha ishlaydi — faqat SmetaGO'ga tegishli narsalarni o'zgartiring.
- **Ilova:** `/opt/smetago` (git clone, egasi `smetago` tizim foydalanuvchisi), `.venv`, baza `db.sqlite3`, sozlamalar `.env` (chmod 600: `DJANGO_SECRET_KEY`, `DJANGO_DEBUG=0`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_CSRF_TRUSTED_ORIGINS`, `DJANGO_BEHIND_PROXY=1`).
- **Xizmat:** `smetago.service` (systemd) — gunicorn `172.18.0.1:8510`, 2 worker. Log: `journalctl -u smetago -f`.
- **Proksi:** umumiy Caddy konteyneri `coach-caddy-1`, fayl `/opt/coach/deploy/Caddyfile` (oxirida SmetaGO bloki). Faylni faqat `>>` bilan yoki joyida tahrirlang — u konteynerga bind-mount qilingan, `sed -i` inode'ni almashtirib, bog'lanishni uzadi. Tekshirish va qo'llash: `docker exec coach-caddy-1 caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile`, keyin `caddy reload`.
- **Firewall:** `ufw allow from 172.18.0.0/16 to any port 8510` — port faqat Caddy uchun ochiq, internetdan yopiq.
- **Yangilash** (GitHub'ga push'dan keyin):
  ```bash
  cd /opt/smetago && sudo -u smetago git pull --ff-only \
   && sudo -u smetago .venv/bin/pip install -q -r requirements.txt \
   && sudo -u smetago bash -c 'set -a; . ./.env; set +a; .venv/bin/python manage.py migrate --noinput && .venv/bin/python manage.py collectstatic --noinput' \
   && systemctl restart smetago
  ```
- **Deploydan oldin:** bazani nusxalang (`cp -p db.sqlite3 db.sqlite3.bak-$(date +%Y%m%d-%H%M%S)`) va `/dev/null` ruxsati `666` ekanini tekshiring (`stat -c %a /dev/null`). 2026-10-10 da u `644` bo'lib qolgan va `sudo -u smetago git` ishlamagan — `chmod 666 /dev/null` bilan tiklandi.
- Admin: `cd /opt/smetago && sudo -u smetago bash -c 'set -a; . ./.env; set +a; .venv/bin/python manage.py createsuperuser'`.
- Zaxira: `db.sqlite3` ni vaqti-vaqti bilan nusxalang (hali avtomatlashtirilmagan).

---

## 10. Hisob va kirish ma'lumotlari

- GitHub: `baxtiyorjumaboyev`. Repo commit muallifi repo-local `git config` da sozlangan. Yangi muhitda `git config user.name` / `user.email` ni qayta sozlang (foydalanuvchidan so'rang).
- Parollar, tokenlar va `SECRET_KEY` bu faylda **yo'q va bo'lmasligi kerak** — repo public.

---

## Dizayn qoidalari (2026-10-10)

- **Palitra:** slate (to'q ko'k-kulrang) + amber (to'q sariq). Aksent `--accent` (`#d97706`, tungi rejimda `#f59e0b`). Yashil ranglar butunlay olib tashlangan — yangi rang qo'shsangiz, shu ikki oiladan oling.
- **Logotip:** `icons/logo.svg` — vektor (chizmachilik uchburchagi), fon `#d97706`. PNG ikonkalar (favicon, apple-touch, 192/512, maskable) `icon.svg` / `maskable.svg` dan yaratiladi. SVG izohida `--` yozmang (XML xatosi — logotip ko'rinmay qoladi; `test_svg_icons_are_valid_xml`).
- **"AI ko'rinishi"dan qochish** (foydalanuvchi talabi): emoji yo'q; KATTA HARFLI monospace yorliqlar yo'q; tugmalarda rangli nur (glow) yo'q; gradient/katakli bezak fonlar yo'q; reklama sarlavhalari o'rniga qisqa nomlar ("Imkoniyatlar", "Qanday ishlaydi"). Uslub bloki: `style.css` oxiridagi "Tinch uslub".
- `i18n.js` faqat `_head.html` da ulanadi — sahifada qayta ulamang (`LANG already declared` xatosi).
- Top-level `const` (masalan `MIX`) `window` da bo'lmaydi: `typeof MIX !== "undefined"` bilan tekshiring.
