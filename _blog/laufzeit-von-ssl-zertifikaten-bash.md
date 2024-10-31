---
layout: post
title: Laufzeit von SSL Zertifikaten + Bash
subtitle:  Unten findet ihr ein Scrip um die Laufzeit von SSL Zertifikaten zu überprüfen. Erweitert habe ich es um eine Prüfung, wenn die Laufzeit weniger als 30 bzw. 7 Tage beträgt.
keywords: [SSL Zertifikaten Laufzeit Bash automatisieren Shellscript]
categories: [LinuxInside]
---
# {{ page.title }}

Unten findet ihr ein Scrip um die Laufzeit von SSL Zertifikaten zu überprüfen. Erweitert habe ich es um eine Prüfung, wenn die Laufzeit weniger als 30 bzw. 7 Tage beträgt.

```#!/bin/bash
set +e
for subdomains in $1
        do
                CERT=$(timeout --kill-after=5 > /dev/null 2>&1| openssl s_client -connect $subdomains:443 > /dev/null | sed -ne '/BEGIN CERT/,/END CERT/p' | openssl x509 -noout -text | grep -A2 Validity |grep "Not After"|awk {'print $4" "$5" "$7.'});
                if [ ! -z "$CERT" ]; then
                        echo "SSL certificate for ${subdomains[@]} is valid until $CERT."
                else
                        echo "No SSL Certificate found for ${subdomains[@]}."
                fi

                CERTRUNTIME=$(date -u -d "$CERT" +%s)
                CURRENTTME=$(date +%s)
                DAYSLEFT=$(($CERTRUNTIME-$CURRENTTME))
                COUNTTIME=$((DAYSLEFT / 86400))

                if [ $COUNTTIME -le 30 ]; then
                        echo "WARN: Certificate for ${subdomains[@]} less then 30 days valid. Certificate valid for $COUNTTIME days."
                        exit 1
                elif [ $COUNTTIME -le 7 ]; then
                        echo "ALERT: Certificate for ${subdomains[@]} less then 7 days valid. Certificate valid for $COUNTTIME days."
                        exit 1
                else
                        echo "OK: Certificate for ${subdomains[@]} valid for $COUNTTIME days."
                        exit 0
                fi

done
```

Der Aufruf erfolgt so gefolgt von der Ausgabe:

```
info@server:~/ssl-check$ ./check_ssl.sh www.elastic2ls.com
SSL certificate for www.elastic2ls.com is valid until Sep 22 2018.
OK: Certificate for www.elastic2ls.com valid for 74 days.
```

Git Repository: 

[https://github.com/elastic2ls-com/ssl-check.git](https://github.com/elastic2ls-com/ssl-check.git)
