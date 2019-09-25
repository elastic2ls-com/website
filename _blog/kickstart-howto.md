---
layout: post
title: Kickstart – wie man Server automatisch provisioniert
subtitle:  Kickstart wird dazu benutzt um Server automatisiert zu provisionieren. Man kann z.B. Benutzer anlegen, die Festplatten zu partitionieren und formatieren, Software installieren,die Netztwerkschnittstellen einrichten und einiges mehr
keywords: [Kickstart provisionieren automatisieren ks.cfg Optionen]
categories: [Howtos]
---
# {{ page.title }}

Kickstart wird dazu benutzt um Server automatisiert zu provisionieren. Man kann z.B. Benutzer anlegen, die Festplatten zu partitionieren und formatieren, Software installieren,die Netztwerkschnittstellen einrichten und einiges mehr.

![kickstart-overview1](https://www.elastic2ls.com/wp-content/uploads/2015/11/kickstart-overview1.png)

## Serverseitige Konfiguration

Im einfachsten Fall benötigen wir lediglich einen FTP oder HTTP Dienst den wir benutzen können um die Kickstart Datei für den zu provisionierenden Server bereitzustellen. In diesem Bespiel werden wir eine Apache Webserver für diesen Zweck auswählen.

```bash
apt-get install apache2
```

Das war es schon. Wir werden die Kickstart Datei in den DocumentRoot Ordner des Apache legen. z.B.

`/var/www/html/ks.cfg`

## Erstellen der Kickstart Datei

Hier gibt es unter anderem für erste Tests eine Gui Werkzeug welches uns helfen kann eine Kickstart Datei zu erstellen. Es heisst system-config-kickstart

![ksconfig-basic](https://www.elastic2ls.com/wp-content/uploads/2015/11/ksconfig-basic.png)

## Optionen in der Kickstart Cfg Datei

### die Kickstart Version für RedHat basierende Systeme

Zuerst bestimmen wir welche Art von Platform wir unterstützen wollen. In unserem Fall eine 64Bit Prozessor

`platform= AMD64 or Intel EM64T`

Einstellungen für Sprache das Keyboard Layoutr sowie die Zeitzone. #LANGUAGE KEYBOARD AND TIMEZONE

```
lang de_DE
keyboard de
timezone Europe/Berlin
```

Selinux und Firewall Einstellung. Hier beide komplet ausgeschaltet.

```
selinux --disabled
firewall --disabled
```

Einstellungen für den Bootloader. Hier wird der Bootloader in den Master Boot Record geschrieben. `Clearpart --all` gibt an das alle Partitionen gelöscht werden sollen. Zerombr löscht alle Partitionstabelen falls vorhanden.

```
bootloader --location=mbr
zerombr
clearpart --all --initlabel
```

Einstellungen für die Partitionierungen. Wir verwenden hier ein LVM Setup, bauen eine ca. 20GB grosse root Partition sowie ein 8GB Home Partition die mit dem ext4 Dateisystem formatiert wird. Ebenso legen wir eine swap Partition.

```
part /boot --fstype ext4 --size=128
part pv.01 --size=0 --grow
volgroup vg0 pv.01
logvol swap --fstype swap --name=swap --vgname=vg0 --recommended
logvol / --fstype ext4 --name=root --vgname=vg0 --size=10480 --grow
logvol /home --fstype ext4 --name=home --vgname=vg0 --size=8096
```

Die Netztwerkkonfiguration. Hier mit DHCP unter Angabe des zu verwendenden Gerätes. Wir stellen eine DNS server ein und teilen mit das wir für dieses Gerät kein IPv6 konfigurieren wollen.

`network --bootproto=dhcp --device=enp0s3 --nameserver=8.8.8.8 --noipv6`

Sagt aus das wir hier keinen X Server konfigurieren wollen.

`skipx`

In der folgenden Sektion bestimmen wir welche Softwarepakete wir installieren wollen. `%pakages` leitet diese Sektion ein. Bei RadHat basierenden System muss zwingen ein `%end` gesetzt werden an den Schluss dieser Sektion. Wir installieren hier einen SSH Server und ein paar andere nützliche Werkzeuge.

```
%packages
openssh-server
puppet
coreutils
curl
screen
nano
%end
```

In der Post Sektion kann man nich einiges Einstellen. Wir geben dem Benutzer eladmin hier sudo Rechte in dem wir ihn in die Gruppe wheel hinzufügen welche in der Datei `/etc/suodoers` schon erweiterte Rechte hat. Ebenso erlauben wir den Login als Root und fügen einen Banner hinzu naho /etc/isssue welcher von SSH Prozess beim Login angezeigt wird. Das alles sind nur Beispiel auf einen Testrechner, weswegen ich den Root Login erlaube.

```
%post
#Grant the user eladmin sudo rights
sed -i 's/wheel:x:10:/wheel:x:10:eladmin/' /etc/group
#grant root login via ssh for testservers only
sed -i 's/^#PermitRootLogin yes/PermitRootLogin yes/' /etc/ssh/sshd_config
sed -i 's:#Banner none:Banner /etc/issue:' /etc/ssh/sshd_config
service sshd restart
#set message for login screen and ssh login screen
echo "******************************************" >/etc/issue
echo "* *" >>/etc/issue
echo "* elastic2ls.com opensource projects *" >>/etc/issue
echo "* *" >>/etc/issue
echo "* 2015 *" >>/etc/issue
echo "* *" >>/etc/issue
echo "******************************************" >>/etc/issue
%end
```

### die Kickstart Datei für Debian basierende Systeme.

Hier finden wir die ersten Unterschiede wie die Sprachunterstützung eingestellt wird.

```
#platform=AMD64 or Intel EM64T
lang de_DE
langsupport de_DE
System keyboard
keyboard de
timezone Europe/Berlin
```

Ein weiteres Beispiel `--fullname` wird von RedHat Systemen nicht akzeptiert.

```
auth --useshadow --enablemd5
rootpw --iscrypted $1$ipo4.ufM$jp6uu4ipYcXdv.wVpGM270
user eladmin --fullname "eladmin" --iscrypted --password $1$.1XtaB/x$CIODLDjRhxBEM1TTYRcIk1
```

```
reboot
text
install
```

```
bootloader --location=mbr
zerombr yes
clearpart --all --initlabel
part /boot --fstype ext4 --size=128
part pv.01 --size=0 --grow
volgroup vg0 pv.01
logvol swap --fstype swap --name=swap --vgname=vg0 --recommended
logvol / --fstype ext4 --name=root --vgname=vg0 --size=10480 --grow
logvol /home --fstype ext4 --name=home --vgname=vg0 --size=8096
```

```
firewall --disabled
network --bootproto=dhcp --device=eth0 --nameserver=8.8.8.8 --noipv6
skipx
```

```
%packages
openssh-server
puppet
coreutils
curl
screen
@ubuntu-desktop
@ubuntu-standard
%end
```

```
%post
#Grant the user eladmin sudo rights
sed -i 's/^sudo:x:27:/sudo:x:27:eladmin/' /etc/group
sed -i 's/^PermitRootLogin without-password/PermitRootLogin yes/' /etc/ssh/sshd_config
sed -i 's:^#Banner /etc/issue.net:Banner /etc/issue/' /etc/ssh/sshd_config
service sshd restart
#set message for login screen and ssh login screen
echo "******************************************" >/etc/issue
echo "* *" >>/etc/issue
echo "* elastic2ls.com opensource projects *" >>/etc/issue
echo "* *" >>/etc/issue
echo "* 2015 *" >>/etc/issue
echo "* *" >>/etc/issue
echo "******************************************" >>/etc/issue
#%end
```

Quellen:

[https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Installation_Guide/s1-kickstart2-options.html](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Installation_Guide/s1-kickstart2-options.html)
