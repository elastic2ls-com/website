---
layout: post
title: Helm vs. Kustomize
subtitle: was sind Vor- und Nachteile von Helm bzw. Kustomize?
keywords: [Helm Kustomize]
categories: [DevOps]
---

![helm_vs_kustomize](../../img/helm_vs_kustomize.webp)

# Helm vs. Kustomize - ein Vergleich


Kubernetes bietet von Haus aus die wichtigsten Tools, die für die Verwaltung von Anwendungen benötigt werden. Während die Anwendung von YAML-Manifesten in Kubernetes grundsätzlich ein einfacher Prozess ist, 
gerät die Entwicklung in einer Microserviceumgebung schnell außer Kontrolle, da eine Vielzahl von Deployments zur Entwicklung eines kompletten Systems erforderlich sind.
Dieser Artikel vergleicht die zwei beliebtesten Tools, die das Management der Anwendungsbereitstellung vereinfachen sollen - Helm und Kustomize.


## Helm
Helm ist ein Paketmanager für Kubernetes. Er hilft bei der Installation und Verwaltung von Kubernetes-Anwendungen, indem er sogenannte Helm-Charts Pakete mit YAML-Dateien, die Template-Funktionen anbieten.
Durch den Einsatz dieser Templates mit dynamischen Werten bietet Helm die Möglichkeit, die Konfiguration fein granular auf die jeweilige Umgebung abzustimmen. Helm bietet Komponenten für die Verwaltung 
von privilegiertem Zugriff mit rollenbasierter Zugriffskontrolle (RBAC) und benutzerdefinierten Ressourcendefinitionen (CRD). Eine weitere nützliche Eigenschaft des Helm-Templating ist die Kapselung. Die YAML-Definitionen von Kubernetes-Objekten, 
wie z. B. Deployment, Service, ConfigMap oder ein Kubernetes Secret, können in einer einzigen Vorlage gekapselt werden. Diese Eigenschaft ist hilfreich für die Konfiguration während der Bereitstellung.


Ein einfaches Helmchart besteht aus:

* Einer Datei Chart.yaml, die das Diagramm deklariert. 
* Eine Datei values.yaml, die Diagrammparameter enthält, die mit Vorlagen verwendet werden sollen. 
* Einem Vorlagenverzeichnis, das Vorlagendateien für die Erstellung des Diagramminhalts enthält.

![helm-chart-create](../../img/helm-chart-create.webp)


Eine Templatedatei hat die Struktur einer YAML-Datei, enthält aber zusätzlich Variablen, die bei der Bereitstellung durch die in der Datei values.yaml angegebenen Werte ersetzt werden.

So sieht der Inhalt einer typischen deployment.yaml aus:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.appname }}
  labels:
    app: {{ .Values.appname }}
spec:
  selector:
    matchLabels:
      app: {{ .Values.appname  }}
  template:
    metadata:
      labels:
        app: {{ .Values.appname }}
        tier: web
    spec:
      containers:
      - name: {{ .Values.deployment.image.name }}
        image: "{ .Values.deployment.image.name }}"
        ports:
        - containerPort: {{ .Values.service.targetPort }}
```

Im obigen Beispiel sucht Helm in der Datei values.yaml nach den Werten der Testvariablen. 
Die entsprechende values.yaml-Datei enthält die Variablendefinition:

```yaml
appname: webapp1

deployments:
  image:
    name: frontend01
    
service:
  targetPort: 8080
```

Basierend auf der values.yaml Definition erstellt Helm die folgende deployment.yaml-Datei:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp1
  labels:
    app: webapp1
spec:
  selector:
    matchLabels:
      app: webapp1
  template:
    metadata:
      labels:
        app: webapp1
        tier: web
    spec:
      containers:
      - name: frontend01
        image: frontend01     
        ports:
        - containerPort: 8080
```

Helm bietet die Möglichkeit, die Werte in der Datei values.yaml mit dem Flag `--set` zu überschreiben, wenn Build-Befehle in der Befehlszeilenschnittstelle ausgegeben werden.  Mit  `helm lint`, kann das Chart vorab geprüft werden.

## Kustomize
Kustomize ist ein Tool, das mit Schichten und Patches anstelle von Templates zur Anpassung von Kubernetes-Objekten verwendet. Es führt die Manifestdatei kustomization.yaml ein, in der Benutzer einsatzspezifische Konfigurationen speichern.
Mit Kustomize können Benutzer eine beliebige Anzahl von Kubernetes-Konfigurationen mit jeweils eigenen Anpassungen verwalten, indem sie den deklarativen Ansatz verwenden. Es erlaubt Entwicklern, mehrere Versionen einer Anwendung zu definieren 
und in Unterverzeichnissen zu verwalten. Das Basisverzeichnis enthält die allgemeinen Konfigurationen, während die Unterverzeichnisse versionsspezifische Patches enthalten.

