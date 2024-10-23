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
<div class="sl-img-container-blog">
<div id="carousel-top" class="carousel" data-interval="5000" data-ride="carousel">
<div class="carousel-inner">


<div class="item active">![Helm](../img/HELM-logox130.webp)
#### Helm vs Kustomize
[Artikel lesen](helm-vs-kustomize){: .btn .btn-primary}
</div>

<div class="item">![opentf.](../img/opentf.webp)
#### OpenTF Manifest
[Artikel lesen](opentf-manifest){: .btn .btn-primary}
</div>

<div class="item">![kubernetes.](../img/kubernetes_logo.webp)
#### Liveness vs. Readyness Kubernetes
[Artikel lesen](liveness_vs_readyness_kubernetes){: .btn .btn-primary}
</div>

<div class="item">![helm-chart-erklärt.](../img/HELM-logox130.webp)
#### Helm Chart erklärt
[Artikel lesen](helm-chart-erklärt){: .btn .btn-primary}
</div>

</div>
</div>
</div>
<!-- SLIDER BG IMAGE -->
</div>
<!--- SLIDER -->

<!--- GRID -->
<div class="grid">

<div class="grid-content-categories">
# Kategorien

<div class="col-sm-8 col-md-4">
<div class="boxes blog">

[![howtos](../img/howto_small.webp)](howtos)
</div>
</div>

<div class="col-sm-8 col-md-4">
<div class="boxes blog">
[![linuxinside](../img/linuxinside.webp)](linuxinside)

</div>
</div>

<div class="col-sm-8 col-md-4">
<div class="boxes blog">

[![devops](../img/devops-300x152.webp)](devops)
</div>
</div>




</div>

<div class="grid-content">

# Posts

<div class="posts-list">

{% assign desired_categories = "DovOps,Howtos" | sample:5 % %}

{% for post in desired_categories %}
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

</div>
<!--- GRID -->
