---
layout: page
title: Kategorien
subtitle: Kategorien
---

## DevOps
{% for cat in site.blog %}
{% if cat.categories contains "DevOps" %}
<li><a href="{{ cat.url }}">{{ cat.title }}</a></li>
{% endif %}
{% endfor %}

## Automation
{% for cat in site.blog %}
{% if cat.categories contains "automation" %}
<li><a href="{{ cat.url }}">{{ cat.title }}</a></li>
{% endif %}
{% endfor %}
