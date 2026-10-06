"""Boshlang'ich ma'lumot: malumotnoma.json (katalog, narxlar, xona turlari) va ru.json (ruscha nomlar).
Bu funksiyalar faqat migratsiyalardan chaqiriladi (tarixiy modellar bilan) — sayt ishlashida ishlatilmaydi."""
import json
from pathlib import Path

SEED_FILE = Path(__file__).resolve().parent / "malumotnoma.json"
RU_FILE = Path(__file__).resolve().parent / "ru.json"


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
    ru = json.loads(RU_FILE.read_text(encoding="utf-8"))
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
    ru = json.loads(RU_FILE.read_text(encoding="utf-8"))
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
