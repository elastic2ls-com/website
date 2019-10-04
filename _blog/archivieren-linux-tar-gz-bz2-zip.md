---
layout: post
title: Archivieren Linux (tar, gz, bz2, zip)
subtitle: Eine kurze Übersicht zum Thema Archivieren und Archivformate (.tar .gz .bz2 .zip) und wie man diese unter Linux benutzt.
keywords: [Archivieren Archivformate Linux tar gz bz2 gzip zip Entpacken packen komprimieren dekomprimieren gunzip bunzip2]
categories: [LinuxInside]
---
# {{ page.title }}

Unten findet ihr eine kurze Übersicht zum Thema Archivieren und Archivformate (.tar .gz .bz2 .zip) und wie man diese unter Linux benutzt. ![tar](../../img/tar.png)

## tar

Entpacken eines Archivs:

``` tar xfv archiv.tar (x = extract, f = file, v = verbose)```


Dateien/Ordner in ein Archiv packen:

``` tar cfv archiv.tar inhalt1 inhalt2 inhalt3 (c = create)```


Komprimierte Archive erstellen:

``` tar cfzv archiv.tar inhalt1 inhalt2 inhalt3 (z = komprimieren)```


Inhalt eines Archivs auflisten:

``` tar tfv archiv.tar```


## gz

Eine Datei komprimieren

``` gzip file```


Ergbnis: file.gz Datei dekomprimieren:

``` gunzip file```


Dateien in einem komprimierten Archiv zusammenfassen:

``` tar cfvz archiv.tar.gz inhalt1 inhalt2```


Archiv dekomprimieren und auspacken:

``` tar xfvz archiv.tar.gz```


## bz2

Eine Datei komprimieren

``` bzip2 file```


Eine Datei dekomprimieren:

``` bunzip2 file.bz2```


Dateien in einem komprimierten Archiv zusammenfassen:

``` tar cfvj archiv.tar.bz2 inhalt1 inhalt2```


Archiv dekomprimieren und auspacken:

``` tar xfvj archiv.tar.bz2```


## zip

_**Einzelne Dateien**_ in einem komprimierten Archiv zusammenfassen:

``` zip archiv.zip inhalt1 inhalt2```


Komplette Ordner in einem komprimierten Archiv zusammenfassen:

``` zip -r archiv.zip ordner1 ordner2 ordner3```


Komprimiertes Archiv entpacken:

``` unzip archiv.zip```


Inhalt eines komprimierten Archivs anzeigen:

``` unzip -l archiv.zip```


Für weitere Schalter und Funktionen, lesen Sie bitte die entsprechende MAN Page des Programms. Bei tar wäre dies:

``` man tar```
