---
layout: post
title: Apache entfernen X-Powered-By Header
subtitle: In u.g. Response Header des Apache sieht man neben der Versionsnummer des Apache zusätzlich die der installierten OpenSSL Version und die PHP Version. Dies bietet Angreifern zusätzlich Informaitonen über möglicherweise auszunutzende Lücken.
tags: [Apache X-Powered-By Header Versionsnummer OpenSSL Version PHP Version Serverversionsnummer Apache/2.4.29]
---

# Apache entfernen X-Powered-By Header
In u.g. Response Header des Apache sieht man neben der Versionsnummer des Apache zusätzlich die der installierten OpenSSL Version und die PHP Version. Dies bietet Angreifern zusätzlich Informaitonen über möglicherweise auszunutzende Lücken. Wir beschreiebn hier wie man diese Informationen verstecken kann. Dies gewährleisted nicht die Sicherheit, macht es aber Angreifern schwerer.

```
curl -I https://www.elastic2ls.com/
HTTP/1.1 200 OK
Date: Mon, 04 Feb 2019 12:46:26 GMT
Server: Apache/2.2.19 (Unix) OpenSSL/0.9
X-Powered-By: PHP/7.0.12
Link: <https://www.elastic2ls.com/wp-json/>; rel="https://api.w.org/"
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=31536000
Connection: keep-alive
Cache-Control: max-age=0, no-cache
Content-Type: text/html; charset=UTF-8
```

### Lösungen

in der httpd.conf des Apache folgendes konfigurieren und danach den Apache Webserver neu starten.

```
ServerTokens Prod
ServerSignature Off
```

### Ergebniss

```
HTTP/1.1 200 OK
Date: Mon, 04 Feb 2019 12:47:38 GMT
Server: Apache
X-Powered-By: PHP/7.0.27
Link: <https://www.elastic2ls.com/wp-json/>; rel="https://api.w.org/"
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=31536000
Connection: keep-alive
Cache-Control: max-age=0, no-cache
Content-Type: text/html; charset=UTF-8
```

Hier sieht man nun, dass die Anzeige der Serverversionsnummer Apache/2.4.29 (Unix) OpenSSL/1.0.2n nicht mehr angezeigt wird.

### nächster Schritt

```
Header always unset "X-Powered-By"
Header unset "X-Powered-By"
```

### Ergebniss

```
HTTP/1.1 200 OK
Date: Mon, 04 Feb 2019 12:50:35 GMT
Server: Apache
Link: <https://www.elastic2ls.com/wp-json/>; rel="https://api.w.org/"
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=31536000
Connection: keep-alive
Cache-Control: max-age=0, no-cache
Content-Type: text/html; charset=UTF-8
```

Nun ist auch der Header X-Powered-By: PHP/7.0.27 verschwunden.
