---
layout: post
title: grep erklärt
subtitle:  Global search for a regular expression and print out matched lines" - kurz grep ist das gebräuchlichste Kommando, um in Dateien nach bestimmten Mustern zu suchen. Die Grep-Familie umfasst die drei Kommandos egrep, grep und fgrep. Das erste "Extended Grep" (erweitertes grep) versteht "ein paar mehr
keywords: [grep Dateienmuster egrep fgrep Rückgabewert Suche Kommando Reguläre Ausdrücke Beispiele]
---
# {{ page.title }}

"Global search for a regular expression and print out matched lines" - kurz **grep** ist das gebräuchlichste Kommando, um in Dateien nach bestimmten Mustern zu suchen. Die Grep-Familie umfasst die drei Kommandos egrep, grep und fgrep. Das erste "Extended Grep" (erweitertes grep) versteht "ein paar mehr" der Regulären Ausdrücke als "grep". "fgrep" (Fixed Grep) hingegen unterstützt nur eine eingeschränkte Teilmenge, womit sich die Suche vor allem in größen Dateien erheblich beschleunigen lässt.


 ![grep](https://s.elastic2ls.com/wp-content/uploads/2018/02/27205950/grep-e1563102229105.gif)

 Grep arbeitet bei der Suche wesentlich effizienter als das in einem Editor geschehen würde. Per Voreinstellung schreibt das Kommando alle Zeilen der Eingabe, die das gesuchte Muster enthalten, auf die Standardausgabe. Dabei kann die Eingabe beliebig viele Dateien, als auch die Standardeingabe betreffen. Zudem liefern die Kommandos der Grep-Familie einen Rückgabewert an das Betriebssystem, was sie für die Verwendung in Shellprogrammen bevorzugt.

## Der Rückgabewert von Grep

Häufig interessiert man sich nicht für den exakten Inhalt der Zeile, die das Muster enthält, sondern einzig ob das Muster überhaupt existiert. Vor allem in Shellskripten wird man die Ausgaben der Kommandos unterdrücken und anschließend anhand des Rückgabewertes den weiteren Programmablauf steuern.

**Rückgabewert 0** Muster wurde gefunden:

```
# "root" sollte es eigentlich in jeder "passwd" geben
user@machine grep root /etc/passwd > /dev/null
user@machine echo $?
0```

**Rückgabewert 1** Muster wurde nicht gefunden:

```
# "ROOT" gibt es hoffentlich nicht
user@machine grep ROOT /etc/passwd > /dev/null
user@machine echo $?
1```

**Rückgabewert 2** Datei nicht gefunden:

```
# die Datei "/bla" gibt es hoffentlich nicht
user@machine grep text /bla > /dev/null
user@machine echo $?
2```

## Wichtige Optionen von Grep

Optionen beeinflussen die Arbeitsweise aller Kommandos der Grep-Familie. Welche Optionen es gibt, beschreibt die folgende Tabelle: **-c** Anzeige der Anzahl Zeilen, in denen das Muster gefunden wurde:

```
user@machine grep -c bash /etc/passwd
38```

**-i** Groß- und Kleinschreibung werden nicht unterschieden:

```
user@machine grep -i ROot /etc/passwd
root:x:0:0:root:/root:/bin/bash```

**-l** Nur Anzeige der Namen der Dateien, in denen das Muster gefunden wurde:

```
user@machine grep -l tcp /etc/host*
/etc/hosts.allow
/etc/hosts.deny```

**-n** Zeigt die Zeilennummer an, in der das Muster gefunden wurde:

```
user@machine grep -n root /etc/passwd
1:root:x:0:0:root:/root:/bin/bash```

**-s** Unterdrückt die Fehlerausgaben (Standardfehler); sinnvoll in Skripten. **-v** Zeigt alle Zeilen an, die das Muster nicht enthalten:

```
# ohne diese Option
user@machine ps ax | grep inetd
 133 ? S 0:00 /usr/sbin/inetd
 762 pts/2 S 0:00 grep inetd```

```
# die Ausgabe "grep" herausfiltern
user@machine ps ax | grep inetd | grep -v grep
 133 ? S 0:00 /usr/sbin/inetd```

**-w** Das Suchmuster muss ein einzelnes Wort sein (also kein Bestandteil eines anderen Wortes).

```
user@machine echo -e "Automaten\n essen\n keine Tomaten" | grep -i Tomaten
Automaten
keine Tomaten```

```
user@sonne echo -e "Automaten\n essen\n keine Tomaten" | grep -iw Tomaten
keine Tomaten```

**-A [Anzahl]** Zeigt "Anzahl" Zeilen an, die der Zeile mit dem Muster folgen.

```
user@machine grep -A 2 root /etc/passwd
root:x:0:0:root:/root:/bin/bash
bin:x:1:1:bin:/bin:/bin/bash
daemon:x:2:2:daemon:/sbin:/bin/bash```

**-B [Anzahl]** Zeigt "Anzahl" Zeilen an, die vor der Zeile mit dem Muster liegen.

## Von Grep unterstützte Reguläre Ausdrücke

Nachfolgend sind alle Reguläre Ausdrücke aufgeführt, die die Kommandos der Grep-Familie unterstützen. Hinter jedem Muster ist angegeben, welches grep-Kommando diese Syntax beherrscht. Dabei wird nicht zwischen grep und fgrep unterschieden, da beide Kommandos dieselbe Sprache sprechen (also grep=fgrep).

``` ^ (grep, egrep)```

Beginn der Zeile

``` $ (grep, egrep)```

Ende der Zeile

``` . (grep, egrep)```

Genau ein beliebiges Zeichen

``` * (grep, egrep)```

Beliebig viele des vorangegangenen Zeichens

``` [] (grep, egrep)```

Ein Zeichen aus dem Bereich. Anstelle von Zeichen können vordefinierte Klassen von Zeichen verwendet werden: [:alnum:], [:alpha:], [:cntrl:], [:digit:], [:graph:], [:lower:], [:print:], [:punct:], [:space:], [:upper:], und [:xdigit:].

``` [^] (grep, egrep)```

Kein Zeichen aus dem Bereich

``` > (grep)```

Muster am Wortanfang suchen

``` \> (grep)```

Muster am Wortende suchen

``` \(..\) (grep)```

Eingeschlossenes Muster vormerken; auf dieses kann später über \1 zugegriffen werden. Bis zu neun Muster können auf diese Weise gespeichert werden ( ein Beispiel steht im Abschnitt Reguläre Ausdrücke).

``` x\{m\} (grep)```

mehrfaches Auftreten des Zeichens x

``` x\{m,n\} (grep)```

mindestens m-, maximal n-maliges Auftreten des Zeichens x

``` + (egrep)```

Mindestens ein Auftreten des vorangegangenen Zeichens

```  ? (egrep)```

Höchstens ein Auftreten des vorangegangenen Zeichens

``` x|y (egrep)```

Zeichen "x" oder Zeichen "y"

``` (abc|xyz) (egrep)```

Zeichenkette "abc" oder Zeichenkette "xyz". Die runden Klammern können entfallen.

## Grep - Beispiele

Einfache Beispiele zur Anwendung von grep begegneten uns schon an mehreren Stellen dieses Buches. Nun möchte ich versuchen, anhand typischer Anforderungen bei der alltäglichen Arbeit mit einem Unix-System, die Verwendung der komplexeren Mechanismen zu erläutern.

### Beispiel 1

Bei der Systemadministration fragt man sich häufig, in welcher Datei eigentlich welche Shell-Variable gesetzt wird? Die globalen Vorgaben erfolgen zum Großteil in den Dateien des Verzeichnisses /etc. Also interessieren uns die Namen der Dateien, in denen z.B. die PATH-Variable modifiziert wird:

```
user@machine grep -l PATH /etc/* > /dev/null
/etc/csh.cshrc
/etc/login.defs
/etc/manpath.config
/etc/profile
/etc/profile.rpmsave
/etc/rc.config
/etc/squid.conf
```

Die Umleitung der Fehlerausgabe nach /dev/null ist sinnvoll, da "grep" nicht auf Verzeichnisse anwendbar ist.

### Beispiel 2

Wie viele Nutzer sind Mitglied in der default-Gruppe users (GID 100)?

```user@machine> grep -c ':[0-9]\{1,\}:100:' /etc/passwd```

Bei der Angabe des Suchmusters hilft uns die Kenntnis des Aufbaus der Datei "/etc/passwd". Dabei steht die GruppenID immer zwischen zwei Doppelpunkten. Allerdings könnte es sein, dass auch die NutzerID (UID) 100 vergeben ist - der Ausdruck :[0-9]\{1,\}:100: garantiert, dass :100: das zweite rein numerische Feld betrifft. Das Muster \{1,\} entspricht genau dem Muster \+. Eine andere Schreibweise ist:

```user@machine grep -c ':digit:\+:100:' /etc/passwd```

### Beispiel 3

Welche Netzwerkdienste über UDP sind auf unserem System verfügbar (Datei /etc/inetd.conf)?

```
user@machine grep '^[^#].*space:udp' /etc/inetd.conf
 time dgram udp wait root internal
 talk dgram udp wait root /usr/sbin/tcpd in.talkd
 ntalk dgram udp wait root /usr/sbin/tcpd in.talkd
 netbios-ns dgram udp wait root /usr/sbin/nmbd nmbd
 ```

Jede Zeile, die mit einem # beginnt, ist ein Kommentar. Also filtern wir solche Zeilen aus (^[^#]). Das gesuchte Protokoll ist "udp". Vor diesem Schlüsselwort können beliebig viele Zeichen (.*) gefolgt von einem Leerzeichen oder Tabulator (space:) stehen.

### Beispiel 4

Je gezielter man nach Informationen fahndet, desto verwirrender wird die Angabe der Suchmusters. In zahlreichen Fällen wird die Verwendung von Pipes einleuchtender sein. Das Ergebnis aus obigen Beispiel erhält man auch mit folgender Befehlsfolge:

```
user@machine grep -w udp /etc/inetd.conf | grep -v ^#
 time dgram udp wait root internal
 talk dgram udp wait root /usr/sbin/tcpd in.talkd
 ntalk dgram udp wait root /usr/sbin/tcpd in.talkd
 netbios-ns dgram udp wait root /usr/sbin/nmbd nmbd
 ```

## Egrep - Beispiele

Egrep ist hilfreich, wenn Sie nach Zeilen in der Eingabe suchen, die mindestens eine von mehreren Zeichenketten enthalten. So findet das folgende Beispiel alle Zeilen der Datei /etc/fstab, in denen "floppy" oder "cdrom" auftauchen:

```
user@machine egrep 'floppy|cdrom' /etc/fstab
/dev/hdc /cdrom iso9660 ro,noauto,user,exec 0 0
/dev/fd0 /floppy auto noauto,user 0 0
```

Eine weitere interessante Anwendung ist die Suche nach "geteilten" Mustern, d.h. die bekannten Teile stehen auf einer Zeile, aber der Zwischenraum ist unbekannt. Zur Demonstration dient folgende Datei:

```
user@machine cat beispiel.txt
1 ein Zwischenraum
2 ein Zwischenraum
3 ein Zwischenraum
4 ein Zwischenraum
```

Gesucht werden sollen alle Zeilen, die "einen Zwischenraum" enthalten; jedoch ist die Zusammensetzung des Zwischenraums nicht bekannt (und besteht teils aus Leerzeichen, teils aus Tabulatoren und teils aus beidem). Mit dem normalen grep könnte man sich mit folgendem Konstrukt behelfen:

```
user@machine grep "einspace:space:*Zwischenraum" beispiel.txt
1 ein Zwischenraum
2 ein Zwischenraum
3 ein Zwischenraum
4 ein Zwischenraum
```

Die doppelte Anwendung des [:space:]-Musters ist für diesen Fall notwendiger Ballast, da wir ja mindestens einen Zwischenraum benötigen. Eleganter ist da die Möglichkeit von "+" in Verbindung mit egrep:

```
user@machine egrep "einspace:+Zwischenraum" beispiel.txt
1 ein Zwischenraum
2 ein Zwischenraum
3 ein Zwischenraum
4 ein Zwischenraum
```

## Fgrep - Beispiele

Fgrep kann immer anstelle von grep verwendet werden, falls das zu suchende Muster keine regulären Ausdrücke enthält. Alle Sonderzeichen in der Musterzeichenkette verlieren ihre Sonderbedeutung und werden als Bestandteil des Musters verstanden. Fgrep arbeitet dadurch etwas schneller als grep und ist vor allem beim Durchsuchen großer Datenmengen nützlich.