![kustomize](../../img/kustomize.webp)

Jedes Verzeichnis enthält eine eigene kustomization.yaml Datei, in der angegeben ist, welche Änderungen an der Konfiguration vorgenommen werden müssen und welche Ressourcen verwendet werden sollen. 
Die folgende kustomization.yaml Datei fügt beispielsweise sowohl der deployment.yaml als auch der service.yaml im Basisverzeichnis eine gemeinsame Bezeichnung `app: frontend01` hinzu:

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

commonLabels:  
  app: frontend01
resources:
- deployment.yaml
- service.yaml
```

Die Änderungen werden folgendermassen angewandt.

```bash
kubectl apply -k base
```

Und so, wenn kustomize als Standalone tool genutzt wird. 

```bash
kustomize build base | kubectl apply -f -
```

## Helm und Kubernetes: Pro und Kontra

### Vorteile von Helm
* Helm bietet viele Funktionen, die über das einfache Konfigurationsmanagement für die App-Bereitstellung hinausgehen, z. B. Paketierung, Hooks und Rollbacks.
* Es vereinfacht die App-Installation, indem es Nutzern erlaubt, Standardwerte festzulegen, die sie bei Bedarf weiter konfigurieren können.
* Helm ist bei Entwicklern gut bekannt, es hat viele Nutzer und einen hervorragenden Online-Support.
* Die Helm Templatefunktionen ermöglichen u.a. die Einführung von Konditionalen und Schleifen.
* Für die meisten häufig verwendeten Anwendungen gibt es bereits existierende Helmcharts.

### Nachteile von Helm
* Helm fügt mehr Abstraktionsebenen hinzu.
* Es beschränkt die Anpassung von Anwendungen auf bereits vorhandene Konfigurationsoptionen.
* Vorlagen sind fehleranfällig, insbesondere im Hinblick auf die korrekte Formatierung von YAML.
* Helm wird nicht nativ in Kubernetes unterstützt, was eine externe Abhängigkeit schafft.
* Helm injiziert zur Laufzeit Werte in Templates, so dass die Applikation bei einer Änderung des Templates möglicherweise nicht mehr zueinander kompatibel ist.
* Schlect lesbare Templates führen unweigerlich zu einer schlechteren Updatefähigkeit im Laufe der Zeit.


### Vorteile von Kustomize 
* Kustomize ist einfach zu bedienen.
* Es ist deklarativ und steht im Einklang mit der Kubernetes-Philosophie.
* Kustomize unterstützt ein Modell mit vererbter Basis, wodurch es besser skaliert als Helm.
* Es macht es einfacher, Standardanwendungen zu verwenden.
* Es verwendet nur einfache YAML-Dateien.

### Nachteile von Kustomize 
* Kustomize bietet nicht viele Funktionen.
* Es ist nicht auf das DRY-Prinzip (Don't Repeat Yourself) ausgelegt.
* Benutzer müssen Ressourcen und Patches manuell in kustomization.yaml deklarieren, und die Datei muss manuell aktualisiert werden, wenn eine neue Datei hinzugefügt wird.
* Online-Support für Kustomize ist schwer zu finden.


Und nun?

Um zu entscheiden, ob Helm oder Kustomize zum Einsatz kommt, bedenke Folgendes:

Mit Kustomize kann man zwar schnell komplizierte Anpassungen vornehmen, aber man muss in der Lage sein, zu verstehen, wie die Patches und Schichten zusammenspielen.
Wenn man andererseits möchte, dass Entwickler neue Anwendungen und Dienste auf sichere und einfache Weise hinzufügen können, ist die Erstellung von Helm-Diagrammen die bessere Lösung.
Ein weiterer Grund, sich für Helm zu entscheiden, mag folgende sein: Helm-Charts verfügen über Argumente, die es einfacher machen, die Funktionsweise von Diensten zu verstehen.

Da sowohl Helm als auch Kustomize werkzeugspezifische Vorteile bieten und sich gegenseitig gut ergänzen, wäre durchaus eine Überlegung wert, beide Werkzeuge zu verwenden. 
Helm ist besonders nützlich für das Paketieren, Teilen und Installieren von Apps, die gut definiert sind, während Kustomize am besten für Änderungen in letzter Minute an bestehenden Kubernetes-Apps geeignet ist.