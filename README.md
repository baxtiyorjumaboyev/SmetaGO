# SmetaGo

Smetachi, PTO mutaxassisi, pudratchi va nazoratchi uchun veb-ilova. Foydalanuvchi obyektga borib xonalarni o'lchaydi va xonada bor narsalarni katalogdan tanlaydi. Ilova material hajmini, narxini va ish haqini hisoblab, tayyor smeta chiqaradi.

Versiya: **0.4 (Django)**. Foydalanuvchi hisoblari va obyektlar SQLite bazada saqlanadi. Eski statik versiya `smetago-project/` papkasida o'zgarmay turibdi.

---

## 0. Django bilan ishga tushirish

**Talab:** Python 3.10+ ([python.org](https://www.python.org/downloads/), o'rnatishda **"Add python.exe to PATH"** ni belgilang).

```powershell
cd C:\Users\Robbit\Desktop\SmetaGO
python -m venv .venv
.\.venv\Scripts\Activate.ps1          # xato bersa: Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser      # admin panel uchun (ixtiyoriy)
python manage.py runserver
```

Brauzerda `http://127.0.0.1:8000` → ro'yxatdan o'ting → «+ Yangi obyekt» yoki «Namunaviy obyekt». Admin panel: `http://127.0.0.1:8000/admin/`.

Telefonda sinash: `python manage.py runserver 0.0.0.0:8000`, so'ng telefonda `http://<kompyuter-IP>:8000`.

### Django tuzilishi

```
SmetaGO/
├── manage.py
├── requirements.txt
├── config/                 # settings.py, urls.py, wsgi.py
└── smeta/                  # asosiy ilova
    ├── models.py           # Obyekt: owner, name, state (JSON — frontenddagi S), created, updated
    ├── views.py            # obyektlar ro'yxati, yaratish, nusxa, o'chirish, state API, ro'yxatdan o'tish
    ├── urls.py
    ├── admin.py
    ├── migrations/
    ├── templates/smeta/    # app.html (ilova), obyekt_list.html, base.html
    ├── templates/registration/  # login.html, register.html
    └── static/smeta/       # css/style.css, js/data.js, js/app.js (serverga ulangan nusxa)
```

| URL | Vazifasi |
| --- | --- |
| `/` | Foydalanuvchi obyektlari ro'yxati |
| `/obyekt/<id>/` | Smeta ilovasi (xonalar, beton, narxlar, smeta) |
| `/api/obyekt/<id>/state/` | `GET` — holatni o'qish, `PUT` — saqlash (JSON, `v:1`) |
| `/kirish/`, `/chiqish/`, `/royxatdan-otish/` | Hisob |

### Ma'lumotnoma (admin panelda)

Katalog, material narxlari va xona turlari bazada saqlanadi va `/admin/` da tahrirlanadi. Ular birinchi `migrate` da `smeta/seed/malumotnoma.json` dan (asl `data.js` qiymatlari) avtomatik yuklanadi.

| Admin bo'limi | Nima qilinadi |
| --- | --- |
| **Katalog guruhlari** | Guruh qo'shish, tartibi; ichida elementlar ro'yxati |
| **Katalog elementlari** | Narx, soat, birlik, turlari (variantlar), "o'lcham/quvvat so'ralsin". *Faol* belgisini olib tashlash — elementni yashiradi (o'chirishdan xavfsizroq) |
| **Material narxlari** | 3 ta manba narxi va manbalar nomi — ro'yxatning o'zida tahrirlanadi |
| **Xona turlari** | Standart pol/devor/shift va "Tavsiya" elementlari |

- Element yoki material **kaliti** (`key`) yaratilgandan keyin o'zgarmaydi: u saqlangan obyektlarda va `data.js` dagi `FLOOR/WALL/CEIL` da ishlatiladi.
- Qoplama turlari (`FLOOR/WALL/CEIL`), beton retseptlari (`MIX`), hududlar va choraklar formulalarga bog'liq, shuning uchun `data.js` da qoladi.
- **Mavjud obyektlarga ta'siri:** xonaga qo'shilgan elementlar narxi o'zgarmaydi (smeta tuzilgan paytdagi narx). Yangi material avtomatik qo'shiladi. Manba narxlarini yangilash uchun foydalanuvchi **Narxlar → "Markaziy narxlarni yuklash"** tugmasini bosadi, bunda uning tanlovi (o'rtacha / eng arzon / qo'lda) saqlanib qoladi.

Testlar: `.\.venv\Scripts\python.exe manage.py test smeta`

**Saqlash qanday ishlaydi.** `app.js` avvalgidek `S` holati bilan ishlaydi. Sahifa Django orqali ochilganda (`window.SMETAGO` bor) holat shablonga joylanadi, `save()` esa uni 0,7 soniyadan keyin `PUT` bilan serverga yuboradi. Sahifa yopilayotganda saqlanmagan o'zgarish ham jo'natiladi. Obyekt nomi ro'yxat uchun `S.obj.name` dan olinadi.

**Serverga joylash.** Muhit o'zgaruvchilari: `DJANGO_SECRET_KEY` (uzun tasodifiy qator), `DJANGO_DEBUG=0`, `DJANGO_ALLOWED_HOSTS=smetago.uz`, `DJANGO_CSRF_TRUSTED_ORIGINS=https://smetago.uz`. So'ng `python manage.py collectstatic` va gunicorn/uWSGI + nginx (yoki PythonAnywhere, Railway, Render).

---

## 1. Tezkor ishga tushirish (VS Code)

1. Papkani oching: **File → Open Folder… → `smetago-project`**.
2. VS Code tavsiya qilgan kengaytmalarni o'rnating. Pastki o'ng burchakda "Install" chiqadi, ro'yxat `.vscode/extensions.json` faylida:
   - **Live Server** (ritwickdey.LiveServer) — saytni lokal serverda ochadi.
   - **Prettier** — kodni formatlaydi (ixtiyoriy).
3. `index.html` faylini oching, o'ng tugmani bosing va **"Open with Live Server"** ni tanlang.
4. Brauzerda `http://127.0.0.1:5500` ochiladi. Faylni saqlasangiz, sahifa o'zi yangilanadi.

Live Serversiz ham ishlaydi: `index.html` ni ikki marta bosib brauzerda ochish kifoya.

**Telefonda sinash.** Kompyuter va telefon bir Wi-Fi tarmog'ida bo'lishi kerak. Live Server ishlab turganda telefonda `http://<kompyuter-IP>:5500` manzilini oching. Kompyuter IP manzilini Windows'da `ipconfig`, Mac'da `ifconfig` buyrug'i bilan bilasiz.

---

## 2. Papka tuzilishi

```
smetago-project/
├── index.html            # Sahifa skeleti: sarlavha, tablar, bo'sh konteynerlar
├── css/
│   └── style.css         # Barcha uslublar: ranglar, tungi rejim, telefon moslashuvi
├── js/
│   ├── data.js           # Ma'lumotnoma: katalog, xona turlari, qoplamalar, beton, narxlar
│   └── app.js            # Mantiq: holat, hisob-kitob, chizish, hodisalar
├── docs/
│   ├── ARXITEKTURA.md    # Kod qanday tuzilgan, qaysi funksiya nima qiladi
│   ├── HISOB-QOIDALARI.md# Formulalar: pol, plintus, devor, beton, ish haqi
│   ├── MALUMOTLAR.md     # Katalogga element / narx / xona turi qo'shish
│   └── YOL-XARITASI.md   # Keyingi versiyalar rejasi
├── .vscode/              # VS Code sozlamalari va tavsiya kengaytmalar
└── README.md
```

Skriptlar tartib bilan yuklanadi: avval `data.js`, keyin `app.js`. `app.js` fayli `data.js` dagi o'zgaruvchilardan (`CATALOG`, `MIX`, `FLOOR` va boshqalar) foydalanadi, shuning uchun tartibni almashtirmang.

---

## 3. Ilova nima qiladi

| Bo'lim | Vazifasi |
| --- | --- |
| **Xonalar va o'lchov** | Xona qo'shish; uzunlik, en, balandlik; eshik va derazalar; pol, devor va shift qoplamasi. Pol, plintus, devor va shift avtomatik hisoblanadi. Katalogdan element qo'shiladi, ro'yxatda yo'q narsani "+" tugmasi bilan o'zingiz yozasiz. |
| **Beton** | Marka (M150–M400), sement markasi (PC M500 yoki M400) va hajm kiritiladi. Natijada sement, shag'al, qum va suv miqdori, 1 m³ tannarxi va zavod narxi bilan solishtirish chiqadi. |
| **Narxlar** | Har bir material uchun 3 ta manbadan narx kiritiladi. Tanlov: o'rtacha, eng arzon, eng qimmat yoki qo'lda. Shu bo'limda ish haqi va boshqa sozlamalar ham bor. |
| **Smeta** | Xonalar va beton ishlari bo'yicha jadval hamda jami summa. Kutilmagan xarajatlar va QQS 12% qo'shiladi. Natijani "Excel uchun" yoki "matn sifatida" nusxa olish mumkin. |

Pastki qatorda doim jami summa ko'rinib turadi. Telefonda katalog "+ Element qo'shish" tugmasi bilan pastdan ochiladi.

---

## 4. Ma'lumot qayerda saqlanadi

- Hamma kiritilgan ma'lumot brauzerning `localStorage` xotirasida, **`smetago-v1`** kaliti ostida saqlanadi (`app.js` → `save()`).
- Ma'lumot faqat o'sha brauzer va o'sha qurilmada qoladi, boshqa foydalanuvchiga o'tmaydi.
- Toza holatdan boshlash uchun: DevTools → Application → Local Storage → `smetago-v1` ni o'chiring. Yoki sahifadagi "Yangi obyekt" tugmasini bosing.
- Ma'lumot tuzilishini o'zgartirsangiz (yangi maydon qo'shsangiz), `v:1` ni `v:2` ga oshiring. Aks holda eski saqlangan ma'lumot yangi kod bilan mos kelmay qolishi mumkin (`docs/ARXITEKTURA.md`, 5-bo'lim).

---

## 5. Tez-tez qilinadigan o'zgarishlar

| Nima qilmoqchisiz | Qaysi fayl | Qaysi joy |
| --- | --- | --- |
| Katalogga yangi element qo'shish | `js/data.js` | `CATALOG` massivi |
| Standart material narxini o'zgartirish | `js/data.js` | `defaultPrices()` |
| Yangi xona turi va unga tavsiyalar | `js/data.js` | `ROOM_TYPES` |
| Yangi pol, devor yoki shift qoplamasi | `js/data.js` | `FLOOR`, `WALL`, `CEIL` (+ narxi `defaultPrices()` da) |
| Beton retsepti | `js/data.js` | `MIX` |
| Ish haqi, zaxira %, kutilmagan xarajat % | `js/app.js` | `sample()` → `settings` |
| Formula (masalan, plintus hisobi) | `js/app.js` | `roomCalc()` |
| Rang va shrift | `css/style.css` | `:root` tokenlari |

Batafsil ko'rsatmalar `docs/MALUMOTLAR.md` faylida.

---

## 6. Texnologiyalar

- Toza HTML, CSS va JavaScript (ES2020). Freymvork ham, yig'uvchi (build) vosita ham yo'q.
- Shriftlar Google Fonts'dan: Onest (sarlavhalar), IBM Plex Sans (matn), IBM Plex Mono (raqamlar). Internet bo'lmasa, tizim shriftlari ishlatiladi.
- Brauzerlar: Chrome, Edge, Safari va Firefoxning so'nggi versiyalari; Android va iOS.

---

## 7. Serverga joylash (domen olingach)

Loyiha statik, shuning uchun istalgan hostingga papkani shundayligicha yuklash kifoya:

- **Oddiy hosting (ahost.uz, webname.uz va h.k.):** papkadagi fayllarni FTP yoki panel orqali `public_html` ga yuklang.
- **GitHub Pages / Netlify / Vercel:** papkani repozitoriyaga qo'ying va statik sayt sifatida ulang. Keyin domenni (masalan, `smetago.uz`) DNS sozlamalari orqali bog'lang.

Domenni `.uz` zonasi uchun akkreditatsiyadan o'tgan registrator orqali olasiz (ro'yxati cctld.uz saytida).

---

## 8. Ma'lum cheklovlar

- Narxlar **namunaviy**, haqiqiy manbalardagi narxlar bilan almashtirish kerak.
- Ma'lumot faqat bitta brauzerda saqlanadi, umumiy baza va foydalanuvchi hisoblari hali yo'q.
- Smeta oddiy formatda, davlat standarti (ShNQ) formati keyingi versiyada qo'shiladi.
- Brauzerdan fayl yuklab olish (Excel, PDF) hali yo'q, hozircha "nusxa olish" orqali ishlaydi.
- Beton retseptlari ma'lumotnoma uchun (СНиП 82-02-95, ГОСТ 7473-2010). Mas'uliyatli konstruksiyalar uchun laboratoriya tanlagan tarkib kerak.
