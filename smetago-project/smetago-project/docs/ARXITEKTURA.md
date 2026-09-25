# Arxitektura

SmetaGo bitta sahifali ilova (SPA). Hamma ma'lumot bitta global `S` (state) obyektida saqlanadi. Har bir o'zgarishdan keyin kerakli qism qayta chiziladi va `S` brauzer xotirasiga yoziladi.

```
Foydalanuvchi kiritadi ──► hodisa (input / click)
                              │
                              ▼
                       S (state) yangilanadi
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
      hisob-kitob       qayta chizish       save()
   roomCalc, buildSmeta  render / renderX   localStorage
```

## 1. Holat (state) — `S`

`sample()` funksiyasi namunaviy obyektni yaratadi. Tuzilishi:

```js
S = {
  v: 1,                        // ma'lumot versiyasi (migratsiya uchun)
  sample: true,                // namunaviy obyektmi (xabar ko'rsatish uchun)
  obj: { name, region, quarter },
  settings: {
    reserve: 10,               // material zaxirasi, %
    piece: 2.5,                // 1 dona plintus uzunligi, m
    contingency: 5,            // kutilmagan xarajatlar, %
    vat: false,                // QQS 12%
    monthly: 7030000,          // o'rtacha oylik (qurilish), so'm
    hoursMonth: 176,           // oyiga ish soati
    rhoSheben: 1400, rhoQum: 1500,  // zichlik, kg/m³
    concreteHours: 3           // beton ishi, soat/m³
  },
  prices: [ { id, n, u, g, src:[3 ta narx], s, mode:'avg'|'min'|'max'|'manual', manual } ],
  rooms: [ {
    id, type, name, L, W, H,           // o'lchamlar (matn, vergul bilan: "2,8")
    doors: ["0,9", ...],               // eshiklar eni, m
    windows: [ {w, h}, ... ],          // derazalar, m
    floor, wall, ceil,                 // FLOOR / WALL / CEIL kalitlari
    tileLen, tileH,                    // devordagi kafel qismi
    plinthOv,                          // plintus qo'lda (bo'sh = avto)
    items: [ { uid, cid, name, variant, unit, qty, price, h, dims, watt, note, custom } ]
  } ],
  concrete: [ { id, name, grade, cem, mode:'vol'|'dims', L, W, T, V, factory } ],
  ui: { tab, room, grp, q, confirmDel, confirmReset }
}
```

Raqamli maydonlar **matn** ko'rinishida saqlanadi. Shunda foydalanuvchi yozgan "2,8" o'zgarmay qoladi. Hisoblashda `num()` funksiyasi vergulni nuqtaga almashtirib, qiymatni songa aylantiradi.

## 2. `js/app.js` bo'limlari

| Bo'lim | Funksiyalar | Vazifasi |
| --- | --- | --- |
| helpers | `num`, `fmt`, `fd`, `esc`, `sum`, `uid` | Son o'qish, formatlash (`1 234 567`, `2,50`), HTML ekranlash |
| state | `mkRoom`, `mkItem`, `sample`, `save` | Yangi xona va element yaratish, namunaviy obyekt, saqlash |
| calculations | `priceStats`, `priceOf`, `rate`, `roomCalc`, `itemLine`, `concreteCalc`, `lineTotals`, `buildSmeta` | Barcha hisoblar (docs/HISOB-QOIDALARI.md) |
| rendering | `render`, `viewRooms`, `renderDerived`, `renderCatItems`, `renderTotal`, `viewConcrete`, `renderConcreteDerived`, `viewPrices`, `viewSmeta` | HTML chizish |
| export | `smetaTsv`, `smetaTxt`, `copy`, `toast` | Nusxa olish (Excel va matn) |
| modal | `openPick`, `openCustom`, `modalAdd`, `closeModal` | Element qo'shish oynasi |
| events | `click`, `input`, `keydown` tinglovchilari | Foydalanuvchi harakatlari |

## 3. Chizish qoidasi

- `view*()` funksiyalari butun bo'limning HTML'ini qaytaradi. `render()` ularni `#app` ichiga joylaydi. Bu tab, xona yoki eshik qo'shilgandek **tuzilma o'zgarganda** chaqiriladi.
- Maydonga yozish paytida kursor yo'qolmasligi uchun forma qayta chizilmaydi. Faqat hisob qismlari yangilanadi: `renderDerived()` (xona hisobi), `renderTotal()` (pastki qator), `renderConcreteDerived()`, `renderCatItems()`.
- Tugmalar `data-act="..."` atributi orqali ishlaydi. Hamma tugma bitta `click` tinglovchisidagi `switch` bilan boshqariladi.
- Maydonlar atribut orqali holatga bog'lanadi:

| Atribut | Qayerga yoziladi |
| --- | --- |
| `data-o="name"` | `S.obj.name` |
| `data-f="L"` | joriy xona: `room.L` |
| `data-door="0"` | `room.doors[0]` |
| `data-win="0" data-k="w"` | `room.windows[0].w` |
| `data-it="<uid>" data-k="qty"` | xona elementi |
| `data-c="<id>" data-k="grade"` | beton ishi |
| `data-p="<id>" data-i="0"` / `data-k="mode"` | narxlar |
| `data-s="monthly"` | `S.settings` |

Yangi maydon qo'shish uchun HTML'ga shu atributlardan birini qo'yish yetarli. `input` tinglovchisi uni o'zi holatga yozadi.

## 4. Telefon moslashuvi

`css/style.css` ichida uchta chegara bor:

- `max-width:1180px` — katalog yon ustundan pastga tushadi.
- `max-width:760px` — telefon rejimi:
  - jadvallar (`.rtable`, `.ptable`) kartochkaga aylanadi;
  - katalog pastdan ochiladigan panelga aylanadi (`body.cat-open`);
  - `.fab` tugmasi ko'rinadi;
  - smetada `.hm` ustunlari yashiriladi.
- `max-width:400px` — kichik ekranlar uchun katalog bir ustunda chiqadi.

`.mobonly` klassi faqat telefonda, `.deskonly` klassi faqat kompyuterda ko'rinadi.

## 5. Ma'lumot versiyasi va migratsiya

Yuklanganda `S.v !== 1` bo'lsa, ma'lumot namunaviy obyekt bilan almashtiriladi. Holat tuzilishini o'zgartirganda:

1. `sample()` ichida `v: 2` qiling.
2. Foydalanuvchi ma'lumoti yo'qolmasligini istasangiz, yuklash qismiga migratsiya yozing:

```js
if (S && S.v === 1) { S.rooms.forEach(r => r.yangiMaydon = ""); S.v = 2; }
```

## 6. Tungi rejim

Ranglar `:root` dagi CSS o'zgaruvchilarida. Tungi palitra `@media (prefers-color-scheme: dark)` va `:root[data-theme="dark"]` ichida qayta aniqlanadi. Yangi rang qo'shganda uni ikkala joyda ham yozing.
