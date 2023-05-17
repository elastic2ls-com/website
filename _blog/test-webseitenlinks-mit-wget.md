---
layout: post
title: Test Webseitenlinks mit WGET
subtitle:  Defekte Webseitenlinks entstehen, wenn eine Seite verschoben oder gar gelöscht wird. Es ist der Job des Webmasters diese defekten als erster Links zu finden.
keywords: [Test Webseitenlinks mit WGET]
categories: [Howtos]
---
# {{ page.title }}
## Einleitung

![wget](../../img/wget.webp)

Defekte Webseitenlinks entstehen, wenn eine Seite verschoben oder gar gelöscht wird. Es ist der Job des Webmasters diese defekten Webseitenlinks zu finden bevor ein Besucher oder eine Suchmaschinen es tun. Verzögerungen bei der Korrektur resultieren in einer schlechten User Erfahrung sowie möglichen Schaden für ihr Page ranking. Wenn deine Website aus mehr als ein "paar" Seiten besteht wird das manuelle prüfen unverhälniss massig aufwendig, aber es gibt einige Tools mit denen man diese Aufgabe automatisieren kann. Man kann webbasierende Tool wie die Google Webmaster Tools verwenden, aber es fehlt in der Regel zusätzliche Funktionen. Wenn deine Webseite Wordpress benutzt könntest du ein Plugin benutzen, aber manche Anbieter von gehosteten Webanwendungen verbieten das, da das Plugin ja auf dem selben Server läuft wie die Wordpress Installation und das testen der Links ist recht Ressourcen intensiv. Eine andere Option ist es ein Linux basierendes Programm auf einer seperaten Maschine zu benutzen. Die beinhalten neben rudimentären Webcrawlern wie `wget` oder spezialisierte Tool wie z.B. `linkchecker` oder `klinkstatus`. Diese sind hochgradig anpassbar und minimieren den negativen Einfluss auf die Antwortzeiten der Zielwebseite. Dieses Tutorial zeigt auf wie man `wget` dazu benutzen kann alle defekten Links auf einer Webseite zu finden, damit man diese reparieren kann.

## Voraussetzungen

Für unser Tutorial brauchen wir das Folgende:

*   Zwei Debian 7 VM's, Eine die, die Webseite zur verfügung stellt **(web)** und eine zweite auf welcher wir wget laufen lassen können **(test)**.
*   Auf der VM **(web)** muss kein LAMP stack installiert werden sondern es reicht lediglich die Installation des Apache Webservers.

Grundsätzlich sollte diese Tutorial für alle Linux Distributionen geneignet sein. Lediglich die Parameter zur Installation der Pakete sollte Distributionsspezifisch sein.

## Bereitstellen der Webseite

Als erstes müssen wir eine Bespielwebseite bauen die, die defekte Webseitenlinks enthält. Dazu loggen wir uns auf der VM **(web)** ein und installieren als erstes den Apache Webserver mittels:
```
apt-get update && apt-get install apache2
```

Dann gehen wir in das DocumentRoot Verzeichniss des Webservers
```
cd /var/www/
```

Jetzt erstellen wir eine HTML Datei mit den fehlerhaften Links. Ich verwende dafür `nano`, es sei aber jedem sein Lieblingseditor gegeben.
```
nano linktest.html
```

Am einfachsten kopierst du den folgenden Code in das Terminal. Dieser enhält ein sehr rudimenäre Webseite mit zwei defekten Links. Für deine_server_ip trage bitte die tatsächliche IP Adresse deiner VM ein.

```html
<html>
<head>
  <title>Hello World!</title>
</head>
<body>
  <p>
    <a href="https://deine_server_ip/keinlink">interner fehlerhafter Link</a>.
    <a href="https://www.elastic2ls.com/keinlink">externenr fehlender Link</a>.
  </p>
</body>
</html>
```

Speichere und schliesse die Datei. Wir sollten der Richtigkeit halber noch die Besitzrechte sowie die Dateiberechtigung anpassen.
```
chown www-data:www-data /var/www/linktest.html && chmod 644 /var/www/linktest.html
```

Jetzt können wir die Seite besuchen. `https://deine_server_ip/linktest.html`

## Wget

