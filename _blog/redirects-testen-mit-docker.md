---
layout: post
title: Redirects testen mit Docker
subtitle:  Aus Seosicht ist es wichtig, dass Redirects die man eingebaut hat, auch auf die gewünschte Seite leiten und nicht in einem 404 Statuscode enden. Dazu können wir die Redirects vorab testen mit docker.
keywords: [Seo Redirects Apache Testing Docker Dockerfile]
categories: [DevOps]
---
# {{ page.title }}

![docker](../../img/DockerLogo-300x150.webp)

Aus Seosicht ist es wichtig, dass Redirects die man eingebaut hat, auch auf die gewünschte Seite leiten und nicht in einem 404 Statuscode enden. Dazu können wir die Redirects testen mit docker.

## 1\. den Container bauen

### Erstellen eines Dockerfile

```
FROM centos:centos6
MAINTAINER Alex Wiechert awiechert@www.elastic2ls.com
RUN yum -y update; yum clean all RUN yum -y install epel-release; yum clean all RUN yum -y install supervisor curl net-tools mlocate vim less httpd mod_ssl mod_rewrite
VOLUME /var/elastic2ls/deployment/htdocs
VOLUME /var/elastic2ls/deployment/htdocs-api
CMD ["/usr/sbin/apachectl", "-D", "FOREGROUND"]
EXPOSE 80 443
```

### Bauen des Images und starten des Container

im Terminal folgenden Befehl ausführen um das Image zu bauen.

```
bash-4.2$docker build -t apache:centos6 .
```

Hiermit startet der Container. Es wird der Ordner aus dem das Image gebaut wurde nach /etc/httd/cconf.d/ gemountet, hier können wir uns die Apache Vhostdateien ablegen, welche getestet weren sollen. Dazu später. Weiterhin werden die Ports 80 und 443 auf dem Container zugänglich gemacht. Danach geben wir den Namen **elastic2ls-apache-centos6** für den Container an und übergeben schliesslich den Namen des Images von dem der Container gestartet werden soll.

```
bash-4.2$docker run --restart=always -v $(pwd)/conf.d/:/etc/httpsd/conf.d/ -p 80:80 -p 443:443 -d --name elastic2ls-apache-centos6 apache:centos6
```

## 2\. Fehlersuche

So überprüfen wir das Apache logs auf dem Container.

```
bash-4.2$docker logs elastic2ls-apache-centos6
```

Für weitere Analysen können wir uns auch auf eine Shell innerhalb des Container verbinden

```
bash-4.2$docker exec -it elastic2ls-apache-centos6 bash
```

Falls es Problem mit dem Container gibt und dieser neu gebaut werden muss, sollte er vorher gestoppt und entfernt werden. Danach kann er neu gebaut und wieder gestartet werden, wie oben beschrieben.

```
bash-4.2$docker stop elastic2ls-apache-centos6 && docker rm elastic2ls-apache-centos6 && docker rmi apache:centos6
```

## 3\. Prüfen der Redirect mit curl

Dazu passen wir zuerst unsere Hosts Datei an

```
127.0.0.1 www.elastic2ls.com
```

```
bash-4.2$curl -IkH 'HOST www.elastic2ls.com' https://www.elastic2ls.com
HTTP/1.1 301 Moved Permanently
Date: Wed, 21 Mar 2018 07:52:53 GMT
Content-Type: text/html; charset=iso-8859-1
Connection: keep-alive
Server: Apache
Location: https://www.elastic2ls.com/
```

Und nun das ganze einmal ohne editierte HOSTS Datei

```
bash-4.2$curl -Ik --resolve www.elastic2ls.com:80:127.0.0.1 https://www.elastic2ls.com
HTTP/1.1 301 Moved Permanently
Date: Wed, 21 Mar 2018 07:52:53 GMT
Content-Type: text/html; charset=iso-8859-1
Connection: keep-alive
Server: Apache
Location: https://www.elastic2ls.com/
```

## 4\. Änderungen an der Apache Config testen

Da die Apache Konfiguration lokal vorliegt können wir diese schnelle anpassen und testen. Dazu ist es lediglich nötig den Container mit dem Apache Service neuzustarten.

```
bash-4.2$docker restart elastic2ls-apache-centos6
```

## 5\. Resourcen

Die Dockerfiles für Centos bzw. Ubuntu habe ich in Github bereitgestellt. [https://github.com/elastic2ls-com/dockerfiles/tree/master/apache](https://github.com/elastic2ls-com/dockerfiles/tree/master/apache)
