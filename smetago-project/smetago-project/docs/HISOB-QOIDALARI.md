# Hisob-kitob qoidalari

Barcha formulalar `js/app.js` faylida. Belgilar: **L** — uzunlik, **W** — en, **H** — balandlik (m), **z** — material zaxirasi (`settings.reserve`, standart 10%).

## 1. Xona geometriyasi — `roomCalc()`

| Ko'rsatkich | Formula |
| --- | --- |
| Pol maydoni | L × W |
| Perimetr | 2 × (L + W) |
| Eshiklar maydoni | Σ (eshik eni × 2,1 m) |
| Derazalar maydoni | Σ (eni × balandligi) |
| Devor (sof) | perimetr × H − eshiklar − derazalar |
| Devordagi kafel | kafel uzunligi × kafel balandligi |

Eshik balandligi `DOOR_H = 2.1` doimiysida (`data.js`).

## 2. Plintus

```
plintus (m) = perimetr − Σ eshiklar eni − devordagi kafel uzunligi
```

- Pol **kafel** bo'lsa, kafel uzunligi ayirilmaydi, plintus turi esa "kafel plintus" bo'ladi.
- "Plintus, m (qo'lda)" maydoni to'ldirilsa, avtomatik qiymat o'rniga shu qiymat olinadi.
- Plintus turi poldan kelib chiqadi: laminat va linoleum → PVC, parket → yog'och, kafel → kafel plintus.
- Donaga o'girish (PVC va yog'och): `dona = ⌈ plintus × (1 + z) / 2,5 ⌉`. Kafel plintus metrda hisoblanadi.
- Ish vaqti: 0,1 soat/m.

**Misol:** xona 5 × 4 m, 3 ta eshik × 0,9 m → 18 − 2,7 = **15,3 m** → ⌈15,3 × 1,1 / 2,5⌉ = **7 dona**.

## 3. Qoplamalar

| Qator | Miqdor | Ish, soat/m² |
| --- | --- | --- |
| Pol (laminat, kafel, linoleum, parket) | pol × (1 + z) | 0,3 / 1,0 / 0,15 / 0,6 |
| Devor — bo'yoq, gipsokarton | devor (sof) − kafel qismi | 0,35 / 0,6 |
| Devor — oboy, kafel | (devor (sof) − kafel qismi) × (1 + z) | 0,25 / 1,1 |
| Devordagi kafel qismi | kafel maydoni × (1 + z) | 1,1 |
| Shift | pol maydoni | 0,35 / 0,3 / 0,7 / 0,3 |

Zaxira faqat kesib ishlatiladigan materiallarga (plitka, oboy, laminat) qo'shiladi.

## 4. Katalog elementlari — `itemLine()`

```
material = miqdor × narx
ish soati = miqdor × h   (h — katalogdagi o'rnatish vaqti)
```

## 5. Narx tanlash — `priceOf()`

3 ta manbadan 0 dan katta qiymatlar olinadi, keyin tanlovga qarab:

| Tanlov | Natija |
| --- | --- |
| o'rtacha | (a + b + c) / 3 |
| eng arzon | min |
| eng qimmat | max |
| qo'lda | `manual` maydoni |

**Misol:** sement 2000 / 1800 / 1700 so'm/kg → o'rtacha **1 833 so'm**.

## 6. Ish haqi — `rate()`

```
soatlik stavka = o'rtacha oylik / oyiga ish soati
               = 7 030 000 / 176 ≈ 39 943 so'm
ish haqi (qator) = ish soati × soatlik stavka
```

Standart oylik — qurilish sohasida 2026-yil yanvar–iyun oylaridagi o'rtacha nominal ish haqi (Milliy statistika qo'mitasi).

## 7. Beton — `concreteCalc()`

1 m³ uchun retsept (`MIX`, PC M500; СНиП 82-02-95 va ГОСТ 7473-2010 asosidagi ma'lumotnoma):

| Marka | Sement, kg | Qum, kg | Shag'al, kg | Suv, l |
| --- | --- | --- | --- | --- |
| M150 | 230 | 850 | 1200 | 145 |
| M200 | 280 | 800 | 1200 | 155 |
| M250 | 320 | 750 | 1200 | 160 |
| M300 | 350 | 720 | 1200 | 165 |
| M350 | 380 | 700 | 1200 | 170 |
| M400 | 420 | 670 | 1200 | 175 |

```
V = L × W × T  (yoki to'g'ridan-to'g'ri m³)
sement (kg)   = retsept × V × (PC M400 bo'lsa 1,15)
shag'al (m³)  = 1200 × V / 1400
qum (m³)      = qum_kg × V / 1500
suv (m³)      = suv_l × V / 1000
1 m³ tannarxi = Σ (miqdor × narx) / V
ish           = V × 3 soat
```

**Misol, M200, 1 m³, o'rtacha narxlarda:** sement 280 × 1 833 = 513 333 · shag'al 0,857 × 550 000 = 471 429 · qum 0,533 × 76 667 = 40 889 · suv 0,155 × 6 000 = 930 → jami **≈ 1 026 581 so'm/m³**.

## 8. Smeta — `buildSmeta()`

```
qator jami   = material + ish haqi
bevosita     = Σ material + Σ ish haqi
kutilmagan   = bevosita × contingency %   (standart 5%)
QQS          = (bevosita + kutilmagan) × 12%   (yoqilgan bo'lsa)
JAMI         = bevosita + kutilmagan + QQS
```
