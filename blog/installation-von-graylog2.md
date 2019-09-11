---
layout: post
title: Installation von Graylog2 mit Elasticsearch
subtitle:  Graylog2 ist ein zentralisiertes Log-Management und Log-Analyse-Framework basierend auf Elasticsearch und MongoDB. Elasticsearch ist ein verteilter Suchserver auf Basis von Lucene, der als OpenSource-Software verfügbar ist. In diesem Howto führen wir durch die Installation von Gralog2 mit Elasticsearch und MongoDB.
keywords: [Graylog2 Elasticsearch MongoDB JSON NoSQL Java Installation password_secret Web-Interface]
---
# {{ page.title }}

Graylog2 ist ein zentralisiertes Log-Management und Log-Analyse-Framework basierend auf Elasticsearch und MongoDB. Elasticsearch ist ein verteilter Suchserver auf Basis von Lucene, der als OpenSource-Software verfügbar ist. Es ist eine Volltext-Suchmaschine, geschrieben in Java, mit einem HTTP-Web-Interface und es unterstützt JSON-Dokumente nativ. Elasticsearch kann verwendet werden, um alle Arten von Dokumenten zu durchsuchen und bietet eine skalierbare Such-und Echtzeit-Suche-Lösung. In diesem Howto führen wir durch die Installation von Gralog2 mit Elasticsearch und MongoDB. Als Betriebssystem basiert ein Ubuntu 15.10.

## 1\. Installieren der MongoDB

MongoDB ist eine Dokumentenorientierte NoSQL-Datenbank. Das MongoDB-Dokumentenschema ähnelt JSON, es heißt BSON. Wir installieren MongoDB 3 aus den MongoDB Debian-Repositories. Fügen wir das Repository hinzu, aktualisieren und installieren es:

```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo "deb https://repo.mongodb.org/apt/debian wheezy/mongodb-org/3.0 main" > /etc/apt/sources.list.d/mongodb-org-3.0.list
sudo apt-get update
```

Installieren wir MongoDB mit dem folgenden apt-Befehl:

```bash
sudo apt-get install mongodb-org
```

Als nächstes starten wir mongodb und aktivieren Sie es beim Booten starten:

```bash
sudo service mongod start
sudo update-rc.d mongod defaults
```

## 2.Installation von Java

Die gesamte Anwendung, die wir in diesem Tutorial verwenden werden, basiert auf Java. Für die Graylog-Installation benötigen wir Java 7 oder höher. Java 8 ist im ubuntu Repository verfügbar.

```bash
sudo apt-get install openjdk-8-jdk
```

Jetzt testen wir die Java Installation

```bash
java -version
```

Und hier die Ausgabe:

```
bashopenjdk version "1.8.0_91"
OpenJDK Runtime Environment (build 1.8.0_91-8u91-b14-0ubuntu4~14.04-b14)
OpenJDK 64-Bit Server VM (build 25.91-b14, mixed mode)
```

## 3\. Installation von Elasticsearch

Herunterladen und Hinzufügen des GPG-Schlüssels zum System:

```bash
sudo wget -qO - httpss://packages.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
```

Fügen wir jetzt das Elasticsearch-Repository zum sources.list.d-Verzeichnis hinzu und führen apt-get update aus:

