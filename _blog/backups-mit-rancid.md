---
layout: post
title: Backups Cisco Rancid
subtitle: Zum Sicher der Konfiguration von Netzwerkgeräten gibt es eine Software genannt Rancid, welche voll automatisert Backups Job ausführen kann.
keywords: [Rancid Backups Netzwerkgeräte Cicso Webconsole Bash Opensoure Konfiguration /etc/aliases rancid-cvs rancid-run var/networking/router.db clogin.rc Passwörter]
categories: [Old]
---
# {{ page.title }}

Backups von Netzwerkgeräten erstellen mit Rancid. Einer der am meisten vernachlässigten Aspekte des Netzwerk Managments ist es die Konfiguration der Geräte regelmässig zu sicher. Leider wird das erst als Priorität wahrgenommen wenn das Disaster schon seinen Lauf genommen hat. Glücklicherweise gibt es hierfür eine Opensoure Software, welche den Job Backups anzulegen voll automatiseren kann, für die meisten Geräte die ein Terminalzugang bereitstellen. Die Software kann hier [www.shrubbery.net/rancid/](https://www.shrubbery.net/rancid/) heruntergeladen werden. Die Software hat den Vorteil das es eine automatisierte Archievierung und Versionskontrolle für die Konfigurationsdateien mittels CVS anbietet. In diesem Turorial zeigen wir euch wie man sie installiert und konfiguriert.

## Installation

### Vorbereitung

Als erstes installieren wir die Notwendigen Pakete zum kompilieren.

```root@ubuntu:~# apt-get install expect make gcc g++```

1\. Erstellen der Gruppe netadm.

```root@ubuntu:~# groupadd netadm```

2\. Erstellen des Benutzers für das erstellen von automatisierten Backups. 3\. Der Benutzer muss Mitglied der Gruppe netadm sein und sein Home Directory soll `/usr/local/rancid` sein.

```root@ubuntu:~# useradd -g netadm -c "Networking Backups" -d /usr/local/rancid rancid```

4\. Erstellen der Ordners zum auspacken der Sourcen

```root@ubuntu:~# mkdir -p /usr/local/rancid/tar
cd /usr/local/rancid/tar```

5\. Herunterladen der aktuellsten Version.

```root@ubuntu:/usr/local/rancid/tar# wget ftp://ftp.shrubbery.net/pub/rancid/rancid-2.3.8.tar.gz```

6\. Jetzt entpacken wir das Archiv und wechseln danach in das Verzeichniss.

```root@ubuntu:/usr/local/rancid/tar# tar -xvzf rancid-2.3.8.tar.gz
root@ubuntu:/usr/local/rancid/tar# cd rancid-2.3.8```

7\. Jetzt preparieren wir das Paket mit dem `configure` Kommando. Mit der -prefix Angabe setzten wir das Default Verzeichniss `/usr/local/rancid/` welches das Home Verzeichniss des Benutzers ist.

```
root@ubuntu:/usr/local/rancid/tar/rancid-2.3.8:# ./configure --prefix=/usr/local/rancid/
./configure --prefix=/usr/local/rancid/
checking for a BSD-compatible install... /usr/bin/install -c
checking whether build environment is sane... yes
checking for gawk... gawk
...
...
...
config.status: creating include/config.h
config.status: include/config.h is unchanged
config.status: executing depfiles commands
```

8\. Jetzt installieren wir das Paket mittels des `make` Kommandos.

```
root@ubuntu:/usr/local/rancid/tar/rancid-2.3.8:#make install
Making install in .
gmake[1]: Entering directory `/usr/local/rancid/tar/rancid-2.3.2a2'
gmake[2]: Entering directory `/usr/local/rancid/tar/rancid-2.3.2a2'
gmake[2]: Nothing to be done for `install-exec-am'.
test -z "/usr/local/rancid//share/rancid" || mkdir -p -- "/usr/local/rancid//share/rancid"
...
...
...
/usr/bin/install -c 'downreport' '/usr/local/rancid//share/rancid/downreport'
gmake[2]: Leaving directory `/usr/local/rancid/tar/rancid-2.3.2a2/share'
gmake[1]: Leaving directory `/usr/local/rancid/tar/rancid-2.3.2a2/share'
```

## Konfiguration

1\. In dem Benutzerverzeichniss gibt es eine Beispieldatei mit Namen `cloginrc.sample`. Diese kopieren wir nun als "versteckte" Datei nach `.cloginrc`.

```root@ubuntu:/usr/local/rancid/tar/rancid-2.3.8:# cp cloginrc.sample /usr/local/rancid/.cloginrc```

2\. Wir passen noch die Datei .cloginrc sowie das Verzechniss selbst an damit der Benutzer und die Gruppe die Datei lesen können.

```root@ubuntu:~# chmod 0640 /usr/local/rancid/.cloginrc
root@ubuntu:~# chown -R rancid:netadm /usr/local/rancid/
root@ubuntu:~# chmod 770 /usr/local/rancid/```

3\. Jetzt werden wir die Konfiguration so anpassen, dass die Software regelmässige Backups anlegt und per Email einen Status report versendet. In der Konfiguration legen wir ausserdem fest wo die Backups speichert sowie einige ander generelle Parameter. Dazu editieren wir die Konfigurationsdatei.

```root@ubuntu:~# nano /usr/local/rancid/etc/rancid.conf```

In unserem Beispiel erstellen wir eine "device group" mit Namen "networking". Alle zugehörigen Dateien werden in einem Unterordner mit dem selben Namen gespeichert. Also: `var/networking` Normalerweise filtert die Software Passwörter und SNMP community strings heraus. Wenn du das nicht möchtest solltest du die Werte **FILTER_PWDS** und **NOCOMMSTR** auf **NO** ändern.

```
#
# Sample rancid.conf
#
LIST_OF_GROUPS="networking"
FILTER_PWDS=NO; export FILTER_PWDS
NOCOMMSTR=NO; export NOCOMMSTR
```

Rancid sendet seine Status Emails an die Adresse(n) welche in `/etc/aliases` definiert sind.

```
root@ubuntu:~# nano /etc/aliases
#
# Rancid email addresses
#
rancid-admin-networking:     rancid-networking
rancid-networking:           mylist
mylist:                      myself@example.com
```

Der Emailalias muss nun zur sendmail Alias Datenbank hinzugefüt werden.

```root@ubuntu:~# newaliases```

Die nächsten Schritte müssen wir als Benutzer Rancid ausführen, daher wechseln wir den Benutzer.

```root@ubuntu:~# su - rancid```

Das `rancid-vs` Kommando wird gebraucht um das Verzeichniss `/usr/local/var/networking` zu erstellen und die dazu gehörige Datenbank sowie die Liste der Netzwerkgeräte.

```
rancid@ubuntu~$ ~/bin/rancid-cvs
No conflicts created by this import
cvs checkout: Updating networking
cvs checkout: Updating networking/configs
cvs add: scheduling file `router.db' for addition
cvs add: use 'cvs commit' to add this file permanently
RCS file: var/CVS/networking/router.db,v
done
Checking in router.db;
~/var/CVS/networking/router.db,v
```

Jetzt erstellen wir zwei Crontab Einträge für den Benutzer um die Backups zu planen. Der zweite Eintrag dient dazu die Logs regelmässig zu bereinigen.

```rancid@ubuntu~$ crontab -e```

```
# Run config differ hourly
1 * * * * /usr/local/rancid/bin/rancid-run

# Clean out config differ logs
50 23 * * * /usr/bin/find /usr/local/rancid/var/logs -type f -mtime +2 -exec rm {} \;```
```

### Hinzufügen von Geräten

Die router.db Datei enthält die Geräteliste von welcher Backups angefertigt werden sollen. Zu finden ist sie unter `~/var/networking/router.db` Die Datei hat das Format: fqdn oder IP Adresse:Geräte-Typ:Status Beispiel:

```
    rancid@ubuntu:~$ nano ~/var/networking/router.db
    192.168.1.1:cisco:up
    asa-5505.example.com:cisco:up
    srv-0815.example.com:hp:Down
```

## Die Datei .clogin.rc

In der .clogin.rc Datei werden alle Passwörter gespeichert die die Software benötigt um sich in die jeweiligen Geräte einzulogen. Die mit gelieferte Datei kommt mit einer grossen Menge an Beispielen. Unglücklicherweise sind einige dieser Beispiel nicht auskommentiert, daher muss man sehr genau schauen was man davon braucht.

```
rancid@ubuntu:~$ nano ~/.cloginrc
###################################################################
# networking
# two passwords, where first is login and second is enable.
# {ssh password}{enable password}
add method *            ssh
add user *              user-name
add password *          {paswd}      {paswd}

# I weren't sure if I needed these:
# set ssh encryption type, dflt: 3des # add cyphertype *                {3des}
# set the username prompt to "router login:" # add userprompt *              {"router login:"}

# If I want to be more specific I could do something like:
# Using this you can specify for different domains, or even specific devices as needed.
add method *.domain.eu            ssh
add user *domain.eu              user-name
add password *domain.eu          {paswd}      {paswd}
###################################################################
```

## Testen

Die Software liefert einige Scripte mit welche zu Testzwecken benutzt werden können. Das Script clogin in dem `bin` Verzeihniss kann benutzt werden um die Datei .cloginrc einzulesen für einen interaktiven Test. In u.g. Beispiel haben wir uns erfolgreich in unser 192.168.1.1 Cisco Gerät eingelogt und haben einen interaktiven Zugang.

```
rancid@ubuntu~$ ~/bin/clogin 192.168.1.1
192.168.1.1
spawn ssh -c 3des -x -l user-name 192.168.1.1
user-name@192.168.1.1's password:
MOTD siger: My Device!!
My ASA5505 Type help or '?' for a list of available commands.
ASA5505> enable
Password: ********
ASA5505#
ASA5505# exit
Logoff
```

### Fehlersuche in den Log Dateien

Das Verzeichniss ```~/var/logs``` enthält alle Logdateien sortiert nach dem Datum.

```
rancid@ubuntu~$ ls ~/var/logs
networking.20151109.141201networking.20151109.141315
rancid@ubuntu:~$ less ~/var/logs/networking.20151109.141315
starting: Mon Nov 09 14:13:15 CEST 2015
Trying to get all of the configs.
All routers sucessfully completed.
cvs diff: Diffing .
cvs diff: Diffing configs
cvs commit: Examining .
cvs commit: Examining configs
starting: Mon Nov 09 14:13:33 CEST 2015
~/var/logs/networking.20151109.141315 (END)

( CTRL+Z to exit)
```

Nachdem das Kommando `rancid-run` ausgeführt wurde solltest du eine Kopie der Konfiguration deiner definierten Netzwerkgeräte unter ~/var/networking/configs/ finden.

```rancid@ubuntu~$ ls ~/var/networking/configs/ 192.168.1.1 CVS```

  Quellen:
  * [Network Backups With Rancid](https://www.linuxhomenetworking.com/wiki/index.php/Quick_HOWTO_:_Ch1_:_Network_Backups_With_Rancid)
  * [rancid FAQ](https://www.shrubbery.net/rancid/FAQ)
