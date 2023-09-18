---
layout: post
title: Owncloud mit thunderbird nutzen
subtitle: Dies ist ein Tutorial wie man mittels Owncloud die Kalender und Kontakte zwischen Rechnern und Mobiltelefonen syncronisieren kann.
keywords: [Owncloud thunderbird syncronisieren Mobiltelefonen Laptop Kalender Kontakte]
categories: [Howtos]
---
# {{ page.title }}

Mit Owncloud kann man primar seine eigene Cloud Infrastruktur aufbauen und das kombiniert mit der Sicherheit seine Daten nicht einem Anbieter wie Dropbox o.ä anzuvertrauen, da man die Installation auf jedem eigenen beliebigen Server aufbauen kann. Mein primäres Ziel in diesem Tutorial ist es die Kalender und Kontakte auf meinen Rechnern sowie meinem Mobiltelefon syncron zu halten, was ohne Owncloud doch eine ziemliche Nerverei ist/war. Ich zeige euch wie man die Installation durchführt, wie man die Verbindungen absicher kann und zum Schluss wie man die Kontakte und Kalender in Thunderbird. Auf die Einrichtung des Mobiletelefones gehe ich nicht weiter ein da das doch durchaus sehr unterschiedlich sein.

## 1\. Installation am Beispiel Debian
Füge das Download-Repository hinzu. Dies erfordert die Registrierung eines vertrauenswürdigen Schlüssels.
```
wget -nv https://download.owncloud.org/download/repositories/production/Debian_9.0/Release.key -O Release.key
apt-key add - < Release.key
```
Danach die sourcelist für apt-get speichern und das Paket òwncloud-files` installieren.

```
echo 'deb http://download.owncloud.org/download/repositories/production/Debian_9.0/ /' > /etc/apt/sources.list.d/owncloud.list
apt-get update
apt-get install owncloud-files
```

### 2\. Datenbankserver installieren

```
# apt-get update && apt-get install mariadb-server
```

### 3\. Datenbank einrichten

```
# mysql -uroot -pEINPASSWORT
MariaDB [(none)]> create database owncloud_db;
MariaDB [(none)]> create user 'ownclouduser'@'localhost' identified by 'EINPASSWORT';
MariaDB [(none)]> GRANT ALL ON owncloud_db.* to 'ownclouduser'@'localhost' IDENTIFIED BY 'EINPASSWORT';
MariaDB [(none)]> flush privileges;
```

### 4\. Webserver installieren

```
# apt-get install apache2 php5 libapache2-mod-php5 php5-gd php5-json php5-json php5 php5-mysql php5-curl php5-intl php5-mcrypt php5-imagick
```

### 5\. mit SSL Zertifikat absichern

Für diesen Test verwenden wir erst einmal das Standart Zertifikt von Ubuntu. Dazu aktivieren wir das SSL Modul:

```
# a2enmod ssl
```

und die Default SSL Konfiguration:

```
# a2ensite default-ssl
```

Anschliesend erstellen wir uns die Konfigurationsdatei owncloud.conf für den Webserver mit folgedem Inhalt:

```
# nano /etc/apache2/sites-available/owncloud.conf
```

```
Options Indexes FollowSymLinks
AllowOverride All
Order allow,deny
allow from all
```

Anschliesen aktivieren wir die Konfigurationsdatei:

```
# a2ensite owncloud.conf
```

und führen einen Reload des Apache Webservers durch damit die neue Konfiguration aktiviert wird.

```
# service apache2 reload
```

Der Apache nimmt nun mittels der Url **https://172.28.128.9/owncloud_web** Verbindungen über SSL an aber ebenso per **http://172.28.128.9/owncloud_web**. Um zu erreichen das alle unverschlüsselten http Verbindungen permanent auf https umgeleitet werden ist noch folgendes nötig. Als erstes aktivieren wir das Apache Modul `rewrite` und starten den Webserver neu

```
# a2enmod rewrite && service apache2 restart
```

Es gibt verschieden Wege das rewrite Modul zu nutzen um alle https Anfragen auf https umzuleiten. Da ich aber auschliesslich Anfragen an die Owncloud Instanz nach https umleiten will hier mein Weg. Im Owncloud Webordner befindet sich eine `.htaccess` Datei welche wir dafür benutzen können. Und zwar fügen wir zwischen `IfModule mod_rewrite.c` und `IfModule` folgende Zeilen ein:

```
RewriteEngine on
RewriteCond %{HTTPS} !=on
RewriteRule ^/?(.*) https://%{SERVER_NAME}/owncloud_web [R,L]
```

Ab nun sollten all Anfragen an die Url **http://127.28.128.9/owncloud_web** umgeleitet werden nach **https://172.28.128.9/owncloud_web**.

### 6\. Owncloud über Webinterface einrichten

Nehmen wir an wir haben die Owncloud Installation auf einer virtuellen Maschine installiert mit der Adresse 172.28.128.9. (Dies ist nicht bestandteil dieses Tutorials) Dazu öffnen wir die Seite **https://172.28.128.9/owncloud_web** in dem Browser der Wahl. Als erstes müssen wir ein Administratoren Konto anlegen z.B. admin mit dem Passwort owncloud. Dann müssen wir auf der selben Seite die Datenbank Parameter eingeben und zwar genau so wie oben beschrieben mit folgenden Werten:

```
 Datenbankserveradresse: `127.0.0.1`
 Datenbankname: `owncloud_db`
 Datenbankbenutzer: `ownclouduser`
 Datenbankpasswort: `passwort`
