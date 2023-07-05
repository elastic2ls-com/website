---
layout: post
title: Prometheus und Grafana Installation in Minikube
subtitle: In diesem Beitrag zeige ich euch, wie Sie Prometheus und Grafana in Ihrem Minikube-Cluster mit Hilfe der mitgelieferten Helm-Charts instalieren können.
keywords: [Prometheus Grafana Minikube]
categories: [DevOps]
---
# {{ page.title }}

![Prometheus](../../img/Prometheus-logo-300x300.webp)


## Einführung

In diesem Beitrag zeige ich euch, wie Sie Prometheus und Grafana in Ihrem Minikube-Cluster mithilfe der mitgelieferten Helm-Diagramme einsetzen können. 
Prometheus wird uns dabei helfen, unseren Kubernetes-Cluster und andere darauf laufende Ressourcen zu überwachen. Grafana hilft uns dabei, die von Prometheus aufgezeichneten Metriken zu visualisieren 
und sie in schicken Dashboards anzuzeigen.

## Voraussetzungen

    Minikube
    helm

## Installation

### Prometheus installieren

Wir installieren das Prometheus Community Kubernetes Helm Chart. Dazu fügen wir das Repositorys zu unserer Helm Konfiguration hinzu.

```
[]~ helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
```

Sobald das Repo fertig ist, können wir die bereitgestellten Charts installieren, indem wir die folgenden Befehl ausführen. Mit dem zweiten Befehl stellen wir Prometheus
über Port 3000 zur Verfügung.

```
[]~ helm install prometheus prometheus-community/prometheus
[]~ kubectl expose service prometheus-server --type=NodePort --target-port=9090 --name=prometheus-server-np
```

Der erste Befehl installiert die Charts. Da wir Minikube verwenden, stellt der zweite Befehl den Prometheus-server Service über einen NodePort zur Verfügung. 
Auf diese Weise können wir nun einfach auf die Prometheus-Weboberfläche zugreifen, wenn der Pod fertig ist:

```
[]~ minikube service prometheus-server-np
```

![Promettheus_installation](../../img/Promettheus_installation.webp)

### Grafana Installieren
Wir installieren das Grafana Community Kubernetes Helm Chartanalog zu oben. Dazu fügen wir das Repositorys zu unserer Helm Konfiguration hinzu.

```
[]~ helm repo add grafana https://grafana.github.io/helm-charts
```

Sobald das Repo installiert ist, können wir die bereitgestellten Charts installieren, indem wir den folgenden Befehl ausführen. Mit dem zweiten Befehl stellen wir Grafana 
über Port 3000 zur Verfügung.

```
[]~ helm install grafana stable/grafana
[]~ kubectl expose service grafana --type=NodePort --target-port=3000 --name=grafana-np
```

**Hinweis:** Grafana ist standardmäßig Passwort geschützt. Um das Passwort des Admin-Benutzers abzurufen, können wir den folgenden Befehl ausführen.

```
[]~ kubectl get secret --namespace default grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
```

Wir können uns nun in die Grafana-Weboberfläche mit dem Benutzer admin und dem ermittelten Passwort einloggen.

```
[]~ minikube service grafana-np
```

![Grafana_Installation](../../img/Grafana_Installation.webp)

## Konfiguration

### Prometheus als Datenquelle konfigurieren

Sobald wir in der Verwaltungsoberfläche eingeloggt sind, ist es an der Zeit, die Prometheus Instanz als Datenquelle zu hinzuzufügen.

Wir müssen zu Konfiguration > Datenquellen gehen und die neue Prometheus-Instanz hinzufügen.

![Grafana_Datasource](../../img/Grafana_Datasource.webp)
Die URL für unsere Prometheus-Instanz ist der Name des Dienstes http://prometheus-server:80.

### Kubernetes Dashboard anlegen

Als Nächstes richten wir eines der, von der Community bereitgestellten Kubernetes-Dashboards ein.

In diesem Blogbeitrag verwende ich dieses https://grafana.com/grafana/dashboards/6417. 
Wir gehen zum Abschnitt Erstellen (+) > Importieren, geben 6417 in das Feld id ein und klicken auf Import.

![Grafana_Dashboard](../../img/Grafana_Dashboard.webp)

![Grafana_Dashboard_imported](../../img/Grafana_Dashboard_imported.webp)
Sobald wir den Import-Dialog bestätigen, werden wir zum neuen Dashboard weitergeleitet.

![Grafana_Kubernetes_Dahsboard](../../img/Grafana_Kubernetes_Dahsboard.webp)
Wenn alles gut gegangen ist, können wir die Informationen unseres Clusters im Dashboard sehen.

## Fazit

In diesem Beitrag habe ich euch gezeigt, wie wir sowohl Prometheus als auch Grafana in einem Minikube-Cluster installieren können und auf die Schnelle 
ein erstes sinnvolles Dashboard importieren könnt.