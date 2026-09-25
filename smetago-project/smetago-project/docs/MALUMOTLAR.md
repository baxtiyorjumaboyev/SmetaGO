# Ma'lumotlarni tahrirlash

Barcha ma'lumotnomalar `js/data.js` faylida. O'zgartirgach, brauzerdagi eski saqlangan ma'lumotni tozalang (README, 4-bo'lim). Aks holda **narxlar** eski holicha qoladi, chunki ular `localStorage` dan o'qiladi. Katalog esa har safar `data.js` dan yangidan o'qiladi.

## 1. Katalogga element qo'shish

`CATALOG` — guruhlar massivi. Mavjud guruhga element qo'shing:

```js
{g:"Elektrika", items:[
  ...
  {id:"datchik", n:"Harakat datchigi", u:"dona", p:150000, h:.5},
]}
```

| Maydon | Majburiy | Ma'nosi |
| --- | --- | --- |
| `id` | ha | Takrorlanmas kalit (lotin harflari, `_`) |
| `n` | ha | Ko'rinadigan nomi |
| `u` | ha | Birlik: `dona`, `m`, `m²`, `m³`, `seksiya`, `komplekt` |
| `p` | ha | Standart narx, so'm |
| `h` | ha | O'rnatish vaqti, soat/birlik (0 — faqat sotib olish) |
| `v` | yo'q | Turlari: `[["Nomi", narx], ["Nomi 2", narx, soat]]` |
| `dims` | yo'q | `1` bo'lsa, o'lcham so'raladi (sm) |
| `w` | yo'q | `1` bo'lsa, quvvat so'raladi (Vt) |

Yangi guruh qo'shish uchun `CATALOG` ga `{g:"Guruh nomi", items:[...]}` obyektini qo'shing. U avtomatik ravishda alohida chip bo'lib chiqadi.

## 2. Xona turi va tavsiyalar

```js
ROOM_TYPES["Server xonasi"] = {
  floor:"linoleum", wall:"boyoq", ceil:"armstrong",
  s:["konditsioner","rozetka","shchit","kabel","led_panel"]   // katalog id lari
};
```

`s` — shu xona uchun "Tavsiya" bo'limida ko'rsatiladigan elementlar.

## 3. Qoplama qo'shish

1. `defaultPrices()` ga narx qatorini qo'shing:
   ```js
   {id:"vinil", n:"Vinil pol", u:"m²", g:"Pol", src:[130000,150000,170000], s:"", mode:"avg", manual:0},
   ```
2. `FLOOR` (yoki `WALL`, `CEIL`) ga qo'shing:
   ```js
   vinil:{l:"Vinil", pid:"vinil", h:.3, pl:"plintus_pvc"},
   ```
   `pid` — narx id si, `h` — soat/m², `pl` — plintus turi (faqat `FLOOR` uchun).

## 4. Standart narxlar

`defaultPrices()` ichida har bir materialning `src` massiviga 3 ta manba narxi yoziladi, `s` maydoniga esa manba nomlari. Foydalanuvchi narxlarni "Narxlar" bo'limida o'zgartirsa, yangi qiymat uning brauzerida saqlanadi.

## 5. Beton retsepti

`MIX` obyektiga yangi marka qo'shish mumkin: `[sement_kg, qum_kg, shag'al_kg, suv_l]` (1 m³ uchun, PC M500).

```js
MIX.M450 = [460, 640, 1200, 180];
```

## 6. Sozlamalar

`app.js` → `sample()` → `settings` obyektida: zaxira %, kutilmagan xarajat %, oylik, ish soati, zichliklar. Foydalanuvchi ularni "Narxlar → Ish haqi va sozlamalar" bo'limida o'zgartiradi.
