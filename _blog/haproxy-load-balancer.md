---
layout: post
title: grep logfiles via SSH on multiple server
subtitle:  HAProxy ist eine beliebte Open Source Software für TCP/HTTP Load Balancing sowie Proxy Lösung, welche unter Linux, Solaris und FreeBSD laufen kann.
keywords: [HAProxy loadbalancer OpenSource Software TCP/HTTP Load Balancing Proxy ACL Terminologie Layer4 Layer7 Algorithmen]
categories: [Howtos]
---
# {{ page.title }}

HAProxy (High Availability Proxy), ist eine beliebte Open Source Software für TCP/HTTP Load Balancing sowie Proxy Lösung, welche unter Linux, Solaris und FreeBSD laufen kann. Es wird hauptsächlich benutzt um die Perfomance und Zuverlässigkeit von Serverdiensten zu verbessern indem die Arbeitslast auf mehrere Server (z.B. Web-, Applikations-, Datenbankserver) verteilt wird. In diesem Artikel werden ich euch eine generelle Übersicht darüber geben was HAProxy ist, Grundbegriffe der Load-Balancing Terminologie erklären und einige Beispiele aufzeigen wie HAProxy eingesetzt werden kann um Preformance und Zuverlässigkeit eurer Server Umgebungen zu erhöhen.

## HAProxy Terminologie

Es gibt eine grosse Anzahl an Begriffen und Konzepte, welche wichtig sind wenn wir über Load-Balancing und Proxies sprechen. Ich werde die gängigen Begriffe im nächsten Abschnitt erklären. Bevor wir uns mit den technischen Aspekten des Load-Balancings beschäftigen sollten wir über ACLs, Backends und Frontends sprechen.

### Access Control List (ACL)

