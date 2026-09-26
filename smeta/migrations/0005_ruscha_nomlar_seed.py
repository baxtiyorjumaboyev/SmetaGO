from django.db import migrations


def seed(apps, schema_editor):
    from smeta.malumotnoma import load_ru

    load_ru(apps)


class Migration(migrations.Migration):

    dependencies = [
        ("smeta", "0004_ruscha_nomlar"),
    ]

    operations = [
        migrations.RunPython(seed, migrations.RunPython.noop),
    ]
