---
layout: post
title: root-Passwort in Ubuntu zurücksetzen
subtitle:  Wie setzt man das Root Passwort in einem Ubuntu System zurücksetzt wenn man es vergessen hat. Es ist zwar ärgerlich aber auch kein grossen Aufwand.
keywords: [Ubuntu root Passwort Recovery grub2]
categories: [Howtos]
---
# {{ page.title }}


Wie setzt man das root-Passwort in einem Ubuntu System zurücksetzt wenn man es vergessen hat. Es ist zwar ärgerlich aber auch kein grossen Aufwand. Man sollte besonnen und ruhig den Schritten dieser Anleitung folgen.

### 1\. Schritt 1 - Reboot ins GRUB2 boot Menü

Als erstes rebooten wir das System um in das Grub2 Boot Loader Menü zu gelangen. Dazu am Anfang des Boot Vorgangs **"e"** drücken.  

### 2\. Schritt 2 - Modifizieren der Boot Optionen

Dazu öffnen wir im Editor unserer Wahl **/boot/grub/grub.cfg**
Suche nach der Zeile welche mit GRUB_CMDLINE_LINUX=  anfängt und ergänze folgendermassen

```
GRUB_CMDLINE_LINUX=init=/bin/bash
```

### 3\. Schritt 3 - Boote das System

Nach dem Neustart bist du als Root eingelogt.

### 4\. Schritt 4 - Setzte das root-Passwort neu

Nun mountest do das root filesystem remount im read write Modus setzt per passwd das Root Passwort neu und rebootest die Maschine.

```
# mount -o remount,rw /
# passwd
# reboot -f
```

### 5\. Schritt 5 - Login mit deinem neuen root-Passwort

Nach einem erneuten Neustart des Systems kannst du dich mit dem neu vergebenen root-Passwort einloggen.
