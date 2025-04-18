---
layout: post
title: Apache ErrorDocument
subtitle: Wichtig um Apache ErrorDocument zu verwenden ist, dass die Angabe relativ zur DocumentRoot ist. D.h in unserem Fall wollen wir für die deutsche Sprachversion unserer Seite.
keywords: [Apache ErrorDocument DocumentRoot Fehlerdokument Serverversionsnummer Apache/2.4.29]
categories: [Old]
---
# {{ page.title }}

![apache-logo](../../img/apache-logo-300x300.webp)         

Wichtig um Apache ErrorDocument zu verwenden ist, dass die Angabe relativ zur DocumentRoot ist. D.h in unserem Fall wollen wir für die deutsche Sprachversion unserer Seite ein eigenes Fehlerdokument ausgeben. Konkret:

```
DocumentRoot /var/www/html/site/
```

so liegt das Fehlerdokument unter

```
/var/www/html/site/de/404_de.html
```

Also muss der Pfad

```
/de/404_de.html
```

angegeben werden.

## Zwei konkrete Beispiele:

```
<Directory "/var/www/html/site/de/" >
  ErrorDocument 404 /de/404_de.html
```

oder der Directory Pfad relativ zum DocumentRoot

```  
ErrorDocument 404 /de/404_de.html
```

Wenn man z.B. den Pfad falsch angibt:

```
ErrorDocument 404 /404_de.html
```

Sieht man das im Errorlog folgendermassen:

```
s[Tue Jan 30 12:12:40 2018] [error] [client x.x.x.x] File does not exist: /var/www/html/404_de.html
```