```bash
echo "deb https://packages.elastic.co/elasticsearch/2.x/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elasticsearch-2.x.list
sudo apt-get update
``

Jetzt könne wir die Installation starten

```bash
sudo apt-get install elasticsearch
```

Wenn die Installation abgeschlossen ist, starten wir den Elastcisearch-Daemon:

```bash
sudo service elasticsearch start
sudo update-rc.d elasticsearch defaults
```

Jetzt könne wir mit den Anpassungen für Elasticsearch starten. Dazu editieren wir die Konfiguirationsdatei von Elasticsearch: /etc/elasticsearch/elasticsearch.yml

```bash
sed -i '/^#cluster.name/a cluster.name = graylog2' /etc/elasticsearch/elasticsearch.yml
sed -i '/^script.disable_dynamic/a script.disable_dynamic: true' /etc/elasticsearch/elasticsearch.yml
sed -i '/^#network.host/a network.host: localhost' /etc/elasticsearch/elasticsearch.yml
```

Erklärung: a) Wir passen den Cluster Namen an von default elasticsearch zu graylog2. b) Wir deeaktivieren dynamische Scripts und vermeiden Remote-Ausführung c) Wir setzen den network.host auf localhost damit der Cluster nicht extern verfügbar ist. Im Anschluss starten wir den Elasticsearch Service neu:

```bash
sudo service elasticsearch restart
```

Nun können wir den Elasticsearchcluster mit curl testen:

```bash
curl -XGET 'https://localhost:9200/'
curl -XGET 'https://localhost:9200/_cluster/health?pretty=true'
```

![Graylog2](https://s.elastic2ls.com/wp-content/uploads/2018/02/27204501/Test_Elasticsearch.png)

## 4\. Installation des Graylog2 Server

Als nächstes laden wir uns das Graylog2 Packet herunter und konfigurieren den Service.

```bash
wget httpss://packages.graylog2.org/repo/packages/graylog-2.1-repository_latest.deb
sudo dpkg -i graylog-2.1-repository_latest.deb
sudo apt-get update
sudo apt-get install graylog-server
```

Bevor wir den Graylog2 starten können müssen wir die Konfiguration anpassen. Zuerst müssen wir uns die Bespielkonfigurationsdatei kopieren und umbennen. Danach müssen wir pwgen installieren und ein Random Passwort erstellen.

```bash
cp /etc/graylog/graylog.conf.example /etc/graylog/server/server.conf
sudo apt-get install pwgen
```

Jetzt erstelle wir uns das Passwort für **password_secret**

```bash
pwgen -N 1 -s 96
```

Damit passen wir die Graylog Konfigurationsdatei /etc/graylog/server/server.conf an:

```bash
sed -i '/^#password_secret/a password_secret = GYXOjHVNjTv7EdDxUOYEvW9MFJHzqzJarjuar7bszkXr41xTA9Gb8ig8j9MbclWYdzVdis2BfggLbxGaMoxLw1FCZuPNo3Ua' /etc/graylog/server/server.conf
```

Im nächsten Schritt legen wir uns das Admin Passwort für den Login in das Webinterface an.

```bash
echo -n mypassword | sha256sum
9235b36556923005015a6c2c18bf6f08a61daf54bfad653bde0ce6404000f0b1
```

```bash
sed -i '/^root_password_sha2/a root_password_sha2 = 9235b36556923005015a6c2c18bf6f08a61daf54bfad653bde0ce6404000f0b1' /etc/graylog/server/server.conf
```

Zum Schluss nehmen wir noch ein paar kleinere Anpassungen vor: Deaktivieren von elasticsearch multicast search aktivieren des unicast hosts.

```bash
elasticsearch_discovery_zen_ping_multicast_enabled = false
elasticsearch_discovery_zen_ping_unicast_hosts = ["127.0.0.1:9300"]
```

Ändern von elasticsearch shards auf 1, weil wir alles auf diesem einzelnen Server installieren.

```bash
elasticsearch_shards = 1
elasticsearch_replicas = 0
```

Zum Abschluss starten wir den Graylog2 Server

```bash
service graylog2 start
sudo update-rc.d graylog defaults
```

## 5\. Installation des Graylog2 Web-Interfaces

Ab der Version 2.x, wird keine zusätzliche Web-Interface-Komponente benötigt. Die Web-Schnittstelle wird direkt von Graylog-Server bedient. Wir konfigurieren die Graylog-Webschnittstelle, indem Sie die Datei server.conf bearbeiten.

```bash
sed -i '/^graylog2-server.uris/a graylog2-server.uris="https://127.0.0.1:12900/" ' /etc/graylog/server.conf
```

Wir generieren einen neuen Applikations-Secret für graylog-web mit pwgen:

```bash
pwgen -N 1 -s 96
zHg966Be4cBBLmasLiQm4mA0ziR5HziHq6RnfmgKIsjNtLCyHUvmxBMhzRkBclaE2IWyzJPJtPaQGEiLek0iJ3CaWh6kCDAE
```

und fügen diesen in dei Konfig ein.

```bash
sed -i '/^application.secret/a application.secret="zHg966Be4cBBLmasLiQm4mA0ziR5HziHq6RnfmgKIsjNtLCyHUvmxBMhzRkBclaE2IWyzJPJtPaQGEiLek0iJ3CaWh6kCDAE" '  /etc/graylog/server.conf
```

Ganz wichtig für die korrekte Anzeige der Zeitzone:

```bash
sed -i '/^timezone/a timezone="Europe/Berlin" '/etc/graylog/server.conf
```

Dann starten wir das Webinterface

```bash
sudo service graylog2 restart
```

## 6\. Zugriff Graylog web interface:

Dazu geben wir im Browser der Wahl ein: https://Server-Adresse:9000. Der Login erfolgt mittels "admin" und dem konfigurietem **root_password_sha2** Passwort in der server.conf.

![Graylog2](https://s.elastic2ls.com/wp-content/uploads/2018/02/27204602/Install-Graylog2_login_screen-768x410.png)

![Graylog2](https://s.elastic2ls.com/wp-content/uploads/2018/02/27204718/Install-Graylog2-Search-Page-768x410.png)

Das wars! In der zweiten Runde gehts ans Konfigurieren von Graylog um diverse Dienste nach Graylog schreiben zu lassen. Sowie die benötigten Extraktoren um die Nachrichten in Felder zu zerlegen. Im dritten Teil zeigen wir euch wir man Dashboards baut und Streams nutzt um Alerts festzulegen. Quellen: [https://www.howtoforge.com/](httpss://www.howtoforge.com/tutorial/how-to-Install-graylog2-and-elasticsearch-on-ubuntu-15-10/) [httpss://www.itzgeek.com/](https://www.itzgeek.com/how-tos/linux/ubuntu-how-tos/how-to-install-graylog2-on-ubuntu-14-04.html)
