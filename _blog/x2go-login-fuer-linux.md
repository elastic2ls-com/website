---
layout: post
title: x2go - sicherer Remote Login für Linux
subtitle:  x2go - Machmal hilft es nicht per SSH auf einen Linux Sytem zu zugreifen. Einige Anwendungen benötigen eine grafische Oberfläche zur Konfiguration.
keywords: [x2go sicherer Remote Login Linux grafische Oberfläche]
categories: [Sicherheit]
---
# {{ page.title }}

## x2go - sicher Fernsteuern

## Einleitung

Machmal hilft es nicht ausschlieslich per SSH auf ein Linux Sytem remote zu zugreifen, da gibt es x2go. Es gibt einige Anwendungen die eine grafische Konfiguration benötigen. Dazu muss eine Desktop Umgebung vorhanden sein. Aber wie kommt man nun an diesen Desktop heran? VNC bietet sich an ist aber dadurch, dass es keine Verschüsselung anbietet nicht verwendbar über das Internet. Wir können eine Standardfunktion des SSH Dienstes nutzen mittels derer wir den Zugriff auf den Desktop per se verschlüsseln können. Der X-Server bietet eine Funktionalität um über ein TCP/IP Netzwerk betrieben werden zu können. Das können wir nutzen um auf die graphische Anwendung durch einen SSH Tunnel zuzugreifen. Die Optionen dazu heissen`X11Forwarding`. und ist Teil jeder OpenSSH Installation. Man muss lediglich den Wert falls noch nicht geschehen auf `yes` setzen oder das Kommentarzeichen davor entfernen. Das ist alles was wir auf der Remote Maschine brauchen. Auf der Maschine von der ich auf die Remote Maschine zugreifen will muss ein X-Server installiert werden.

