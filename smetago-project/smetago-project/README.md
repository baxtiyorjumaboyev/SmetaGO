# SmetaGo

Smetachi, PTO mutaxassisi, pudratchi va nazoratchi uchun veb-ilova. Foydalanuvchi obyektga borib xonalarni o'lchaydi va xonada bor narsalarni katalogdan tanlaydi. Ilova material hajmini, narxini va ish haqini hisoblab, tayyor smeta chiqaradi.

Versiya: **0.2 (MVP)**. Server va baza yo'q, hamma narsa brauzerda ishlaydi.

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
