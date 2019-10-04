---
layout: post
title: Netzwerk Bandbreite mit iperf messen
subtitle:  Das OpenSource Tool iperf erlaubt das Messen der maximalen TCP und UDP Netzwerk Bandbreite. Bei Debian und Ubuntu ist es im Repository bereits enthalten.
keywords: [Netzwerk Bandbreite iperf messen Ubuntu Debian]
categories: [LinuxInside]
---
# {{ page.title }}

Das OpenSource Tool iperf erlaubt das Messen der maximalen TCP und UDP Netzwerk Bandbreite.

## Installation

Bei Debian und Ubuntu ist es im Repository bereits enthalten, d.h. eine Installation ist recht einfach möglich mittels der Standard Paketverwaltung von Ubuntu oder Debian.

```
bash# apt-get install iperf
```
Für RHEL und CentOS ist das Paket im EPEL Repository verfügbar.

```
bash# wget https://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
bash# rpm -ivh epel-release-6-8.noarch.rpm
bash# yum install iperf
```

## Verwendung von iperf

Iperf funktioniert nach dem Client-Server Modell. D.h. man startet zuerst den Daemon auf einem Server und verbindet sich danach mit dem Client.

## TCP Performance messen

In der Standardeisntellung von iperf wird der TCP Datentransfer zwischen Server und Client gemessen. Siehe unten.

### Server

```
bash# iperf -s
------------------------------------------------------------
Server listening on TCP port 5001
TCP window size: 85.3 KByte (default)
------------------------------------------------------------
[  4] local 192.168.1.100 port 5001 connected with 172.17.1.20 port 48828
[ ID] Interval       Transfer     Bandwidth
[  4]  0.0-10.0 sec   607 MBytes   507 Mbits/sec
```

### Client

```
bash# iperf -c 192.168.1.100
------------------------------------------------------------
Client connecting to 192.168.1.100, TCP port 5001
TCP window size: 19.3 KByte (default)
------------------------------------------------------------
[  3] local 172.17.1.20 port 48828 connected with 192.168.1.100 port 5001
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0-10.0 sec   607 MBytes   509 Mbits/sec
```

## Bandbreite testen

Wenn wir nun die Bandbreite testen wollen müssen wir das per UDP tun. Zusätzlich wird mit `--bandwith` oder `-b` die Bandbreite angegeben. Default Wert ist 1Mbit/s.

### Server

```
bash# iperf -s -u
------------------------------------------------------------
Server listening on UDP port 5001
Receiving 1470 byte datagrams
UDP buffer size:  122 KByte (default)
------------------------------------------------------------
[  3] local 192.168.1.100 port 5001 connected with 172.17.1.20 port 58150
[ ID] Interval       Transfer     Bandwidth        Jitter   Lost/Total Datagrams
[  3]  0.0-10.3 sec   918 MBytes   751 Mbits/sec  14.786 ms 25994/680611 (3.8%)
[  3]  0.0-10.3 sec  1 datagrams received out-of-order
```

### Client

```
bash# iperf -c 192.168.1.100 -u -b 1000M
------------------------------------------------------------
Client connecting to 192.168.1.100, UDP port 5001
Sending 1470 byte datagrams
UDP buffer size:  122 KByte (default)
------------------------------------------------------------
[  3] local 172.17.1.20 port 58150 connected with 192.168.1.100  port 5001
[ ID] Interval       Transfer     Bandwidth
[  3]  0.0-10.0 sec   954 MBytes   800 Mbits/sec
[  3] Sent 680612 datagrams
[  3] Server Report:
[  3]  0.0-10.3 sec   918 MBytes   751 Mbits/sec  14.786 ms 25994/680611 (3.8%)
[  3]  0.0-10.3 sec  1 datagrams received out-of-order
```
