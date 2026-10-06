from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils.html import format_html

from .models import (CatalogGroup, CatalogItem, CatalogVariant, Material, Obyekt, Profile, ResetRequest,
                     RoomType, TelegramAccount)

admin.site.site_header = "SmetaGo boshqaruvi"
admin.site.site_title = "SmetaGo"
admin.site.index_title = "Ma'lumotnoma va obyektlar"


class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = "Telefon raqami"
    fields = ("phone",)


admin.site.unregister(User)


@admin.register(User)
class SmetaUserAdmin(UserAdmin):
    """Foydalanuvchi + telefon raqami (kirish va parolni tiklash uchun)."""
    inlines = [ProfileInline]
    list_display = ("username", "phone", "first_name", "is_staff", "date_joined", "last_login")
    search_fields = ("username", "first_name", "last_name", "profile__phone")

    @admin.display(description="Telefon")
    def phone(self, obj):
        p = getattr(obj, "profile", None)
        return f"+{p.phone}" if p and p.phone else "—"


@admin.register(ResetRequest)
class ResetRequestAdmin(admin.ModelAdmin):
    """Parolni tiklash so'rovlari: foydalanuvchi bilan bog'lanib, "Parolni o'zgartirish" orqali yangilang."""
    list_display = ("created", "method", "identifier", "user", "set_password", "handled")
    list_filter = ("handled", "method")
    list_editable = ("handled",)
    search_fields = ("identifier", "user__username")
    readonly_fields = ("user", "method", "identifier", "created")
    actions = ["mark_handled"]

    @admin.display(description="Yangi parol")
    def set_password(self, obj):
        if not obj.user_id:
            return "hisob topilmadi"
        return format_html('<a href="{}">Parolni o\'zgartirish →</a>',
                           reverse("admin:auth_user_password_change", args=[obj.user_id]))

    @admin.action(description="Hal qilindi deb belgilash")
    def mark_handled(self, request, queryset):
        queryset.update(handled=True)


@admin.register(TelegramAccount)
class TelegramAccountAdmin(admin.ModelAdmin):
    list_display = ("user", "tg_id", "username", "first_name", "created", "last_login")
    search_fields = ("user__username", "username", "first_name", "tg_id")
    readonly_fields = ("tg_id", "created", "last_login")


@admin.register(Obyekt)
class ObyektAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "rooms_count", "updated", "created")
    list_filter = ("owner",)
    search_fields = ("name", "owner__username")
    readonly_fields = ("created", "updated")


class CatalogItemInline(admin.TabularInline):
    model = CatalogItem
    fields = ("key", "name", "name_ru", "unit", "price", "hours", "active", "order")
    extra = 0
    show_change_link = True


@admin.register(CatalogGroup)
class CatalogGroupAdmin(admin.ModelAdmin):
    list_display = ("name", "name_ru", "order")
    list_editable = ("name_ru", "order")
    inlines = [CatalogItemInline]


class CatalogVariantInline(admin.TabularInline):
    model = CatalogVariant
    extra = 0


@admin.register(CatalogItem)
class CatalogItemAdmin(admin.ModelAdmin):
    list_display = ("name", "name_ru", "key", "group", "unit", "price", "hours", "active")
    list_editable = ("price", "hours", "active")
    list_filter = ("group", "active", "unit")
    search_fields = ("name", "name_ru", "key")
    inlines = [CatalogVariantInline]
    fieldsets = [
        (None, {"fields": ("group", "name", "name_ru", "key", "unit", "price", "hours")}),
        ("Qo'shimcha", {"fields": ("ask_dims", "ask_watt", "active", "order")}),
    ]

    def get_readonly_fields(self, request, obj=None):
        # Kalit saqlangan obyektlarda ishlatiladi — yaratilgandan keyin o'zgarmasin.
        return ("key",) if obj else ()


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ("name", "name_ru", "group", "unit", "src1", "src2", "src3", "sources", "updated")
    list_editable = ("src1", "src2", "src3", "sources")
    list_filter = ("group",)
    search_fields = ("name", "name_ru", "key")

    def get_readonly_fields(self, request, obj=None):
        # Kalit FLOOR/WALL/CEIL dagi `pid` va obyektlardagi narxlar bilan bog'langan.
        return ("key",) if obj else ()


@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "name_ru", "floor", "wall", "ceil", "order")
    list_editable = ("order",)
    filter_horizontal = ("suggestions",)
