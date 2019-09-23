---
layout: post
title: Watchguard vpn client  Mac OS
subtitle:  Wenn man Watchguard-VPN mit Mac OS nutzen will gibt es einen Client. Will man mit mehreren Backends arbeiten braucht es einen anderen Client. z.B. Tunnelblick.
keywords: [Watchguard vpn client  Mac OS OpenVPN Tunnelblick]
---
# {{ page.title }}

Wenn man Watchguard-VPN mit Mac OS nutzen will steht einem wie für Windows ein Watchguard zu Verfügung.

![Watchguard-VPN](https://www.elastic2ls.com/wp-content/uploads/2015/11/WGsslclient-300x218.jpg)

Wer aber mit mehreren Backends, also Firewalls, arbeiten möchte braucht einen anderen Client. Hier empfielt sich Tunnelblick.

![Watchguard-VPN](https://www.elastic2ls.com/wp-content/uploads/2015/11/tunnelblick-vpn-client-300x200.jpg)          

### Client Paket von der Firewall herunterladen

Als erstes besorgen wir uns die Datei client.wgssl von unserer Watchguard Firebox. Diese Datei kann man einfach direkt von der Firewall herunterladen: [https://firebox:4100/?action=sslvpn_download&filename=client.wgssl&username=my_name&password=my_password](https://firebox:4100/?action=sslvpn_download&filename=client.wgssl&username=my_name&password=my_password)

Wobei wir folgende Werte anpassen:

*   _firebox=URL oder IP Adresse deiner Watchguard Firewall_
*   _username=dein Username_
*   _password=dein Passwort_

[https://firebox:4100/?action=sslvpn_download&filename=client.wgssl&username=my_name&password=my_password](https://firebox:4100/?action=sslvpn_download&filename=client.wgssl&username=my_name&password=my_password)

### Entpacken der Datei

Die Datei benennen wir in in client.wgssl.tgz um und schon kann man sie mit **tar -xvzf client.wgssl.tgz** entpacken. Folgende Dateien sind erhalten:

*   ca.crt
*   client.crt
*   client.pem
*   client.ovpn
*   VERSION
*   MD5SUM

Wenn man nun Tunnelblick gestartet hat kann man die Zertifikate und Konfiguration über das _Kontextmenü => Optionen => Add a Configuration_ hinzufügen.

### Starten der Verbindung

Starten kann man das ganze nun über einen Klick auf Tunnelblick "Connect to **_Name of your Firewall_** ". Das OS fragt nun noch einmal ein Passwort des aktuellen Benutzers ab, beim Start. Dann erfolgt die eigentliche Benutzerauthentifizierung. Bei erfolgreicher Anmeldung sieht man das "Licht am Ende des Tunnels".
