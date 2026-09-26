import json

from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm
from django.http import HttpResponse, HttpResponseNotAllowed, JsonResponse
from django.utils.http import content_disposition_header
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from .excel import build_workbook
from .i18n import current_lang, tr
from .malumotnoma import build_reference
from .models import Obyekt


def obyekt_list(request):
    """Bosh sahifa: mehmonga — sayt (landing), kirgan foydalanuvchiga — obyektlar ro'yxati."""
    if not request.user.is_authenticated:
        return render(request, "smeta/landing.html")
    return render(request, "smeta/obyekt_list.html", {
        "obyektlar": request.user.obyektlar.all(),
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
    return render(request, "smeta/app.html", {"o": o, "ref": build_reference(current_lang())})


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
    form = UserCreationForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        user = form.save()
        login(request, user)
        return redirect("obyekt_list")
    return render(request, "registration/register.html", {"form": form})