Im Zusammenhang mit Load-Balancing werden ACLs benutzt um Konditionen zu prüfen und anhand der Resultate ein spezifische Aktione auszuführen (z.B. einen Server auswählen, die Anfrage abweisen). Das benutzen von ACLs erlaubt das weiterleiten der Anfragen basierend auf einer Vielzahl von Faktoren wie z.B. Abgleich von Mustern oder die Anzahl von vorhanden Verbindungen zu einem Backend, bespielsweise: `acl url_blog path_beg /blog` Diese ACL trifft zu, wenn der Pfad der Anfrage mit einem _/blog_ beginnt. Zum Beispiel würde _https://deinedomain.com/blog/blog-1_ anhand der ACL zutreffen. Für eine detailierte Darlegung der ACL Einstellungsmöglichkeiten schaut bitte hier.
[Configuration Manual](https://cbonte.github.io/haproxy-dconv/configuration-1.4.html#7).

### Backend

Ein Backend ist ein oder mehrere Server die weitergeleitete Anfragen entgegenehmen. Backends werden in der _backend_ Sektion von HAProxy konfiguriert. In der vereinfachten Basisversion kann ein Backend folgendermassen definiert werden:

*   Welcher Load-Balance Algorithmus soll benutzt werden
*   eine Liste von Servern und Ports

Ein Backend kann einen oder mehrere Server enthalten. Das hinzufügen von mehr Server Instanzen kann/wird Last Kapazitäten vergrößern, da die Last auf multiple Server verteilt werden kann. Gleiches gilt für die Zuverlässigkeit der Services. Ausserdem kann der Ausfall einzelner Instanzen kompensiert werden. Hier ist eine Bespiel mit einer Konfiguration mit zwei Backends _web-backend_ und _blog-backend_ mit jeweils zwei Server Instanzen in jedem der Backends. `backend web-backend balance roundrobin server web1 web1.deinedomain.com:80 check server web2 web2.deinedomain.com:80 check` backend blog-backend balance roundrobin mode https server blog1 blog1.deinedomain.com:80 check server blog1 blog1.deinedomain.com:80 check `balance roundrobin` gibt einen der Möglichen Load-Balancing Algorithmen an. `mode https` spezifiziert, dass ein Layer 7 Proxy genutzt werden soll. `check` diese Option gibt an, dass ein sogenannter "Health-Check" durchgeführt weerden um zu prüfen ob die Server Instanzen zur Verfügung stehen.

## Frontend

In der Frontend Sektion wird definiert, wie Anfragen an die Backends gesendet werden sollen. Frontends werden im der Notation _frontend_ definiert. Ihre Definition setzt sich aus den folgenden Komponenten zusammen:

*   Ein Satz von IP Adressen und ein Port (z.B. 10.1.1.7:80, *:443, etc.)
*   ACLs
*   _use_backend_ Regel, definiert welches Backenbd zu benutzen ist Anhand der zutreffenden Konditionen in der ACL Konfiguration sowie eine _default_backend_ Regel die alle anderen nicht defnierten Anfragen abfängt.

Ein Frontend kann für verschiedene Arten von Netzwerktraffic konfiguriert werden.

## Arten des Load Balancing

Jetzt wo wir ein Verständniss für die Grundkomponenten des Load-Balancings haben, widmen wir uns einigen verschiedenen Möglichlkeiten Load-Balancing zu betreiben.

### Kein Load-Balancing

Eine einfache Webanwendung ohne Load-Balancing könnte folgendermaßen aussehen:

![haproxy](../../img/haproxy1.png)

In diesem Beispiel verbindet sich der Benuter direkt mit eurer Web Anwednung ohne ein Load-Balancing Lösung. Wenn der Webserver nicht erreichbar ist wird der Benutzer ihn natürlich nicht erreichen könne. Ebenso kann es passieren, dass wenn viele Benutzer simultan auf den Server zugreifen wollen, dieser langsam reagiert oder gar nicht erreichbar ist

### Layer 4 Load-Balancing

Der einfachste Weg die Anfragen im Netzwerk gleichmässig zu verteilen ist es Layer 4 [(Transport layer)](https://www.fachadmin.de/index.php/OSI-Modell_in_der_Netzwerktechnik) Load-Balancing zu betreiben. Wenn man auf diesem Weg das Load-Balancing betreibt wird die Anfrage basierend auf IP Adresse und Port weitergeleitet an die in der Backend Sektion genannten Server. Hier ist ein Diagram eines einfachen Layer 4 Load-Balancings:

[![haproxy](../../img/haproxy2.png)

Die Anfrage des Benutzers wird vom Load-Balancer an die Backendserver, welche in _web-backend_ definiert sind, gesendet.

### Layer 7 Load-Balancing

Eine andere etwas komplexere Art des Load-Balancings ist es ein Layer 7 [(application layer)](https://www.fachadmin.de/index.php/OSI-Modell_in_der_Netzwerktechnik) Load-Balancing zu betreiben. Layer 7 Load-Balancing erlaubt es Anfragen des Benutzers basierend auf dem Content an die Backendserver weiterzuleiten. Dies Methode erlaubt es mehrere Webserver unter der selben Domäne sowie mit identischem Port zu betreiben. Hier ist ein Diagramm eines einfachen Layer 7 Load-Balancings:

[![haproxy](../../img//haproxy3.png)

In diesem Beispiel wird die Anfrage des Benutzers nach _deinedomain.com/blog_ zum _blog_ Backend weitergeleiten die die Blog Anwendung bereitstellen. Alle anderen Anfragen werden zu dem Backen, welches unter _web-backend_ definiert ist weitergeleitet.ample. Ein Auszug aus einer Frontend Konfiguration: `frontend https bind *:80 mode https acl url_blog path_beg /blog use_backend blog-backend if url_blog default_backend web-backend ` Hier wird ein Frontend namens _https_ konfiguriert, welches die Anfragen nach dem Pfad _/blog_ auf Port 80 verarbeitet.

*   `acl url_blog path_beg /blog` trifft zu, wenn der Benutzer nahc dem Pfad _/blog_ fragt.
*   `use_backend blog-backend if url_blog` benutzt die ACL um die Anfrage and das _blog-backend_ Backend weiterzuleiten.
*   `default_backend web-backend` specifiziert, dass alle anderen Anfragen and das Backend _web-backend_ weiter geleitet werden.

## Load-Balancing Algorithmen

Der Load-Balancing Algorithmus der benutzt wird bestimmt welcher Server in dem ausgewählten Backend ausgewählt wird. HAProxy bietet eine Menge verschiedene Optionen für die zu verwendeten Algorithmen an. Zusatzlich zu den Load-Balancing Algorithmus kann ein _weight_ Parameter angegeben werden um zu bestimmen wie oft ein Server ausgewählt wird im Verhältniss zu anderen Servern. Um mehr über die für HAProxy zur Verfügung stehenden Angorithmen zu erfahren schaut bitte [hier.](https://) Ein paar der gängisten Algorithmen für das Load-Balancing:

### roundrobin

Round Robin wählt die Server immer einem nach dem anderen aus ohne sich um Last oder andere Parameter zu kümmern. Es ist der Default und auch Fallback Allgorithmus.

### leastconn

Wählt den Server mit den wenigsten aktiven Verbindungen aus. Dieser Modus ist für lange Sessions empfohlen. Server, die im selben Backend konfiguriert sind werden im Round Robin Verfahren ausgewählt.

### source

Entscheidet anhand eines Hashwertes der Source IP Adresse welcher Server ausgewählt werden soll. Dies ist eine der möglichen Methoden um sicherzustellen, dass der Benutzer immer zum selben Server verbindet.

### Sticky Sessions

Manche Anwendungen setzen voraus, dass der Benutzer verbunden bleibt mit dem gleichen Backend Server. Dies wird erreicht durch _sticky sessions_, wenn man den Parameter _appsession_ in der Backend Definition benutzt.

## Health Check

HAProxy benutzt "health checks" um zu ermitteln ob ein Backend server verfügbar ist um die Anfrage zu verarbeiten. Dies macht es unnötig Server manuell aus den Backends zu entfernen wenn diese nicht mehr entsprechend reagieren. Ein Standard "health check" ist eine TCP Verbindung zu dem Backendserver aufzubauen oder zu testen ob der Backendserver auf IP Adresse und Port hört. Wenn ein Server nicht erreichbar ist laut "health check" wird er automatisch aus dem Backend entfernt bzw. die Anfragen werden nicht mehr an diesen Server weitergeleitet, bis er wieder erreichbar ist.

## Zusammenfassung

Du solltest jetzt ein grunsätzliches Verständniss haben wie Load-Balancing mit HAProxy funktoniert und einige Möglichkeiten verstanden haben wie du Load-Balancing verwenden kannst um deine Server Umgebungen performanter und sicherer zu machen.

Quelle:
[https://cbonte.github.io/haproxy-dconv/configuration-1.6.html](https://cbonte.github.io/haproxy-dconv/configuration-1.6.html)
