---
layout: post
title: Elementary OS Freya
subtitle:  Ein schickes Linux Mit ElementaryOS Freya haben die ElementaryOS-Entwickler eine neue Version ihrer eleganten Linux-Distribution veröffentlicht.
keywords: [Elementary Linux Freya Linux-Distribution Ubuntu 14.04 Pantheon-Desktop Slingshot Wingpanel UEFI Installationserfahrungen software-properties-gtk elementary-tweaks]
categories: [LinuxDesktop]
---
# {{ page.title }}

Mit ElementaryOS Freya haben die ElementaryOS-Entwickler eine neue Version ihrer eleganten Linux-Distribution auf Basis von Ubuntu 14.04 veröffentlicht. Nach rund eineinhalb Jahren Entwicklungszeit haben die ElementaryOS-Entwickler die neue Version 0.3 ihrer Linux-Distribution Namens "Freya" veröffentlicht. Die Vorversion "Luna" war im August 2013 freigegeben worden und hat sich mit ihrem eleganten Pantheon-Desktop eine eigene Fangemeinde erarbeitet. Auf ihrer ebenfalls neuen Website preisen die Entwickler ElementaryOS 0.3 Freya als schnellen und offenen Ersatz für Windows und OS X an. Als Basis nutzt die Linux-Distribution das langzeitunterstützte Ubuntu 14.04 und dessen Paketquellen, die zwei eigene Paketquellen ergänzen. Auf dem Desktop kommt die Eigenentwicklung Pantheon mit dem Gala-Windowmanager zum Einsatz. An Icons und anderen Desktop-Details hat das ElementaryOS-Team weiter gefeilt und platzsparende Gtk-Headerbars ins Design integriert. Dazu liefert ElementaryOS Freya die neuere Gtk-Version 3.14 mit. Das Anwendungsmenü Slingshot im Wingpanel unterstützt jetzt auch Quicklists, die es in Form kurzer Kontextmenüs zeigt. Pantheon wurde mit einem neuen Benachrichtigungssystem ausgestattet, das sich über die Systemeinstellungen konfigurieren lässt. Der hier integrierte "Nicht stören"-Modus schaltet die Benachrichtigungen auf Wunsch komplett ab. Einige Einstellungsdialoge wurden neu gestaltet sowie Lock Screen und Anmeldebildschirm vereinheitlicht. ElementaryOS Freya unterstützt erstmals UEFI Secure Boot. Als Kernel ist Linux 3.16 an Bord.

![ElementaryOS Freya](../../img/elemetary_freya_1.png){:height="52%" width="50%" .col-sm-12 .col-md-6}

![ElementaryOS Freya](../../img/Anwendungen-1024x640.png){:height="50%" width="50%" .col-sm-12 .col-md-6}

## Installationserfahrungen

