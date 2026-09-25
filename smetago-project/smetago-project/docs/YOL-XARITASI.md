# Yo'l xaritasi

| Versiya | Holat | Tarkibi |
| --- | --- | --- |
| 0.1 | tayyor | Xonalar, o'lchamlar, avtomatik pol/plintus/devor/shift, katalog, "+ o'z elementim", smeta, nusxa olish |
| 0.2 | tayyor | Telefon moslashuvi: kartochkalar, pastdan ochiladigan katalog; beton kalkulyatori; 3 manbali narxlar; ish haqi |
| 0.3 | reja | Excel (.xlsx) va PDF yuklab olish; bir nechta obyektni saqlash; obyekt nusxasi |
| 0.4 | reja | Backend va baza: foydalanuvchi hisoblari, jamoaviy ishlash, narxlarni markazdan yangilash |
| 0.5 | reja | Narx integratsiyalari: rasmiy resurs narxlari bazasi (kodlar bilan), birja, "Gloter"; internetdan narx yig'ish |
| 1.0 | reja | Davlat standarti (ShNQ) bo'yicha smeta formati; resurs kodlari; mobil ilova (PWA) |

## Ochiq savollar

- "Gloter" dasturining aniq nomi va unga API orqali ulanish imkoniyati bormi?
- Kodli rasmiy narxlar bazasi qaysi (nomi, manbasi, pullik yoki bepul)?
- Daromad modeli: obuna, har bir smeta uchun to'lov yoki korporativ litsenziya?

## Backendga o'tish tavsiyasi (0.4)

- Holat obyekti `S` o'zgarmaydi. `save()` va yuklash qismini API chaqiruviga almashtirish kifoya.
- Taklif qilinadigan jadvallar: `users`, `objects`, `rooms`, `room_items`, `concrete_works`, `prices` (chorak va hudud bilan), `catalog`.
- Katalog va narxlarni serverdan olib, `data.js` ni faqat standart qiymatlar manbai sifatida qoldirish mumkin.
