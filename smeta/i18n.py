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