```

![owncloud_web_einrichtung](../../img/owncloud_web_einrichtung-300x222.webp)

## Einrichten in Thunderbird Kontakte und Kalender

### 1\. Kontakte

Als erstes laden wir den SOGo Connector für Mozilla Thunderbird herunter. wir laden die Datei über den Browser herunter. Zusaätzlich müssen wir noch das Plugin Lightning installieren.

![sogo_conect_tb2](../../img/sogo_conect_tb2-300x218.webp)

Dann öffnen wir über das Menü Extras -> Add-ons den Add-ons Manager von Thunderbird und wählen dort Add-on aus Datei installieren…

![sogo_connect_tb3](../../img/sogo_connect_tb3-300x49.webp)

Jetzt das Adressbuch öffnen und über _Datei -> Neu_ ein neues Remote-Adressbuch anlegen

![sogo_connect_tb4](../../img/sogo_connect_tb4-300x147.webp)

Dort muss ein Name für das Adressbuch vergeben werden und wir benötigen die CardDAV-Adresse der ownCloud Instanz. Um diese herauszufinden, gehen wir im ownCloud Fenster im Browser auf die App Kontakte. Die benötigte CardDAV-Adresse findest Du dort unten links unter dem Zahnrädchen und der Weltkugel.

![sogo_connect_tb5](../../img/sogo_connect_tb5.webp)

Nun können wir mit einem Rechtsklick auf das ownCloud Adressbuch die Synchronisation starten.

![sogo_connect_tb6](../../img/sogo_connect_tb6-300x164.webp)

Es erscheint ein Popup Fenster in dem die Anmeldedaten für das Adressbuch eingegeben werden müssen. Hier können wir auch einstellen, in welchem Interwall synchronisiert werden soll und welche Benachrichtigungen wir erhalten wollen. (Rechtsklick auf das Adressbuch -> _Eigenschaften_)

![sogo_connect_tb7](../../img/sogo_connect_tb7-300x167.webp)

### 2\. Kalender

Um den Kalender zu integrieren sind folgende Schritte notwendig. Als erstes müssen wir die Url herausfinden. Diese finden wir im Webinterface von owncloud.

![calendar_connect_tb3](../../img/calendar_connect_tb3.webp)

Dann öffnen wir in Thunderbird den Kalender -> Rechtsklick Neuer Kalender -> Im Netzwerk. Hier können wir die Url des Kalenders eingeben. ![calendar_connect_tb1](../../img/calendar_connect_tb1-300x223.webp)

Hier können wir die Url des Kalenders eingeben.

![calendar_connect_tb2](../../img/calendar_connect_tb2-300x219.webp)

Wenn wir auf Eigenschaften des Kalenders gehen können wir noch z.B. einstellen wie oft syncronisiert werden soll.

![calendar_connect_tb4](../../img/calendar_connect_tb4-300x179.webp)

## Einrichten im Mobil Telefon Kontakte und Kalender

Hier findet ihr recht aktuell wie das bewerkstelligt wird. [Konfiguration für Mobiletelefone](https://www.connect.de/ratgeber/konfiguration-caldav-und-carddav-1540275.html)
