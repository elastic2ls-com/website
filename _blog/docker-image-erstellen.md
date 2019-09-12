---
layout: post
title: Docker-Base-Image erstellen
subtitle:  Bevor wir mit Docker loslegen können müssen oder sollten wir uns ein passendes Docker-Base-Image erzeugen. Dazu müssen wir das Paket debootstrap auf Ubuntu zuerst installieren.
keywords: [docker Dockerfile debootstrap Basis-Images Container Image minbase MAINTAINER exec persistent]
---
# {{ page.title }}

[![Docker](https://s.elastic2ls.com/wp-content/uploads/2018/02/27203623/DockerLogo-300x150.png)](https://s.elastic2ls.com/wp-content/uploads/2018/02/27203623/DockerLogo.png)


Bevor wir mit Docker auf Ubuntu loslegen können oder sollten wir uns ein passendes Docker-Base-Image erzeugen. Dazu müssen wir das Paket ```debootstrap``` auf Ubuntu zuerst installieren. Natürlich gibt es bereits sehr viele fertige Images auf dockerhub aber, wenn man alles unter Kontrolle behalten will, bietet es sich an sein eigenes Basis Image zu erstellen.


## Installation des Tools

```
alex@vm# apt-get install debootstrap -y
```

Dann erstellen wir uns einen Ordner in den das Dataisystem mit debootstrap installiert wird.


## Erstellen des root Datei Systems

```
alex@vm# mkdir trusty
```

Jetzt müssen wir dem Tool nur ein paar Optionen mitgeben. z.B. die Version, Architektur, das Ziel und den Mirror. Das kann ein wenig dauern und hängt von deiner Internetverbindung ab. Debootstrap benötigt root Privilegien um das Root Dateisystem anzulegen.

```
alex@vm# sudo debootstrap --variant=minbase --arch=amd64 trusty ./trusty https://de.archive.ubuntu.com/ubuntu
```

Wenn man es will kann man direkt auch zusätzliche Pakete mit installieren lassen, wenn man die Option ```--include``` mit angibt.


[![Docker-Base-Image](https://s.elastic2ls.com/wp-content/uploads/2018/02/27205227/deboot-strap-300x199.png)](https://s.elastic2ls.com/wp-content/uploads/2018/02/27205227/deboot-strap.png)


## Erstellen des Docker-Base-Image

Docker unterstützt komprimierte sowie nicht komprimierte Images.tar, .tar.gz, .tgz, .bzip, .tar.xz or .txz. Wir erstellen ein nicht komprimiertes Image.

```
alex@vm# tar -C trusty -cf trusty.tar .
```

Um das Image mit anderen zu teilen kannst du es zu [httpss://hub.docker.com/](httpss://hub.docker.com/) hochladen. Ausserdem kannst du es nun nach deinen Vorstellungen passend konfiguieren. z.B. Pakete installieren, Konfigurationen hinzufügen und vieles mehr.
