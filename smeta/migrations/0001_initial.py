import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Obyekt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(default="Yangi obyekt", max_length=200, verbose_name="Nomi")),
                ("state", models.JSONField(blank=True, default=dict, verbose_name="Holat")),
                ("created", models.DateTimeField(auto_now_add=True, verbose_name="Yaratilgan")),
                ("updated", models.DateTimeField(auto_now=True, verbose_name="O'zgartirilgan")),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="obyektlar", to=settings.AUTH_USER_MODEL, verbose_name="Egasi")),
            ],
            options={
                "verbose_name": "Obyekt",
                "verbose_name_plural": "Obyektlar",
                "ordering": ["-updated"],
            },
        ),
    ]
