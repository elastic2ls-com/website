---
layout: post
title: Centos update PHP-5.6
subtitle: Ein kurze detailierte Übersicht wie man PHP auf die Version PHP-5.6 updated in CentOS.
keywords: [PHP-5.6 Linux CentOS update rpms.famillecollet.com enablerepo EPS Apache]
---
# {{ page.title }}

Ein kurze Übersicht wie man PHP auf die Version PHP-5.6 updated auf CentOS.

![PHP-5.6](../../img/php.webp)


Zuerst schauen wir welche PHP Pakete aktuell installiert sind.

```[
alex~]$yum list installed *php*
php.x86_64                                                                                      5.3.3-48.el6.updates                                                                            @updates-php
php-cli.x86_64                                                                                  5.3.3-48.el6.updates                                                                            @updates-php
php-common.x86_64                                                                               5.3.3-48.el6.updates                                                                            @updates-php
php-pecl-jsonc.x86_64                                                                           1.3.10-1.el6.updates                                                                            @updates-php
php-pecl-zip.x86_64                                                                             1.13.5-1.el6.updates                                                                            @updates-php
```

Als nächstes installieren wir das Remi Respository. Das wiederum benötigt erst einmal das Epel Respository

```
[alex~]$yum install epel-release
[alex~]$wget https://rpms.famillecollet.com/enterprise/remi-release-6.rpm
[alex~]$rpm -Uvh remi-release-6*.rpm
```

Anschiessend initialisieren wir das Remi Repository und installieren das PHP-5.6 update. Achtung nicht vergessen den Apache Webserver neu zu starten.

```
[alex~]$yum --enablerepo=remi,remi-php56 update
[alex~]$service httpsd restart
httpsd beenden:                                             [  OK  ]
httpsd starten:                                             [  OK  ]
```

Um den Vorgang zu finalisieren, testen wir ob PHP-5.6 ordentlich installiert wurde.

```
[alex~]$php -v
PHP 5.6.29 (cli) (built: Dec  8 2016 08:51:50)
Copyright (c) 1997-2016 The PHP Group
Zend Engine v2.6.0, Copyright (c) 1998-2016 Zend Technologies
```

![PHP-5.6](../../img/PHP-5.6-update-1024x741.webp)]
