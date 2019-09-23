---
layout: post
title: SSH Buffalo-Link-Station-Duo
subtitle:  Um SSH auf der Buffalo-Link-Station-Duo zu installieren sind folgende Schritte notwendig. Zuerst müsst ihr euch den ACP commander herunter laden.
keywords: [Buffalo-Link-Station-Duo ssh Pipline acp commander NAS]
---
# {{ page.title }}

Um SSH auf der Buffalo-Link-Station-Duo zu installieren müsst ihr zuerst euch den ACP commander herunter laden. Mit acp_commander.jar könnt ihr beliebige Befehle auf dem NAS ausführen als root. Ihr benötigt nur die IP-Adresse des NAS und das Passwort für den Admin-Benutzer.

![Buffalo-Link-Station-Duo](https://www.elastic2ls.com/wp-content/uploads/2016/05/linkstationduo.jpg)

## Download acp_commander

* [https://github.com/elastic2ls-awiechert/Buffalo_ssh/blob/master/acp_commander.jar](https://github.com/elastic2ls-awiechert/Buffalo_ssh/blob/master/acp_commander.jar)
* [https://download.discountnetz.com/tools/acp_commander.zip](https://download.discountnetz.com/tools/acp_commander.zip)


## enable SSH
Dann öffnen wir ein Terminal und tippen der Reihe nach unten genannte Befehle ab.

```
alex@storage:~ java -jar acp_commander.jar -t NAS_IP -ip NAS_IP -pw Youradminpassword -c "(echo newrootpass;echo newrootpass)|passwd"
```
```
alex@storage:~ java -jar acp_commander.jar -t NAS_IP -ip NAS_IP -pw Youradminpassword -c "echo 'UsePAM no' >> /etc/sshd_config" java -jar acp_commander.jar -t NAS_IP -ip NAS_IP -pw Youradminpassword -c "sed -i 's/PermitRootLogin no/PermitRootLogin yes/g' /etc/sshd_config" java -jar acp_commander.jar -t NAS_IP -ip NAS_IP -pw Youradminpassword -c "/usr/local/sbin/sshd"
```

ACHTUNG der letzer Befehl lautet auf der LS-WXL statt

`/usr/local/sbin/sshd`

`/usr/local/bin/sshd`

Zum Schluss füge ich aus Sicherheitsgründen noch meinen SSH key hinzu.

**Für Root**
```
alex@storage:~mkdir /root/.ssh
alex@storage:~vi /root/.ssh/authorized_keys
ssh-rsa AAAAB3NzaC...
```

**Für einen anderen Benutzer**

```
alex@storage:~mkdir /home/.ssh
alex@storage:~vi /home/.ssh/authorized_keys
ssh-rsa AAAAB3NzaC...
```


## Installation ipkg

Dann entpacken und noch Java mit **ipkg** installieren. Aber zuerst **ipkg** installieren.

```
cd /tmp
wget http://ipkg.nslu2-linux.org/feeds/optware/cs05q3armel/cross/stable/lspro-bootstrap_1.2-7_arm.xsh
sh ./lspro-bootstrap_1.2-7_arm.xsh
```

`HINWEIS: Wenn diese Seite verschwindet, können Sie sich das Archiv/ Verzeichnis in diesem Repository ansehen.`

## Installation NFS

```
# ipkg update
# ipkg install nfs-server
```
Um die Exports zu konfigurieren in folgende Datei die u.g. Beispiele hinzufügen.
`/opt/etc/exports`.  

```
/mnt/array1/backups 192.168.1.2(rw,sync)
/mnt/array1/share   192.168.1.2(rw,sync)
```

Dann den NFS Server neustarten.

```
/opt/etc/init.d/*nfs* stop
/opt/etc/init.d/*nfs* start
```

## Testen NFS

Von der IPadresse `192.168.1.2` solltest du folgende Exports sehen können.

```
alex@desktop:~# showmount -e 192.168.1.28
Export list for 192.168.1.28:
/mnt/array1/share   192.168.1.2
/mnt/array1/backups 192.168.1.2
```

## Mounten der NFS Shares

```
mkdir /home/alex/share
mount  -t nfs -o vers=2 192.168.1.28:/mnt/array1/share /home/alex/share
mkdir /home/alex/backups
mount  -t nfs -o vers=2 192.168.1.28:/mnt/array1/backups /home/alex/backups
```
## GITHUB:

### [https://github.com/elastic2ls-awiechert/Buffalo_ssh](https://github.com/elastic2ls-awiechert/Buffalo_ssh)
