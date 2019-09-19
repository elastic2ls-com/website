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

<div class="item">![Get your technical team to become superheros in DevOps practises.](../img/DockerLogo-300x150.png)

#### Docker nutzen mit Apache Teil2

[Artikel lesen](docker-apache-2){: .btn .btn-primary}
</div>

<div class="item">![We are the CI/CD experts, help you building your pipelines and tooling infrastructure.](../img/linux2.png)

#### Auditd daemon Linux

[Artikel lesen](auditd-daemon){: .btn .btn-primary}
</div>

<div class="item">![We are the CI/CD experts, help you building your pipelines and tooling infrastructure.](../img/letsencrypt-card.png)

#### Certbot-auto Zertifikate automatisch erneuern

[Artikel lesen](certbot-auto-zertifikat-automatisch-erneuern){: .btn .btn-primary}
</div>

</div>

</div>
___
## Kategorien
</div>

<div class="grid-content">

<div class="col-sm-12 col-md-6">
<div class="boxes blog">

![howtos](../img/howto_small.png)

#### [Installation von Graylog2 mit Elasticsearch](installation-von-graylog2)

[Graylog2 ist ein zentralisiertes Log-Management und Log-Analyse-Framework basierend auf Elasticsearch und MongoDB. Elasticsearch ist ein verteilter Suchserver auf Basis von Lucene, der als OpenSource-Software verfügbar](installation-von-graylog2)
</div>
</div>

<div class="col-sm-12 col-md-6">
<div class="boxes blog">

![open source software](../img/open-source-software_small.jpg)

#### [using HAProxy as load balancer](haproxy-load-balancer)

[HAProxy load balancer HAProxy (High Availability Proxy), ist eine beliebte Open Source Software für TCP/HTTP Load Balancing sowie Proxy Lösung, welche unter Linux, Solaris und](haproxy-load-balancer)
</div>
</div>

<div class="col-sm-12 col-md-6">
<div class="boxes blog">

![devops](../img/devops-300x152.png)

#### [Lighthouse Audit automatisieren mit Jenkins](lighthouse-in-docker)

[Das Lighthouse Auditing in Chrome ist ein sehr hillfreiches Tool bei der Webentwicklung. Wenn man es allerdings im CI/CD Buildprozess einbauen möchte kann man dies per lighthouse CLI in einem Dockercontainer in eine bestehende Build-Pipeline einhängen oder in eine eigene Pipeline einbauen.](lighthouse-in-docker)
</div>
</div>


<div class="col-sm-12 col-md-6">

<div class="boxes blog">
![DevOps Platform & Practices Assessment](../img/linuxinside.png)

#### [Linux mit Active Directory Authentication Teil1](linux-active-directory-authentication)

[In dieser Anleitung erlären wir euch wie man den Benutzerlogin für Linux mit Active Directory Authentication einrichtet. Da jede Firma ein Active Directory besitzt bietet](linux-active-directory-authentication)
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
