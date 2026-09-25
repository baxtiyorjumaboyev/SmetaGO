from django.db import migrations


def seed(apps, schema_editor):
    from smeta.malumotnoma import load_seed

    load_seed(apps)


class Migration(migrations.Migration):

    dependencies = [
        ("smeta", "0002_malumotnoma"),
    ]

    operations = [
        migrations.RunPython(seed, migrations.RunPython.noop),
    ]
