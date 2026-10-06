"""Ma'lumotnoma: bazadagi katalog, narxlar va xona turlarini frontend formatiga (data.js dagi
CATALOG / defaultPrices / ROOM_TYPES) yig'ish va keshlash. Boshlang'ich ma'lumotni yuklash — smeta/seed/."""
from django.db.models import Prefetch


def _n(d):
    """Decimal -> int yoki float (JSON uchun)."""
    return int(d) if d == int(d) else float(d)


def build_reference(lang="uz"):
    """`lang="ru"` bo'lsa ruscha nomlar olinadi (bo'sh bo'lsa — o'zbekchasi).
    Xona turi kaliti va material guruhi har doim o'zbekcha qoladi: ular saqlangan obyektlarda ishlatiladi."""
    from .models import CatalogGroup, CatalogItem, Material, RoomType

    ru = lang == "ru"

    def pick(uz, ru_val):
        return ru_val if ru and ru_val else uz

    items_qs = CatalogItem.objects.filter(active=True).prefetch_related("variants")
    catalog = []
    for g in CatalogGroup.objects.prefetch_related(Prefetch("items", queryset=items_qs)):
        items = []
        for it in g.items.all():
            d = {"id": it.key, "n": pick(it.name, it.name_ru), "u": it.unit,
                 "p": _n(it.price), "h": _n(it.hours)}
            if it.ask_dims:
                d["dims"] = 1
            if it.ask_watt:
                d["w"] = 1
            vs = [[pick(v.label, v.label_ru), _n(v.price)] + ([_n(v.hours)] if v.hours is not None else [])
                  for v in it.variants.all()]
            if vs:
                d["v"] = vs
            items.append(d)
        if items:
            catalog.append({"g": pick(g.name, g.name_ru), "items": items})

    materials = list(Material.objects.all())
    prices = [{"id": m.key, "n": pick(m.name, m.name_ru), "u": m.unit, "g": m.group,
               "src": [_n(m.src1), _n(m.src2), _n(m.src3)], "s": pick(m.sources, m.sources_ru),
               "mode": "avg", "manual": 0} for m in materials]
    last = max((m.updated for m in materials), default=None)

    room_types = {}
    for rt in RoomType.objects.prefetch_related(Prefetch("suggestions", queryset=items_qs)):
        room_types[rt.name] = {"l": pick(rt.name, rt.name_ru), "floor": rt.floor, "wall": rt.wall,
                               "ceil": rt.ceil, "s": [it.key for it in rt.suggestions.all()]}

    return {"catalog": catalog, "prices": prices, "roomTypes": room_types,
            "pricesUpdated": last.strftime("%d.%m.%Y") if last else ""}


# --- kesh: ma'lumotnoma har sahifada kerak, lekin kam o'zgaradi ---
CACHE_TIMEOUT = 300  # soniya; bir nechta server jarayonida ham ko'pi bilan shuncha eskiradi


def _cache_key(lang):
    return f"smeta-ref:{lang}"


def cached_reference(lang="uz"):
    from django.core.cache import cache

    ref = cache.get(_cache_key(lang))
    if ref is None:
        ref = build_reference(lang)
        cache.set(_cache_key(lang), ref, CACHE_TIMEOUT)
    return ref


def invalidate_reference(**kwargs):
    """Admin'da katalog/narx/xona turi o'zgarsa (signal) — kesh darhol tozalanadi."""
    from django.conf import settings
    from django.core.cache import cache

    cache.delete_many([_cache_key(code) for code, _ in settings.LANGUAGES])
