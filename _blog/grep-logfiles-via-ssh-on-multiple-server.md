---
layout: post
title: grep logfiles via SSH on multiple server
subtitle:  Mittels des unten angeführten Shellscripts ist es möglich mit grep logfiles via SSH on multiplen server einzusammeln. Diese werden in eine Logfile geschrieben. Jetzt hat man alle Möglichkeiten die, die Bash bietet um alles mögliche mit den Logs anzustellen.
keywords: [grep Shellscripts SSH Logfile Rückgabewert Suche Kommando Reguläre Ausdrücke Beispiele]
categories: [LinuxInside]
---
# {{ page.title }}

![grep logfiles via SSH on multiple server](https://s.elastic2ls.com/wp-content/uploads/2018/02/27205950/grep-e1563102229105.gif)


Mittels des unten angeführten Shellscripts ist es möglich mit grep logfiles via SSH on multiplen server einzusammeln. Diese werden in eine Logfile geschrieben. Jetzt hat man alle Möglichkeiten die, die Bash bietet um alles mögliche mit den Logs anzustellen. Zum Beispiel zählen, wie of ein Logeintrag vorkommt:

```grep LOGEINTRAG |wc -l```

```
#!/usr/bin/env bash
#Date: 16.1.2018
#Version: 0.1
#Author: AWiechert

HOSTS=(ipaddr1 ipaddr2 ipaddr3)
USER=alex
LOG=~/mylog
DATE=$(date +%Y-%m-%d-%H:%M:%S)

echo SEARCHTERM: $1 >>$LOG
for HOSTS in ${HOSTS[@]}; do
   echo "== $HOSTS ==" >> $LOG
   ssh $USER@$HOSTS "grep '$1' /var/log/www/ >> $LOG
done
less $LOG
mv $LOG $DATE-mylog
```

Bespiel Output

```
./multi.sh 'grep logfiles via SSH auf multiplen  Servern'
SEARCHTERM: grep logfiles via SSH auf multiplen  Servern
== 172.30.100.27 ==
12
== 172.30.100.28 ==
20
== 172.30.100.29 ==
31
```

Um das ganze noch aufzuhübschen, da man sich ja nicht alle möglichen IP Adressen merken kann man das Array mit den Host IP Adressen in eine Datei auslagern. Im gezeigten Beispiel möchte ich wissen, welche Java Versionen auf den Server installiert sind.

```
#!/usr/bin/env bash

user="awiechert"
log=~/check_java.log
date=$(date +%Y-%m-%d-%H:%M:%S)

cat > hosts.$ <>$log
        ssh -n $user@$IPADDR 'java -version' >> $log
done < hosts.$

less $log
rm -rf $log
rm -rf hosts.$
```

Bespiel Output

```
./multi.sh
== HOST_1 ==
java version "1.8.0_91"
Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)
== HOST_2 ==
java version "1.8.0_91"
Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)
== HOST_3 ==
java version "1.7.0_75"
Java(TM) SE Runtime Environment (build 1.7.0_75-b13)
Java HotSpot(TM) 64-Bit Server VM (build 24.75-b04, mixed mode)
== HOST_4 ==
java version "1.8.0_91"
Java(TM) SE Runtime Environment (build 1.8.0_91-b14)
Java HotSpot(TM) 64-Bit Server VM (build 25.91-b14, mixed mode)
```
