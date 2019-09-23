---
layout: post
title: Journal rollforward failed journal out of synch with zone
subtitle:  Wenn der named Server den Start verweigert mit der folgenden Meldung in den Logs journal rollforward failed journal out of sync with zone
keywords: [named  bind  DNS journal nameserver]
categories: [dns]
---
# {{ page.title }}

Wenn der named Server den Start verweigert mit der folgenden Meldung in den Logs:

```
**Nov 11 09:15:11 fodns named[20264]: zone domain.com/IN: journal rollforward failed: journal out of sync with zone**

**Nov 11 09:19:45 fodns named[20291]: zone domain.com/IN: journal rollforward failed: journal out of sync with zone**
```

lösche die **/var/named/domain.tld.jnl** file und starte bind/named neu.
