---
layout: post
title: root-Passwort zurücksetzen in CentOS 7
subtitle:  Wie setzt man das Root Passwort in einem CentOS 7 System zurücksetzt wenn man es vergessen hat. Es ist zwar ärgerlich aber auch kein grossen Aufwand.
keywords: [CentOS root Passwort Recovery grub2]
---
# {{ page.title }}

Wenn man bisher das root-Passwort bei einem RHEL- CentOS-Systems zurücksetzen musste konnte man das bequem bis einschlieslich Version 6 in den Single User Modus booten und das Passwort einfach mittels `passwd` ändern.

Unter RHEL bzw. CentOS 7 muss man nun ähnlich wie bei anderen Distributionen verfahren. Beim Start des Systems gehen wir mittels drücken der Taste **E**  während des Bootvorgangs, in das GRUB-Menü und ändern den Eintrag, der mit dem Schlüsselwort **linux16** bzw. **linuxefi** beginnt. Hier müssen wir am Ende der Zeile ein `init=/bin/bash` eingeben. Sollten Einträge wie rhgb oder quiet in der Zeile stehen sollten diese entfernt werden damit man die System Meldungen sieht.

![root_passwort zurücksetzen](https://www.elastic2ls.com/wp-content/uploads/2015/06/centos7-init-sh.png)

Jetzt haben wir eine Root Shell ohne Passwort abfrage. Hier führen wir folgende Schritte aus um das System schreibend zu mounten und anschliesend mittels passwd ein neues root-Passwort zu setzen. Vor dem Reboot müssen wir noch sicherstellen, das der SELinux-Kontext für die Dateien nach dem Reboot richtig gestellt wird.

```
#mount -o remount,rw /
#passwd
#touch /.autorelabel
#exec /sbin/init
```
