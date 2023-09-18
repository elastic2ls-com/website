---
layout: post
title: eigenes Initscript erstellen
subtitle:  Hier eine kurze Anleitung wie ihr ein eigenes Init-Script erstellen könnt.
keywords: [Init-Script Linux bash chkconfig /etc/init.d/ processname]
categories: [LinuxInside]
---
# {{ page.title }}

![init_d](../../img/init_d.webp)


Hier eine kurze Anleitung wie ihr ein eigenes Init-Script erstellen könnt.          

```
# chkconfig: 2345 95 20
# description: Deine Beschreibung
# Was dein Script tut.
# processname: meinscript
```

Die Zeilen oben sind der Header für das selbst gebaute Initscript.

```
# processname: meinscript
```

Der Wert muss den gleichen Namen haben wie das Initscript welches nach /etc/init.d/ kopiert wurde. Bsp meinscript

```
# chkconfig: 2345 95 20
# processname: meinscript
```

Jetzt kannst du mit den Linux Befehle chkconfig auf CentOS deinen Service hinzufügen.

```
# chkconfig --add meinscript
```

```
# chkconfig meinscript on
```

```
# chkconfig --list meinscript
meinscript 0:off 1:off 2:on 3:on 4:on 5:on 6:off
```
