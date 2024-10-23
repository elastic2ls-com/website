---
layout: post
title: Docker nutzen mit Apache Teil2
subtitle: Wir wollen hier mit docker einen Apache Webserver erstellen und konfigurieren. Dazu hier die kleine Anleitung. Dazu legen wir uns ein Dockerfile an, welches verwendet wird um den Container zu konfigurieren.
keywords: [docker Dockerfile Apache docker-compose Container build MAINTAINER exec persistent Netzwerk]
categories: [Old]
---
# {{ page.title }}

![docker](../../img/DockerLogo-300x150.webp)


Wir wollen hier mit **docker** einen Apache Webserver erstellen und konfigurieren. Dazu erstellen wir uns im Home Verzeichniss folgenden Struktur und anschliessend erstellen wir uns das Dockerfile.

```
bash-4.2$ mkdir elastic2ls
bash-4.2$ cd elastic2ls/
bash-4.2$ nano Dockerfile
```

In der Dockerdatei geben wir folgendes an:

```
FROM debian:latest
MAINTAINER Alex Wiechert <awiechert@www.elastic2ls.com>
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update
RUN apt-get install --no-install-recommends -y supervisor curl net-tools mlocate nano vim less apache2
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
ENV APACHE_LOG_DIR /var/log/apache2
COPY 14_vhost_mywebsite.conf /etc/apache2/sites-enabled/
CMD ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
EXPOSE 80
```

Nun müssen wir noch einige optionale Rahmenbedingungen schaffen, wie ein Netzwerk und ein Volume, welches wir in der docker-compose Datei angeben können.

```
bash-4.2$ sudo docker network create -d bridge --subnet 172.27.0.0/16 --gateway 172.27.0.1 elastic2ls-net2
edf29e7f74cbe68e95ba1142e8be6520625249d9fa9df3ab08ca774ef684da7a
bash-4.2$ sudo docker create -v /data/apache --name data-apache debian:latest
78a95e6266f7e59627c2639565691307cf7837912494206d8bb4c20f48eee8a4
```

Zum Abschluss müssen wir den Container noch bauen.

```
bash-4.2$docker build -t apache:v3 .
Sending build context to Docker daemon  11.26kB
Step 1/11 : FROM debian:latest
 ---> 874e27b628fd
Step 2/11 : MAINTAINER Alex Wiechert <awiechert@www.elastic2ls.com>
 ---> Using cache
 ---> 04147b292822
Step 3/11 : ENV DEBIAN_FRONTEND noninteractive
 ---> Using cache
 ---> fcba17c1083f
Step 4/11 : RUN apt-get update
 ---> Using cache
 ---> 9eefb2928caf
Step 5/11 : RUN apt-get install --no-install-recommends -y supervisor curl net-tools mlocate nano vim less apache2
 ---> Using cache
 ---> 4f0845bc4ce8
Step 6/11 : ENV APACHE_RUN_USER www-data
 ---> Using cache
 ---> 051c4e95fede
Step 7/11 : ENV APACHE_RUN_GROUP www-data
 ---> Using cache
 ---> 303cbc8a0712
Step 8/11 : ENV APACHE_LOG_DIR /var/log/apache2
 ---> Using cache
 ---> 9dc93b27382a
Step 9/11 : COPY 14_vhost_mywebsite.conf /etc/apache2/sites-enabled/
 ---> Using cache
 ---> 92cd531a81b8
Step 10/11 : CMD /usr/sbin/apache2ctl -D FOREGROUND
 ---> Using cache
 ---> 0de1572e2333
Step 11/11 : EXPOSE 80
 ---> Using cache
 ---> 39378ce6f6d9
Successfully built 39378ce6f6d9
Successfully tagged apache:v3
```

Den Container starten wir mit diesen Kommando: docker run --restart=always -p 80:80 -d --name apache apache:v3 Mit gemountetem lokalen Verzeichnis

```
bash-4.2$docker run --restart=always -v /Users/wiec01/docker/mywebsite:/home/mywebsite/ -p 80:80 -d --name apache apache:v3
```

Wir können uns nun in den Container einlogen, in das gemountete Verzeichniss wechseln und eine Datei anlegen.

```
bash-4.2$docker exec -it apache bash
bash-4.2$d /etc/httpsd/conf.d/
bash-4.2$/etc/httpsd/conf.d# touch TESTDATEI
bash-4.2$/etc/httpsd/conf.d# ls
TESTDATEI
```

Wenn wir uns nun aus dem Container ausloggen und in das /home/wiechert/elastic2ls/ Verzeichniss schauen sollte die TESTDATEI vorhanden sein.

```
bash-4.2$cd /home/wiechert/elastic2ls/
bash-4.2$ls
TESTDATEI
```

Nun stoppen und entfernen wir den so gestarteten Container wieder.

```
bash-4.2$docker stop apache
bash-4.2$docker rm apache
```

Altenativ könnten wir das erzeugte Volume mit einbinden, um dort Daten zu speichern, die man z.B persistent vorhalten möchte oder mit anderen Containern teilen möchte.

```
bash-4.2$docker run --restart=always --mount source=data-apache,target=/var/www/data -p 80:80 -d --name apache apache:v3
```

oder mit dem angelegten Netzwerk starten:

```
bash-4.2$docker run --restart=always -p 80:80 --network elastic2ls-net -d --name apache apache:v3
```
