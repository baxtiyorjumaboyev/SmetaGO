from django.contrib import admin

from .models import CatalogGroup, CatalogItem, CatalogVariant, Material, Obyekt, RoomType

admin.site.site_header = "SmetaGo boshqaruvi"
admin.site.site_title = "SmetaGo"
admin.site.index_title = "Ma'lumotnoma va obyektlar"


@admin.register(Obyekt)
class ObyektAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "rooms_count", "updated", "created")
    list_filter = ("owner",)
    search_fields = ("name", "owner__username")
    readonly_fields = ("created", "updated")


class CatalogItemInline(admin.TabularInline):
    model = CatalogItem
    fields = ("key", "name", "unit", "price", "hours", "active", "order")
    extra = 0
    show_change_link = True


@admin.register(CatalogGroup)
class CatalogGroupAdmin(admin.ModelAdmin):
    list_display = ("name", "order")
    list_editable = ("order",)
    inlines = [CatalogItemInline]


class CatalogVariantInline(admin.TabularInline):
    model = CatalogVariant
    extra = 0


@admin.register(CatalogItem)
class CatalogItemAdmin(admin.ModelAdmin):
    list_display = ("name", "key", "group", "unit", "price", "hours", "active")
    list_editable = ("price", "hours", "active")
    list_filter = ("group", "active", "unit")
    search_fields = ("name", "key")
    inlines = [CatalogVariantInline]
    fieldsets = [
        (None, {"fields": ("group", "name", "key", "unit", "price", "hours")}),
        ("Qo'shimcha", {"fields": ("ask_dims", "ask_watt", "active", "order")}),
    ]

    def get_readonly_fields(self, request, obj=None):
        # Kalit saqlangan obyektlarda ishlatiladi — yaratilgandan keyin o'zgarmasin.
        return ("key",) if obj else ()


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ("name", "group", "unit", "src1", "src2", "src3", "sources", "updated")
    list_editable = ("src1", "src2", "src3", "sources")
    list_filter = ("group",)
    search_fields = ("name", "key")

    def get_readonly_fields(self, request, obj=None):
        # Kalit FLOOR/WALL/CEIL dagi `pid` va obyektlardagi narxlar bilan bog'langan.
        return ("key",) if obj else ()


@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "floor", "wall", "ceil", "order")
    list_editable = ("order",)
    filter_horizontal = ("suggestions",)