`wget`'s grundsätzliche Verwendung zielt darauf ab Datein per HTTP down zu loaden. Es kann aber auch als Webcrawler eingesetzt werden. Wir werden `wget` so konfigurieren, dass es die fehlerhaften Links einer Webseite meldet, ohne die Webseite oder Teile davon herunterzuladen. **Achtung:** Bitte teste nur auf an Seiten die du kennst, denn das testen von Links auf einer Webseite erzeugt sehr hohe Last auf einem Webserver. Logge dich in die VM **(test)** ein und führe folgendes `wget` Kommando aus. Die Erklärung für jede einzelne Option findest du unten. Die Optionen lassen sich einfach an deine Bedürfnisse anpassen.
```
wget --spider -r -nd -nv -H -l 1 -w 2 -o run1.log https://deine_server_ip/linktest.html
```

Folgende Optionen für `wget` brauchst du:

*   `--spider` hindert `wget` daran die Seite(n) herunter zu laden.
*   `-r` sorgt dafür, dass den Links auf jeder Seite recursiv gefolgt wird.
*   `-nd`, kurz für `--no-directories`, verhindert das `wget` die Ordnerstruktur deiner Webseite nachbaut auch wenn `--spider` gesetzt ist.
*   `-nv`, kurz für `--no-verbose`, verhindert das `wget`unötige Informationen zu den defekten Links logt.

Mit den folgenden optionalen Parameter kannst du die Suche nach deinen Bedürfnissen anpassen:

*   `-H`, kurz für `--span-hosts`,sort dafür das `wget` die Subdomains mit crawled. U.a. externe Seiten.
*   `-l 1` kurz für `--level`.
Per default crawled, `wget` bis zu fünf Ebenen(Links) ausgehend von der initialen URL. Wir setzen hier aktuell einen Level von 1\. Hier kannst du mit den Levels herum probieren abhängig davon wie deine Webseite aufgebaut ist.

*   `-w 2`, kurz für `--wait`, weist `wget` an zwei Sekunden zu warten bis es die nächste Anfrage sendet. Dies kann/soll den Performance Einbusen auf den Server minimieren.

*   `-o run1.log` sichert den Output von `wget` in eine Logdatei namens `run1.log` anstatt es auf dem Terminal auszugeben.

Nachdem die das obige `wget` Kommando ausgeführt hast, kannst du mittels `grep -B1 "Link nicht gültig!" run1.log` die defekten Links aus der Datei filtern. Der `-B1` Parameter spezifiziert das für jeden Zeile, die einen Treffer enthält, eine zusätzliche Zeile angezeigt wird und zwar die Vorangehende die den fehlerhaften Link enthält. Unten findet ihr die Ausgabe des obigen Beispiels:

```
https://deine_server_ip/keinlink: Die Datei auf dem Server existiert nicht -- Link nicht gültig!
https://www.elastic2ls.com/keinlink: Die Datei auf dem Server existiert nicht -- Link nicht gültig!
```

## Referrer URLs

Mit dem vorangegangenen Schritt finden wir die defekte Webseitenlinks, aber nicht deren Referrer URLs also die Seiten, die die fehlerhaften Links enthalten. In diesem Schritt suchen wir diese Referrer URLs. Ein bequemer Weg die Referrer URLs zu indentifizieren ist es das access log des Webservers zu durchsuchen. Log dich dazu in **(web)** ein und durchsuche das Apache access log mit folgendem Befehl.
```bash
sudo grep Wget /var/log/apache2/access.log | grep "HEAD"
```

Das erste `grep` in dem obigen Kommando findet alle access Anfragen durch `wget` an den Webserver. Jede Anfrage enthalt u.a. den _User Agent_ string, welcher die Software identifiziert die, die Anfrage gestellt hat. Der User Agent für `wget` ist _Wget/1.13.4 (linux-gnu)_. Die zweite Verwendung von `wget` sucht nach dem Teil der URL die den defekte Webseitenlinks (`/keinlink`) enthält. Die Ausgabe des `grep` Kommandos ist folgende:
```bash
192.168.0.1 - - [10/Apr/2015:17:26:12 -0800] "HEAD /keinlink HTTP/1.1" 404 417 "https://deine_server_ip/linktest.html" "Wget/1.13.4 (linux-gnu)"
```

Die Referrer URL ist das der erste Eintrag in der Datei `https://deine_server_ip/linktest.html`.

## Zusammenfassung

Dieses Tutorial zeigt dir wie man `wget` verwenden kann um defekte Links auf einer Webseite finden kann und die dazu gehörigen Referrer URLs. Nun kannst du die Fehler korregieren in dem du die Links updatest oder entfernst.
