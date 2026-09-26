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