Ich hatte beschlossen ElementaryOS Freya in der 64Bit Version in der neuen Version definitiv auf meinem "alten" Mac Book zu installieren. Um ElemetaryOS von einem USB Stick zu booten habe ich Unetbootin verwendet welches das [ISO Image](httpss://sourceforge.net/projects/elementaryos/files/stable/elementaryos-freya-amd64.20150411.iso/download) zuverlässig und einfach auf selbigem entpackt und den Stick letztendlich boot fähig macht. Nach dem Neustart des Mac's kann man bei gedrückte gehaltener ALT Taste im Boot Menü nun den Stick welcher als "Efi Boot" angezeigt wird auswählen und ElementaryOS booten. Wie gewohnt startet ein Live System oder man kann die Installation direkt aufrufen. Der Installer lehnt sich weitestgehend an den Ubuntu Installer an, so das man damit recht einfach zurecht kommen kann. Etwas schwierig stellte sich die Partitionierung heraus, da ich eigentlich ElementaryOS Freya neben OSX installieren wollte. Nach mehreren versuchen mit den verschiedenen Optionen u.a. des "händischen" anlegen von Partitionen entschloss ich mich OSX komplett zu löschen. Das half allerdings auch nicht weiter. Letztendlich blieb nur die Benutzung der Option mit LVM übrig und siehe da, das Problem war gelöst.

![ElementaryOS Freya](../../img/freya-partitioning.png){:height="50%" width="50%"}

## 1\. System update

Als erstes schauen wir das wir alle Software Repositories verwenden können. Dazu tippen wir folgendes ins Terminal. `sudo software-properties-gtk` Es öffnet sich ein Fenster in dem man auf dem Tab "Other Software" die zusätzlichen Paketquellen wie z.B. "Canonical Partners" hinzufügen kann. Beim schliessen des Fensters werden die Paketquellen normalerweise neu eingelesen. Bei mir ging das nicht.

![ElementaryOS Freya](../../img/Software-Updates_007-300x241.png)

Danach muss folgende Zeile im Terminal eingegeben werden. `sudo apt-get update && sudo apt-get upgrade && sudo apt-get dist-upgrade` Der erste Teil vor && veranlasst das die Paketquellen nochmals eingelesen werden. Der mittlere Teil sorgt dafür das die aktuell installierten Pakete erneuert werden und der letzte Teil nach && sorgt schliesslich dafür das die zugrunde liegende Ubuntu Distribution falls nötig ein komplettes Update erfährt.

## 2\. Firefox

ElementaryOS Freya wird standardmässig mit Midori als Browser. Da Midori zwar schnell aber nicht besonders reich an Features ist und ich ausserdem Firefox lieber mag ist der Erste Schritt Firefox über das Softwarecenter zu installieren. Midori kann man leider nicht über das Software Center deinstallieren also hilft nur der Weg über die Befehlszeile im Terminal.


![ElementaryOS Freya](../../img/Software-Center_006-300x188.png)

`apt-get remove midori-granite` Zusätzlich kann man Firefox noch weiter an ElementaryOS optisch angleichen. Dazu kann man folgende Firefox Erweiterung installieren.

[https://addons.mozilla.org/en-US/firefox/addon/elementary-firefox/](https://addons.mozilla.org/en-US/firefox/addon/elementary-firefox/)

## 3\. Anpassungen für Firefox

Es gibt eine Funktion die es aus irgend einem Grund im Firefox in Linux nicht aktiviert gibt, die aber duchaus praktisch ist, die Backspace Taste um damit seitenweise im Firefox zurück zu blättern. Hier hilft es `about:config` in die Addresszeile des Browsers einzugeben. Sucht dann nach dem Eintrag `browser.backspace_action` und setzt dessen Inhalt mit einem Doppelklick auf "0" erhält die Backspace-Taste ihre Funktion zurück.


![ElementaryOS Freya](../../img/aboutconfig-Mozilla-Firefox_002-300x179.png)

Flash für Firefox: `sudo apt-get install adobe-flashplugin && sudo apt-get install icedtea-plugin`

## 4\. Thunderbird

Das Emailprogramm Geary welches verwendet wird ist sehr fehlerbehaftet und daher ist es meine Empfehlung dieses durch Thunderbird zu ersetzen. Beides kann über das Software Center de/installiert werden.


![ElementaryOS Freya](../../img/Software-Center_006-300x188.png)

## 5\. Office Paket

Leider wird in ElementaryOS Freya kein Office Paket direkt mit ausgeliefert. Das sollte aber kein Problem sein. Ich verwende die Libre Office Suite es steht aber auch Openoffice im Software Center zur Verfügung.


![ElementaryOS Freya](../../img/Software-Center_006-300x188.png)

## 6\. Skype

Da wir arbeitsbedingt viel mittels Skype komunizieren habe ich mir das passende Paket [hier](httpss://www.skype.com/de/download-skype/skype-for-linux/) herunter geladen. Es gibt dort offiziell nur ein Paket für Ubuntu 12.04 welches wir aber für uns ohne weitere Probleme verwenden können.


![ElementaryOS Freya](../../img/Skype-für-iPod-Touch-herunterladen-Mozilla-Firefox_011-300x179.png)

## 7\. Teamdrive

Teamdrive ist eine Cloud Speicher wie Dropbox. Teamdrive liefert einen ähnlichen Funktionsumfang. Zu finden ist das Paket [hier](https://archiv.teamdrive.net/de/download.html).


![ElementaryOS Freya](../../img/TeamDrive-3-Downloads-TeamDrive-Mozilla-Firefox_012-300x179.png)

## 8\. Tweaks

Damit wir noch etwas mehr Kontrolle über die Oberfläche, das heisst die Symbole, die Fensteranordnung und ähnliches bekommen gibt es die Möglichkeit sogenannte Tweaks nach zu installieren. `sudo add-apt-repository ppa:versable/elementary-tweaks-isis sudo apt-get update sudo apt-get install elementary-tweaks` Das funktionierte in der Vorgänger Version "Luna" sehr einfach. In der aktuellen Version von ElementaryOS muss man, damit die Tweak Option in den Systemeinstellungen angezeigt wird zusätzlich noch folgendes tun. `sudo pantheon-files /usr/share/glib-2.0/schemas` Es öffnet sich ein Fenster in welchem man die Datei "org.gnome.desktop.interface.gschema.xml" editieren muss. Dort muss folgendes zwischen `< schema > < /schema >` eingefügt werden.

```
<key type="b" name="ubuntu-overlay-scrollbars"> <default>true</default> <summary>Meow</summary> < description>lol</description> </key>
```
 Abschliesend müsst ihr das ins Terminal eingeben:

 ```
 sudo glib-compile-schemas /usr/share/glib-2.0/schemas && sudo rm ~/.config/dconf/user
 ``` und das Betriebssystem neustarten.


![ElementaryOS Freya](../../img/Tweaks_017-300x179.png)

## 9\. VLC

Da ich lange Jahre an VLC gewöhnt bin als Standard Video Anwendung installieren wir in per Softwarecenter.


![ElementaryOS Freya](../../img/Software-Center_006-300x188.png)

## 10\. Anderes

Für den Artikel den ich übrigens auf dem hier beschriebenen System verfasst habe brauchte ich noch ein Screencapture tool. Hier habe ich Shutter installiert welches die Screenshot geliefert hat die ihr hier seht.

![ElementaryOS Freya](../../img/shutter_in_action.png)

## 11\. Windows Freigaben mounten

Da ich Musik über mein NAS hören wollte und die Freigaben entsprechend per SMB Windows Freigabe gemountet werden müssen habe ich folgendes probiert.

```mount -t cifs //192.168.0.60/share /home/user/Musik/ -o user=user```

mit der Fehlermeldung `mount: wrong fs type, bad option, bad superblock on //192.168.0.60/share/musik,` Dafür musste ich noch ein Paket installieren.

```apt-get install cifs-utils```

Um das ganze nun automatisch beim starten des Mac's zu mounten müssen wir folgendes tun. Wir editieren die fstab Datei `nano /etc/fstab` und fügen diesen Inhalt ein

```//192.168.0.60/share/musik /home/user/Musik/ cifs credentials=/home/user/.smbcredentials 0 0```

 Anschliesend erstellen wir die .smbcredentials Datei. ```nano /home/user/.smbcredentials``` ``` username=user password=geheim```

 Nun verbindet sich der Rechner nach jedem Neustart automatisch mit der Freigabe auf dem NAS
