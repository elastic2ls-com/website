---
layout: post
title: ESXi - SSH Login ohne Passwort
subtitle:  Der SSH Login in den ESXI ist eine sehr praktische Sache. Einziges Manko und duchaus nervig ist die ständige Abfrage des Passwortes beim Login. Auch aus Sicherheitssicht ist ein Login mittels eines SSH Keys von Vorteil. Um in den  Host per SSH zu gelangen und zwar ohne Passwort mittels SSH-Key ist folgendes nötig.
keywords: [Passwortloser SSH Login ESXI Sicherheit /etc/ssh/keys-root/authorized_keys /sbin/auto-backup.sh]
---
# {{ page.title }}

Der SSH Login in den ESXI ist eine sehr praktische Sache. Einziges Manko und duchaus nervig ist die ständige Abfrage des Passwortes beim Login. Auch aus Sicherheitssicht ist ein Login mittels eines SSH Keys von Vorteil. Um in den Host per SSH zu gelangen und zwar ohne Passwort mittels SSH-Key ist folgendes nötig.

```
>cat ~/.ssh/id_rsa.pub | ssh root@esxi cat &gt; /etc/ssh/keys-root/authorized_keys
```

alternativ könnt ihr euch den Key auch direkt auf den Host kopieren und danach in einem zweiten Schritt diesen in die Datei `/etc/ssh/keys-root/authorized_keys` eintragen. Normalerweise sind solche Änderungen am ESXi nicht persistent, daher müssen wir dafür sorgen das die Änderung dauerhaft gespeichert wird. Es gibt hier zwei einfache Möglichkeiten. Generell wird die Konfiguration des ESXI's von einem Backupscript `/sbin/auto-backup.sh` gesichert. Du kannst es einfach von "Hand" aufrufen. `/sbin/auto-backup.sh` oder abwarten bis das Script vom Crondaemon aufgerufen wird.


![ESXI](https://www.elastic2ls.com/wp-content/uploads/2015/06/ESXI_Screen1-300x55.png)


Das wars. Jetzt noch ein Trick für Fortgeschrittene:

## rsync auf dem ESXI

Da der ESXi-Host z.B. kein rsync von Haus aus mitbringt, ich dieses aber praktischerweise dazu brauche um Maschinen vom jeweiligen Host wegzusichern, muss man üner einen Umweg gehen um diese dauerhaft zu speichern. Binaries müssen auf einem persistenten Volume gespeichert werden. Das wäre zum Beispeil ein belibigen Datastore auf dem ESXi -Host sein.

![ESXI](https://www.elastic2ls.com/wp-content/uploads/2015/06/esxi_datastore-300x133.png)

```>mkdir /volumes/datastore1/bin```

Dann kopieren wir rsync hinein.

```>scp rsync root@esxi:/volumes/datastore1/bin```

Zum Abschluss muss folgende Zeile in /etc/rc.local eingetragen werden um bei einem Neustart des ESXi-Hosts das Rsync Binary wieder in das /bin Verzeichniss zu kopieren.

```>cp /vmfs/volumes/datastore1/bin/rsync /bin/rsync```

Abschliesend solltest du wie oben beim SSH Part die Konfiguration für den Neustart sichern.

```>/sbin/auto-backup.sh```