> ACHTUNG!!! Die Bezeichnung für Client und Server sind beim X-Window-System etwas verwirrend, da die Begrifflichkeiten umgekehrt sind. D.h. die Maschine auf die ich Zugreife enthält den X-Client. Die Maschine auf der ich die grafische Oberfläche starte beinhaltet den X-Server. [Weitere Informatione findet ihr hier.](httpss://www.freebsd.org/doc/de_DE.ISO8859-1/books/handbook/x-understanding.html)

Wenn wir von einer Linux oder Unix Maschine kommmen ist das kein Problem, da diese Betriebssysteme den X Server gleich mitbringen. Um den Remote Zugriff zu vereinfachen bevorzuge ich X2Go Es gibt aber auch noch FreeNX oder gar das proprietäre NOMaschine. Im folgenden die notwendigen Schritte für verschiedene Linux Systeme.

## Konfiguration der Remote Linux Systeme

### Ubuntu14.04

#### Installation X2Go Server

```bash
apt-get install software-properties-common
apt-get install software-properties-common
add-apt-repository ppa:x2go/stable
apt-get update
apt-get install x2goserver x2goserver-xsession
```

### nutzbare Desktop Umgebungen

Vorab sei gesagt das der Zugriff auf den Desktop Gnome3 sowie Unity nicht möglich ist

#### Xfce

```bash
apt-get install xfdesktop4 xfdesktop4-data xfce4-session
```

#### KDE

```bash
apt-get install kde-plasma-desktop
```

#### Mate

```bash
apt-add-repository ppa:ubuntu-mate-dev/ppa
apt-add-repository ppa:ubuntu-mate-dev/trusty-mate
apt-get update && sudo apt-get upgrade
apt-get install --no-install-recommends ubuntu-mate-core ubuntu-mate-desktop
```

#### Cinnamon

```bash
add-apt-repository ppa:lestcape/cinnamon
apt-get update
apt-get install cinnamon mint-themes
```

**_stürzt ab und hinterlässt einen Fullscreen in schwarz_**

#### Lxde

```bash
apt-get install lxde
```

### Centos7

#### Installation X2Go Server

```bash
wget httpss://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
rpm -ihv epel-release-latest-7.noarch.rpm
wget -O /etc/yum.repos.d/x2go.repo https://download.opensuse.org/repositories/X11:/RemoteDesktop:/x2go/RHEL_6/X11:RemoteDesktop:x2go.repo
yum -y install x2goserver x2goserver-xsession
```

#### nutzbare Desktop Umgebungen

#### Xfce

```bash
yum -y groupinstall "Xfce"
```

#### KDE

```bash
yum -y groupinstall "kde"
```

#### Mate

```bash
yum install mate-desktop.x86_64 mate-settings-daemon
```

#### Cinnamon

```bash
yum install cinnamon-desktop.x86_64 cinnamon-settings-daemon.x86_64 cinnamon.x86_64 cinnamon-control-center.x86_64 cinnamon-session.x86_64
```

**_Stürzt ab und hat kein Startpanel._**  

### Debian

```bash
apt-get install x2goserver x2goserver-xsession
Paketlisten werden gelesen... Fertig
Abhängigkeitsbaum wird aufgebaut.
Statusinformationen werden eingelesen.... Fertig
Einige Pakete konnten nicht installiert werden. Das kann bedeuten, dass
Sie eine unmögliche Situation angefordert haben oder, wenn Sie die
Unstable-Distribution verwenden, dass einige erforderliche Pakete noch
nicht erstellt wurden oder Incoming noch nicht verlassen haben.
Die folgenden Informationen helfen Ihnen vielleicht, die Situation zu lösen:
Die folgenden Pakete haben unerfüllte Abhängigkeiten:
x2goserver : Hängt ab von: x2goagent (>= 2:3.5.0.25-0~) soll aber nicht installiert werden
E: Probleme können nicht korrigiert werden, Sie haben zurückgehaltene defekte Pakete.
```

Leider lies sich das Problem nicht umgehen, daher kann Debian7 nicht genutzt werden.

## Konfiguration in Windows

Wir installieren den X2Go Client auf der Windows Maschine. Danach können wir die Verbindung testen.

![x2go](../../img/x2go_001-550x666-248x300.webp)

Hierzu geben wir lediglich die IP-Adresse sowie den Benutzernamen ein sowie die zu verwendete Desktopumgebung.

![x2go](../../img/x2go_003-550x231-300x126.webp)

So sehen die Verbindungsdetails bei erfolgreicher Verbindung aus.

![x2go](../../img//x2go_RS_003-550x470-300x235.webp)

Und hier sehen wir den Ubuntu14.04 Mate Desktop. Der Zugriff ist über einen SSH Tunnel gesichert.

## Remote Support

Für den Remote Support muss zusätzlich noch das Paket `apt-get install x2godesktopsharing` installiert werden. Zu finden ist das installierte Paket in Ubuntu unter "Applications" => "Internet" => "X2GoDesktopSharing".

![x2go](../../img/x2go_RS_002-550x470-300x256.webp)

Aktiviert wird das ganze auf dem Symbol in der Anwendungsleiste.

![x2go](../../img/x2go_RS_002-550x4701-300x256.webp)

In X2Go müssen wir nun die Verbindungseinstellungen anpassen.

![x2go](../../img/x2go_RS_003-550x666-248x300.webp)

Wir erlauben den Vollzuggriff.

![x2go](../../img/x2go_RS_004-550x300-300x164.png)

Und jetzt haben wir vollen Zugriff auf den Desktop.

![x2go](../../img/x2go_RS_005-550x300-300x164.png)

## Zusammenfassung

Neben Wartungsarbeiten oder Installationen, die eine Grafische Oberfläche brauchen können wir das Tool als alternative zu Teamviewer oder ähnlichen proprietären Remote Support Lösungen gebrauchen. Die Einrichtung auf der "Server" Seite ist Standard, lediglich die Option für den SSH Dienst muss angepasst werden und eine Desktopumgebung installiert sein. Auf Windows Seite ist lediglich das X2Go Software Paket zu installieren. Insgesamt würde ich diese Lösung durchaus für Anfänger empfehlen.
