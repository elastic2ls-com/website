---
layout: post
title: Docker nutzen mit Apache Teil 1
subtitle:  Unten sind die nötigen Schritte skiziert wie wir uns ein Basis Image herunterladen können, dann den Apachen installieren und daraus ein neues Image für die weitere Verwendung speicher können.
keywords: [docker Dockerfile Apache Basis-Images Container Image commit MAINTAINER exec persistent]
categories: [DevOps]
---
# {{ page.title }}

![docker](../../img/DockerLogo-300x150.png)

Apache mit Docker zu nutzten ist relativ einfach. Unten sind die nötigen Schritte skiziert wie wir uns ein Basis Image herunterladen können, dann den Apachen installieren und daraus ein neues Image für die weitere Verwendung speicher können.

## Importieren eines Docker Basis Images

Als erstes starten wir ein Image im interaktiven Modus. Gleichzetig wird das Image namens **ubuntu** dabei importiert.

```
alex@vm# docker run -t -i ubuntu /bin/bash
Unable to find image 'ubuntu:latest' locally
latest: Pulling from ubuntu
20ee58809289: Pull complete
f905badeb558: Pull complete
119df6bf2a3a: Pull complete
94d6eea646bc: Pull complete
bb4eabee84bf: Pull complete
Digest: sha256:85af8b61adffea165e84e47e0034923ec237754a208501fce5dbeecbb197062c
```

Die Option ```-i``` sagt das der Prozess im interaktiven Modus starten soll. Sobald man ein exit eingibt wird der Container beendet und nicht im Hintergrund weiter ausgeführt. Mit der Option ```-t``` wird der CMD Promt ausgegeben.

## Installation des Webservers

Im interaktiven Modus installieren wir nun den Apache Webserver.

```
alex@vm# apt-get update && apt-get install apache2 -y
```

Jetzt sollte man nicht mit exit den Vorgang beenden, sondern mittels ```ctrl+p``` und ```ctrl-q``` aus der interaktiven Shell kommen, ohne den Prozess zu beenden. Wir ermitteln die ID des Comtainers und führen danach folgendes Kommando aus.

```
alex@vm# docker ps

CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS              PORTS               NAMES
5f17b27bf811        ubuntu:latest       "/bin/bash"         7 minutes ago       Up 7 minutes                            serene_euclid```

```alex@vm# docker attach --sig-proxy=false 5f17b27bf811
```

Durch die Angabe von ```--sig-proxy``` werden alle empfangenen Eingaben des CMD Promt an den Prozess weitergeleitet, danach muss man wieder mit ```ctrl-p``` und ```ctrl-q``` wieder aus der Shell heraus um den Prozess nicht zu beenden  

## Erstellen eines neuen Docker Images

Nun erstellen wir uns eine neues Image mit dem installierten Apache ...

```
alex@vm# docker commit 5f17b27bf811 test/apache
```

```
alex@vm# docker images
REPOSITORY          TAG                 IMAGE ID            CREATED             VIRTUAL SIZE
test/apache         latest              fe28661e59db        34 seconds ago      262.8 MB
ubuntu              latest              bb4eabee84bf        2 weeks ago         124.8 MB
```

und exportieren dieses in eine Tar Datei.

```
alex@vm# docker save -o ubuntu-apache.tar fe28661e59db
```

## Starten des Webservers

Im detached Modus -d starten wir jetzt apachectl. Die Option -p 1234 sorgt dafür, das der Port 80 des Webservers, lokal an den Port 1234 weitergelietet wird.

```
alex@vm# docker run -d -p 1234:80 test/apache /usr/sbin/apache2ctl -D FOREGROUND
```

und testen mit curl ob dieser gestartet ist.

```
alex@vm# curl -I https://localhost
HTTP/1.1 200 OK
Date: Tue, 09 Aug 2016 14:06:34 GMT
Server: Apache/2.4.18 (Ubuntu)
Last-Modified: Tue, 09 Aug 2016 13:43:18 GMT
ETag: "2c39-539a3b71ae980"
Accept-Ranges: bytes
Content-Length: 11321
Vary: Accept-Encoding
Content-Type: text/html
```
