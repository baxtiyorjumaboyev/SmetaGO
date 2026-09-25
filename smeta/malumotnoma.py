"""Ma'lumotnoma: bazadan frontend formatiga (data.js dagi CATALOG / defaultPrices / ROOM_TYPES)
yig'ish va boshlang'ich ma'lumotni seed/malumotnoma.json dan yuklash."""
import json
from pathlib import Path

from django.db.models import Prefetch

SEED_FILE = Path(__file__).resolve().parent / "seed" / "malumotnoma.json"


def _n(d):
    """Decimal -> int yoki float (JSON uchun)."""
    return int(d) if d == int(d) else float(d)


def build_reference():
    from .models import CatalogGroup, CatalogItem, Material, RoomType

    items_qs = CatalogItem.objects.filter(active=True).prefetch_related("variants")
    catalog = []
    for g in CatalogGroup.objects.prefetch_related(Prefetch("items", queryset=items_qs)):
        items = []
        for it in g.items.all():
            d = {"id": it.key, "n": it.name, "u": it.unit, "p": _n(it.price), "h": _n(it.hours)}
            if it.ask_dims:
                d["dims"] = 1
            if it.ask_watt:
                d["w"] = 1
            vs = [[v.label, _n(v.price)] + ([_n(v.hours)] if v.hours is not None else [])
                  for v in it.variants.all()]
            if vs:
                d["v"] = vs
            items.append(d)
        if items:
            catalog.append({"g": g.name, "items": items})

    materials = list(Material.objects.all())
    prices = [{"id": m.key, "n": m.name, "u": m.unit, "g": m.group,
               "src": [_n(m.src1), _n(m.src2), _n(m.src3)], "s": m.sources,
               "mode": "avg", "manual": 0} for m in materials]
    last = max((m.updated for m in materials), default=None)

    room_types = {}
    for rt in RoomType.objects.prefetch_related(Prefetch("suggestions", queryset=items_qs)):
        room_types[rt.name] = {"floor": rt.floor, "wall": rt.wall, "ceil": rt.ceil,
                               "s": [it.key for it in rt.suggestions.all()]}

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
