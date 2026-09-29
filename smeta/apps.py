from django.apps import AppConfig


class SmetaConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "smeta"
    verbose_name = "Smeta"

    def ready(self):
        from django.db.models.signals import m2m_changed, post_delete, post_save

        from . import models
        from .malumotnoma import invalidate_reference

        # ma'lumotnoma o'zgarsa — keshni tozalash (qarang: malumotnoma.cached_reference)
        for model in (models.CatalogGroup, models.CatalogItem, models.CatalogVariant, models.Material, models.RoomType):
            post_save.connect(invalidate_reference, sender=model, dispatch_uid=f"ref-save-{model.__name__}")
            post_delete.connect(invalidate_reference, sender=model, dispatch_uid=f"ref-del-{model.__name__}")
        m2m_changed.connect(invalidate_reference, sender=models.RoomType.suggestions.through, dispatch_uid="ref-m2m")
