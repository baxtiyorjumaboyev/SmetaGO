/* SmetaGo — o'zbekcha / ruscha. data.js va app.js dan oldin yuklanadi.
 * Til <html lang="..."> dan olinadi (Django UZ / RU tugmalari cookie orqali o'rnatadi).
 * tr("o'zbekcha matn", ...qiymatlar) — kalit o'zbekcha matnning o'zi; {0}, {1} o'rniga qiymatlar qo'yiladi.
 * Yangi matn qo'shsangiz, RU ga ham tarjimasini yozing (yo'q bo'lsa o'zbekchasi chiqadi).
 */
const LANG=/^ru/i.test(document.documentElement.lang||"")?"ru":"uz";
const RU={
 // umumiy
 "so'm":"сум","sm":"см","Vt":"Вт","avto":"авто","qo'lda":"вручную","katalog":"каталог","ish haqi":"оплата труда",
 "Sessiya tugagan — qayta kiring":"Сессия истекла — войдите снова",
 "Serverga saqlanmadi, qayta urinib ko'ring":"Не сохранено на сервере, попробуйте ещё раз",
 "Internet yo'q — o'zgarishlar qurilmada saqlandi":"Нет интернета — изменения сохранены на устройстве",
 "Aloqa tiklandi — o'zgarishlar yuborilmoqda":"Связь восстановлена — изменения отправляются",
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
 "Pol qoplamasi: {0}":"Покрытие пола: {0}","{0} m² + {1}% zaxira":"{0} м² + {1}% запас",
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
 "Xona nomi":"Название комнаты","O'chirishni tasdiqlang":"Подтвердите удаление","Xonani o'chirish":"Удалить комнату",
 "O'lchamlar, metr":"Размеры, метры","Uzunligi":"Длина","Eni":"Ширина","Balandligi":"Высота",
 "Eshiklar — eni, m (plintusdan ayiriladi)":"Двери — ширина, м (вычитается из плинтуса)",
 "{0}-eshik eni":"Ширина двери {0}","Eshikni olib tashlash":"Убрать дверь","+ Eshik":"+ Дверь",
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
 "QQS 12% qo'shilsin":"Начислить НДС 12%","Soatlik stavka:":"Часовая ставка:",
 "Standart qiymat — qurilish sohasida 2026-yil yanvar–iyun o'rtacha oylik ish haqi 7,03 mln so'm (Milliy statistika qo'mitasi). Narxlar namunaviy; o'z manbalaringizdagi narxlarni kiriting.":"Значение по умолчанию — средняя зарплата в строительстве за январь–июнь 2026 г., 7,03 млн сум (Национальный комитет по статистике). Цены примерные; введите цены из своих источников.",
 "Manba narxlari yangilandi":"Цены источников обновлены",
 // smeta
 "Jami: {0}":"Итого: {0}","Smeta: {0}":"Смета: {0}",
 "{0} · {1} narxlarida · soddalashtirilgan hisob (davlat standarti formati keyingi versiyada)":"{0} · в ценах: {1} · упрощённый расчёт (формат госстандарта — в следующей версии)",
 "Excel uchun nusxa olish":"Копировать для Excel","Matn sifatida nusxa":"Копировать как текст",
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
function tr(s,...a){let o=LANG==="ru"&&Object.prototype.hasOwnProperty.call(RU,s)?RU[s]:s;a.forEach((v,i)=>{o=o.split("{"+i+"}").join(String(v))});return o}
// birliklar: holatda o'zbekcha saqlanadi ("dona", "m²"), faqat ko'rsatishda tarjima
const UNITS_RU={dona:"шт.",m:"м","m²":"м²","m³":"м³",kg:"кг",l:"л",seksiya:"секц.",komplekt:"компл."};
const U=u=>LANG==="ru"&&UNITS_RU[u]?UNITS_RU[u]:u;
// {l:"o'zbekcha", ru:"ruscha"} ko'rinishidagi nomlar (FLOOR, WALL, CEIL, PLINTH_LABEL)
const lab=o=>o?(LANG==="ru"&&o.ru?o.ru:o.l):"";
// "2026-yil III chorak" → "III квартал 2026 г."
const qLabel=q=>{if(LANG!=="ru")return q;const m=/^(\d{4})-yil (\S+) chorak$/.exec(q||"");return m?`${m[2]} квартал ${m[1]} г.`:q};
