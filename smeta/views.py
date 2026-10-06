"""SmetaGo sahifalari va API.

Bo'limlar:
  1. Ommaviy sahifalar  — bosh sahifa (sayt), namuna, yordam, maxfiylik
  2. Kabinet            — boshqaruv paneli, smeta loyihalari, obyekt muharriri
  3. Obyekt amallari    — yaratish, nusxa, o'chirish
  4. API                — holatni saqlash (PUT), Excel fayl
  5. Hisob              — kirish, ro'yxatdan o'tish

Hisob-kitob brauzerda (static/smeta/js/calc.js); server faqat saqlaydi va Excel faylni formatlaydi.
"""
import json

from django.contrib.auth import login
from django.contrib.auth import views as auth_views
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseNotAllowed, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.utils.http import content_disposition_header
from django.views.decorators.http import require_POST

from .excel import DEMO_LIMITS, build_workbook
from .forms import RegisterForm
from .i18n import current_lang, tr
from .malumotnoma import cached_reference
from .models import Obyekt

XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
DEMO_MAX_BODY = 300_000  # bayt; namuna smetasi odatda 20–60 KB


def _ref():
    """Joriy tildagi ma'lumotnoma (katalog, narxlar, xona turlari) — keshdan."""
    return cached_reference(current_lang())


def _my_obyekt(request, pk):
    """Faqat egasining obyekti; begonasiga 404."""
    return get_object_or_404(Obyekt, pk=pk, owner=request.user)


# ---------- 1. Ommaviy sahifalar ----------

def obyekt_list(request):
    """Bosh sahifa: mehmonga — sayt (jonli kalkulyator bilan), kirgan foydalanuvchiga — boshqaruv paneli."""
    if not request.user.is_authenticated:
        return render(request, "smeta/landing.html", {"ref": _ref()})
    return render(request, "smeta/obyekt_list.html", _dash_context(request))


def demo(request):
    """Namuna smeta: ro'yxatdan o'tmasdan to'liq ilova. Holat faqat brauzerda saqlanadi."""
    return render(request, "smeta/app.html", {"o": None, "ref": _ref()})


def help_page(request):
    return render(request, "smeta/yordam.html")


def privacy_page(request):
    return render(request, "smeta/maxfiylik.html")


# ---------- 2. Kabinet ----------

@login_required
def loyihalar(request):
    """Smeta loyihalari: barcha obyektlar jadvali, tezkor beton kalkulyatori, xarajat tarkibi."""
    return render(request, "smeta/loyihalar.html", _dash_context(request))


def _dash_context(request):
    """Boshqaruv paneli va loyihalar sahifasi uchun obyektlar.
    Summalar brauzerda calc.js bilan hisoblanadi — ilovadagi bilan aynan bir xil."""
    obyektlar = list(request.user.obyektlar.all())
    ref = _ref()
    return {
        "obyektlar": obyektlar,
        "dash": [{"id": o.pk, "name": o.name, "url": reverse("obyekt_app", args=[o.pk]),
                  "created": o.created.isoformat(), "updated": o.updated.isoformat(), "state": o.state}
                 for o in obyektlar],
        "ref": {"prices": ref["prices"]},
        "prices_updated": ref.get("pricesUpdated", ""),
    }


@login_required
def obyekt_app(request, pk):
    """Obyekt muharriri: xonalar, beton, narxlar, smeta."""
    return render(request, "smeta/app.html", {"o": _my_obyekt(request, pk), "ref": _ref()})


# ---------- 3. Obyekt amallari ----------

@login_required
@require_POST
def obyekt_create(request):
    namuna = request.POST.get("namuna") == "1"
    o = Obyekt.objects.create(
        owner=request.user,
        name=tr("Namunaviy obyekt") if namuna else tr("Yangi obyekt"),
        state={"namuna": True} if namuna else {},
    )
    return redirect("obyekt_app", pk=o.pk)


@login_required
@require_POST
def obyekt_copy(request, pk):
    o = _my_obyekt(request, pk)
    state = json.loads(json.dumps(o.state))
    name = f"{o.name} {tr('(nusxa)')}"[:200]
    if isinstance(state.get("obj"), dict):
        state["obj"]["name"] = name
    Obyekt.objects.create(owner=request.user, name=name, state=state)
    return redirect("obyekt_list")


@login_required
@require_POST
def obyekt_delete(request, pk):
    _my_obyekt(request, pk).delete()
    return redirect("obyekt_list")


# ---------- 4. API ----------

@login_required
def obyekt_state(request, pk):
    """Brauzerdagi `S` holatini o'qish (GET) va saqlash (PUT)."""
    o = _my_obyekt(request, pk)
    if request.method == "GET":
        return JsonResponse(o.state, safe=False)
    if request.method != "PUT":
        return HttpResponseNotAllowed(["GET", "PUT"])
    try:
        state = json.loads(request.body)
    except (ValueError, UnicodeDecodeError):
        return JsonResponse({"error": "JSON noto'g'ri"}, status=400)
    if not isinstance(state, dict) or state.get("v") != 1:
        return JsonResponse({"error": "Holat tuzilishi noto'g'ri"}, status=400)
    o.state = state
    o.sync_from_state()
    o.save()
    return JsonResponse({"ok": True, "updated": o.updated.isoformat()})


def _xlsx_response(request, filename, **limits):
    """Brauzer yuborgan varaq modeli -> .xlsx fayl (smeta/excel.py)."""
    try:
        content = build_workbook(json.loads(request.body), **limits)
    except (ValueError, UnicodeDecodeError):
        return JsonResponse({"error": "Varaq ma'lumoti noto'g'ri"}, status=400)
    resp = HttpResponse(content, content_type=XLSX_TYPE)
    resp["Content-Disposition"] = content_disposition_header(True, filename)
    return resp


@login_required
@require_POST
def obyekt_excel(request, pk):
    o = _my_obyekt(request, pk)
    return _xlsx_response(request, f"{o.name or 'Smeta'}.xlsx")


@require_POST
def demo_excel(request):
    """Namuna sahifasi uchun: hech narsa saqlanmaydi (CSRF bilan). Anonim so'rov — chegaralar qattiqroq,
    umumiy serverda CPU band qilinmasin."""
    if len(request.body) > DEMO_MAX_BODY:
        return JsonResponse({"error": "Varaq juda katta"}, status=413)
    return _xlsx_response(request, "Smeta.xlsx", **DEMO_LIMITS)


# ---------- 5. Hisob ----------

class Login(auth_views.LoginView):
    """Kirish: "Eslab qolish" belgilanmasa — sessiya brauzer yopilganda tugaydi (umumiy kompyuter uchun)."""

    def form_valid(self, form):
        response = super().form_valid(form)
        if not self.request.POST.get("remember"):
            self.request.session.set_expiry(0)
        return response


def register(request):
    if request.user.is_authenticated:
        return redirect("obyekt_list")
    form = RegisterForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        login(request, form.save(), backend="django.contrib.auth.backends.ModelBackend")
        return redirect("obyekt_list")
    return render(request, "registration/register.html", {"form": form})
