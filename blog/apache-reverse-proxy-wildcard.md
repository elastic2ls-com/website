---
layout: post
title: Apache entfernen X-Powered-By Header
subtitle: Wenn man z.B. im Zuge einer Webseitenrestrukturierung die alten Url's weiterleiten muss und man nicht alle einzeln per ProxyPass und ProxyPassReverse eintragen will geht das am einfachsten und schnellsten geht es wenn man alle Url's per Wildcard durch den Proxy weiterleitet.
tags: [Apache ProxyPass ProxyPassReverse RewriteRule Webseitenrestrukturierung Wildcard Proxy Serverversionsnummer Apache/2.4.29]
---
# {{ page.title }}

![apache-logo](https://www.elastic2ls.com/wp-content/uploads/2017/01/apache-logo-300x300.png)

Wenn man z.B. im Zuge einer Webseitenrestrukturierung die alten Url's weiterleiten muss und man nicht alle einzeln per ProxyPass und ProxyPassReverse eintragen will geht das am einfachsten und schnellsten geht es wenn man alle Url's per Wildcard durch den Proxy weiterleitet.

```
ProxyPass / https://www.elastic2ls.com/ ProxyPassReverse / https://www.elastic2ls.com/ RewriteRule ^/(.*) https://www.elastic2ls.com/$1 [P,L]
```
