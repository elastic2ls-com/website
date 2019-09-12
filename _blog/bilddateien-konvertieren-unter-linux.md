---
layout: post
title: Bilddateien konvertieren unter Linux
subtitle: Bilddateien konvertieren unter Linux von einem Format ins andere ist eine recht bequeme Sache mittels Imagemagic unter etwas Kenntisse der Bash.
keywords: [Bilddateien Linux konvertieren Imagemagic Bash PNG EPS Script convert]
---
# {{ page.title }}

Bilddateien konvertieren unter Linux von einem Format ins andere ist eine recht bequeme Sache mittels Imagemagic unter etwas Kenntisse der Bash. Im Zuge der extensiven Benutzung von [Pencil](https://www.elastic2ls.com/pencil) hatte ich festegestellt, das es kaum verwertbare Netzwerksymbole gibt. Diese kann man sich aber u.a. von [Cisco als EPS](httpss://www.cisco.com/c/en/us/about/brand-center/network-topology-icons.html) herunterladen. Um diese mit Pencil brauchbar zu verwenden, Pencil erkennt EPS Dateien nicht musste ich diese ins PNG Format umwandeln. Da das ca 300 Bilder sind war ich auf der Suche nach einer eleganten Lösung. Am schnellsten sollte das gelingen, dachte ich mir, mit einem kleinen bash-Script und dem convert-Kommando aus dem ImageMagick-Paket.

```convert bild01.eps bild01.png```

erzeugt aus

```bild01.eps```

die neue Datei

```bild01.png```

. Die for Schleife erledigt das für alle Bilder mit der Endung .eps im aktuellen Verzeichnis. Die Zuweisung

```pngfile=...```

entfernt aus dem ursprünglichen Dateinamen die Endung .eps und fügt stattdessen .png hinzu. Zuvor muss man allerdings die Leerzeichen in den Dateinamen entfernen. Das bewerkstelligen wir mit rename, wobei die Syntax

```'s/ /_/g'```

alle Leerzeichen in allen Dateinamen durch einen Unterstrich ersetzt.

```
#!/bin/bash
rename -v   's/ /_/g'  *eps
for filename in *.eps; do
pngfile=${filename%.eps}.png
echo "verarbeite $filename $pngfile"
convert $filename $pngfile
done`
``
