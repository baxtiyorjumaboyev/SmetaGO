/* SmetaGo — o'zbekcha / ruscha / kirillcha. data.js va app.js dan oldin yuklanadi.
 * Til localStorage, cookie yoki <html lang="..."> dan olinadi.
 * tr("o'zbekcha matn", ...qiymatlar) — matnni joriy tilda qaytaradi.
 */
function getInitialLang() {
  try {
    const l = localStorage.getItem("smetago-lang");
    if (l === "ru" || l === "uz_cyr" || l === "uz-cyr" || l === "uz") return l.replace("-", "_");
  } catch(e) {}
  const m = document.cookie.match(/django_language=([^;]+)/);
  if (m) {
    const l = decodeURIComponent(m[1]).trim();
    if (l === "ru" || l === "uz_cyr" || l === "uz-cyr" || l === "uz") return l.replace("-", "_");
  }
  return /^ru/i.test(document.documentElement.lang || "") ? "ru" : "uz";
}
let LANG = getInitialLang();

const RU={
 // soddalashtirish: qadamlar, "+ O'zim qo'shaman"
 "+ Katalogdan":"+ Из каталога","Boshqa (o'zim yozaman)…":"Другое (впишу сам)…","Boshqa eshik":"Другая дверь",
 "Eshik turi (o'zim yozaman)":"Тип двери (впишу сам)",
 "Mebel, rozetka, santexnika va boshqalar: katalogdan tanlang yoki ro'yxatda yo'q bo'lsa «+ O'zim qo'shaman» ni bosing.":"Мебель, розетки, сантехника и др.: выберите из каталога, а если чего-то нет — нажмите «+ Добавлю сам».",
 "O'zim qo'shaman":"Добавлю сам","O'zim yozaman":"Впишу сам","Qadamma-qadam to'ldiring — narx o'zi hisoblanadi.":"Заполняйте по шагам — цена посчитается сама.",
 "Qanday ishlaydi?":"Как это работает?","Qo'shimcha sozlamalar (ixtiyoriy)":"Дополнительные настройки (необязательно)",
 "Ro'yxatda yo'q bo'lsa — o'zingiz yozing":"Если нет в списке — впишите сами","Tayyor smetani ko'rish":"Посмотреть готовую смету",
 "Xonadagi narsalar ({0})":"Предметы в комнате ({0})","Xonaning 3D ko'rinishi":"3D-вид комнаты","Yo'riqnomani yopish":"Скрыть подсказку",
 "\"{0}\" topilmadi — o'zingiz qo'shing:":"«{0}» не найдено — добавьте сами:","ro'yxatda yo'q bo'lsa":"если нет в списке",
 "Xonani o'lchang":"Измерьте комнату","Eshik va derazani qo'shing":"Добавьте двери и окна","Pol, devor, shiftni tanlang":"Выберите пол, стены, потолок",
 "Xonadagi narsalarni qo'shing":"Добавьте предметы в комнате","Xona o'lchami":"Размеры комнаты",
 "Lenta bilan uzunligi, eni va balandligini o'lchang (metrda, masalan 4,5).":"Измерьте рулеткой длину, ширину и высоту (в метрах, например 4,5).",
 "Eshiklar":"Двери","Har bir eshik: turi, eni × bo'yi (m). Devor va plintusdan o'zi ayiriladi.":"Каждая дверь: тип, ширина × высота (м). Вычитается из стен и плинтуса автоматически.",
 "Derazalar":"Окна","Har bir deraza: eni × balandligi (m). Devor maydonidan o'zi ayiriladi.":"Каждое окно: ширина × высота (м). Вычитается из площади стен автоматически.",
 "Pol, devor va shift":"Пол, стены и потолок","Nima bilan qoplanadi — tanlang. Ro'yxatda yo'q bo'lsa «+ O'zim yozaman» ni bosing.":"Выберите отделку. Если нужной нет в списке — нажмите «+ Впишу сам».",
 // boshqaruv paneli va loyihalar (proba dizayni)
 "Barcha obyektlar bo'yicha: materiallar {0}, ish haqi {1} so'm.":"По всем объектам: материалы {0}, работа {1} сум.","Faol obyektlar":"Активные объекты",
 "Hali o'zgarish yo'q.":"Изменений пока нет.","Hali obyekt yo'q":"Объектов пока нет","Hali ochilmagan":"Ещё не открыт","Hisoblangan":"Рассчитан",
 "Ish haqi ulushi":"Доля работы","Jami smeta qiymati":"Общая стоимость смет","Jami smetalar":"Всего смет",
 "Ko'rsatilgan: {0} ta pozitsiya (jami {1} tadan)":"Показано позиций: {0} (всего {1})","Ko'rsatilmoqda: {0} ta / {1} ta":"Показано: {0} из {1}",
 "Kutilmagan":"Непредвиденные","Kutilmagan xarajatlar zaxirasi":"Резерв на непредвиденные","Maydon":"Площадь","Navbatda":"В очереди",
 "Obyekt qo'shing — 3D ko'rinish va summalar shu yerda chiqadi.":"Добавьте объект — здесь появятся 3D-вид и суммы.","Oxirgi o'zgarish":"Последнее изменение",
 "Yuborilmagan o'zgarishlar":"Неотправленные изменения","Oxirgi saqlash":"Последнее сохранение","Qo'shilgan qiymat solig'i (12%)":"НДС (12%)","Sinxronizatsiya":"Синхронизация","TANNARX":"СЕБЕСТОИМОСТЬ",
 "Tayyor":"Готово","To'g'ridan-to'g'ri xarajatlar":"Прямые затраты","Umumiy pol maydoni":"Общая площадь пола","Umumiy portfel":"Общий портфель",
 "Umumiy smeta":"Итого по смете","Xonalar hali kiritilmagan.":"Комнаты ещё не добавлены.","bu oy":"в этом месяце",
 "hisoblangan obyektlar bo'yicha":"по рассчитанным объектам","kutmoqda":"ожидают","mat.":"мат.","pol maydoni":"площадь пола","saqlangan":"сохранено",
 "ta":"шт.","ta hisoblangan":"рассчитано","xona":"комн.","{0} xona":"Комнат: {0}",
 // dashboard (Asosiy)
 "Elementlar":"Позиции","mlrd":"млрд","mln":"млн","ming":"тыс.","Jami smeta":"Итого по сметам","Obyektlar":"Объекты",
 "O'rtacha smeta":"Средняя смета","Smeta summasi":"Сумма смет","{0} ta obyekt":"Объектов: {0}",
 "Obyekt qo'shing — grafik shu yerda chiqadi.":"Добавьте объект — здесь появится график.","{0} ta bo'lim":"Разделов: {0}",
 "Hali hisoblangan obyekt yo'q.":"Пока нет рассчитанных объектов.","hali ochilmagan":"ещё не открыт",
 // umumiy
 "so'm":"сум","sm":"см","Vt":"Вт","avto":"авто","qo'lda":"вручную","katalog":"каталог","ish haqi":"оплата труда",
 "Sessiya tugagan — qayta kiring":"Сессия истекла — войдите снова",
 "Serverga saqlanmadi, qayta urinib ko'ring":"Не сохранено на сервере, попробуйте ещё раз",
 "Internet yo'q — o'zgarishlar qurilmada saqlandi":"Нет интернета — изменения сохранены на устройстве",
 "Aloqa tiklandi — o'zgarishlar yuborilmoqda":"Связь восстановлена — изменения отправляются",
 "Bosh sahifada o'lchangan xona qo'shildi":"Комната с главной страницы добавлена",
 // namunaviy obyekt
 "Oyna (hammom uchun)":"Зеркало (для ванной)",
 "Namuna: 2 xonali kvartira, Chilonzor":"Пример: 2-комнатная квартира, Чиланзар",
 "Hovli yo'lagi":"Дорожка во дворе","Ayvon poydevori":"Фундамент веранды",
 "Yangi obyekt":"Новый объект","Yangi beton ishi":"Новая бетонная работа",
 // xona turlari (bazasiz rejim uchun)
 "Mehmonxona":"Гостиная","Yotoqxona":"Спальня","Oshxona":"Кухня","Hammom":"Ванная","Koridor":"Коридор",
 "Ofis xonasi":"Офисное помещение","Navbatchi xona":"Дежурная комната","Boshqa":"Другое",
 // hududlar
 "Toshkent sh.":"г. Ташкент","Toshkent vil.":"Ташкентская обл.","Andijon":"Андижан","Buxoro":"Бухара",
 "Farg'ona":"Фергана","Jizzax":"Джизак","Xorazm":"Хорезм","Namangan":"Наманган","Navoiy":"Навои",
 "Qashqadaryo":"Кашкадарья","Qoraqalpog'iston":"Каракалпакстан","Samarqand":"Самарканд",
 "Sirdaryo":"Сырдарья","Surxondaryo":"Сурхандарья",
 // narx tanlovi
 "o'rtacha":"средняя","eng arzon":"самая низкая","eng qimmat":"самая высокая","{0} narx":"цена: {0}",
 // hisob qatorlari
 "Pol qoplamasi: {0}":"Покрытие пола: {0}","{0} dona × {1} m":"{0} шт. × {1} м",
 "Plintus: {0}":"Плинтус: {0}","{0} m (qo'lda o'lchangan)":"{0} м (измерено вручную)",
 "eshiklar":"двери","kafel":"плитка","Devor: {0}":"Стены: {0}",
 "{0} m² (eshik va derazalarsiz)":"{0} м² (без дверей и окон)","Devor: kafel qismi":"Стены: участок плитки",
 "Shift: {0}":"Потолок: {0}",
 "Sement":"Цемент","Shag'al (sheben)":"Щебень","Shag'al":"Щебень","Qum":"Песок","Suv":"Вода",
 "Qorishma tayyorlash va quyish":"Приготовление и заливка смеси","{0} soat/m³":"{0} ч/м³","Beton: {0}":"Бетон: {0}",
 // bo'limlar
 "Xonalar va o'lchov":"Комнаты и замеры","Beton":"Бетон","Narxlar":"Цены","Smeta":"Смета",
 "Pol":"Пол","Devor":"Стены","Shift":"Потолок",
 // xonalar
 "Xona turi":"Тип комнаты","+ Xona qo'shish":"+ Добавить комнату",
 "Xona qo'shing — o'lchamlarni kiritgach, hisob avtomatik chiqadi.":"Добавьте комнату — после ввода размеров расчёт появится автоматически.",
 "Bu namunaviy obyekt: 3 xona va 2 ta beton ishi bilan to'ldirilgan. O'zingiznikini boshlash uchun":"Это пример объекта: 3 комнаты и 2 бетонные работы. Чтобы начать свой, нажмите",
 "Tasdiqlang: hammasi o'chadi":"Подтвердите: всё будет удалено",
 "Xona nomi":"Название комнаты","Xona nomini yozing":"Введите название комнаты","{0}-xona":"Комната {0}","«{0}» xonasi o'chirilsinmi?":"Удалить комнату «{0}»?","Xona o'chirildi":"Комната удалена","O'chirishni tasdiqlang":"Подтвердите удаление","Xonani o'chirish":"Удалить комнату",
 "O'lchamlar, metr":"Размеры, метры","Uzunligi":"Длина","Eni":"Ширина","Balandligi":"Высота",
 "Eshiklar — turi, eni × bo'yi, m (eni plintusdan ayiriladi)":"Двери — тип, ширина × высота, м (ширина вычитается из плинтуса)",
 "Soni":"Количество","Jami: {0} ta eshik, {1} m²":"Итого: дверей {0}, {1} м²","Jami: {0} ta deraza, {1} m²":"Итого: окон {0}, {1} м²",
 "Qoplama o'lchami, m: bo'sh qoldirilsa — xonaning o'lchami olinadi.":"Размеры отделки, м: если пусто — берутся размеры комнаты.",
 "Eshik turi":"Тип двери","Turi?":"Тип?","Eshik eni":"Ширина двери","Eshik bo'yi":"Высота двери","Eshikni olib tashlash":"Убрать дверь",
 "Akfa alyumin":"Akfa алюминий","Akfa PVX":"Akfa ПВХ","MDF yog'och":"МДФ (дерево)","Temir eshik":"Металлическая дверь",
 "Yog'och eshik":"Деревянная дверь","Vitrajli eshik":"Витражная дверь",
 "Derazalar — eni × balandligi, m":"Окна — ширина × высота, м","Deraza eni":"Ширина окна",
 "Deraza balandligi":"Высота окна","Derazani olib tashlash":"Убрать окно","+ Deraza":"+ Окно",
 "Qoplamalar":"Отделка","Devordagi kafel uzunligi, m":"Длина плитки на стене, м",
 "Kafel balandligi, m":"Высота плитки, м","Plintus, m (qo'lda)":"Плинтус, м (вручную)",
 "Devorning pastki qismi kafel bo'lsa, o'sha uzunlik plintusdan va bo'yoq maydonidan ayiriladi. Plintusni lenta bilan o'lchagan bo'lsangiz, \"qo'lda\" maydoniga yozing.":"Если нижняя часть стены в плитке, эта длина вычитается из плинтуса и площади покраски. Если вы измерили плинтус рулеткой, впишите его в поле «вручную».",
 // katalog
 "Katalog":"Каталог","Xonada nima bor?":"Что есть в комнате?","bosing → o'lchang":"нажмите → измерьте",
 "Katalogni yopish":"Закрыть каталог","Yopish ×":"Закрыть ×","Qidirish: rozetka, vytyazhka…":"Поиск: розетка, вытяжка…",
 "Katalogdan qidirish":"Поиск по каталогу","Tavsiya":"Рекомендуем",
 "+ Ro'yxatda yo'q narsani qo'shish":"+ Добавить то, чего нет в списке","+ Element qo'shish":"+ Добавить элемент",
 "dan":"от","{0} uchun odatiy":"Типично для: {0}",
 "\"{0}\" topilmadi — pastdagi tugma orqali o'zingiz qo'shing.":"«{0}» не найдено — добавьте сами кнопкой ниже.",
 // xona hisobi
 "Miqdor":"Количество","Narx":"Цена","Jami":"Итого","o'zim qo'shdim":"добавлено вручную","Narx, so'm":"Цена, сум",
 "O'chirish":"Удалить","Pol maydoni":"Площадь пола","Perimetr":"Периметр","Devor (sof)":"Стены (чистая)",
 "Plintus":"Плинтус","Nomi":"Наименование","Jami*, so'm":"Итого*, сум",
 "O'lchamlarni kiriting — pol, plintus, devor va shift hisobi shu yerda chiqadi.":"Введите размеры — здесь появится расчёт пола, плинтуса, стен и потолка.",
 "Xonadagi elementlar ({0})":"Элементы в комнате ({0})","+ Qo'shish":"+ Добавить",
 "O'ngdagi katalogdan tanlang yoki o'zingiz qo'shing.":"Выберите в каталоге справа или добавьте сами.",
 "* Jami = material + ish haqi (soatlik stavka {0} so'm, o'rtacha oylikdan). Xona bo'yicha:":"* Итого = материалы + оплата труда (часовая ставка {0} сум, из средней зарплаты). По комнате:",
 // pastki qator
 "Materiallar":"Материалы","Ish haqi":"Оплата труда","Kutilmagan {0}%":"Непредвиденные {0}%","QQS":"НДС",
 "Jami smeta, so'm":"Итого по смете, сум","Smetani ochish →":"Открыть смету →",
 // beton
 "Beton qorishmasi":"Бетонная смесь",
 "Markani va hajmni kiriting — sement, shag'al va qum miqdori normativ bo'yicha, narxi esa \"Narxlar\" bo'limidagi tanlangan narxdan hisoblanadi.":"Укажите марку и объём — количество цемента, щебня и песка считается по нормативу, а стоимость — по выбранной цене в разделе «Цены».",
 "+ Beton ishi":"+ Бетонная работа","Beton markasi":"Марка бетона","Sement markasi":"Марка цемента","Hajm":"Объём",
 "m³ da kiritaman":"ввожу в м³","o'lchamdan (U×E×Q)":"по размерам (Д×Ш×Т)","Uzunligi, m":"Длина, м",
 "Eni, m":"Ширина, м","Qalinligi, m":"Толщина, м","Hajm, m³":"Объём, м³",
 "Zavod narxi, so'm/m³ (solishtirish uchun)":"Цена завода, сум/м³ (для сравнения)","ixtiyoriy":"необязательно",
 "Hali beton ishi yo'q.":"Бетонных работ пока нет.",
 "Retseptlar: СНиП 82-02-95 va ГОСТ 7473-2010 asosidagi ma'lumotnoma jadvali, 1 m³ uchun, portlandsement PC M500. PC M400 tanlansa sement sarfi 15% ga oshiriladi. Zichlik: shag'al {0} kg/m³, qum {1} kg/m³ (Narxlar → Sozlamalar).":"Рецептуры: справочная таблица по СНиП 82-02-95 и ГОСТ 7473-2010, на 1 м³, портландцемент ПЦ М500. При выборе ПЦ М400 расход цемента увеличивается на 15%. Плотность: щебень {0} кг/м³, песок {1} кг/м³ (Цены → Настройки).",
 "{0} qop × 50 kg":"{0} меш. × 50 кг","{0} m³ beton":"{0} м³ бетона",
 "1 m³ tannarxi (materiallar)":"Себестоимость 1 м³ (материалы)","Jami materiallar":"Всего материалов",
 "Zavod narxi {0} so'm/m³ — o'zingiz qorishtirsangiz":"Цена завода {0} сум/м³ — при самостоятельном замесе",
 "{0} so'm arzon":"дешевле на {0} сум","{0} so'm qimmat":"дороже на {0} сум","(ish haqisiz).":"(без оплаты труда).",
 // narxlar
 "Narxlar bazasi — {0}":"База цен — {0}",
 "Har bir material uchun 3 ta manbadan narx kiriting (zavod, karyer, do'kon, birja). Dastur o'rtachasini hisoblaydi; kerakli narxni tanlang. Narxlar har chorakda yangilanadi.":"Для каждого материала введите цены из 3 источников (завод, карьер, магазин, биржа). Программа рассчитает среднюю; выберите нужную цену. Цены обновляются ежеквартально.",
 "Manba narxlari markaziy bazadan olinadi; tanlov (o'rtacha / qo'lda) saqlanadi":"Цены источников загружаются из центральной базы; выбор (средняя / вручную) сохраняется",
 "Manba narxlari standart qiymatlardan olinadi; tanlov (o'rtacha / qo'lda) saqlanadi":"Цены источников берутся из стандартных значений; выбор (средняя / вручную) сохраняется",
 "Tasdiqlang: manba narxlari almashadi":"Подтвердите: цены источников будут заменены",
 "Markaziy narxlarni yuklash":"Загрузить центральные цены","Standart narxlarga qaytarish":"Вернуть стандартные цены",
 "Markaziy baza: {0}":"Центральная база: {0}","Material":"Материал","Birlik":"Ед. изм.",
 "1-manba":"Источник 1","2-manba":"Источник 2","3-manba":"Источник 3","Tanlov":"Выбор",
 "Qo'llanadigan narx":"Применяемая цена","{0}-manba":"Источник {0}","{0}-manba narxi":"Цена источника {0}",
 "Qo'lda narx":"Цена вручную","Ish haqi va sozlamalar":"Оплата труда и настройки",
 "O'rtacha oylik (qurilish), so'm":"Средняя зарплата (строительство), сум","Oyiga ish soati":"Рабочих часов в месяц",
 "Material zaxirasi, %":"Запас материала, %","Kutilmagan xarajatlar, %":"Непредвиденные расходы, %",
 "Plintus uzunligi (1 dona), m":"Длина плинтуса (1 шт.), м","Shag'al zichligi, kg/m³":"Плотность щебня, кг/м³",
 "Qum zichligi, kg/m³":"Плотность песка, кг/м³","Beton ishi, soat/m³":"Бетонные работы, ч/м³",
 "QQS 12% qo'shilsin":"Начислить НДС 12%",
 "Manba narxlari yangilandi":"Цены источников обновлены",
 // smeta
 "Jami: {0}":"Итого: {0}","Smeta: {0}":"Смета: {0}",
 "{0} · {1} narxlarida · soddalashtirilgan hisob (davlat standarti formati keyingi versiyada)":"{0} · в ценах: {1} · упрощённый расчёт (формат госстандарта — в следующей версии)",
 "Matn sifatida nusxa":"Копировать как текст",
 // Excel
 "Excel yuklab olish":"Скачать Excel","Excel fayl yuklab olindi":"Файл Excel скачан",
 "Excel fayl uchun internet kerak":"Для файла Excel нужен интернет",
 "Excel faylni yaratib bo'lmadi, qayta urinib ko'ring":"Не удалось создать файл Excel, попробуйте ещё раз",
 "Ko'rinish":"Вид","Excel ko'rinishi":"Вид Excel","Jadval":"Таблица",
 "Yuklab olinadigan fayl aynan shunday bo'ladi":"Скачанный файл будет выглядеть точно так же",
 "Tuzilgan: {0}":"Составлено: {0}","Material, so'm":"Материалы, сум","Ish haqi, so'm":"Оплата труда, сум",
 "JAMI, so'm":"ИТОГО, сум","Xonalar hisobi":"Расчёт по комнатам","Xonalar":"Комнаты","Xona":"Комната",
 "Balandligi, m":"Высота, м","Pol maydoni, m²":"Площадь пола, м²","Perimetr, m":"Периметр, м",
 "Devor (sof), m²":"Стены (чистая), м²","Plintus, m":"Плинтус, м","Eshiklar":"Двери","Derazalar":"Окна",
 "Kutilmagan xarajatlar {0}%":"Непредвиденные расходы {0}%","Kutilmagan xarajatlar":"Непредвиденные расходы",
 "QQS 12%":"НДС 12%","Jami, so'm":"Итого, сум","Manba":"Источник","Smeta bo'sh.":"Смета пуста.",
 "Tafsilot":"Детали","JAMI":"ИТОГО","SMETA":"СМЕТА",
 "Nusxa olindi — Excel yoki Telegramga joylang":"Скопировано — вставьте в Excel или Telegram",
 "Avtomatik nusxa olinmadi. Matnni belgilab, nusxa oling:":"Не удалось скопировать автоматически. Выделите текст и скопируйте:",
 // element qo'shish oynasi
 "Yopish":"Закрыть","Turi":"Вариант","Soni":"Количество","Miqdori":"Количество","Narx, so'm/{0}":"Цена, сум/{0}",
 "Quvvati, Vt":"Мощность, Вт","O'lchami, sm (ixtiyoriy)":"Размеры, см (необязательно)",
 "Uzunligi / eni":"Длина / ширина","Chuqurligi":"Глубина","Izoh (holati, rangi, joyi)":"Примечание (состояние, цвет, место)",
 "masalan: eski, almashtiriladi":"например: старое, под замену","O'rnatish: {0} soat/{1}":"Монтаж: {0} ч/{1}",
 "Bekor qilish":"Отмена","Xonaga qo'shish":"Добавить в комнату","O'z elementingiz":"Свой элемент",
 "Ro'yxatda yo'q narsa":"То, чего нет в списке","masalan: Oyna, Akvarium, Sport trenajyori":"например: Зеркало, Аквариум, Тренажёр",
 "O'lchami (erkin)":"Размер (свободно)","O'rnatish, soat/birlik":"Монтаж, ч/ед.","Izoh":"Примечание",
 "Smetaga \"qo'lda\" belgisi bilan tushadi":"Попадёт в смету с отметкой «вручную»","Nomini yozing.":"Укажите название.",
 "{0} qo'shildi":"Добавлено: {0}"
};

