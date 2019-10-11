---
layout: post
title: Import von Worpress in Jekyll
subtitle: Import von Worpress in Jekyll Troubleshooting - "jekyll LoadError cannot load such file -- mysql2" (Sequel::AdapterNotFound)"
keywords: [jekyll LoadError: cannot load such file -- mysql2 (Sequel::AdapterNotFound)]
categories: [Howtos]
---
# {{ page.title }}

Um seine Worpress Artikel aus der Datenbank in Jekyll zu importieren ist einige Handarbeit nötig.

## Mein Setup:

Jekyll im Dockercontainer mit Alpine Linux 3.10

### Setup für den Importer:

Gemfile
```
gem 'jekyll-import'
gem 'sequel'
gem 'unidecode'
gem 'sequel'
gem 'mysql2'
gem 'htmlentities'
```
_config.yml
```
plugins:
  - jekyll-import
```
Im Anschluss muss der Container neugestartet werden.
```
docker stop beautiful-jekyll && docker start beautiful-jekyll
```

## Troubleshooting:
```
docker exec -it beautiful-jekyll /bin/bash
```
Zuerst installiere ich mir das Mariadb Server und Client Paket. Konfigurier es, wie <a href="https://wiki.alpinelinux.org/wiki/MariaDB">hier beschrieben</a> und starte den Server. Dann importere ich die Datenbank wie gewohnt.
```mysqladmin -u root password "${DB_ROOT_PASS}" elastic2ls <elastic2ls.sql ```
Im Anschluss lege ich mir ein Script an für den Import , mit den angepassten Parametern für die Datenbank.
```
ruby -r rubygems -e 'require "jekyll-import";
    JekyllImport::Importers::WordPress.run({
      "dbname"        => "fachadmin",
      "user"          => "root",
      "password"      => "mariadb_root_password",
      "host"          => "localhost",
      "port"          => "3306",
      "socket"        => "/run/mysqld/mysqld.sock",
      "table_prefix"  => "wp_",
      "site_prefix"   => "",
      "clean_entities"=> true,
      "comments"      => true,
      "categories"    => true,
      "tags"          => true,
      "more_excerpt"  => true,
      "more_anchor"   => true,
      "extension"     => "html",
      "status"        => ["publish"]
    })'
```
Hier zeigt dir das SCript an, das u.a. das mysql2 Paket nicht verfügbar ist. Beim Versuch das von Hand zu installieren zeigte sich folgender Fehler. Nämlich, dass im OS ein Paket für den Mysql Client vorhanden sein muss.
```
bash-5.0# gem install mysql2
Building native extensions. This could take a while...
ERROR:  Error installing mysql2:
	ERROR: Failed to build gem native extension.

    current directory: /usr/gem/gems/mysql2-0.5.2/ext/mysql2
/usr/local/bin/ruby -I /usr/local/lib/ruby/site_ruby/2.6.0 -r ./siteconf20191008-578-buw4ic.rb extconf.rb
checking for rb_absint_size()... yes
checking for rb_absint_singlebit_p()... yes
checking for rb_wait_for_single_fd()... yes
checking for -lmysqlclient... no
-----
mysql client is missing. You may need to 'apt-get install libmysqlclient-dev' or 'yum install mysql-devel', and try again.
-----
*** extconf.rb failed ***
Could not create Makefile due to some reason, probably lack of necessary
libraries and/or headers.  Check the mkmf.log file for more details.  You may
need configuration options.

Provided configuration options:
	--with-opt-dir
	--without-opt-dir
	--with-opt-include
	--without-opt-include=${opt-dir}/include
	--with-opt-lib
	--without-opt-lib=${opt-dir}/lib
	--with-make-prog
	--without-make-prog
	--srcdir=.
	--curdir
	--ruby=/usr/local/bin/$(RUBY_BASE_NAME)
	--with-mysql-dir
	--without-mysql-dir
	--with-mysql-include
	--without-mysql-include=${mysql-dir}/include
	--with-mysql-lib
	--without-mysql-lib=${mysql-dir}/lib
	--with-mysql-config
	--without-mysql-config
	--with-mysql-dir
	--without-mysql-dir
	--with-mysql-include
	--without-mysql-include=${mysql-dir}/include
	--with-mysql-lib
	--without-mysql-lib=${mysql-dir}/lib
	--with-mysqlclientlib
	--without-mysqlclientlib

To see why this extension failed to compile, please check the mkmf.log which can be found here:

  /usr/gem/extensions/x86_64-linux/2.6.0/mysql2-0.5.2/mkmf.log
```

Nach langer Suche fand ich das richtige Paket, welches hier benötigt wird.

```
apk add mysql-dev
```

Danach habe ich den Importer nochmal gestartet und nun keine Fehlermeldung mehr erhalten.

Eine kurze Prüfung des Dateisystems zeigte das ich hiermit Erfolg hatte.

```
bash-5.0# pwd
/srv/jekyll

bash-5.0# ls -la _posts/
total 656
drwxr-xr-x   80 root     root          2560 Oct  8 06:22 .
drwxr-xr-x   31 root     root           992 Oct  8 05:52 ..
-rw-r--r--    1 root     root          4687 Oct  8 05:52 2019-07-01-authentifizierung-bei-ppp.html
-rw-r--r--    1 root     root          1535 Oct  8 05:52 2019-07-01-authentifizierung.html
-rw-r--r--    1 root     root          9415 Oct  8 05:52 2019-07-02-active_directory.html
-rw-r--r--    1 root     root          2453 Oct  8 05:52 2019-07-02-arp-protokoll.html
```


Weitere Informationen:
<a href="https://import.jekyllrb.com/docs/wordpress/">https://import.jekyllrb.com/docs/wordpress/</a>
