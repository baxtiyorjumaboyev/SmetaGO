"""O'zbekcha / ruscha. Kalit — o'zbekcha matnning o'zi, shuning uchun shablonlar o'qilishi oson qoladi.

Django'ning o'z xabarlari (parol talablari, forma xatolari) uz/ru tarjimalari bilan birga keladi;
bu yerda faqat SmetaGo matnlari. JS tomoni: static/smeta/js/i18n.js.
"""
from django.conf import settings
from django.utils import translation

RU = {
    # umumiy
    "o'lchang · tanlang · hisoblang": "измеряйте · выбирайте · считайте",
    "Chiqish": "Выйти",
    "Til": "Язык",
    "Tungi rejim": "Ночной режим",
    "Kunduzgi rejim": "Дневной режим",
    # proba dizayni: yon panel, boshqaruv paneli, loyihalar, yorug' kirish sahifasi
    "3 manba": "3 источника", "Amallar": "Действия", "Aniq hisob": "Точный расчёт", "Aniqlik va ochiqlik": "Точность и прозрачность",
    "Avto-saqlash": "Автосохранение", "Avto-saqlash yoqilgan": "Автосохранение включено",
    "Barcha huquqlar himoyalangan.": "Все права защищены.", "Barcha loyihalar": "Все проекты",
    "Barcha obyektlaringiz bir joyda: xonalar, pol maydoni, material va ish haqi bo'yicha smeta. Hisob ilovadagi formulalar bilan bir xil.":
        "Все ваши объекты в одном месте: комнаты, площадь пола, смета по материалам и работе. Расчёт — по тем же формулам, что в приложении.",
    "Barcha smetalardagi material, ish haqi va zaxira ulushi": "Доля материалов, работы и резерва во всех сметах",
    "Barchasi": "Все", "Batafsil": "Подробнее", "Beton markasi": "Марка бетона", "Beton qorishmasi: hajm bo'yicha": "Бетонная смесь: по объёму",
    "Birlik narxi": "Цена за ед.", "Boshqaruv paneli": "Панель управления", "Bu oy": "Этот месяц",
    "Devor (sof, eshik va derazasiz)": "Стены (чистая, без дверей и окон)", "Eng qimmat pozitsiyalar": "Самые дорогие позиции",
    "Eslab qolish": "Запомнить меня", "Excel eksport": "Экспорт в Excel", "Faol obyektlar": "Активные объекты", "Filtr": "Фильтр",
    "Hajm": "Объём", "Hajm, m³": "Объём, м³", "Hali obyekt yo'q": "Объектов пока нет",
    "Har bir material narxi uchun: eng arzon, o'rtacha, eng qimmat": "Для цены каждого материала: минимальная, средняя, максимальная",
    "Har bir qatorda o'lchov, zaxira va narx manbasi ko'rinadi — har raqamni tekshirish oson.":
        "В каждой строке видны замер, запас и источник цены — любую цифру легко проверить.",
    "Internet uzilganda ham ma'lumotlar qurilmada saqlanadi va aloqa tiklanganda o'zi yuboriladi.":
        "Даже без интернета данные сохраняются на устройстве и отправляются, когда связь восстановится.",
    "Internetsiz ishlash va avtomatik sinxronlash": "Работа без интернета и автосинхронизация",
    "Ish turi va resurs tavsifi": "Вид работ и описание ресурса", "Jami summa": "Итоговая сумма",
    "Joriy narxlar bo'yicha hisoblangan smeta": "Смета по текущим ценам", "Materiallar": "Материалы",
    "Materiallar narxi 3 manbadan olinadi; har obyektda o'z narxingizni ham kiritishingiz mumkin.":
        "Цены материалов берутся из 3 источников; в каждом объекте можно указать и свою цену.",
    "Menyu": "Меню", "Menyuni yopish": "Закрыть меню", "Miqdor": "Количество", "Namuna hisob": "Пример расчёта",
    "Namuna smetada ochish": "Открыть в примере сметы", "Namuna va yordam": "Пример и помощь",
    "Namuna: Mehmonxona 5 × 4 × 2,8 m": "Пример: гостиная 5 × 4 × 2,8 м", "Narxlar bazasi": "База цен",
    "Narxlar — standart ma'lumotnoma (o'rtacha). Obyekt ichida o'z narxingizni kiritasiz.":
        "Цены — стандартный справочник (средние). Внутри объекта можно указать свои.",
    "O'lchang • Tanlang • Hisoblang": "Измеряйте • Выбирайте • Считайте", "O'lchov": "Ед. изм.",
    "O'zgarishlar o'zi saqlanadi — internetsiz ham": "Изменения сохраняются сами — даже без интернета",
    "Obyekt nomi bo'yicha qidirish…": "Поиск по названию объекта…", "Obyekt va hudud": "Объект и регион",
    "Obyektlaringizning 3D ko'rinishi, xarajatlar tahlili va eng qimmat pozitsiyalar — bitta sahifada.":
        "3D-вид объектов, анализ затрат и самые дорогие позиции — на одной странице.",
    "Ochilmagan": "Не открыт", "Oflayn ishlash rejimi": "Работа офлайн", "Oflayn rejim": "Офлайн-режим", "Onlayn": "Онлайн",
    "Oxirgi loyiha": "Последний проект", "Oxirgi obyekt bo'yicha: material + ish haqi": "По последнему объекту: материалы + работа",
    "Plintusni lenta bilan o'lchagan bo'lsangiz, uni «qo'lda» maydoniga yozing — eshik va kafel uzunligi avtomatik ayirilmaydi. Zaxira foizini (10%) Narxlar → Sozlamalar bo'limida o'zgartirasiz.":
        "Если плинтус измерен рулеткой, впишите его в поле «вручную» — двери и плитка не вычитаются автоматически. Процент запаса (10%) меняется в разделе Цены → Настройки.",
    "Pol maydoni": "Площадь пола", "QQS (12%) qo'shish": "Добавить НДС (12%)", "Qidirish": "Поиск", "Qidirish…": "Поиск…",
    "Qurilish smetalarini avtomatlashtirish": "Автоматизация строительных смет",
    "Ro'yxatdan o'tmasdan namunaviy smetani ochib ko'ring; savollar uchun Yordam bo'limi.":
        "Откройте пример сметы без регистрации; по вопросам — раздел «Помощь».",
    "SSL himoyalangan": "Защищено SSL", "Sement markasi": "Марка цемента", "Smeta (jami / material)": "Смета (итого / материалы)",
    "Smeta loyihalari": "Сметные проекты", "Smeta loyihalari va hisob-kitobi": "Сметные проекты и расчёты", "Smeta monitoringi": "Мониторинг смет",
    "SmetaGo tizimiga xush kelibsiz. Hisobingizga kiring yoki yangisini yarating.": "Добро пожаловать в SmetaGo. Войдите в аккаунт или создайте новый.",
    "Smetachi maslahati": "Совет сметчика", "So'nggi o'zgarishlar": "Последние изменения", "Sozlamalar (admin)": "Настройки (админ)",
    "Tahlil": "Анализ", "Tezkor kalkulyator": "Быстрый калькулятор", "Tezkor, aniq va ishonchli": "Быстрые, точные и надёжные",
    "To'liq hisob-kitobni ochish": "Открыть полный расчёт", "Xarajat tarkibi": "Структура затрат",
    "Xona o'lchamlari asosida avtomatlashtirilgan hisob-kitoblar, material va ish haqi jadvali hamda bir zumda Excel eksport.":
        "Автоматические расчёты по размерам комнат, таблица материалов и работ и мгновенный экспорт в Excel.",
    "Xonalar": "Комнаты", "Xonalar va xarajat ulushi": "Комнаты и доля затрат", "Xush kelibsiz": "Добро пожаловать",
    "Yangi smeta loyihasi": "Новый сметный проект", "Yangi smeta yaratish": "Создать смету", "Yangilangan": "Обновлено",
    "Yordam bo'limi": "Раздел «Помощь»", "deraza": "окно", "eshik": "дверь", "model": "модель", "smeta loyihalari": "сметные проекты",
    # dashboard (Asosiy)
    "Asosiy": "Главная",
    "{0} ta obyekt": "Объектов: {0}",
    "Ko'rsatkich": "Показатель",
    "Jami": "Итого",
    "Material": "Материалы",
    "Ish haqi": "Работа",
    "Smeta summasi": "Сумма смет",
    "Xarajatlar tarkibi": "Структура затрат",
    "Bo'limlar bo'yicha": "По разделам",
    "Pol, devor, shift, elementlar, beton": "Пол, стены, потолок, позиции, бетон",
    "Eng katta obyektlar": "Крупнейшие объекты",
    "Jami smeta bo'yicha": "По итоговой сумме",
    "Foydalanuvchi": "Пользователь",
    "Admin": "Админ",
    # obyektlar ro'yxati
    "Obyektlar": "Объекты",
    "Barcha obyektlar": "Все объекты",
    "Namunaviy obyekt": "Пример объекта",
    "+ Yangi obyekt": "+ Новый объект",
    "Yangi obyekt": "Новый объект",
    "{0} xona": "Комнат: {0}",
    "O'zgartirilgan": "Изменён",
    "Ochish": "Открыть",
    "Nusxa": "Копия",
    "O'chirish": "Удалить",
    "(nusxa)": "(копия)",
    "«{0}» o'chirilsinmi? Bu amalni qaytarib bo'lmaydi.": "Удалить «{0}»? Это действие нельзя отменить.",
    "Hali obyekt yo'q. «+ Yangi obyekt» bilan boshlang yoki ilovani ko'rish uchun namunaviy obyekt oching.":
        "Объектов пока нет. Начните с «+ Новый объект» или откройте пример, чтобы посмотреть приложение.",
    # ilova sahifasi
    "Obyekt nomi": "Название объекта",
    "Hudud": "Регион",
    "Narxlar choragi": "Квартал цен",
    # kirish / ro'yxatdan o'tish
    "Kirish": "Вход",
    "Login": "Логин",
    "Parol": "Пароль",
    "Login yoki parol noto'g'ri.": "Неверный логин или пароль.",
    "Hisobingiz yo'qmi?": "Нет аккаунта?",
    "Ro'yxatdan o'ting": "Зарегистрируйтесь",
    "Ro'yxatdan o'tish": "Регистрация",
    "Parolni takrorlang": "Повторите пароль",
    "Kamida 8 belgi, faqat raqamlardan iborat bo'lmasin.": "Не менее 8 символов, не только цифры.",
    "Hisobingiz bormi?": "Уже есть аккаунт?",
    # kirish sahifalari (3D)
    "Jonli 3D smeta": "Живая 3D-смета",
    "Aylantiring": "Вращайте",
    "Xonaning 3D ko'rinishi": "3D-вид комнаты",
    "Hisobingizga kiring va smetalar ustida ishlashni davom ettiring.": "Войдите в аккаунт и продолжайте работу над сметами.",
    "Loginingizni kiriting": "Введите логин",
    "Parolni ko'rsatish": "Показать пароль",
    "yoki": "или",
    "Bepul hisob oching — smetalaringiz saqlanadi va istalgan qurilmadan ochiladi.":
        "Создайте бесплатный аккаунт — сметы сохраняются и открываются с любого устройства.",
    "Masalan: ali_usta": "Например: ali_usta",
    # Telegram orqali kirish
    "yoki login va parol bilan": "или по логину и паролю",
    "Telegram bilan — bir bosishda, parolsiz.": "Через Telegram — в одно нажатие, без пароля.",
    "Telegram'ni ulasangiz, keyingi safar parolsiz kirasiz": "Подключите Telegram — в следующий раз войдёте без пароля",
    "Telegram'ni ulash:": "Подключить Telegram:",
    "Telegram ma'lumoti tasdiqlanmadi. Qaytadan urinib ko'ring.": "Данные Telegram не подтверждены. Попробуйте ещё раз.",
    "Bu Telegram boshqa hisobga ulangan.": "Этот Telegram уже привязан к другому аккаунту.",
    "Hisobingizga boshqa Telegram ulangan.": "К вашему аккаунту уже привязан другой Telegram.",
    "Telegram hisobingizga ulandi.": "Telegram подключён к вашему аккаунту.",
    "Hisob o'chirilgan.": "Аккаунт отключён.",
    # xato sahifalari
    "Sahifa topilmadi": "Страница не найдена",
    "Manzil noto'g'ri yoki sahifa o'chirilgan.": "Неверный адрес или страница удалена.",
    "Bosh sahifaga qaytish": "Вернуться на главную",
    "Havola eskirgan yoki boshqa sahifadan ochilgan. Sahifani yangilab, qaytadan urinib ko'ring.":
        "Ссылка устарела или открыта с другой страницы. Обновите страницу и попробуйте снова.",
    "Email": "Email",
    # parolni tiklash
    "Parolni unutdingizmi?": "Забыли пароль?",
    "Parolni tiklash": "Восстановление пароля",
    "Ro'yxatdan o'tishda kiritgan emailingizni yozing — yangi parol o'rnatish havolasini yuboramiz.":
        "Введите email, указанный при регистрации, — мы отправим ссылку для установки нового пароля.",
    "Havolani yuborish": "Отправить ссылку",
    "Kirish sahifasiga qaytish": "Вернуться ко входу",
    "Pochtangizni tekshiring": "Проверьте почту",
    "Agar bu email bilan hisob bo'lsa, unga yangi parol o'rnatish havolasi yuborildi. Xat bir necha daqiqada keladi — «Spam» papkasini ham ko'ring.":
        "Если аккаунт с таким email существует, на него отправлена ссылка для установки нового пароля. "
        "Письмо придёт в течение нескольких минут — проверьте и папку «Спам».",
    "Havola 24 soat amal qiladi va bir marta ishlatiladi.": "Ссылка действует 24 часа и только один раз.",
    "Yangi parol": "Новый пароль",
    "Parolni saqlash": "Сохранить пароль",
    "Havola yaroqsiz": "Ссылка недействительна",
    "Bu havola eskirgan yoki allaqachon ishlatilgan. Yangi havola so'rang.":
        "Ссылка устарела или уже использована. Запросите новую.",
    "Yangi havola so'rash": "Запросить новую ссылку",
    "Parol o'zgartirildi": "Пароль изменён",
    "Endi yangi parol bilan kirishingiz mumkin.": "Теперь вы можете войти с новым паролем.",
    "Assalomu alaykum, {0}!": "Здравствуйте, {0}!",
    "SmetaGo'da parolingizni tiklash so'raldi. Yangi parol o'rnatish uchun havolani oching:":
        "Для вашего аккаунта SmetaGo запрошено восстановление пароля. Чтобы задать новый пароль, откройте ссылку:",
    "Havola 24 soat amal qiladi va bir marta ishlatiladi. Agar buni siz so'ramagan bo'lsangiz, xatni e'tiborsiz qoldiring — parolingiz o'zgarmaydi.":
        "Ссылка действует 24 часа и только один раз. Если вы не запрашивали восстановление, просто "
        "проигнорируйте письмо — пароль не изменится.",
    "Loginingiz": "Ваш логин",
    "SmetaGo: parolni tiklash": "SmetaGo: восстановление пароля",
    # PWA / ilova
    "smeta kalkulyatori": "калькулятор смет",
    "Xonalarni o'lchang, katalogdan tanlang — material, narx va ish haqi bilan tayyor smeta.":
        "Измерьте комнаты, выберите из каталога — готовая смета с материалами, ценами и оплатой труда.",
    "Oflayn": "Офлайн",
    "Ilovani o'rnatish": "Установить приложение",
    "Internet yo'q. Bu amal uchun aloqa kerak.": "Нет интернета. Для этого действия нужна связь.",
    "iPhone / iPad: Safari'da «Ulashish» tugmasini bosing, so'ng «Bosh ekranga qo'shish».":
        "iPhone / iPad: в Safari нажмите «Поделиться», затем «На экран «Домой»».",
    "Internet yo'q": "Нет интернета",
    "Bu sahifa hali qurilmada saqlanmagan. Avval ochilgan obyektlar internetsiz ham ishlaydi — ularni aloqa bor paytda bir marta oching.":
        "Эта страница ещё не сохранена на устройстве. Ранее открытые объекты работают и без интернета — откройте их один раз, пока есть связь.",
    "Qayta urinish": "Повторить",
    # sayt (bosh sahifa)
    "Smetachi, PTO, pudratchi va nazoratchi uchun": "Для сметчиков, ПТО, подрядчиков и технадзора",
    "Obyektni o'lchang — smeta o'zi tayyor bo'ladi": "Измерьте объект — смета готова сама",
    "Xonalarni o'lchang, xonadagi narsalarni katalogdan tanlang. SmetaGo material hajmi, narxi va ish haqini hisoblab, tayyor smeta chiqaradi.":
        "Измерьте комнаты и выберите из каталога всё, что в них есть. SmetaGo рассчитает объём материалов, цены и оплату труда и выдаст готовую смету.",
    "Bepul boshlash": "Начать бесплатно",
    "Telefon, planshet va kompyuterda ishlaydi · internetsiz ham": "Работает на телефоне, планшете и компьютере · даже без интернета",
    "Mehmonxona": "Гостиная",
    "m": "м", "m²": "м²", "dona": "шт.", "so'm": "сум",
    "Pol: laminat": "Пол: ламинат",
    "Plintus: PVC": "Плинтус: ПВХ",
    "Devor: bo'yoq": "Стены: покраска",
    "Shift: natyajnoy": "Потолок: натяжной",
    "Svetilnik, rozetka, konditsioner…": "Светильники, розетки, кондиционер…",
    "Xona bo'yicha jami": "Итого по комнате",
    "Xonalar va o'lchov": "Комнаты и замеры",
    "Uzunlik, en, balandlik, eshik va derazalar. Pol, plintus, devor va shift avtomatik hisoblanadi.":
        "Длина, ширина, высота, двери и окна. Пол, плинтус, стены и потолок считаются автоматически.",
    "Katalog": "Каталог",
    "50 dan ortiq element: mebel, elektrika, santexnika, isitish. Ro'yxatda yo'q narsani o'zingiz qo'shasiz.":
        "Более 50 позиций: мебель, электрика, сантехника, отопление. Чего нет в списке — добавите сами.",
    "Beton": "Бетон",
    "M150–M400 markalar: sement, shag'al, qum va suv miqdori, 1 m³ tannarxi va zavod narxi bilan solishtirish.":
        "Марки М150–М400: расход цемента, щебня, песка и воды, себестоимость 1 м³ и сравнение с ценой завода.",
    "Narxlar va smeta": "Цены и смета",
    "Har material uchun 3 manbadan narx, ish haqi, kutilmagan xarajatlar va QQS. Excel'ga bir bosishda nusxa.":
        "Цены из 3 источников на каждый материал, оплата труда, непредвиденные расходы и НДС. Копия в Excel в один клик.",
    "Ilova sifatida o'rnating": "Установите как приложение",
    "Telefon ekranida ikonka bilan, brauzer panelisiz ochiladi": "Иконка на экране телефона, открывается без панели браузера",
    "Internetsiz ishlaydi — o'zgarishlar aloqa tiklanganda o'zi yuboriladi": "Работает без интернета — изменения отправятся сами, когда появится связь",
    "O'zbekcha va ruscha, kunduzgi va tungi rejim": "Узбекский и русский, дневной и ночной режим",
    "Android va kompyuter: Chrome yoki Edge'da «O'rnatish». iPhone: Safari → «Ulashish» → «Bosh ekranga qo'shish».":
        "Android и компьютер: «Установить» в Chrome или Edge. iPhone: Safari → «Поделиться» → «На экран «Домой»».",
    "Qanday ishlaydi": "Как это работает",
    "Bo'limlar": "Разделы",
    "Ro'yxatdan o'ting — bepul, bir daqiqa": "Зарегистрируйтесь — бесплатно, за минуту",
    "Obyekt oching, xonalarni o'lchang va narsalarni tanlang": "Откройте объект, измерьте комнаты и выберите позиции",
    "Tayyor smetani Excel yoki Telegramga yuboring": "Отправьте готовую смету в Excel или Telegram",
    "Narxlar namunaviy — o'z manbalaringizdagi narxlarni kiriting.": "Цены примерные — вводите цены из своих источников.",
    # yangi bosh sahifa (2026-09-29 dizayni)
    "Sahifa bo'limlari": "Разделы страницы",
    "Kim uchun": "Для кого",
    "Smetachi · PTO · Pudratchi · Nazoratchi": "Сметчик · ПТО · Подрядчик · Технадзор",
    "Obyektni o'lchang —": "Измерьте объект —",
    "smeta o'zi": "смета",
    "tayyor bo'ladi": "готова сама",
    "Xona o'lchamlarini kiriting, materiallarni katalogdan tanlang. SmetaGo hajm, narx va ish haqini hisoblab, tayyor smetani Excel'da beradi.":
        "Введите размеры комнат и выберите материалы из каталога. SmetaGo рассчитает объёмы, цены и оплату труда и выдаст готовую смету в Excel.",
    "Namuna smetani ko'rish": "Посмотреть пример сметы",
    "Telefon, planshet, kompyuter": "Телефон, планшет, компьютер",
    "Internetsiz ishlaydi": "Работает без интернета",
    "Karta talab qilinmaydi": "Карта не нужна",
    "Xonani o'lchab ko'ring": "Измерьте комнату",
    "Raqamlarni o'zgartiring — natija darhol yangilanadi": "Меняйте цифры — результат обновляется сразу",
    "Xona turi": "Тип комнаты",
    "Uzunligi, m": "Длина, м", "Eni, m": "Ширина, м", "Balandligi, m": "Высота, м",
    "Pol": "Пол", "Devor": "Стены", "Shift": "Потолок",
    "Hisobda 1 ta eshik (0,90 m) bor — ilovada eshik va derazalarni o'zingiz qo'shasiz.":
        "В расчёте 1 дверь (0,90 м) — в приложении двери и окна добавляете сами.",
    "Smetani saqlash va Excel yuklab olish": "Сохранить смету и скачать Excel",
    "Saqlash uchun bepul ro'yxatdan o'ting · 30 soniya": "Для сохранения — бесплатная регистрация · 30 секунд",
    "Kalkulyator uchun JavaScript kerak.": "Для калькулятора нужен JavaScript.",
    "Uch qadam — obyektdan tayyor smetagacha": "Три шага — от объекта до готовой сметы",
    "O'lchang": "Измерьте", "Tanlang": "Выберите", "Hisoblang": "Посчитайте",
    "Xonalarni kiriting": "Введите комнаты",
    "Uzunlik, eni va balandlik. Eshik va derazalarni qo'shing — maydon avtomatik ayiriladi.":
        "Длина, ширина и высота. Добавьте двери и окна — площадь вычтется автоматически.",
    "Materialni katalogdan oling": "Возьмите материалы из каталога",
    "Pol, devor, shift, santexnika — 3 manbali narxlar bazasi bilan. O'z narxingizni ham kiritishingiz mumkin.":
        "Пол, стены, потолок, сантехника — с базой цен из 3 источников. Можно ввести и свою цену.",
    "Smetani yuboring": "Отправьте смету",
    "Zaxira foizi, ish haqi va jami summa tayyor. Buyurtmachiga Excel faylda yuboring.":
        "Запас, оплата труда и итоговая сумма готовы. Отправьте заказчику файлом Excel.",
    "Qurilishdagi har bir rol uchun bitta vosita": "Один инструмент для каждой роли в стройке",
    "Smetachi": "Сметчик", "Pudratchi": "Подрядчик", "Nazoratchi": "Технадзор",
    "Qo'lda hisob-kitobsiz smeta — soatlar emas, daqiqalarda.": "Смета без ручных расчётов — за минуты, а не часы.",
    "Hajmlar va formulalar ochiq — har bir raqamni tekshirish oson.": "Объёмы и формулы открыты — каждую цифру легко проверить.",
    "Buyurtmachiga obyektning o'zida tayyor narx taklif qiling.": "Предложите заказчику готовую цену прямо на объекте.",
    "Hajmlarni obyektda o'lchab, smetadagi raqamlar bilan solishtiring.": "Измерьте объёмы на объекте и сравните с цифрами сметы.",
    "Birinchi smetangizni bugun tuzing": "Составьте первую смету сегодня",
    "Ro'yxatdan o'tish bepul, karta talab qilinmaydi. Obyektlar soni cheklanmagan.":
        "Регистрация бесплатна, карта не нужна. Количество объектов не ограничено.",
    # pastki qator, namuna, qoralama
    "Sayt": "Сайт", "Namuna": "Пример", "Yordam": "Помощь", "Maxfiylik": "Конфиденциальность",
    "Bosh sahifa": "Главная", "Namuna smeta": "Пример сметы",
    "Bu namuna: o'zgarishlar faqat shu qurilmada saqlanadi.": "Это пример: изменения сохраняются только на этом устройстве.",
    "Bepul ro'yxatdan o'tish": "Бесплатная регистрация",
    "Bosh sahifada o'lchangan xona saqlanmagan:": "Комната, измеренная на главной, не сохранена:",
    "Yangi obyekt sifatida saqlash": "Сохранить как новый объект",
    "Kerak emas": "Не нужно",
    # yordam
    "SmetaGo bo'yicha ko'p beriladigan savollar.": "Частые вопросы о SmetaGo.",
    "Qanday boshlayman?": "С чего начать?",
    "Bepul ro'yxatdan o'ting va «+ Yangi obyekt» ni bosing. Xona qo'shing, uzunlik, eni va balandligini kiriting — pol, plintus, devor va shift o'zi hisoblanadi. Keyin o'ngdagi katalogdan xonadagi narsalarni tanlang.":
        "Зарегистрируйтесь бесплатно и нажмите «+ Новый объект». Добавьте комнату, введите длину, ширину и высоту — пол, плинтус, стены и потолок посчитаются сами. Затем выберите в каталоге справа то, что есть в комнате.",
    "Smetani Excel faylda qanday olaman?": "Как получить смету в Excel?",
    "Pastki qatordagi «Excel» tugmasini yoki «Smeta» bo'limidagi «Excel yuklab olish» ni bosing. Faylda ikki varaq bor: «Smeta» (har bir qator, oraliq va umumiy jami) va «Xonalar» (o'lchamlar, maydonlar, xona summasi). «Excel ko'rinishi» faylni yuklamasdan oldin ilovaning o'zida ko'rsatadi.":
        "Нажмите «Excel» в нижней строке или «Скачать Excel» в разделе «Смета». В файле два листа: «Смета» (все строки, промежуточные и общий итог) и «Комнаты» (размеры, площади, сумма по комнате). «Вид Excel» показывает файл прямо в приложении ещё до скачивания.",
    "Narxlar qayerdan olinadi?": "Откуда берутся цены?",
    "«Narxlar» bo'limida har bir material uchun 3 ta manbadan narx kiritiladi va o'rtacha, eng arzon, eng qimmat yoki qo'lda narx tanlanadi. Standart narxlar namunaviy — o'z manbalaringizdagi narxlarni kiriting. «Markaziy narxlarni yuklash» tugmasi ma'lumotnomadagi eng so'nggi narxlarni oladi.":
        "В разделе «Цены» для каждого материала вводятся цены из 3 источников и выбирается средняя, самая низкая, самая высокая или своя цена. Стандартные цены примерные — вводите цены из своих источников. Кнопка «Загрузить центральные цены» берёт последние цены из справочника.",
    "Internetsiz ishlaydimi?": "Работает ли без интернета?",
    "Ha, avval ochilgan obyektlar internetsiz ham ochiladi va tahrirlanadi. O'zgarishlar qurilmada saqlanadi va aloqa tiklanganda serverga o'zi yuboriladi. Yangi obyekt yaratish va Excel fayl olish uchun internet kerak.":
        "Да, ранее открытые объекты открываются и редактируются без интернета. Изменения сохраняются на устройстве и сами отправляются на сервер, когда появится связь. Для создания объекта и файла Excel нужен интернет.",
    "Telefonga ilova sifatida qo'shsa bo'ladimi?": "Можно ли установить как приложение на телефон?",
    "Ha. Android va kompyuterda Chrome yoki Edge menyusidan «Ilovani o'rnatish» ni tanlang. iPhone'da Safari → «Ulashish» → «Bosh ekranga qo'shish».":
        "Да. На Android и компьютере выберите «Установить приложение» в меню Chrome или Edge. На iPhone: Safari → «Поделиться» → «На экран «Домой»».",
    "Ro'yxatdan o'tmasdan sinab ko'rsa bo'ladimi?": "Можно попробовать без регистрации?",
    "Ha — «Namuna» sahifasida to'liq ilova bor. U yerdagi o'zgarishlar faqat shu brauzerda saqlanadi.":
        "Да — на странице «Пример» полное приложение. Изменения там сохраняются только в этом браузере.",
    "Tilni va rejimni qanday almashtiraman?": "Как сменить язык и режим?",
    "Yuqoridagi UZ / RU tugmalari tilni, oy / quyosh belgisi kunduzgi va tungi rejimni almashtiradi. Tanlov eslab qolinadi.":
        "Кнопки UZ / RU вверху меняют язык, значок луны / солнца — дневной и ночной режим. Выбор запоминается.",
    "Ma'lumotlarim qayerda saqlanadi?": "Где хранятся мои данные?",
    "Obyektlaringiz serverda, hisobingizga bog'langan holda saqlanadi va faqat sizga ko'rinadi.":
        "Ваши объекты хранятся на сервере, привязаны к вашему аккаунту и видны только вам.",
    # maxfiylik
    "Oxirgi yangilanish: 29.09.2026": "Последнее обновление: 29.09.2026",
    "Qanday ma'lumot saqlanadi": "Какие данные хранятся",
    "Hisob: login va parol. Parol ochiq holda emas, qaytarib bo'lmaydigan shifrlangan ko'rinishda (xesh) saqlanadi.":
        "Аккаунт: логин и пароль. Пароль хранится не в открытом виде, а в необратимо зашифрованном виде (хеш).",
    "Obyektlaringiz: nomi, hudud, xonalar va o'lchamlar, tanlangan elementlar, narxlar va sozlamalar.":
        "Ваши объекты: название, регион, комнаты и размеры, выбранные позиции, цены и настройки.",
    "Brauzeringizda nima saqlanadi": "Что хранится в вашем браузере",
    "Cookie: kirish sessiyasi, xavfsizlik belgisi (CSRF) va tanlangan til.": "Cookie: сессия входа, защитный токен (CSRF) и выбранный язык.",
    "Brauzer xotirasi: kunduzgi/tungi rejim tanlovi, internetsiz qilingan va hali yuborilmagan o'zgarishlar, bosh sahifadagi kalkulyator qoralamasi va namuna sahifasi holati.":
        "Память браузера: выбор дневного/ночного режима, изменения, сделанные без интернета и ещё не отправленные, черновик калькулятора с главной и состояние страницы примера.",
    "Internetsiz ishlash uchun ochilgan sahifalar nusxasi. Hisobdan chiqqaningizda u o'chiriladi.":
        "Копии открытых страниц для работы без интернета. Удаляются при выходе из аккаунта.",
    "Kimga beriladi": "Кому передаются",
    "Ma'lumotlaringiz sotilmaydi va uchinchi shaxslarga berilmaydi. Saytda reklama va kuzatuv (analitika) skriptlari yo'q. Shriftlar Google Fonts xizmatidan yuklanadi — bunda brauzeringiz Google serverlariga murojaat qiladi.":
        "Ваши данные не продаются и не передаются третьим лицам. На сайте нет рекламы и скриптов отслеживания (аналитики). Шрифты загружаются из сервиса Google Fonts — при этом браузер обращается к серверам Google.",
    "Ma'lumotni o'chirish": "Удаление данных",
    "Istalgan obyektni «Obyektlar» sahifasida o'chirishingiz mumkin. Hisobni butunlay o'chirish uchun sayt ma'muriga murojaat qiling.":
        "Любой объект можно удалить на странице «Объекты». Чтобы полностью удалить аккаунт, обратитесь к администратору сайта.",
    # hududlar (obyektda o'zbekcha saqlanadi)
    "Toshkent sh.": "г. Ташкент", "Toshkent vil.": "Ташкентская обл.", "Andijon": "Андижан",
    "Buxoro": "Бухара", "Farg'ona": "Фергана", "Jizzax": "Джизак", "Xorazm": "Хорезм",
    "Namangan": "Наманган", "Navoiy": "Навои", "Qashqadaryo": "Кашкадарья",
    "Qoraqalpog'iston": "Каракалпакстан", "Samarqand": "Самарканд", "Sirdaryo": "Сырдарья",
    "Surxondaryo": "Сурхандарья",
}


def current_lang():
    return "ru" if translation.get_language() == "ru" else "uz"


def tr(text, *args, lang=None):
    lang = lang or current_lang()
    out = RU.get(text, text) if lang == "ru" else text
    for i, a in enumerate(args):
        out = out.replace("{%d}" % i, str(a))
    return out


class LanguageMiddleware:
    """Til cookie'dan olinadi (Django'ning set_language ko'rinishi yozadi), aks holda o'zbekcha.
    Brauzerning Accept-Language'i hisobga olinmaydi: ilova avvalo o'zbek tilida."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        lang = request.COOKIES.get(settings.LANGUAGE_COOKIE_NAME)
        if lang not in dict(settings.LANGUAGES):
            lang = settings.LANGUAGE_CODE
        translation.activate(lang)
        request.LANGUAGE_CODE = lang
        response = self.get_response(request)
        response.headers.setdefault("Content-Language", lang)
        return response
