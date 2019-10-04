---
layout: post
title: mehrere Kommandos innerhalb eines Docker Containers ausführen
subtitle:  Dazu übergibt man an den Docker Container mit dem Parameter -it einen Befehl. Hier wird nun eine Shell sh aufgerufen mit dem Parameter -c Die Aneinanderreihung der Befehle erfolgt mittels ; siehe Beispiel unten.
keywords: [Docker Container Parameter Kommandos ausführen]
categories: [DevOps]
---
# {{ page.title }}


![docker](../../img/DockerLogo-300x150.png)


Dazu übergibt man an den Docker Container mit dem Parameter

`-it`

einen Befehl. Hier wird nun eine Shell

`sh`

aufgerufen mit dem Parameter

`-c`

Die Aneinanderreihung der Befehle erfolgt mittels

`;`

siehe Beispiel unten.  

```
docker run -it -c "apt-get update ; apt-get install docker.io -y ; bash"
```
