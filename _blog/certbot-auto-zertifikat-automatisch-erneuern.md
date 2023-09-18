---
layout: post
title: Certbot-auto zertifikat automatisch erneuern
subtitle: Autoupdate Letsencrypt Script Die Zertifikatserneuerung gestalltet sich als recht einfach, wenn die Webserverconfiguration angepasst wurde um das Zertifikatssetup zu integrieren.
keywords: [Autoupdate certbot-auto Letsencrypt SSL Zertifikat bitnami reload Apache SSLCertificateFile SSLCertificateKeyFile SSLCACertificateFile]
categories: [Sicherheit]
---
# {{ page.title }}

![Letsencrypt](../../img/letsencrypt-card.webp)

Autoupdate Letsencrypt Script: Die Zertifikatserneuerung gestalltet sich als recht einfach, wenn die Webserverconfiguration angepasst wurde um das Zertifikatssetup zu integrieren.

```
00 02 * * 0 /usr/local/sbin/certbot-auto renew
00 02 * * 0 /usr/bin/systemctl reload nginx
```

Der Crontab startet nun um 2:00 Uhr jeden Sonntag und versucht das Zertifikat zu erneuern. Wenn es nicht nötig ist wird es nicht erneuert. Da in meinem Setup das Einbinden in die Webserverkonfiuration nicht machber war, da es ein vorgefertigter Stack von Bitnami ist, sieht mein Script um das Zertifikat auszutauschen etwas anders aus.

```
#!/bin/bash
cd /opt/bitnami/letsencrypt/
#renew certificate
sudo ./certbot-auto certonly --webroot -w /opt/bitnami/apps/wordpress/htdocs/ -d dev.elastic2ls.com

#unlink the previus certificate
sudo unlink /opt/bitnami/apacha/conf/server.crt

#link the new certificate
sudo ln -s /etc/letsencrypt/live/dev.elastic2ls.com/privkey.pem /opt/bitnami/apache2/conf/server.crt

#unlink the previus private key
sudo unlink /opt/bitnami/apache2/conf/server.keysudo

#link the new private key
sudo ln -s /etc/letsencrypt/live/dev.elastic2ls.com/privkey.pem /opt/bitnami/apache2/conf/server.key

#restart the webserver
/opt/bitnami/ctlscript.sh restart apache
```

Der Crontab Eintrag:

```
00 2 * * 0 root cd /opt/bitnami/letsencrypt/ && ./updatecert.sh
```

UPDATE: Die elegantere Lösung ist es im Apache die Pfade für die Zertifikate usw anzupassen.

```
# Let's Encrypt
SSLCertificateFile "/etc/letsencrypt/live/example.com/fullchain.pem"
SSLCertificateKeyFile "/etc/letsencrypt/live/example.com/privkey.pem"
SSLCACertificateFile "/etc/letsencrypt/live/example.com/fullchain.pem"
```
