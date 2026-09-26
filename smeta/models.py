from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models

key_validator = RegexValidator(r"^[a-z0-9_]+$", "Faqat kichik lotin harflari, raqam va _")

# Kalitlar js/data.js dagi FLOOR / WALL / CEIL bilan bir xil bo'lishi shart:
# qoplama formulalari frontendda, bu yerda faqat xona turi uchun standart tanlov.
FLOOR_CHOICES = [("laminat", "Laminat"), ("kafel", "Kafel"), ("linoleum", "Linoleum"),
                 ("parket", "Parket"), ("yoq", "O'zgarmaydi")]
WALL_CHOICES = [("boyoq", "Bo'yoq (shpaklyovka bilan)"), ("oboy", "Oboy"),
                ("kafel", "Kafel (to'liq balandlik)"), ("gipsokarton", "Gipsokarton"),
                ("yoq", "O'zgarmaydi")]
CEIL_CHOICES = [("shift_boyoq", "Bo'yoq"), ("natyajnoy", "Natyajnoy shift"),
                ("gipsokarton", "Gipsokarton"), ("armstrong", "Armstrong"), ("yoq", "O'zgarmaydi")]
UNIT_CHOICES = [(u, u) for u in ("dona", "m", "m²", "m³", "kg", "seksiya", "komplekt")]


class CatalogGroup(models.Model):
    name = models.CharField("Nomi", max_length=100, unique=True)
    name_ru = models.CharField("Nomi (ruscha)", max_length=100, blank=True)
    order = models.PositiveIntegerField("Tartib", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Katalog guruhi"
        verbose_name_plural = "Katalog guruhlari"

    def __str__(self):
        return self.name


class CatalogItem(models.Model):
    """Katalog elementi. `key` — frontenddagi `cid`, saqlangan obyektlarda ishlatiladi."""

    key = models.CharField("Kalit (id)", max_length=50, unique=True, validators=[key_validator])
    group = models.ForeignKey(CatalogGroup, on_delete=models.PROTECT, related_name="items",
                              verbose_name="Guruh")
    name = models.CharField("Nomi", max_length=150)
    name_ru = models.CharField("Nomi (ruscha)", max_length=150, blank=True)
    unit = models.CharField("Birlik", max_length=20, choices=UNIT_CHOICES, default="dona")
    price = models.DecimalField("Narx, so'm", max_digits=14, decimal_places=0, default=0)
    hours = models.DecimalField("O'rnatish, soat/birlik", max_digits=6, decimal_places=2, default=0)
    ask_dims = models.BooleanField("O'lcham so'ralsin", default=False)
    ask_watt = models.BooleanField("Quvvat so'ralsin", default=False)
    active = models.BooleanField("Faol", default=True)
    order = models.PositiveIntegerField("Tartib", default=0)

    class Meta:
        ordering = ["group__order", "order", "id"]
        verbose_name = "Katalog elementi"
        verbose_name_plural = "Katalog elementlari"

    def __str__(self):
        return self.name


class CatalogVariant(models.Model):
    item = models.ForeignKey(CatalogItem, on_delete=models.CASCADE, related_name="variants")
    label = models.CharField("Turi", max_length=150)
    label_ru = models.CharField("Turi (ruscha)", max_length=150, blank=True)
    price = models.DecimalField("Narx, so'm", max_digits=14, decimal_places=0)
    hours = models.DecimalField("Soat (bo'sh — elementniki)", max_digits=6, decimal_places=2,
                                null=True, blank=True)
    order = models.PositiveIntegerField("Tartib", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Turi"
        verbose_name_plural = "Turlari"

    def __str__(self):
        return self.label


class Material(models.Model):
    """Markaziy material narxi (3 manba). Frontenddagi `defaultPrices()` shu yerdan olinadi."""

    GROUPS = [("Beton", "Beton"), ("Pol", "Pol"), ("Devor", "Devor"), ("Shift", "Shift")]

    key = models.CharField("Kalit (id)", max_length=50, unique=True, validators=[key_validator])
    name = models.CharField("Nomi", max_length=150)
    name_ru = models.CharField("Nomi (ruscha)", max_length=150, blank=True)
    unit = models.CharField("Birlik", max_length=20, choices=UNIT_CHOICES)
    group = models.CharField("Guruh", max_length=20, choices=GROUPS)
    src1 = models.DecimalField("1-manba", max_digits=14, decimal_places=0, default=0)
    src2 = models.DecimalField("2-manba", max_digits=14, decimal_places=0, default=0)
    src3 = models.DecimalField("3-manba", max_digits=14, decimal_places=0, default=0)
    sources = models.CharField("Manbalar nomi", max_length=200, blank=True)
    sources_ru = models.CharField("Manbalar nomi (ruscha)", max_length=200, blank=True)
    order = models.PositiveIntegerField("Tartib", default=0)
    updated = models.DateTimeField("Yangilangan", auto_now=True)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Material narxi"
        verbose_name_plural = "Material narxlari"

    def __str__(self):
        return self.name


class RoomType(models.Model):
    name = models.CharField("Nomi", max_length=100, unique=True)
    name_ru = models.CharField("Nomi (ruscha)", max_length=100, blank=True)
    floor = models.CharField("Pol", max_length=20, choices=FLOOR_CHOICES, default="laminat")
    wall = models.CharField("Devor", max_length=20, choices=WALL_CHOICES, default="boyoq")
    ceil = models.CharField("Shift", max_length=20, choices=CEIL_CHOICES, default="shift_boyoq")
    suggestions = models.ManyToManyField(CatalogItem, blank=True, verbose_name="Tavsiya elementlar")
    order = models.PositiveIntegerField("Tartib", default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "Xona turi"
        verbose_name_plural = "Xona turlari"

    def __str__(self):
        return self.name


class Obyekt(models.Model):
    """Bitta smeta obyekti.

    `state` — frontenddagi `S` obyektining o'zi (docs/ARXITEKTURA.md, 1-bo'lim).
    Bo'sh `{}` bo'lsa, frontend yangi bo'sh obyekt yaratadi;
    `{"namuna": true}` bo'lsa — namunaviy obyekt.
    """

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="obyektlar", verbose_name="Egasi",
    )
    name = models.CharField("Nomi", max_length=200, default="Yangi obyekt")
    state = models.JSONField("Holat", default=dict, blank=True)
    created = models.DateTimeField("Yaratilgan", auto_now_add=True)
    updated = models.DateTimeField("O'zgartirilgan", auto_now=True)

    class Meta:
        ordering = ["-updated"]
        verbose_name = "Obyekt"
        verbose_name_plural = "Obyektlar"

    def __str__(self):
        return self.name

    def sync_from_state(self):
        """Nomni holatdagi `obj.name` dan oladi, ro'yxatda ko'rsatish uchun."""
        obj = self.state.get("obj") if isinstance(self.state, dict) else None
        name = (obj or {}).get("name") if isinstance(obj, dict) else None
        if isinstance(name, str) and name.strip():
            self.name = name.strip()[:200]

    @property
    def rooms_count(self):
        rooms = self.state.get("rooms") if isinstance(self.state, dict) else None
        return len(rooms) if isinstance(rooms, list) else 0

    @property
    def region(self):
        obj = self.state.get("obj") if isinstance(self.state, dict) else None
        return obj.get("region", "") if isinstance(obj, dict) else ""
