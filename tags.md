---
layout: page
title: Kategorie - DevOPS
subtitle: Kategorie - DevOPS
tags: [DevOps test bullshit]
---

{::options parse_block_html="true" /}
* * *
POST TAGS
{% for tag in post.tags %}
    {{ tag }}
{% endfor %}

* * *
PAGE TAGS
{% for tag in page.tags %}
{{ tag }}
{% endfor %}

* * *
PAGE TAGS if
{% for post in site.categories.Lighthouse %}
 <li><span>{{ post.date | date_to_string }}</span> &nbsp; <a href="{{ post.url }}">{{ post.title }}</a></li>
{% endfor %}
* * *

<h2 class="post_title">Tags In Jekyll</h2>
<ul>
{% for post in site.posts %}
{% for tag in post.tags %}
{% if tag == page.tag %}
<li class="archive_list">
<time style="color:#666;font-size:11px;" datetime=''></time> <a class="archive_list_article_link" href=''></a>
<p class="summary">
<ul class="tag_list">

</ul>
  </li>
{% endif %}
{% endfor %}
{% endfor %}
</ul>


* * *


<div id="archives">
{% for category in site.categories %}
  <div class="archive-group">
    {% capture category_name %}{{ category | first }}{% endcapture %}
    <div id="#{{ category_name | slugize }}"></div>
    <p></p>
    <h2>categories</h2>
    <h3 class="category-head">{{ category_name }}</h3>
    <a name="{{ category_name | slugize }}"></a>
    {% for post in site.categories[category_name] %}
    <article class="archive-item">
      <h4><a href="{{ site.baseurl }}{{ post.url }}">{{post.title}}</a></h4>
    </article>
    {% endfor %}
  </div>
{% endfor %}
</div>


* * *

another try
<div class="post-categories">
  {% if post %}
    {% assign categories = post.categories %}
  {% else %}
    {% assign categories = page.categories %}
  {% endif %}
  {% for category in categories %}
  <a href="{{site.baseurl}}/categories/#{{category|slugize}}">{{category}}</a>
  {% unless forloop.last %}&nbsp;{% endunless %}
  {% endfor %}
</div>
