---
layout: post
title: Loading from master file managed-keys.bind failed
subtitle: Loading from master file managed-keys.bind failed
keywords: [bind named DNS master managed-keys.bind DNSSEC-Validierung]
---
# {{ page.title }}

In den Standard-Konfigurationsdateien des bind DNS Servers unter Debian Squeeze ist ein Fehler der diese Meldung verusacht: Loading from master file managed-keys.bind failed

Da die Root-Zone seit einiger Zeit signiert ist, ist die DNSSEC-Validierung bei Squeeze standardmäßig eingeschaltet.

Damit Bind die Signatur-Prüfung durchführen kann, braucht es eine Kopie des öffentlichen Schlüssels und die kann nicht über eine DNS-Abfrage bezogen werden. Diese Kopie des öffentlichen ISC-Schlüssels liegt in der Datei **/etc/bind/bind.keys**. Die Datei muss in der **/etc/bind/named.conf** verlinkt werden.
Hier ist die Standard-Version von Debian Squeeze:
```
include "/etc/bind/named.conf.options";
include "/etc/bind/named.conf.local";
include "/etc/bind/named.conf.default-zones";
```
Es fehlt folgende Zeile:
```
include "/etc/bind/bind.keys";
```
Danach wird die DNSSEC-Validierung einwandfrei funktionieren. Ein weiterer Schrit wird notwendig für Server, die keine IPv6-Anbindung haben. Bei aktiviertem IPSEC kontaktiert der bind DNS Server regelmäßig alle ihm bekannten Rootserver-IP Adressen auch die IPv6-Adressen. Dies führt u.a. zu oben genanntem Fehler im bind Log.

Um dies zu verhindern, kommentiert man einfach aus der Datei **/etc/bind/db.root** alle IPv6-Einträge aus.
