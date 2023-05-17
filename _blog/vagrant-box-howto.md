---
layout: post
title: Vagrant Box
subtitle:  Vagrant ist ein hervoragendes Tool für Entwickler aber auch generell für IT Test- Entwicklungssysteme. Es gibt einige Möglichkeiten vorkonfigurierte Vagrant Box aus dem Internet zu laden. Da ich aber lieber Kontrolle über die Maschinen habe ...
keywords: [Jenkins Deklarative Pipline checkoutscm Jenkinsfile webinterface]
categories: [DevOps]
---
# {{ page.title }}
## [![vagrant box](../../img/Vagrant-logo.png)

## Vagrant Box Howto

Vagrant ist ein hervoragendes Tool für Entwickler aber auch generell für IT Test- Entwicklungssysteme. Es gibt einige Möglichkeiten vorkonfigurierte Vagrant Box aus dem Internet zu laden. Da ich aber lieber Kontrolle über die Maschinen habe die ich einsetzte habe ich nach einer brauchbaren Dokumentation gesucht wie man sich eine eigene Vagrant Box baut.

### 1\. Downloade und installiere VirtualBox

[VirtualBox Download](httpss://www.virtualbox.org/wiki/Downloads)

![vagrant box](../../img/virtualbox.webp)

### 2\. Downloade ein CentOS iso image

[CentOS iso image Download](https://wiki.centos.org/Download)

![vagrant box](../../img/centos-300x158.png)

### 3\. neue VM in VirtualBox

Baue eine neue VM in VirtualBox mit folgenden Parametern.

* Name = "vagrant-centos7
* Linuxversion = Red Hat
* Extra = deaktivieren von audio und usb

###  4\. Boote die VM und installiere CentOS 7:

Setze das vagrant Passwort `vagrant`: Als Benutzer legst die `vagrant` mit dem Password `vagrant` an Der Hostname ist `vagrant-centos7`

###  5\. Openssh-Server installieren

Nach erfolgreicher Installation solltest du dich in die VM einloggen und als erstes den Openssh-Server installieren and aktivieren.

```bash
vagrant@vagrant-centos7$ sudo yum install openssh-server vagrant@vagrant-centos7
vagrant@vagrant-centos7$ sudo service sshd start
vagrant@vagrant-centos7$ sudo chkconfig sshd on
vagrant@vagrant-centos7$ netstat -tulpn | grep :22
```

### 6\. Portforwarding für SSH

Anschliessend erlauben wir der VM das Portforwarding für SSH. Dafür gibt es zwei Wege:

a. Stoppe die VM und von der CMD Line oder Terminal führst du folgenden Befehl aus:

```bash
you@host$ VBoxManage modifyvm "vagrant-centos7" --natpf1 "guestssh,tcp,,2222,,22"
```

b. Stoppe die VM und setze das Portforwarding in der Gui von VirtualBox.

![vagrant box](../../img/VBOx-Portforwaring-550x293-300x160.png)

###  7\. Test SSH:

Jetzt können wir uns testweise per SSH einlogen

```bash
you@host$ ssh -p 2222 vagrant@127.0.0.1
```

###  8\. Installieren von Software für die Box

```bash
vagrant@vagrant-centos7$ yum install nano wget gcc bzip2 make kernel-devel-`uname -r`
```

###  9\. Instalierne der VirtualBox Gäste Tools  

Als erstes solltest du das [passende Paket herunterladen](httpss://virtualbox.org/wiki/Downloads). Binde das Iso file unter "Geräte => Optische Laufwerke => Abild auswählen" aus. Dann moute es folgendermassen.

```bash
mount -r /dev/cdrom /media
```
Binde das EPEL Repository auf dem Host ein `rpm -Uvh https://dl.fedoraproject.org/pub/epel/7/x86_64/e/epel-release-7-5.noarch.rpm` und installiere die folgende Pakete `yum install gcc kernel-devel kernel-headers dkms make bzip2 perl` und erstelle die KERN_DIR environment variable `KERN_DIR=/usr/src/kernels/`uname -r` export KERN_DIR` Jetzt kannst du die Gäste Erweiterung installieren und danach rebooten `./VBoxLinuxAdditions.run && reboot`

### 10\. Füge den Benutzer Vagrant der Gruppe Admin hinzu:

```bash
vagrant@vagrant-centos7$ groupadd admin
vagrant@vagrant-centos7$ usermod -G admin vagrant
```
### 11\. sudoers Datei

Passe die sudoers Datei folgendermassen an:

`Add SSH_AUTH_SOCK to the env_keep option Comment out the Defaults requiretty line Add the line %admin ALL=NOPASSWD: ALL`

Der Benutzer Vagrant sollte jetzt in der Lage sein das sudo Kommando ohne Passwort Abfrage zu verwenden

```bash
vagrant@vagrant-centos62$ sudo ls
```

###  12. Public key von vagrant hinzufügen

Füge den Public key von vagrant hinzu, damit sich der User vagrant ohne Passwort per SSH verbinden kann. Wird für das Kommando `vagrant ssh` gebraucht.

```bash
vagrant@vagrant-centos7$ mkdir .ssh
vagrant@vagrant-centos7$ curl -k httpss://raw.github.com/mitchellh/vagrant/master/keys/vagrant.pub > .ssh/authorized_keys vagrant@vagrant-centos7$ chmod 0700 .ssh
vagrant@vagrant-centos7$ chmod 0600 .ssh/authorized_keys
```

### 13\. Das Netzwerkinterface anpassen

```bash
vagrant@vagrant-centos62$ nano /etc/sysconfig/network-scripts/ifcfg-eth0
```

`ONBOOT=no`

anpassen zu

`ONBOOT=yes NM_CONTROLLED=yes BOOTPROTO=dhcp`

### 14\. Cleanup & Packen der Box

Zum Abschluss räumern wir in der VM noch etwas auf und packen die Vagrant Base-Box.

```bash
vagrant@vagrant-centos62$ sudo yum clean all && sudo halt
```

```bash
alex@host$ vagrant package --output centos7.box --base centos7_default_1434544491721_62573
alex@host$ vagrant box add centos7 centos7.box
```

**!!! ACHTUNG** Der Name der hinter **--base**; sollte identisch sein mit dem Namen der VM in Virtual Box.

![centos_base_box_export](../../img/centos_base_box_export.webp)

Du solltest jetzt die neu erstellte Vagrant Base-Box in der Liste der Boxen in vagrant finden.

```bash
alex@host$ vagrant box list centos7.box
```

Ab hier kannst du in jedem Ordner ganz einfach eine neue VM kreieren.

```bash
alex@host$ /home/user/my_vm $ vagrant init centos7
alex@host$ /home/user/my_vm $ vagrant up
alex@host$ /home/user/my_vm $ vagrant ssh
```

### 15\. Nutzen der Box auf anderen Maschinen

Um die VM auf einer neuen Maschine nutzen zu können kopiere dir die Datei centos7.box dorthin und führe folgende Schritte aus.

```bash
alex@otherhost$ /home/user/my_vm $ vagrant box add centos7 centos7.box
alex@otherhost$ /home/user/my_vm $ vagrant init centos7
alex@otherhost$ /home/user/my_vm $ vagrant up
alex@otherhost$ /home/user/my_vm $ vagrant ssh
```

E Voilà. Das wars. Jetzt hast du eie Base Box die du als Grundlage für deine Tests benutzen kannst.
