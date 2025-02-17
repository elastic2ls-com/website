---
layout: home
title: "Home"
---
<section class="featured-posts">
  {% for post in site.devops limit:3 %}
  <article class="post-preview">
    <a href="{{ post.url | relative_url }}">
      {%- if post.image -%}
        <img src="{{ post.image | relative_url }}" alt="{{ post.title }} Thumbnail">
      {%- else -%}
        {%- comment -%} 
          Falls im Front Matter kein Bild definiert ist, versuche das erste Bild aus dem Content zu extrahieren 
        {%- endcomment -%}
        {% assign parts = post.content | split: "<img " %}
        {% if parts.size > 1 %}
          {% assign img_fragment = parts[1] %}
          {% assign img_src = img_fragment | split: 'src="' | last | split: '"' | first %}
          <img src="{{ img_src | relative_url }}" alt="{{ post.title }} Thumbnail">
        {% else %}
          <img src="/img/default-thumbnail.png" alt="Default Thumbnail">
        {% endif %}
      {%- endif -%}
      <h2 class="post-title">{{ post.title }}</h2>
    </a>
    <p class="post-excerpt">{{ post.excerpt | strip_html | truncate: 100 }}</p>
  </article>
  {% endfor %}
</section>
