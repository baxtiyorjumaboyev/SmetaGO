"""Ma'lumotnoma: bazadan frontend formatiga (data.js dagi CATALOG / defaultPrices / ROOM_TYPES)
yig'ish va boshlang'ich ma'lumotni seed/malumotnoma.json dan yuklash."""
import json
from pathlib import Path

from django.db.models import Prefetch

SEED_FILE = Path(__file__).resolve().parent / "seed" / "malumotnoma.json"


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


def load_seed(apps):
    """Migratsiyadan chaqiriladi (tarixiy modellar bilan). Baza bo'sh bo'lsagina yuklaydi."""
    CatalogGroup = apps.get_model("smeta", "CatalogGroup")
    CatalogItem = apps.get_model("smeta", "CatalogItem")
    CatalogVariant = apps.get_model("smeta", "CatalogVariant")
    Material = apps.get_model("smeta", "Material")
    RoomType = apps.get_model("smeta", "RoomType")
    if CatalogGroup.objects.exists() or Material.objects.exists():
        return

    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
    for gi, g in enumerate(data["catalog"]):
        group = CatalogGroup.objects.create(name=g["g"], order=gi)
        for ii, it in enumerate(g["items"]):
            item = CatalogItem.objects.create(
                key=it["id"], group=group, name=it["n"], unit=it["u"], price=it["p"],
                hours=it["h"], ask_dims=bool(it.get("dims")), ask_watt=bool(it.get("w")), order=ii)
            for vi, v in enumerate(it.get("v", [])):
                CatalogVariant.objects.create(item=item, label=v[0], price=v[1],
                                              hours=v[2] if len(v) > 2 else None, order=vi)
    for pi, p in enumerate(data["prices"]):
        Material.objects.create(key=p["id"], name=p["n"], unit=p["u"], group=p["g"],
                                src1=p["src"][0], src2=p["src"][1], src3=p["src"][2],
                                sources=p["s"], order=pi)
    by_key = {i.key: i for i in CatalogItem.objects.all()}
    for ri, (name, rt) in enumerate(data["room_types"].items()):
        room = RoomType.objects.create(name=name, floor=rt["floor"], wall=rt["wall"],
                                       ceil=rt["ceil"], order=ri)
        room.suggestions.set([by_key[k] for k in rt["s"] if k in by_key])


def sync_materials(apps):
    """Seed'ga keyin qo'shilgan materiallarni mavjud bazaga qo'shadi va tartibni seed bo'yicha
    tiklaydi. Admin'da o'zgartirilgan nom va narxlarga tegmaydi."""
    Material = apps.get_model("smeta", "Material")
    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
    ru = json.loads((SEED_FILE.parent / "ru.json").read_text(encoding="utf-8"))
    # shift_boyoq endi "suv emulsiyali" — nomi eski standartda qolgan bo'lsagina yangilanadi
    renamed = {"shift_boyoq": (("Shift bo'yog'i", "Suv emulsiyali bo'yoq (shift)"),
                               ("Краска для потолка", ru["materials"]["shift_boyoq"]))}
    for pi, p in enumerate(data["prices"]):
        m = Material.objects.filter(key=p["id"]).first()
        if m is None:
            Material.objects.create(key=p["id"], name=p["n"], name_ru=ru["materials"].get(p["id"], ""),
                                    unit=p["u"], group=p["g"], src1=p["src"][0], src2=p["src"][1],
                                    src3=p["src"][2], sources=p["s"], order=pi)
            continue
        if p["id"] in renamed:
            (old, new), (old_ru, new_ru) = renamed[p["id"]]
            if m.name == old:
                m.name = new
            if m.name_ru == old_ru:
                m.name_ru = new_ru
        m.order = pi
        m.save(update_fields=["name", "name_ru", "order"])


def load_ru(apps):
    """Ruscha nomlarni seed/ru.json dan to'ldiradi (faqat bo'sh maydonlarga)."""
    ru = json.loads((SEED_FILE.parent / "ru.json").read_text(encoding="utf-8"))
    models = {n: apps.get_model("smeta", n) for n in
              ("CatalogGroup", "CatalogItem", "CatalogVariant", "Material", "RoomType")}
    for obj in models["CatalogGroup"].objects.filter(name_ru=""):
        obj.name_ru = ru["groups"].get(obj.name, "")
        obj.save(update_fields=["name_ru"])
    for obj in models["CatalogItem"].objects.filter(name_ru=""):
        obj.name_ru = ru["items"].get(obj.key, "")
        obj.save(update_fields=["name_ru"])
    for obj in models["CatalogVariant"].objects.filter(label_ru=""):
        obj.label_ru = ru["variants"].get(obj.label, "")
        obj.save(update_fields=["label_ru"])
    for obj in models["Material"].objects.all():
        obj.name_ru = obj.name_ru or ru["materials"].get(obj.key, "")
        obj.sources_ru = obj.sources_ru or ru["sources"].get(obj.sources, "")
        obj.save(update_fields=["name_ru", "sources_ru"])
    for obj in models["RoomType"].objects.filter(name_ru=""):
        obj.name_ru = ru["room_types"].get(obj.name, "")
        obj.save(update_fields=["name_ru"])


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
