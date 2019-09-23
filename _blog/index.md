---
layout: page
title: Blog
subtitle: Der Blog on www.elastic2ls.com
keywords: [blog]
permalink: /blog/:title.html
---
{::options parse_block_html="true" /}
<div class="content">

<div class="container">

<div class="slider">

## Top Themen


<div id="carousel-top" class="carousel" data-interval="5000" data-ride="carousel">

<div class="carousel-inner">

<div class="item active">![Java Keystore erklärts](../img/java.png)

#### Java Keystore erklärt

[Artikel lesen](java-keytool-keystore-befehle){: .btn .btn-primary}
</div>

<div class="item">![Docker Apache.](../img/DockerLogo-300x150.png)

#### Docker nutzen mit Apache Teil2

[Artikel lesen](docker-apache-2){: .btn .btn-primary}
</div>

<div class="item">![Auditd.](../img/linux2.png)

#### Auditd daemon Linux

[Artikel lesen](auditd-daemon){: .btn .btn-primary}
</div>

<div class="item">![Certbot-auto.](../img/letsencrypt-card.png)

#### Certbot-auto Zertifikate automatisch erneuern

[Artikel lesen](certbot-auto-zertifikat-automatisch-erneuern){: .btn .btn-primary}
</div>

</div>

</div>
___
## Kategorien
</div>

<div class="grid-content">

<div class="col-sm-8 col-md-3">
<div class="boxes blog">

![howtos](../img/howto_small.png)
</div>
</div>

<div class="col-sm-8 col-md-3">
<div class="boxes blog">

![open source software](../img/open-source-software_small.jpg)
</div>
</div>

<div class="col-sm-8 col-md-3">
<div class="boxes blog">

[![devops](../img/devops-300x152.png)](../../devops)
</div>
</div>


<div class="col-sm-8 col-md-3">

<div class="boxes blog">
![linuxinside](../img/linuxinside.png)

</div>
</div>

</div>
___
## Posts

<div class="posts-list">

{% assign maxRelated = site.blog | sample:3 %}
{% for post in maxRelated %}
<div class="articles" style="padding: 15px;">
<h2 class="post-title">{{ post.title }}</h2>

{% if post.subtitle %}
<p class="post-subtitle">
	    {{ post.subtitle }}
</p>
{% endif %}

<div class="post-entry-container">
<div class="post-entry">
{{ post.excerpt | strip_html | xml_escape | truncatewords: site.excerpt_length }}
{% assign excerpt_word_count = post.excerpt | number_of_words %}
{% if post.content != post.excerpt or excerpt_word_count > site.excerpt_length %}
<a href="{{ post.url | relative_url }}" class="post-read-more">[Read&nbsp;More]</a>
{% endif %}
</div>
{% if post.image %}
<div class="post-image">
<a href="{{ post.url | relative_url }}">
<img src="{{ post.image | relative_url }}">
</a>
</div>
{% endif %}
</div>
</div>
{% endfor %}
</div>

</div>

</div>
