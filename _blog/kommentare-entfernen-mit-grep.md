---
layout: post
title: Kommentare entfernen mit GREP
subtitle:  Kommentare entfernen mit GREP ist eine sehr einfache aber effektive Sache. Bei vielen Linux-Programmen dient die Konfigurationsdatei gleichzeitig auch zur Dokumentation. Zum Einarbeiten in eine neue Konfigurations-Syntax kann das durchaus praktisch sein.
keywords: [grep Kommentare automatisieren entfernen Dokumentation Konfigurationsdatei]
categories: [LinuxInside]
---
# {{ page.title }}


![Kommentare entfernen](../../img/grep.gif)

Viele Konfigurationsdatein in Linux Systemen dienen auch gleichzeitig der Dokumentation, was durchaus zum einarbeiten in eine neune Syntax sehr hilfreich sein kann. Da man aber spätestens wenn die gewünschten/gebrauchten Parameter bekannt sind und man zuweilen die Orientierung verlieren kann in grossen Konfigurationsdateien, kann

```grep```

weiterhelfen. Als Bespiel nehmen wir die Samba Konfigirationsdatei. Diese umfasst 337 Zeilen, wovon 306 Kommentare bzw. Leerzeilen sind. Kommentarzeiten in der Samba Konfigurationsdatei sind entwender

```#```

oder

```;```

 Ein

```grep -v ^#```

würde alle Zeilen mit Kommentaren entfernen, die mit einen

```#```

beginnen. Gleiches gilt für

```grep -v '^;'```

welches die Zeilen Kommentaren entfernt die mit einem Semikolon beginnen.

```grep -v '^/pre>```

würde die Leerzeilen entfernen.

Da es aber unsinnig wäre diese Kommandos nacheinander auszuführen und die Datei jeweils umzuleiten, kombinieren wir die drei Aufrufe mittels:

```grep -Ev```

![Kommentare entfernen](https://s.elastic2ls.com/wp-content/uploads/2018/02/27212612/grep_kommentare_entfernen1.webp)

Und so sieht das dann bereinigt aus.

![Kommentare entfernen](https://s.elastic2ls.com/wp-content/uploads/2018/02/27212634/grep_kommentare_entfernen2.webp)
