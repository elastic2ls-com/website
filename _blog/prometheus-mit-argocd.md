---
layout: post
title: ArgoCD Beispiel mit Prometheus
subtitle: In diesem Tutorial will ich euch zeigen, wie man Prometheus mittels ArgoCD im Gitops Ansatz installieren und verwalten kann.
keywords: [ArgoCD, Prometheus, Gitop, Helm, Kubernetes]
categories: [DevOps]
---
# {{ page.title }}

![](../../mg/argocd-200x200.png)

In diesem Blogbeitrag richten wir Argo CD auf einem Kubernetes-Cluster ein. Wir installieren ArgoCD mit Helm, erstellen eine Anwendung zur Verwendung des App-of-Apps Ansatzes, 
richten Argo CD so ein, dass es sich selbst aktualisieren kann, und installieren Prometheus über Argo CD als Beispiel.

![prometheus-argocd](../../img/1-argo-app-details.webp)

## 1. Was ist Argo CD?
Argo CD ist ein GitOps Tool zur automatischen Synchronisierung des Clusters mit dem gewünschten Status, der in einem Git-Repository definiert ist. 
Jede Arbeitslast wird deklarativ über ein Ressourcenmanifest in einer YAML-Datei definiert. Argo CD prüft, ob der im Git-Repository definierte Status mit dem übereinstimmt, 
was auf dem Cluster ausgeführt wird, und synchronisiert ihn, wenn Änderungen festgestellt wurden.

Anstatt beispielsweise CLI-Befehle manuell auszuführen, um Kubernetes-Ressourcen mit `kubectl apply` oder zu aktualisieren `helm upgrade`, 
würden wir eine YAML-Datei in unserem Git-Repository aktualisieren, die ein ApplicationManifest enthält. 
Argo CD überprüft dieses Manifest regelmäßig auf Änderungen und synchronisiert die darin definierten Ressourcen automatisch mit denen, 
die in unserem Cluster ausgeführt werden.

Eine Verbindung zum Cluster, entweder vom Laptop des Entwicklers oder von einem CI/CD-System, ist nicht mehr erforderlich, da Änderungen von einem Kubernetes-Operator, 
der im Cluster ausgeführt wird, aus dem Git-Repository abgerufen werden.

### Anforderungen
Um diesem Tutorial folgen zu können, benötigen wir Folgendes.

> kubectl
> Helm
> ein öffentliches GitHub Repository

