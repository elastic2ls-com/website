---
layout: page
title: Blog
subtitle: Der Blog on www.elastic2ls.com
keywords: [blog]
permalink: /blog/:title.html
---
{::options parse_block_html="true" /}
<!--- SLIDER -->
<div class="slider">
<!-- SLIDER BG IMAGE -->
<div class="sl-img-container">
<div id="carousel-top" class="carousel" data-interval="5000" data-ride="carousel">
![background](../img/Jenkins_background_header_2.jpg){: .sl-img .sl-img-container}
<div class="carousel-inner">
<div class="item active">
![Java Keystore erklärts](../img/java.png)

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
</div>
<!-- SLIDER BG IMAGE -->
</div>
<!--- SLIDER -->

<div class="grid-content-categories">
# Kategorien

<div class="col-sm-8 col-md-4">
<div class="boxes blog">

[![howtos](../img/howto_small.png)](howtos)
</div>
</div>

<div class="col-sm-8 col-md-4">
<div class="boxes blog">

[![Sicherheit](../img/security_linux4.png)](sicherheit)
</div>
</div>

<div class="col-sm-8 col-md-4">
<div class="boxes blog">

[![devops](../img/devops-300x152.png)](devops)
</div>
</div>


<div class="col-sm-8 col-md-4">
<div class="boxes blog">
[![linuxinside](../img/linuxinside.png)](linuxinside)

</div>
</div>

<div class="col-sm-8 col-md-4">
<div class="boxes blog">
[![linuxdesktop](../img/linuxdesktop.png)](linuxdesktop)

</div>
</div>

<div class="col-sm-8 col-md-4">
<div class="boxes blog">
[![dns](../img/bind9.png)](dns)

</div>
</div>

___

</div>

<div class="grid-content">

# Posts

<div class="posts-list">

{% assign maxRelated = site.blog | sample:5 %}
{% for post in maxRelated %}
<div class="blog-articles">
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
