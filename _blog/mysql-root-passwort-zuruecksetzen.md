---
layout: post
title: MySQL-root-Passwort zurücksetzen
subtitle:  Ärgerlich wird es wenn man das MySQL-root-Passwort vergessen hat oder aus anderen Gründen der Login nicht funktioniert.
keywords: [MySQL root Passwort zurücksetzen Sicherheit]
categories: [Howtos]
---
# {{ page.title }}

![MySQL](../../img/MySQL_logo_small.png)

Wir kennen alle das Problem, vor langer Zeit haben wir einen MySQL-Server eingerichtet. Nun suchen wir den Root Zugang und weil wir dieses Passwort auf unerklärliche Weise verloren haben, können wir nicht mehr als Admin auf diese Datenbank zugreifen. Mit diesem kurzen Beitrag möchte ich euch nun bei diesem Problem abhelfen. Diese Anleitung basiert auf Debian 6.

Um das Passwort zu ändern müssen wir unseren MySQL Server stoppen und diesen anschliessend in einen Safe-Mode versetzen bei welchem wir keine Passwörter zur Authentifizierung brauchen. Dies geht mit folgenden 2 Befehlen:

![MySQL-root-Passwort zurücksetzen](../../img//mysql_passwort_reset1.png)

Der MySQL-Server ist nun sozusagen im Wachkomma. Wir öffnen uns eine 2te SSH Session und loggen uns als MySQL-root ein, und benutzen den MySQL Query um das MySQL-root-Passwort zu ändern. Danach Flushen wir die Privilegien und beenden diese 2te Session wieder.

![MySQL-root-Passwort zurücksetzen](../../img//mysql_passwort_reset2.png)

Nun können wir in der ersten Session in welcher wir den Server im Safe-Mode gestartet haben wieder beenden entweder wir killen den Prozess über die Prozessliste in einer 2ten Session oder wir benutzen einfach **STRG + C** um den Prozess zu beenden. Danach können wir den MySQL Server wieder starten und uns mit unserem neuen MySQL-root-Passwort einloggen.

```
/etc/init.d/mysql start
```
