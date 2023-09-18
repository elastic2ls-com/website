---
layout: post
title: Apache entfernen X-Powered-By Header
subtitle: Wenn man z.B. im Zuge einer Webseitenrestrukturierung die alten Url's weiterleiten muss und man nicht alle einzeln per ProxyPass und ProxyPassReverse eintragen will geht das am einfachsten und schnellsten geht es wenn man alle Url's per Wildcard durch den Proxy weiterleitet.
keywords: [Apache ProxyPass ProxyPassReverse RewriteRule Webseitenrestrukturierung Wildcard Proxy Serverversionsnummer Apache/2.4.29]
categories: [Howtos]
---
# {{ page.title }}

![apache-logo](../../img/apache-logo-300x300.webp)

Wenn man z.B. im Zuge einer Webseitenrestrukturierung die alten Url's weiterleiten muss und man nicht alle einzeln per ProxyPass und ProxyPassReverse eintragen will geht das am einfachsten und schnellsten geht es wenn man alle Url's per Wildcard durch den Proxy weiterleitet.

```
ProxyPass / https://www.elastic2ls.com/ ProxyPassReverse / https://www.elastic2ls.com/ RewriteRule ^/(.*) https://www.elastic2ls.com/$1 [P,L]
```
