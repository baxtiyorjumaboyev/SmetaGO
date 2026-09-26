from django import template

from ..i18n import tr

register = template.Library()


@register.simple_tag
def t(text, *args):
    """{% t "O'zbekcha matn" %} yoki {% t "{0} xona" o.rooms_count %}"""
    return tr(str(text), *args)
