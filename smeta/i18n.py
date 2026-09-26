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
    "Ro'yxatdan o'ting — bepul, bir daqiqa": "Зарегистрируйтесь — бесплатно, за минуту",
    "Obyekt oching, xonalarni o'lchang va narsalarni tanlang": "Откройте объект, измерьте комнаты и выберите позиции",
    "Tayyor smetani Excel yoki Telegramga yuboring": "Отправьте готовую смету в Excel или Telegram",
    "Narxlar namunaviy — o'z manbalaringizdagi narxlarni kiriting.": "Цены примерные — вводите цены из своих источников.",
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