const CYR_DICT = {
  "Xonalar": "Хоналар", "Xona": "Хона", "Xonalar va o'lchov": "Хоналар ва ўлчов",
  "Beton": "Бетон", "Beton ishi": "Бетон иши", "Beton ishlari": "Бетон ишлари",
  "Beton qorishmasi": "Бетон қоришмаси", "Beton markasi": "Бетон маркаси",
  "Sement": "Цемент", "Sement markasi": "Цемент маркаси", "Shag'al": "Шағал", "Shag'al (sheben)": "Шағал (щебень)",
  "Qum": "Қум", "Suv": "Сув", "Qorishma": "Қоришма",
  "Narx": "Нарх", "Narxlar": "Нархлар", "Narxi": "Нархи",
  "Smeta": "Смета", "Smetalar": "Сметалар", "Smeta loyihalari": "Смета лойиҳалари",
  "Yangi smeta": "Янги смета", "Yangi smeta yaratish": "Янги смета яратиш", "Yangi smeta loyihasi": "Янги смета лойиҳаси",
  "Boshqaruv paneli": "Бошқарув панели", "Loyihalar": "Лойиҳалар",
  "Materiallar": "Материаллар", "Ish haqi": "Иш ҳақи", "Jami": "Жами", "Jami smeta": "Жами смета",
  "Obyekt": "Объект", "Obyektlar": "Объектлар", "Obyekt nomi": "Объект номи",
  "Uzunligi": "Узунлиги", "Eni": "Эни", "Balandligi": "Баландлиги", "Qalinligi": "Қалинлиги",
  "Uzunligi, m": "Узунлиги, м", "Eni, m": "Эни, м", "Balandligi, m": "Баландлиги, м",
  "Eshik": "Эшик", "Eshiklar": "Эшиклар", "Deraza": "Дераза", "Derazalar": "Деразалар",
  "Pol": "Пол", "Devor": "Девор", "Shift": "Шифт", "Plintus": "Плинтус", "Kafel": "Кафель",
  "so'm": "сўм", "dona": "дона", "soat": "соат", "oy": "ой", "kun": "кун",
  "Hajm": "Ҳажм", "Maydon": "Майдон", "Perimetr": "Периметр",
  "Excel yuklab olish": "Excel юклаб олиш", "Oflayn": "Офлайн", "Onlayn": "Онлайн",
  "Oflayn ishlash rejimi": "Офлайн ишлаш режими", "Aniqlik va ochiqlik": "Аниқлик ва очиқлик",
  "Yordam": "Ёрдам", "Qo'llanma": "Қўлланма", "Maxfiylik": "Махфийлик",
  "Ochish": "Очиш", "Nusxa": "Нусха", "O'chirish": "Ўчириш", "Saqlash": "Сақлаш",
  "Qo'shish": "Қўшиш", "+ Xona qo'shish": "+ Хона қўшиш", "+ Beton ishi": "+ Бетон иши",
  "Toshkent sh.": "Тошкент ш.", "Samarqand": "Самарқанд", "Farg'ona": "Фарғона", "Andijon": "Андижон",
  "Buxoro": "Бухоро", "Namangan": "Наманган", "Navoiy": "Навоий", "Qashqadaryo": "Қашқадарё",
  "Surxondaryo": "Сурхондарё", "Jizzax": "Жиззах", "Sirdaryo": "Сирдарё", "Xorazm": "Хоразм", "Qoraqalpog'iston": "Қорақалпоғистон"
};

