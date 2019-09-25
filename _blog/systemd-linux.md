---
layout: post
title: Systemd linux
subtitle:  Da Systemd SysVinit ablösst, wird es Zeit das neue Systemd kennen zu lernen. Systemd ist schneller, da es Aufgaben parallel ausführt und weniger Scripte benutzt.
keywords: [Systemd Linux]
categories: [LinuxInside]
---
# {{ page.title }}

![systemd](https://s.elastic2ls.com/wp-content/uploads/2018/02/27212330/systemd-logo-300x80.png)

Da Systemd SysVinit ablösst, wird es Zeit das neue Systemd kennen zu lernen. Systemd ist schneller, da es weniger Skripte verwendet und Aufgaben parallel ausführt. Die Konfiguration ist unter /etc/systemd zu finden.

### Boot Prozess

Systemd's hauptsächliche Aufgabe liegt darin, dem Boot Prozess zu verwalten und Informationen darüber zur Verfügung zu stellen. Um die Dauer des Boot Prozesses anzeigen zu lassen:

```
# systemd-analyze
Startup finished in 875ms (kernel) + 2.051s (initrd) + 1min 3.733s (userspace) = 1min 6.660s
```

UIm sich die Zeit, die jeder Prozess beim Bootvorgang benötigt hat anzeigen zu lassen:

```
# systemd-analyze blame
          1min 123ms nfs-mountd.service
          5.951s vboxtoolinit.service
          5.184s network.service
          3.546s plymouth-quit-wait.service
           952ms kdump.service
           774ms vboxdrv.service
           693ms lvm2-monitor.service
           614ms dmraid-activation.service
           308ms firewalld.service
           257ms systemd-udev-trigger.service
...
             4ms systemd-update-utmp.service
             4ms systemd-user-sessions.service
             3ms systemd-random-seed.service
             2ms sys-kernel-config.mount

```

### Journal-Analyse

Zusätzlich ist Systemd verantwortlich für das System Event Log, ein Syslog Dameon wird nicht mehr benötigt. Um sich den Inhalt des Systemd Journals anzeigen zu lassen:
```
# journalctl
```
Um sich alle Ereignisse die sich auf den crond Prozess beziehen anzeigen zu lassen:
```
# journalctl /sbin/crond
```
Um sich alle Meldungen seit dem letzten Reboot anzeigen zu lassen:
```
# journalctl -b
```
Um sich alle Erreignisse von heute anzusehen:
```
# journalctl --since=today
```
Um sch alle Erreignisse mit der Priorität err (Fehler) anzeigen zu lassen:
```
# journalctl -p err
```
Um sich die letzten 10 Erreignisse anzeigen zu lassen und auf neue zu warten (equivalent zu tail -f /var/log/messages):
```
# journalctl -f
```

### Control groups

Systemd organisiert Aufgaben in Kontroll Gruppen. Beispielsweise werden alle Prozesse, die vom Apache Webserver gestartet werden, in der selben Kontroll Gruppe zusammen gefasst, CGI Skripte ebenso. Um sich die Hierarchie der Kontroll Gruppen anzeigen zu lasssen:

```
# systemd-cgls
├─user.slice
│ └─user-1000.slice
│ └─session-1.scope
│ ├─2889 gdm-session-worker [pam/gdm-password]
│ ├─2899 /usr/bin/gnome-keyring-daemon --daemonize --login
│ ├─2901 gnome-session --session gnome-classic
. .
└─iprupdate.service
└─785 /sbin/iprupdate --daemon
```

Um sich eine Liste der Kontroll Gruppen anzeigen zu lassen sortiert nach CPU, Speicher und Disk I/O:

```
# systemd-cgtop
Path Tasks %CPU Memory Input/s Output/s
/ 213 3.9 829.7M - -
/system.slice 1 - - - -
/system.slice/ModemManager.service 1 - - - -
```

Um alle Prozesse die einem Apache Webserver zugeordnet sind zu beenden:
```
# systemctl kill httpsd`
```

Um einem Service ein Resourcen Limit von 500 CPUShares zuzuweisen:
```
# systemctl set-property httpsd.service CPUShares=500
```

> **ACHTUNG!!! Die Änderung wird in die sogenannte "service unit" Datei geschrieben. Um das zu verhindern und die Zuweisung nur für die aktuelle Laufzeit zu setzten muss man die `–runtime` 'Option setzen. Standartmässig wird jedem Service 1024 CPUShares zugewiesen. Es gibt aber keine Grund einem Service weniger oder gar mehr davon zuzuweisen.**

Um sich den aktuellen Wert der CPUShares anzeigen zu lassen die einem Service zugeordnet sind:
```
# systemctl show -p CPUShares httpsd.service
```

### Service management

Systemd ist u.a. zuständig für alle Aspekte des Service Managments. Das `systemctl` Kommando ersetzt `chkconfig` und das `service` Kommando. Die alten Kommandos sind verlinkt auf die jeweiligen systemctl Aufrufe. Um den NTP Service beim Bootvorgang zu aktivieren:
```
# systemctl enable ntpd
```

> **ACHTUNG!!! Du solltest im obigen Beispiel ntpd.service angeben aber per Default wird das .service Suffix hinzugefügt. Wenn du einen Pfad angibst, wird das .mount Suffix anbeigefügt.**

Um den NTP Service zu deaktivieren, zu starten, zu stoppen, neu zu starten oder eine reload der Konfiguration durchzuführen:
```
# systemctl disable ntpd
# systemctl start ntpd
# systemctl stop ntpd
# systemctl restart ntpd
# systemctl reload ntpd
```

Um herauszufinden ob der NTP Service beim Bootvorgang aktiviert ist:
```
# systemctl is-enabled ntpd
```

`enabled`

Um zu sehen ob der NTP Service aktuell läuft:
```
# systemctl is-active ntpd
```

`inactive`

Um den Status des NTP Services zu sehen:
```
# systemctl status ntpd
```

```
ntpd.service
Loaded: not-found (Reason: No such file or directory)
Active: inactive (dead)
```

Wenn du nach Änderungen der Konfiguration den Service neu laden musst:
```
# systemctl daemon-reload
```

Am eine Übersicht über alle units (Services, Mount Orte, Geräte) deren Status und Beschreibung zu sehen:
```
# systemctl
```

Etwas übersichtlicher:
```
# systemctl list-unit-files
```

Um sich eine Liste aller Services zu sehen, die beim booten einen Fehler verursacht haben:
```
# systemctl --failed
```

Der Prozessstatus von z.B https
```
# systemctl status httpsd.service
```

```
httpsd.service - The Apache HTTP Server
   Loaded: loaded (/usr/lib/systemd/system/httpsd.service; disabled)
   Active: active (running) since Tue 2015-11-17 11:48:23 CEST; 44s ago
   Main PID: 2446 (httpsd)
   Status: "Total requests: 0; Current requests/sec: 0; Current traffic:   0 B/sec"
   CGroup: /system.slice/httpsd.service
           └─2446 /usr/sbin/httpsd -DFOREGROUND
           └─2447 /usr/sbin/httpsd -DFOREGROUND
           └─2448 /usr/sbin/httpsd -DFOREGROUND
           └─2449 /usr/sbin/httpsd -DFOREGROUND
           └─2450 /usr/sbin/httpsd -DFOREGROUND
           └─2451 /usr/sbin/httpsd -DFOREGROUND
           └─2452 /usr/sbin/httpsd -DFOREGROUND

Aug 21 11:48:23 JS3 systemd[1]: Starting The Apache HTTP Ser....
Aug 21 11:48:23 JS3 systemd[1]: Started The Apache HTTP Server.
Hint: Some lines were ellipsized, use -l to show in full.
```

### Run level

Systemd verwaltet auch die run level. Da Systemd grundsätzlich mit Dateien arbeitet, ersetzen sogenannte **target files** die run level. Um in den **single user mode** zu kommen:
```
# systemctl rescue
```

Um in den runlevel 3 (Multi-user)zu kommen:
```
# systemctl isolate runlevel3.target
```

oder
```
# systemctl isolate multi-user.target
```

Um in den Grafischen run level zu wechseln:
```
# systemctl isolate graphical.target
```

Um den default run level auf den Nicht-grafischen Modus zu setzen:
```
# systemctl set-default multi-user.target
```

oder umgekehrt:
```
# systemctl set-default graphical.target
```

Sich den aktuellen run level ausgeben zu lassen:
```
# systemctl get-default
```

`graphical.target`

Um einen Server herunter zu fahren:
```
# systemctl poweroff
```
> **ACHTUNG!!! Man kann auch das gewohnte poweroff Kommando verwenden, es ist gelinkt zu dem equivalenten systemctl Kommando.**

Um einen Server neu zu starten, zu pausieren oder in den Ruhezustand zu versetzen:
```
# systemctl reboot
```
```
# systemctl suspend
```
```
# systemctl hibernate
```

### Sonstiges

Um sich den Servernamen anzeigen zu lassen:
```
# hostnamectl
```

```
   System Locale: LANG=de_DE.UTF-8
       VC Keymap: de-nodeadkeys
      X11 Layout: de
     X11 Variant: nodeadkeys
[root@JS3]# hostnamectl
   Static hostname: JS3
         Icon name: computer
           Chassis: n/a
        Machine ID: 6fdc8db1eee5426b98e491ad5f952dcb
           Boot ID: 636eed4d63854f7d83faebbcacc18efb
  Operating System: CentOS Linux 7 (Core)
       CPE OS Name: cpe:/o:centos:centos:7
            Kernel: Linux 3.10.0-229.el7.x86_64
      Architecture: x86_64

```

> **ACHTUNG!!! Es gibt drei verschiedene Arten von Hostnamen: static, transient und pretty. Der Hostname vom Typ "static" ist der traditionelle Hostname, welcher vom Benutzer ausgewählt werden kann, und wird in /etc/hostname gespeichert. Der Hostname des Types "transient" wird dynamisch verwaltet vom Kernel. Dieser kann per DHCP oder mDNS zur Laufzeit geändert werden. Der dritte Hosttyp "pretty" ist ein frei wählbarer UTF8 name zur Präsentation für den Benutzer.**

Um einen Hostnamen permanent zu setzen:
```
# hostnamectl set-hostname rhel7
```

Um sich die aktuellen Einstellungen für **locale**, **virtual console keymap** und X11 Keyboard Layout anzeigen zu lassen:
```
# localectl
```

```
     System Locale: LANG=de_DE.UTF-8
       VC Keymap: de-nodeadkeys
      X11 Layout: de
     X11 Variant: nodeadkeys

```

Um de_DE.utf8 als Wert für "locale" zu setzen:
```
# localectl set-locale LANG=de_DE.utf8
```

Um de_DE.utf8 als Wert für "virtual console keymap" zu setzen:
```
# localectl set-keymap de_DE
```
Um de_DE.utf8 als Wert für "X11" zu setzen:
```
# localectl set-x11-keymap de_DE
```

Um sich das aktuelle Datum und die Zeit anzeigen zu lassen:
```
# timedatectl
```

```
      Local time: Tue 2015-11-17 17:22:20 CET
  Universal time: Tue 2015-11-17 16:22:20 UTC
        RTC time: Tue 2015-11-17 16:19:55
        Timezone: Europe/Berlin (CET, +0100)
     NTP enabled: yes
NTP synchronized: no
 RTC in local TZ: no
      DST active: no
 Last DST change: DST ended at
                  Sun 2015-10-25 02:59:59 CEST
                  Sun 2015-10-25 02:00:00 CET
 Next DST change: DST begins (the clock jumps one hour forward) at
                  Sun 2016-03-27 01:59:59 CET
                  Sun 2016-03-27 03:00:00 CEST

```

Um ein neues Datum zu setzen:
```
# timedatectl set-time YYYY-MM-DD
```

Um eine neue Zeit zu setzten:
```
# timedatectl set-time HH:MM:SS
```

Um eine Liste der Zeitzonen anzeigen zu lassen:
```
# timedatectl list-timezones
```

Um die Zeitzone auf Europe/Berlin
```
# timedatectl set-timezone Europe/Berlin
```

Um sich eine Liste der Benutzer ausgeben zu lassen:
```
# loginctl list-users
```

```
UID USER
42 gdm
1000 alex
0 root
```

Um sich die Liste der aktuellen Benutzer Sessions ausgeben zu lassen:
```
# loginctl list-sessions
```

```
SESSION UID USER SEAT
1 1000 alex seat0

1 sessions listed.
```

Um sich die Eigenschaften des Benutzers alex anzeigen zu lassen:
```
# loginctl show-user alex
```

```
UID=1000
GID=1000
Name=alex
Timestamp=Fri 2015-11-17 21:53:43 CET
TimestampMonotonic=4452802601
RuntimePath=/run/user/1000
Slice=user-1000.slice
Display=1
State=active
Sessions=1
IdleHint=no
IdleSinceHint=0
IdleSinceHintMonotonic=0
```

Quellen:
[httpss://access.redhat.com/articles/754933](httpss://access.redhat.com/articles/754933)
