---
layout: post
title: Watchguard vpn client Linux
subtitle:  Um Watchguard-VPN mit Linux nutzen steht kein fertiges Paket wier unter Windows zur Verfügung. Da aber auf der Watchguard ein OpenVPN Server läuft können ...
keywords: [Watchguard vpn client Linux OpenVPN]
categories: [Sicherheit]
---
# {{ page.title }}

Um Watchguard-VPN mit Linux nutzen, steht einem leider kein fertiges Watchguard-VPN Paket zur Verfügung wie unter Windows. Hier muss man sich über Umwege helfen. Ein grosser Vorteil ist das auf der Watchguard Firewall ein OpenVPN Server läuft. Wer sich schon mal mit OpenVPN beschäftigt hat kennt die Logmeldungen die man auf Windows im VPN Client beim Einlogen sehen kann. Das ist im Folgenden sehr hilfreich.

![WGsslclient](https://www.elastic2ls.com/wp-content/uploads/2015/11/WGsslclient-300x218.jpg)

![Watchguard](https://www.elastic2ls.com/wp-content/uploads/2015/11/Watchguard.jpg)

### Client Paket von der Firewall herunterladen

Als erstes besorgen wir uns die Datei client.wgssl von unserer Watchguard Firebox. Diese Datei kann man einfach direkt von der Firewall herunterladen:

[https://firebox:4100/?action=sslvpn_download&filename=client.wgssl&username=my_name&password=my_password](https://firebox:4100/?action=sslvpn_download&filename=client.wgssl&username=my_name&password=my_password)

Wobei wir folgende Werte anpassen:

*   _firebox=URL oder IP Adresse deiner Watchguard Firewall_
*   _username=dein Username_
*   _password=dein Passwort_

> PS: Es ist möglich über oben genannten Link die Client Installer für Windows oder Mac herunter zu laden.

*   Windows **_WG-MVPN-SSL.exe_**
*   Mac **_WG-MVPN-SSL.dmg_**

### Entpacken der Datei

Die Datei benennen wir in in client.wgssl.tgz um und schon kann man sie mit **tar -xvzf client.wgssl.tgz** entpacken. Folgende Dateien sind erhalten:

*   ca.crt
*   client.crt
*   client.pem
*   client.ovpn
*   VERSION
*   MD5SUM

### DNS Einstellungen automatisieren

#### Das Paket resolvconf installieren.

```
#apt-get install resolvconf
```

oder

```
#yum install resolfconf
```

#### Anpassen der Datei client.ovpn:

```
dev tun
client proto tcp-client
ca ca.crt
cert client.crt
key client.pem
tls-remote "/O=WatchGuard_Technologies/OU=Fireware/CN=Fireware_SSLVPN_Server"
remote-cert-eku "TLS Web Server Authentication"
remote x.x.x.x 443
persist-key
persist-tun
verb 1
mute 20
keepalive 8 120
cipher AES-256-CBC
auth SHA1 float 1 reneg-sec 0
nobind
mute-replay-warnings
auth-user-pass pull
```

#### Hier fügen wir folgende Optionen hinzu:

```
dhcp-option DNS 192.168.x.x
dhcp-option DNS 192.168.x.x
dhcp-option DOMAIN deinedomain.tld
up /etc/openvpn/update-resolv-conf
down /etc/openvpn/update-resolv-conf
```

#### Den Tunnel bauen wir nun so auf:

```
#openvpn /etc/openvpn/client.ovpn
```
Das könnten wir z.B. in ein Script packen, welches wir für den Start verwenden können.

Es wird hier nun der Username sowie das Passwort abgefragt. Natürlich kann man die Verbindung auch über einen VPN Client oder den Network-Manager aufbauen.
