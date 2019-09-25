---
layout: post
title: Logrotate erklärt
subtitle:  Logrotate erklärt Die config Dateien von Logrotate finden sich unter folgenden Pfaden #/etc/logrotate.d/
keywords: [logrotate Linux logrotate.d rsyslog]
categories: [LinuxInside]
---
# {{ page.title }}

Die config Dateien von Logrotate finden sich unter folgenden Pfaden

`/etc/logrotate.d/`

Hier liegen die Config Dateien für die einzelnen Programme. z.B. httpsd rpm dpkg rsyslog.

## Die Default Config
```
[alex@linux-server~]$ vi/etc/logrotate.conf
```

```
# see "man logrotate" for details

# rotate log files weekly
weekly

# keep 4 weeks worth of backlogs
rotate 4

# create new (empty) log files after rotating old ones
create

# uncomment this if you want your log files compressed
#compress

# packages drop log rotation information into this directory
include /etc/logrotate.d

# no packages own wtmp, or btmp -- we'll rotate them here

/var/log/wtmp {
missingok
monthly
create 0664 root utmp
rotate 1
}
```

## Das Cron Script


`/etc/cron.daily/logrotate`


```
#!/bin/sh
test -x /usr/sbin/logrotate || exit 0
/usr/sbin/logrotate /etc/logrotate.conf
```


Der aktuelle Status der Log die mittels logrotate bearbeitet wurden

```
#/var/lib/logrotate/status logrotate state -- version 2
"/var/log/httpsd/*log" 2019-3-1
"/var/log/ppp/connect-errors" 2019-3-1
"/var/account/pacct" 2019-3-1
"/var/log/rpmpkgs" 2019-9-12
"/var/log/samba/*.log" 2019-3-1
"/var/log/messages" 2019-9-12
"/var/log/secure" 2019-9-12
"/var/log/maillog" 2019-9-12
"/var/log/spooler" 2019-9-12
"/var/log/boot.log" 2019-9-12
"/var/log/cron" 2019-9-12
"/var/log/yum.log" 2019-3-1
"/var/log/wtmp" 2019-9-1
```


## Eigenes Logrotate einrichten

```
[alex@linux-server~]$vi /etc/logrotate.d/mylogrotate
```

```
/etc/bind/bind.log {
daily
rotate 14
missingok
create 0644 named named
postrotate /sbin/service named reload 2> /dev/null > /dev/null || true
endscript
}
```


## Achtung

Wenn ihr hier im logrotate script nicht angebt wie es rotiert werden soll werden die Default Werte aus `/etc/logrotate.conf` ausgeführt.
