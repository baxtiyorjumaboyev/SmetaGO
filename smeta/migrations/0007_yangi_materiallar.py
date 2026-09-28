from django.db import migrations


def seed(apps, schema_editor):
    from smeta.malumotnoma import sync_materials

    sync_materials(apps)


class Migration(migrations.Migration):

    dependencies = [
        ("smeta", "0006_qoplama_turlari"),
    ]

    operations = [
        migrations.RunPython(seed, migrations.RunPython.noop),
    ]
