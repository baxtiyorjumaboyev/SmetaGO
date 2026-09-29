import json

from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseNotAllowed, JsonResponse
from django.utils.http import content_disposition_header
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_POST

from .excel import DEMO_LIMITS, build_workbook

DEMO_MAX_BODY = 300_000  # bayt; namuna smetasi odatda 20–60 KB
from .forms import RegisterForm
from .i18n import current_lang, tr
from .malumotnoma import cached_reference
from .models import Obyekt


def obyekt_list(request):
    """Bosh sahifa: mehmonga — sayt (landing), kirgan foydalanuvchiga — obyektlar ro'yxati."""
    if not request.user.is_authenticated:
        # kalkulyator uchun ma'lumotnoma (narxlar, qoplamalar, xona turlari)
        return render(request, "smeta/landing.html", {"ref": cached_reference(current_lang())})
    obyektlar = list(request.user.obyektlar.all())
    # dashboard summalari brauzerda calc.js bilan hisoblanadi (ilova bilan bir xil)
    dash = [{"id": o.pk, "name": o.name, "url": reverse("obyekt_app", args=[o.pk]),
             "created": o.created.isoformat(),
             "updated": o.updated.isoformat(), "state": o.state} for o in obyektlar]
    return render(request, "smeta/obyekt_list.html", {
        "obyektlar": obyektlar,
        "dash": dash,
        "ref": {"prices": cached_reference(current_lang())["prices"]},
    })


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
def obyekt_app(request, pk):
    o = get_object_or_404(Obyekt, pk=pk, owner=request.user)
    return render(request, "smeta/app.html", {"o": o, "ref": cached_reference(current_lang())})


def demo(request):
    """Namuna smeta: ro'yxatdan o'tmasdan to'liq ilova. Holat faqat brauzerda saqlanadi (serverga yozilmaydi)."""
    return render(request, "smeta/app.html", {"o": None, "ref": cached_reference(current_lang())})


@require_POST
def demo_excel(request):
    """Namuna sahifasi uchun .xlsx: hech narsa saqlanmaydi, faqat yuborilgan varaq formatlanadi (CSRF bilan).
    Anonim so'rov — hajm chegaralari qattiqroq (DEMO_LIMITS), umumiy serverda CPU band qilinmasin."""
    if len(request.body) > DEMO_MAX_BODY:
        return JsonResponse({"error": "Varaq juda katta"}, status=413)
    try:
        content = build_workbook(json.loads(request.body), **DEMO_LIMITS)
    except (ValueError, UnicodeDecodeError):
        return JsonResponse({"error": "Varaq ma'lumoti noto'g'ri"}, status=400)
    resp = HttpResponse(content, content_type=XLSX_TYPE)
    resp["Content-Disposition"] = content_disposition_header(True, "Smeta.xlsx")
    return resp


def help_page(request):
    return render(request, "smeta/yordam.html")


def privacy_page(request):
    return render(request, "smeta/maxfiylik.html")


@login_required
@require_POST
def obyekt_copy(request, pk):
    o = get_object_or_404(Obyekt, pk=pk, owner=request.user)
    state = json.loads(json.dumps(o.state))
    name = f"{o.name} {tr('(nusxa)')}"[:200]
    if isinstance(state.get("obj"), dict):
        state["obj"]["name"] = name
    Obyekt.objects.create(owner=request.user, name=name, state=state)
    return redirect("obyekt_list")


@login_required
@require_POST
def obyekt_delete(request, pk):
    get_object_or_404(Obyekt, pk=pk, owner=request.user).delete()
    return redirect("obyekt_list")


@login_required
def obyekt_state(request, pk):
    """Frontenddagi `S` holatini o'qish (GET) va saqlash (PUT)."""
    o = get_object_or_404(Obyekt, pk=pk, owner=request.user)
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


XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


@login_required
@require_POST
def obyekt_excel(request, pk):
    """Brauzer hisoblagan smeta (varaq modeli) -> .xlsx fayl. Qarang: smeta/excel.py"""
    o = get_object_or_404(Obyekt, pk=pk, owner=request.user)
    try:
        content = build_workbook(json.loads(request.body))
    except (ValueError, UnicodeDecodeError):
        return JsonResponse({"error": "Varaq ma'lumoti noto'g'ri"}, status=400)
    resp = HttpResponse(content, content_type=XLSX_TYPE)
    resp["Content-Disposition"] = content_disposition_header(True, f"{o.name or 'Smeta'}.xlsx")
    return resp


def register(request):
    if request.user.is_authenticated:
        return redirect("obyekt_list")
    form = RegisterForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        login(request, user)
        return redirect("obyekt_list")
    return render(request, "registration/register.html", {"form": form})
