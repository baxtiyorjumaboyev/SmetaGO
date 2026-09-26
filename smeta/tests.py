import json

from django.contrib.auth.models import User
from django.test import Client, TestCase
from django.urls import reverse

from .malumotnoma import SEED_FILE, build_reference
from .models import CatalogItem, Material, Obyekt

STATE = {"v": 1, "obj": {"name": "Chilonzor kvartira", "region": "Toshkent sh."}, "rooms": [{}, {}]}


class SmetaTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("ali", password="SmetaGo-2026!")
        self.c = Client()
        self.c.force_login(self.user)

    def test_register_and_login_pages(self):
        anon = Client()
        self.assertRedirects(anon.get("/"), "/kirish/?next=/")
        self.assertEqual(anon.get(reverse("login")).status_code, 200)
        r = anon.post(reverse("register"), {
            "username": "vali", "password1": "Qurilish-2026!", "password2": "Qurilish-2026!",
        })
        self.assertRedirects(r, "/")
        self.assertTrue(User.objects.filter(username="vali").exists())

    def test_create_open_and_save(self):
        r = self.c.post(reverse("obyekt_create"))
        o = Obyekt.objects.get(owner=self.user)
        self.assertRedirects(r, reverse("obyekt_app", args=[o.pk]))
        page = self.c.get(reverse("obyekt_app", args=[o.pk])).content.decode()
        self.assertIn('id="smeta-state"', page)
        self.assertIn("window.SMETAGO", page)
        self.assertIn("/static/smeta/js/app.js", page)

        url = reverse("obyekt_state", args=[o.pk])
        r = self.c.put(url, json.dumps(STATE), content_type="application/json")
        self.assertEqual(r.status_code, 200)
        o.refresh_from_db()
        self.assertEqual(o.name, "Chilonzor kvartira")
        self.assertEqual(o.rooms_count, 2)
        self.assertEqual(self.c.get(url).json(), STATE)

        list_page = self.c.get("/").content.decode()
        self.assertIn("Chilonzor kvartira", list_page)
        self.assertIn("2 xona", list_page)

    def test_sample_object(self):
        self.c.post(reverse("obyekt_create"), {"namuna": "1"})
        self.assertEqual(Obyekt.objects.get().state, {"namuna": True})

    def test_bad_state_rejected(self):
        o = Obyekt.objects.create(owner=self.user)
        url = reverse("obyekt_state", args=[o.pk])
        self.assertEqual(self.c.put(url, "{bad", content_type="application/json").status_code, 400)
        self.assertEqual(self.c.put(url, '{"v":2}', content_type="application/json").status_code, 400)
        self.assertEqual(self.c.post(url).status_code, 405)

    def test_copy_and_delete(self):
        o = Obyekt.objects.create(owner=self.user, name="A", state=dict(STATE, obj={"name": "A"}))
        self.c.post(reverse("obyekt_copy", args=[o.pk]))
        copy = Obyekt.objects.exclude(pk=o.pk).get()
        self.assertEqual(copy.name, "A (nusxa)")
        self.assertEqual(copy.state["obj"]["name"], "A (nusxa)")
        self.assertEqual(Obyekt.objects.get(pk=o.pk).state["obj"]["name"], "A")
        self.c.post(reverse("obyekt_delete", args=[o.pk]))
        self.assertFalse(Obyekt.objects.filter(pk=o.pk).exists())

    def test_other_users_objects_hidden(self):
        other = User.objects.create_user("begona", password="x")
        o = Obyekt.objects.create(owner=other, state=STATE)
        self.assertEqual(self.c.get(reverse("obyekt_app", args=[o.pk])).status_code, 404)
        self.assertEqual(self.c.get(reverse("obyekt_state", args=[o.pk])).status_code, 404)
        r = self.c.put(reverse("obyekt_state", args=[o.pk]), json.dumps(STATE), content_type="application/json")
        self.assertEqual(r.status_code, 404)
        self.assertEqual(self.c.post(reverse("obyekt_delete", args=[o.pk])).status_code, 404)

    def test_reference_matches_seed(self):
        """Bazadan yig'ilgan ma'lumotnoma asl data.js (seed) bilan bir xil bo'lishi kerak."""
        seed = json.loads(SEED_FILE.read_text(encoding="utf-8"))
        ref = build_reference()
        self.assertEqual(ref["catalog"], seed["catalog"])
        self.assertEqual(ref["prices"], seed["prices"])
        self.assertEqual(list(ref["roomTypes"]), list(seed["room_types"]))
        for name, rt in seed["room_types"].items():
            got = ref["roomTypes"][name]
            self.assertEqual((got["floor"], got["wall"], got["ceil"]), (rt["floor"], rt["wall"], rt["ceil"]))
            self.assertEqual(sorted(got["s"]), sorted(rt["s"]))

    def test_admin_changes_reach_app_page(self):
        CatalogItem.objects.filter(key="divan").update(price=5100000)
        CatalogItem.objects.filter(key="seyf").update(active=False)
        Material.objects.filter(key="laminat").update(src1=99000)
        o = Obyekt.objects.create(owner=self.user)
        page = self.c.get(reverse("obyekt_app", args=[o.pk])).content.decode()
        ref = json.loads(page.split('id="smeta-ref" type="application/json">')[1].split("</script>")[0])
        items = {it["id"]: it for g in ref["catalog"] for it in g["items"]}
        self.assertEqual(items["divan"]["p"], 5100000)
        self.assertNotIn("seyf", items)
        self.assertNotIn("seyf", ref["roomTypes"]["Ofis xonasi"]["s"])
        self.assertEqual(next(p for p in ref["prices"] if p["id"] == "laminat")["src"][0], 99000)

    def test_reference_admin_pages(self):
        admin = User.objects.create_superuser("admin", password="x")
        c = Client()
        c.force_login(admin)
        for name in ("cataloggroup", "catalogitem", "material", "roomtype", "obyekt"):
            self.assertEqual(c.get(f"/admin/smeta/{name}/").status_code, 200, name)
        item = CatalogItem.objects.get(key="shkaf")
        self.assertEqual(c.get(f"/admin/smeta/catalogitem/{item.pk}/change/").status_code, 200)

    def test_default_language_is_uzbek(self):
        r = self.c.get("/", HTTP_ACCEPT_LANGUAGE="ru")  # brauzer tili hisobga olinmaydi
        self.assertContains(r, '<html lang="uz">')
        self.assertContains(r, "Obyektlar")

    def test_switch_to_russian(self):
        r = self.c.post("/i18n/setlang/", {"language": "ru", "next": "/"})
        self.assertRedirects(r, "/", fetch_redirect_response=False)
        page = self.c.get("/")
        self.assertContains(page, '<html lang="ru">')
        self.assertContains(page, "Объекты")
        self.assertContains(page, "+ Новый объект")
        self.c.post(reverse("obyekt_create"))
        self.assertEqual(Obyekt.objects.get().name, "Новый объект")

    def test_app_page_reference_in_russian(self):
        self.c.cookies["django_language"] = "ru"
        o = Obyekt.objects.create(owner=self.user)
        page = self.c.get(reverse("obyekt_app", args=[o.pk])).content.decode()
        self.assertIn('<html lang="ru">', page)
        self.assertIn("/static/smeta/js/i18n.js", page)
        ref = json.loads(page.split('id="smeta-ref" type="application/json">')[1].split("</script>")[0])
        self.assertEqual(ref["catalog"][0]["g"], "Мебель")
        items = {it["id"]: it for g in ref["catalog"] for it in g["items"]}
        self.assertEqual(items["shkaf"]["n"], "Шкаф")
        self.assertEqual(items["shkaf"]["v"][0][0], "2-дверный")
        # xona turi kaliti o'zbekcha qoladi (obyektlarda saqlanadi), nomi — ruscha
        self.assertEqual(ref["roomTypes"]["Mehmonxona"]["l"], "Гостиная")
        lam = next(p for p in ref["prices"] if p["id"] == "laminat")
        self.assertEqual((lam["n"], lam["g"]), ("Ламинат", "Pol"))

    def test_empty_russian_name_falls_back_to_uzbek(self):
        CatalogItem.objects.filter(key="divan").update(name_ru="")
        items = {it["id"]: it for g in build_reference("ru")["catalog"] for it in g["items"]}
        self.assertEqual(items["divan"]["n"], "Divan")

    def test_csrf_required_for_save(self):
        o = Obyekt.objects.create(owner=self.user)
        c = Client(enforce_csrf_checks=True)
        c.force_login(self.user)
        r = c.put(reverse("obyekt_state", args=[o.pk]), json.dumps(STATE), content_type="application/json")
        self.assertEqual(r.status_code, 403)