function latinToCyrillic(text) {
  if (!text || typeof text !== "string") return text;
  if (CYR_DICT[text]) return CYR_DICT[text];
  let t = text;
  t = t.replace(/[oO]['`ʻ’]/g, m => m[0] === m[0].toUpperCase() ? "Ў" : "ў");
  t = t.replace(/[gG]['`ʻ’]/g, m => m[0] === m[0].toUpperCase() ? "Ғ" : "ғ");
  t = t.replace(/Sh|SH/g, "Ш").replace(/sh/g, "ш");
  t = t.replace(/Ch|CH/g, "Ч").replace(/ch/g, "ч");
  t = t.replace(/Yo|YO/g, "Ё").replace(/yo/g, "ё");
  t = t.replace(/Yu|YU/g, "Ю").replace(/yu/g, "ю");
  t = t.replace(/Ya|YA/g, "Я").replace(/ya/g, "я");
  t = t.replace(/Ye|YE/g, "Е").replace(/ye/g, "е");
  t = t.replace(/Ts|TS/g, "Ц").replace(/ts/g, "ц");
  const charmap = {
    'A':'А','a':'а','B':'Б','b':'б','D':'Д','d':'д','E':'Э','e':'э',
    'F':'Ф','f':'ф','G':'Г','g':'г','H':'Ҳ','h':'ҳ','I':'И','i':'и',
    'J':'Ж','j':'ж','K':'К','k':'к','L':'Л','l':'л','M':'М','m':'м',
    'N':'Н','n':'н','O':'О','o':'о','P':'П','p':'п','Q':'Қ','q':'қ',
    'R':'Р','r':'р','S':'С','s':'с','T':'Т','t':'т','U':'У','u':'у',
    'V':'В','v':'в','X':'Х','x':'х','Y':'Й','y':'й','Z':'З','z':'з',
    "'":'ъ','ʻ':'ъ','’':'ъ','`':'ъ'
  };
  let res = "", prevAlpha = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (charmap[ch]) {
      let m = charmap[ch];
      if ((ch === 'e' || ch === 'E') && prevAlpha) {
        m = ch === 'E' ? 'Е' : 'е';
      }
      res += m;
      prevAlpha = true;
    } else {
      res += ch;
      prevAlpha = /[a-zA-Zа-яА-ЯёЁ]/.test(ch);
    }
  }
  return res;
}

function tr(s, ...a) {
  let o = s;
  if (LANG === "ru") {
    o = Object.prototype.hasOwnProperty.call(RU, s) ? RU[s] : s;
  } else if (LANG === "uz_cyr" || LANG === "uz-cyr") {
    o = latinToCyrillic(s);
  }
  a.forEach((v, i) => { o = o.split("{" + i + "}").join(String(v)); });
  return o;
}

const UNITS_RU = {dona:"шт.",m:"м","m²":"м²","m³":"м³",kg:"кг",l:"л",seksiya:"секц.",komplekt:"компл."};
const UNITS_CYR = {dona:"дона",m:"м","m²":"м²","m³":"м³",kg:"кг",l:"л",seksiya:"секция",komplekt:"комплект"};
const U = u => {
  if (LANG === "ru") return UNITS_RU[u] || u;
  if (LANG === "uz_cyr" || LANG === "uz-cyr") return UNITS_CYR[u] || latinToCyrillic(u);
  return u;
};

const lab = o => {
  if (!o) return "";
  if (LANG === "ru" && o.ru) return o.ru;
  if ((LANG === "uz_cyr" || LANG === "uz-cyr")) return latinToCyrillic(o.l || "");
  return o.l || "";
};

const qLabel = q => {
  if (LANG === "ru") {
    const m = /^(\d{4})-yil (\S+) chorak$/.exec(q || "");
    return m ? `${m[2]} квартал ${m[1]} г.` : q;
  }
  if (LANG === "uz_cyr" || LANG === "uz-cyr") {
    return latinToCyrillic(q || "");
  }
  return q;
};

function translatePageDOM(lang) {
  try {
    const candidates = document.querySelectorAll("h1, h2, h3, h4, p, span, a, button, label, th, td, dt, dd, small, b, strong, em");
    candidates.forEach(el => {
      if (el.closest(".seg, script, style, code, pre, #calc-plan, svg, select")) return;
      // Only process leaf nodes with text
      if (el.children.length === 0 && el.textContent.trim().length > 0) {
        if (!el.dataset.origText) {
          el.dataset.origText = el.textContent.trim();
        }
        const orig = el.dataset.origText;
        el.textContent = tr(orig);
      }
    });
    // Translate placeholders
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(inp => {
      if (!inp.dataset.origPh) {
        inp.dataset.origPh = inp.placeholder;
      }
      inp.placeholder = tr(inp.dataset.origPh);
    });
  } catch(e) {}
}

function setAppLanguage(newLang) {
  if (!newLang) return;
  const normalized = newLang.replace("-", "_");
  LANG = normalized;
  try {
    localStorage.setItem("smetago-lang", normalized);
  } catch(e) {}
  document.cookie = `django_language=${normalized === "uz_cyr" ? "uz-cyr" : normalized};path=/;max-age=31536000;SameSite=Lax`;
  document.documentElement.lang = normalized === "ru" ? "ru" : (normalized === "uz_cyr" ? "uz-cyr" : "uz");

  // Update active state on any language switch buttons
  document.querySelectorAll("[data-lang]").forEach(btn => {
    const bl = btn.getAttribute("data-lang").replace("-", "_");
    btn.setAttribute("aria-pressed", bl === normalized ? "true" : "false");
  });

  // Instant DOM translation without page reload!
  translatePageDOM(normalized);

  // Re-render UI components if they exist
  window.dispatchEvent(new CustomEvent("languagechange", { detail: { lang: normalized } }));

  // Background notify server without reload
  try {
    fetch("/i18n/setlang/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `language=${encodeURIComponent(normalized === "uz_cyr" ? "uz-cyr" : normalized)}`
    }).catch(() => {});
  } catch(e) {}
}

window.tr = tr;
window.U = U;
window.lab = lab;
window.latinToCyrillic = latinToCyrillic;
window.setAppLanguage = setAppLanguage;
window.translatePageDOM = translatePageDOM;

// Global event listener for language clicks - prevent page reload!
document.addEventListener("click", function(e) {
  const btn = e.target.closest && e.target.closest("[data-lang]");
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  setAppLanguage(btn.getAttribute("data-lang"));
});

// Prevent form submission on language switcher
document.addEventListener("submit", function(e) {
  if (e.target.closest && e.target.closest("[data-lang-switcher]")) {
    e.preventDefault();
    e.stopPropagation();
  }
});

// If initial language is uz_cyr or ru, apply initial translation on DOM load
document.addEventListener("DOMContentLoaded", function() {
  if (LANG === "uz_cyr" || LANG === "uz-cyr" || LANG === "ru") {
    translatePageDOM(LANG);
  }
});

