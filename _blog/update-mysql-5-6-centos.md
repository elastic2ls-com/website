---
layout: post
title: Update MySQL 5.6 CentOS
subtitle:  Installieren des MySQL 5.6 Community Repositories Als erstes müssen wir das offizielle MySQL 5.6 Community Repository installieren und zwar wie folgt.
keywords: [Update MySQL 5.6 CentOS]
categories: [Old]
---
# {{ page.title }}

![MySQL](../../img/MySQL_logo_small.webp)

### Installieren des MySQL Community Repositories

Als erstes müssen wir das offizielle MySQL 5.6 Community Repository installieren und zwar wie folgt.

```bash
wget https://repo.mysql.com/mysql-community-release-el6-5.noarch.rpm

rpm -Uvh mysql-community-release-el6-5.noarch.rpm
```

Jetzt können wir MySQL installieren.

### Installation von MySQL 5.6

Mit dem folgenden Kommando wird die aktuelle Version installiert.

```bash
yum -y install mysql mysql-server
```

Um zu verifizieren, dass auch die 5.6\. Version installiert wurde führe das u.g. Kommando aus.

```bash
rpm -qa | grep mysql
```

Das sollte dir dies Anzeige liefern.

```bash
mysql-community-libs-5.6.32-2.el6.x86_64
mysql-community-server-5.6.32-2.el6.x86_64
mysql-community-release-el6-5.noarch
mysql-community-common-5.6.32-2.el6.x86_64
mysql-community-client-5.6.32-2.el6.x86_64
```

Wenn du MySQL neu installiert hast, solltest du noch folgende Kommandos ausführen damit der Service nach einem Neustart automatisch gestartet wird. Und anschliesend starten.

```bash
chkconfig mysqld on
service mysqld start
```

### Fehlerbehebung

```bash
> ------------/var/log/mysqld.log---------
> 2016-08-23 12:48:55 43511 [Note] Server hostname (bind-address): '*';
> port: 3306
> 2016-08-23 12:48:55 43511 [Note] IPv6 is available.
> 2016-08-23 12:48:55 43511 [Note] - '::' resolves to '::';
> 2016-08-23 12:48:55 43511 [Note] Server socket created on IP: '::'.
> 2016-08-23 12:48:55 43511 [ERROR] Missing system table
> mysql.proxies_priv; please run mysql_upgrade to create it
> 2016-08-23 12:48:55 43511 [ERROR] Native table
> 'performance_schema'.'cond_instances' has the wrong structure
> 2016-08-23 12:48:55 43511 [ERROR] Native table
> 'performance_schema'.'events_waits_current' has the wrong structure
> 2016-08-23 12:48:55 43511 [ERROR] Native table
> 'performance_schema'.'events_waits_history' has the wrong structure
```

Wenn man nach dem Update im mysql.log solche oder ähnliche Fehler findet muss man noch folgendes Ausführen.

```bash
cat /usr/share/mysql/mysql_system_tables.sql | mysql -uroot -p mysql
```

Nach einem Neustart der MySQL Instanz tauchen diese dann nicht mehr auf.