## 2. Erstellen eines Umbrella-Helm-Diagramms
Wir verwenden Helm, um das ArgoCD Chart [argoproj/argo-helm](https://github.com/argoproj/argo-helm/tree/master/charts/argo-cd) zu installieren. 
Wir erstellen ein Umbrella Helm Chart, das das  ArgoCD Chart als Abhängigkeit mit einbezieht.

Durch diesen Ansatz haben wir die Möglichkeit, zusätzliche Ressourcen einzubinden. Beispielsweise können wir Secrets installieren, 
die zur Authentifizierung bei privaten Git- oder Helm-Repositorys verwendet werden, 
indem wir sie im Template Verzeichnis des Charts ablegen.

Um das Umbrella Chart zu erstellen, erstellen wir ein Verzeichnis und erstellen im Folgenden zwei Dateien darin.


`[charts/argo-cd/Chart.yaml](https://github.com/AlexanderWiechert/argocd-prometheus-example/blob/main/charts/argo-cd/Chart.yaml)`

```yaml
apiVersion: v2
name: argo-cd
version: 1.0.0
dependencies:
- name: argo-cd
  version: 4.2.2
  repository: https://argoproj.github.io/argo-helm
```


`[charts/argo-cd/values.yaml](https://github.com/AlexanderWiechert/argocd-prometheus-example/blob/main/charts/argo-cd/values.yaml)`

```yaml
argo-cd:
  dex:
    enabled: false
  server:
    config:
      repositories: |
        - type: helm
          name: argo-cd
          url: https://argoproj.github.io/argo-helm
```

Einen Überblick über die verfügbaren Optionen finden Sie in der [values.yaml](https://github.com/argoproj/argo-helm/blob/master/charts/argo-cd/values.yaml). 

> ACHTUNG: Für unser Subchart müssen die  Werte unterhalb des argo-cd: Keys liegen.

Für dieses Tutorial überschreiben wir die folgenden Werte:

* Wir deaktivieren die dex Komponente, die für die Integration mit externen Authentifizierungsanbietern verwendet wird.
* Wir fügen das ArgoCD Helm-Repository zur Repository Liste hinzu.

Bevor wir das Chart installieren, müssen wir eine Chart.lock Datei generieren.

```bash
$ helm repo add argo-cd https://argoproj.github.io/argo-helm
$ helm dep update charts/argo-cd/
```

Das erstellt folgen Dateien:

* Chart.lock
* charts/argo-cd-4.2.2.tgz

Die Datei im Order Charts benötigen wir nicht in unserem GitHub Repository, daher löschen wir sie und tragen den Ordner in die `.gitignore` Datei ein.

Jetzt können wir das Chart pushen.

```bash
$ git add charts/argo-cd
$ git commit -m 'add argo-cd chart'
$ git push
```

## 3. Installieren wir unser ArgoCD Helm Chart

Dazu installieren wir das Char manuell per Helm CLI

```bash
$ helm install argo-cd charts/argo-cd/
```

## 4. Login in die Web UI

Da das ArgoCD Helm Chart per se keine Ingress definiert hat, müssen wir uns den Zugang per Port-Forwarding
erstellen:

```bash
$ kubectl port-forward svc/argo-cd-argocd-server 8080:443
```

Im Browser öffnen wir dann einfach http://localhost:8080

Der default Benutzer is admin. Das Password ist automatisch generated und wir erhalten es folgednermassen:

```bash
$ kubectl get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

So sieht ArgoCD nach dem ersen Login aus.

![argo-new-install](../../img/2-argo-new-install.webp)

Man könnte jetzt ArgoCD über diese Oberfläche einrichten und Apps hinzufügen, aber wir wollen das Codeseitig lösen,
daher beschreiben wir diese in den Applikations Manifesten in Yaml und pushen sie in unser Git Repository.

Wenn wir nun beispielsweise [Prometheus](https://prometheus.io/) installieren wollten, würden wir ein passendes 
Applikationsmanifest anlegen. Dort würden wir dann das zu verwendende Helm Chart hinterlegen, sowie die Werte, 
welche wir anpassen wollen würden. Würden wir weiter so vorgehen, wie wir hier gestartet sind, müssten wir jede Applikation
per `kubectl` manuell installieren. Das ist aber genau das, was wir nicht wollen.

In ArgoCd gibt es einen Weg diesen Vorgang komplett zu automatisieren, indem wir eine Applikation anlegen, die mittels 
des [App-of-App Pattern](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#app-of-apps), 
weitere Applikationen hinzufügen und verwalten kann. Dies ist die sogenannte Root-Applikation.

Diese Root-Applikation hat eigentlich nur eine Aufgabe: Sie generiert Manifeste für andere Applikationen. ArgoCD
überwacht nun die Root-App und synchronisiert die Manifeste der anderen Applikationen. 

Mit diesen Setup müssen wir nur noch eine Applikation von Hand installieren: Die Root App.

## 4. Erstellen der Root App

Für die Root-Anwendung erstellen ein Helm-Diagramm. Wir erstellen ein apps/-Verzeichnis und fügen eine `Chart.yaml` und eine leere `values.yaml` hinzu.

`apps/Chart.yaml`

```yaml
apiVersion: v2
name: root
version: 1.0.0
```

Wir erstellen nun das Manifest für unsere Stammanwendung in apps/templates/root.yaml. Dies ermöglicht uns, alle Aktualisierungen an der Stammanwendung selbst über Argo CD vorzunehmen.

`[apps/templates/root.yaml](https://github.com/AlexanderWiechert/argocd-prometheus-example/blob/main/apps/templates/root.yaml)`

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: root
  finalizers:
  - resources-finalizer.argocd.argoproj.io
spec:
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  project: default
  source:
    path: apps/
    repoURL: https://github.com/AlexanderWiechert/argocd-prometheus-example.git
    targetRevision: HEAD
  syncPolicy:
    automated:
      prune: true
      selfHeal: true

```

Die Applikation überwacht das Helm-Diagramm unter apps/ (unsere Root-Anwendung) und synchronisiert es, wenn Änderungen festgestellt wurden.

> Hinweis: Argo CD wird nicht `helm install` verwenden, um Diagramme zu installieren. Es wird das Diagramm mit `helm template` rendern und dann die Ausgabe mit `kubectl` anwenden. Das bedeutet, dass wir helm list nicht auf einer lokalen Maschine ausführen können, um alle installierten Versionen zu erhalten.

Um unsere Root-Anwendung bereitzustellen, müssen wir die Dateien in unser Git-Repository pushen und das Manifest anwenden:

```bash
$ git add apps
$ git commit -m 'add root app'
$ git push

$ helm template apps/ | kubectl apply -f -
```

In der Weboberfläche kann man nun unsere Root-Applikation sehen.

![argo-root-app-created](../../img/3-argo-root-app-created.webp)

## 5. Argo CD sich selbst verwalten lassen

Um das Ganze nun auf die Spitze zu treiben, können wir nun ArgoCD als Applikation sich selbst verwalten lassen. Bisher hatten wir ArgoCD mit Helm installiert. 
Wenn wir nun Anpassungen an ArgoCd selbst vornehmen wollten, müssten wir Updates manuell durchführen.

Um dies zu vermeiden, können wir eine Anwendungsressource für Argo CD erstellen und sie sich selbst verwalten lassen.
Mit diesem Ansatz können alle Aktualisierungen an unserer Argo-CD-Bereitstellung durch die Änderung von Dateien in unserem Git-Repository vorgenommen werden, 
anstatt manuelle Befehle auszuführen.

Dazu legen wir ein Applikationsmanifest an.

`[apps/templates/argo-cd.yaml](https://github.com/AlexanderWiechert/argocd-prometheus-example/blob/main/apps/templates/argo-cd.yaml)`

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: argo-cd
  namespace: default
  finalizers:
  - resources-finalizer.argocd.argoproj.io
spec:
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  project: default
  source:
    path: charts/argo-cd
    repoURL: https://github.com/AlexanderWiechert/argocd-prometheus-example.git
    targetRevision: HEAD
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

und pushen es ins Git Repository:

```bash
$ git add apps/templates/argo-cd.yaml
$ git commit -m 'add argo-cd application'
$ git push
```

In der Weboberfläche sollten wir nun ArgoCD als Applikation sehen. Falls die Anwendung nicht sofort angezeigt wird, klicken Sie auf die Schaltfläche "Aktualisieren" in der Stammanwendung. 
Standardmäßig wird alle 3 Minuten nach Änderungen im Git-Repository gesucht.

![argo-app-created.](../../img/4-argo-app-created.webp)

Sobald die ArgoCD Anwendung synchronisiert ist, kann sie sich selbst verwalten und wir können die zuvor manuell installierte Installation löschen. 
Der folgende Befehl löscht Argo CD nicht aus dem Cluster, sondern lässt Helm nur wissen, dass es Argo CD nicht mehr verwaltet:

```bash
$ kubectl delete secret -l owner=helm,name=argo-cd
```

## 6. Kube-prometheus-stack installieren

m zu demonstrieren, wie ein Helm-Diagramm mit Argo CD eingesetzt wird, fügen wir den Kube-prometheus-stack zu unserem Cluster hinzu.
Zuerst erstellen wir ein Anwendungsmanifest in apps/templates/prometheus.yaml, das das [Prometheus Community Chart ](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)verwendet.

`[apps/templates/kube-prometheus-stack.yaml](https://github.com/AlexanderWiechert/argocd-prometheus-example/blob/main/apps/templates/kube-prometheus-stack.yaml)`

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: kube-prometheus-stack
  namespace: default
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  destination:
    server: https://kubernetes.default.svc
    namespace: default
  project: default
  source:
    chart: kube-prometheus-stack
    repoURL: https://prometheus-community.github.io/helm-charts
    targetRevision: 44.3.0
    helm:
      skipCrds: true
      values: |-
  syncPolicy:
    syncOptions:
      - Replace=true
    automated:
      prune: true
      selfHeal: true
```

Im Vergleich zu unserem zuvor erstellten ArgoCD Manifest gibt es folgende Unterschiede:

* Wir verwenden als Source _chart_ anstelle von _path_, um ein Helmchart aus einem anderen Helm-Repository zu installieren
* Die _targetRevision_ ist die spezifische Version des Charts, die wir installieren wollen.
* Die _repoURL_ wird auf das Helmchart-Repository der Prometheus-Community gesetzt.
* Wir überschreiben die Standardwerte des Diagramms, um das _Pushgateway zu deaktivieren_.

> Hinweis! Um den Fehler "The CustomResourceDefinition "prometheuses.monitoring.coreos.com" is invalid: metadata.annotations: Too long: must have at most 262144 bytes" zu umgehen waren einige Anpassungen notwendig.
> 
> helm.skipCrds = true +
> 
> helm.values = |-
> 
> syncPolicy.syncOptions = - Replace=true

Um die Anwendung bereitzustellen, müssen wir nur noch das Manifest in unser Git-Repository pushen:

```bash
$ git add apps/templates/kube-prometheus-stack.yaml
$ git commit -m 'add kube-prometheus-stack'
$ git push
```

Nun sollte in der Weboberfläche Prometheus auftauchen.

![prometheus](../../img/5-prometheus.webp)

![grafana](../../img/6-grafana.webp)

## 7. Kube-prometheus-stack wieder deinstallieren

Um die Prometheus Applikation wieder zu deinstallieren, müssen wir lediglich die zuvor hinzugefügte kube-prometheus-stack.yaml Datei aus dem Git Repository 
löschen.

```bash
$ git rm apps/templates/kube-prometheus-stack.yaml
$ git commit -m 'remove kube-prometheus-stack'
$ git push
```

Die Applikation wird beim nächsten Refresh vom Cluster entfernt werden.

## 8. Fazit


In diesem Tutorial haben wir Argo CD mit Helm installiert und es so eingerichtet, dass es sich selbst verwalten kann. 
Aktualisierungen von Argo CD können durch Modifikation des Manifests im Git-Repository durchgeführt werden und erfordern keinerlei manuelle Schritte.

Wir haben eine Root-Anwendung erstellt, die das [App-of-Apps Pattern](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#app-of-apps) verwendet, um unsere Anwendungen auf deklarative Weise zu verwalten.

Anwendungen können mit Git hinzugefügt, aktualisiert oder entfernt werden. Als Beispiel haben wir Prometheus in unserem Cluster installiert.

Alle in diesem Blog-Beitrag erwähnten Dateien [findet ihr hier bei GitHub](https://github.com/AlexanderWiechert/argocd-prometheus-example).