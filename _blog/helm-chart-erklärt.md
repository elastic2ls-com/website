---
layout: post
title: So erstellen Sie ein Helmdiagramm 
subtitle: In diesem Artikel gehen wir eine Schritt-für-Schritt-Anleitung zum Erstellen eines Helm-Diagramms durch und diskutieren seine Strukturkomponenten und Best Practices.
keywords: [Helm Chart Howto]
categories: [DevOps]
---
# {{ page.title }}

![Helm](../../img/helm-chart.webp)

## Einführung
In diesem Artikel gehen wir eine Schritt-für-Schritt-Anleitung zum Erstellen eines Helm-Diagramms durch und diskutieren seine Strukturkomponenten und Best Practices.

## Voraussetzungen

* Ein funktionierender Kubernetes-Cluster
* Helm auf Ihrer Workstation installiert
* Eine gültige kubeconfig zum Herstellen einer Verbindung mit dem Cluster
* Kenntnisse in Kubernetes und YAML.

## Was ist ein Helmdiagramm?
Zur Erläuterung verwenden wir einfaches Beispiel einer Website mit Nginx auf Kubernetes

Nehmen wir an, Sie haben in Ihrem Projekt verschiedene Stages. Entwicklung, Staging und Produktion. 
Jede Umgebung verfügt über unterschiedliche Parameter für die Nginx-Bereitstellung. Zum Beispiel, im Bereich Entwicklung und Qualitätssicherung benötigen wir wahrscheinlich nur eine Instanz.
Im Staging und in der Produktion benötigen wir für ie Ausfallssicherheit mindestens zwei Instanzen. Die Konfiguration und die Geheimnisse sollten für jede Umgebung unterschiedlich sein.
Aufgrund der Änderung der Konfigurationen und Bereitstellungsparameter für jede Umgebung müssen Sie für jede Umgebung unterschiedliche Nginx-Bereitstellungsdateien verwalten. Hier kann das Helm Chart seine
Stärken ausspielen und je nach Umgebung die passenden Werte in Kubernetes deployen.

Helm-Charts sind eine Kombination aus Kubernetes YAML-Manifestvorlagen und Helm-spezifischen Dateien. Da das Kubernetes-YAML-Manifest als Vorlage erstellt werden kann, 
müssen Sie nicht mehrere Helmdiagramme für verschiedener Umgebungen verwalten. Helm verwendet die Go-Templating-Engine für die Templating-Funktionalität.

Sie benötigen lediglich ein einziges Helmdiagramm und können die Bereitstellungsparameter jeder Umgebung ändern, indem Sie einfach eine einzelne Datei (values.yml) ändern. 
Helm kümmert sich um das einfügen der Werte für die jeweilige Umgebung. 

## Struktur des Helmdiagramms
Bleiben wir bei unserem Beispiel. Dazu benötigen wir normalerweise die folgenden YAML-Dateien.

```
nginx-deployment
├── configmap.yaml
├── deployment.yaml
├── ingress.yaml
└── service.yaml
```

Wenn wir nun ein Helm-Chart für Nginx erstellen, hat es die folgende Verzeichnisstruktur.

```
nginx-chart/
|-- Chart.yaml
|-- charts
|-- templates
|   |-- NOTES.txt
|   |-- _helpers.tpl
|   |-- deployment.yaml
|   |-- configmap.yaml
|   |-- ingress.yaml
|   |-- service.yaml
|   `-- tests
|       `-- test-connection.yaml
`-- values.yaml
```

Wir können nun sehen, dass zu den oben gezeigten Yaml Dateien nun noch Helm spezifische Dateien und Ordner hinzugekomen sind. Schauen wir, wofür die Datien und Ordner da sind.

* .helmignore: Es wird verwendet, um alle Dateien zu definieren, die wir nicht in das Helmdiagramm aufnehmen möchten. Es funktioniert ähnlich wie die .gitignore Datei.
* Chart.yaml: Es enthält Informationen über das Helmdiagramm wie Version, Name, Beschreibung usw.
* values.yaml : In dieser Datei definieren wir die Werte für die YAML-Vorlagen. Zum Beispiel Bildname, Replikatanzahl, HPA-Werte usw. 
  Wie wir bereits erklärt haben, values.yaml ändert sich in jeder Umgebung nur die Datei. 
  Sie können diese Werte auch dynamisch zum Zeitpunkt der Installation des Diagramms mit dem Befehl --values oder --set überschreiben.
* charts: Hier werden Abhängikeiten van anderen Charts hinterlegt. Standardmäßig ist dieses Verzeichnis leer.
* templates: Dieses Verzeichnis enthält alle Kubernetes-Manifestdateien, die eine Anwendung bilden. Diese Manifestdateien können als Vorlage für den Zugriff auf Werte aus der Datei „values.yaml“ erstellt werden . 
  Helm erstellt einige Standardvorlagen für Kubernetes-Objekte wie „deployment.yaml“, „service.yaml“ usw., die wir direkt verwenden, ändern oder mit unseren Dateien überschreiben können.
* templates/NOTES.txt: Dies ist eine Klartextdatei, die angezeigt wird, nachdem das Chart erfolgreich bereitgestellt wurde.
* templates/_helpers.tpl: Diese Datei enthält mehrere Methoden und Untervorlagen. Diese Dateien werden nicht in Kubernetes-Objektdefinitionen gerendert, sondern stehen überall in anderen Vorlagen zur Verwendung zur Verfügung.
* templates/tests/: Wir können Tests definieren, um zu überprüfen, ob Ihr Chart bei der Installation wie erwartet funktioniert. 

## Erstellen wir das Helmchart von Grund auf neu

Um mit der Erstellung von Helmdiagrammen vertraut zu werden, erstellen wir ein blankes Helm-chart für Nginx.

Dazu führen wir den folgenden Befehl aus, der erstellt ein Diagramm mit dem Namen nginx-chart mit den Standarddateien und -ordnern.

```
helm create nginx-chart
```
Wenn Sie das erstellte Diagramm überprüfen, enthält es die folgenden Dateien und Verzeichnisse.

```
nginx-chart
│   ├── Chart.yaml
│   ├── charts
│   ├── templates
│   │   ├── NOTES.txt
│   │   ├── _helpers.tpl
│   │   ├── deployment.yaml
│   │   ├── hpa.yaml
│   │   ├── ingress.yaml
│   │   ├── service.yaml
│   │   ├── serviceaccount.yaml
│   │   └── tests
│   │       └── test-connection.yaml
│   └── values.yaml
```
Wir wechelsen in das generierte Diagrammverzeichnis wechseln. Und passen uns die Dateien nach unseren Bedürfnissen an.

```
cd nginx-chart
```

### Chart.yaml
Als erstes passen wir die Chart.yaml Datei unseren Bedürfnissen an.

```
apiVersion: v2
name: nginx-chart
description: Nginx Chart
type: application
version: 0.1.0
appVersion: "1.0.0"
maintainers:
- email: contact@elastic2ls.com
  name: elastic2ls
```

* apiVersion: v2 ist für Helm 3 und v1 ist für frühere Versionen.
* name: der Namen des Charts.
* description: eine kurze Beschreibung des Charts
* type: Der Diagrammtyp kann entweder **application** oder **library** sein. Charts vom Typ **application** sind das, was in Kubernetes deployt wird .
  **library** Charts sind wiederverwendbar in andern Charts. 
* version: Die Versionsnummer des Charts
* appVersion: Die Versionsnummer unserer Anwendung (Nginx).
* maintainers: Information, wer das Chart verwaltet.

Wir sollten die Versionsnummer appVersion Nummer jedes Mal inkrementieren, wenn wir Änderungen an der Anwendung vornehmen. Es gibt auch noch einige andere mögliche Felder wie **dependencies** usw. 

### Templates

Es gibt einige Standarddateien im templates Verzeichnis. In unserem Fall werden wir einfache Nginx auf Kubernetes bereitstellen. Daher entfernen wir alle Standarddateien aus dem Vorlagenverzeichnis.

```
rm -rf templates/*
```

#### deployment.yaml

Wir werden unsere Nginx-YAML-Dateien hinzufügen und sie zum besseren Verständnis in die Vorlage ändern.

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: "nginx:1.16.0"
          imagePullPolicy: IfNotPresent
          ports:
            - name: http
              containerPort: 80
              protocol: TCP
```

Was hier problematisch ist und dem Ansatz des Templatings widerspricht, sind die statischen Werte in der Datei. Eigentlich wollen wir ja eine Vorlage erstellen, die wir je nach Umgebung mit anderen Werten wieder verwenden wollen.
Um einen Wert als Vorlage zu erstellen, müssen wir lediglich den Objektparameter in geschweifte Klammern einfügen, wie unten gezeigt. Es wird als Template-Direktive bezeichnet und die Syntax ist spezifisch für Go Templates.

{% raw %}
```
{{ .Object.Parameter }}
```
{% endraw %}
Lassen Sie uns zunächst verstehen, was ein Objekt ist. Im Folgenden sind die drei Objekte aufgeführt, die wir in diesem Beispiel verwenden werden.

* Release: Every helm chart will be deployed with a release name. If you want to use the release name or access release-related dynamic values inside the template, you can use the release object.
* Jedes Helm-Chart wird mit dem Release Namen deployt. Wenn wir den Namen des Releases verwenden oder andere auf Release bezogene dynamische Werte innerhalb des Templates zugreifen möchten, 
* können Sie das Release-Objekt verwenden.
* Chart: Wenn wir auf irgendeinen Wert aus der chart.yaml Datei zugreifen wollen können wir das Chart-Objekt verwenden.
* Values: Alle Parameter in der values.yaml Datei können über das Values-Objekt adressiert werden.

Weitere Informationen zu unterstützten Objekten finden wir hier: [Helm Builtin Object](https://helm.sh/docs/chart_template_guide/builtin_objects/).


![Helm](../../img/helm-template.webp)


Zunächst müssen wir uns Gedanken machen, welche Werte wir dynamisch ändern könnten oder was wir als Template verwenden möchten. 

{% raw %}
* name: {{ .Release.Name }}-nginx : Wir müssen den Namen des Deployments anpassen, da Helm uns nicht erlaubt, Releases mit demselben Namen zu installieren. Wenn wir nun ein Release mit dem Namen frontend erstellen, 
  lautet der Namen des Deployments frontend-nginx. Auf diese Weise haben wir einen eindeutigen Namen.
* container name : {{ .Chart.Name }}Als Containernamen verwenden wir das Chart-Objekt und den Namen des Charts aus chart.yaml.
* replicas: {{ .Values.replicaCount }} Wir holen uns den Wert aus der Datei „values.yaml“.
* image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}" Hier verwenden wir mehrere Vorlagenanweisungen in einer einzigen Zeile und greifen auf das Repository und die Tag-Informationen 
 in der values.yaml über den Key image: zu.
{% endraw %}

Hier ist unsere endgültige deployment.yaml Datei nach dem Anwenden des Templates.

{% raw %}
```
apiVersion: apps/v1
kind: Deployment
metadata:
name: {{ .Release.Name }}-nginx
labels:
app: nginx
spec:
replicas: {{ .Values.replicaCount }}
selector:
matchLabels:
app: nginx
template:
metadata:
labels:
app: nginx
spec:
containers:
- name: {{ .Chart.Name }}
image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
imagePullPolicy: {{ .Values.image.pullPolicy }}
ports:
- name: http
containerPort: 80
protocol: TCP
```
{% endraw %}

#### service.yaml

Als Nächstes erstellen wir uns die service.yaml Datei mit folgenden Inhalt.

{% raw %}
```
apiVersion: v1
kind: Service
metadata:
name: {{ .Release.Name }}-service
spec:
selector:
app.kubernetes.io/instance: {{ .Release.Name }}
type: {{ .Values.service.type }}
ports:
- protocol: {{ .Values.service.protocol | default "TCP" }}
port: {{ .Values.service.port }}
targetPort: {{ .Values.service.targetPort }}
```
{% endraw %}

Hier gibt es etwas Besonders. Wir verwenden hier eine Pipe ( | ). Diese wird verwendet, um den Standardwert des Protokolls als TCP festzulegen, falls dieser nicht explizit in der values.yaml mit einem anderen Wert 
überschrieben wird.

#### configmap.yaml
Wir erstellen eine configmap.yaml Datei mit fügen folgendem Inhalt. Hier ersetzen wir die Standardseite index.html von Nginx durch eine benutzerdefinierte HTML-Seite. 
Außerdem nutzen wir im Template den Wert aus der values.yaml um das Enviroment, in das deployt wurde anzuzeigen. 

{% raw %}
```
apiVersion: v1
kind: ConfigMap
metadata:
name: {{ .Release.Name }}-index-html
namespace: default
data:
index.html: |
<html>
<h1>Welcome</h1>
</br>
<h1>Hi! I got deployed in {{ .Values.env.name }} Environment using Helm Chart </h1>
</html
```
{% endraw %}

#### values.yaml
Unsere angepasste values.yaml Datei enthält alle Werte, die in den Templates ersetzt werden müssen . Beispielsweise enthält die deployment.yaml Datei eine Anweisung, um u.a. den Namen des Container-Images und den Tag dynamisch zu ersetzen.

{% raw %}
```
replicaCount: 2

image:
  repository: nginx
  tag: "1.16.0"
  pullPolicy: IfNotPresent

service:
  name: nginx-service
  type: ClusterIP
  port: 80
  targetPort: 9000

env:
 name: dev
```
{% endraw %}

Jetzt haben wir unser Nginx Helm-Chart fertig und die endgültige Struktur sieht wie folgt aus.

```
nginx-chart
├── Chart.yaml
├── charts
├── templates
│   ├── configmap.yaml
│   ├── deployment.yaml
│   └── service.yaml
└── values.yaml
```

### Validieren des Helm-Diagramms

Um nun sicherzustellen, dass unser Diagramm valide ist, können wir den folgenden Befehl ausführen. Dazu wechsel wir in das Verzeichnis des Charts und führen folgenden Befehl aus.

```
helm lint .
```

Wenn kein Fehler oder Problem vorliegt, wird dieses Ergebnis angezeigt

```
==> Linting ./nginx
[INFO] Chart.yaml: icon is recommended

1 chart(s) linted, 0 chart(s) failed
```

Um zu überprüfen, ob die Werte in den Vorlagen ersetzt werden, können wir die YAML-Vorlagendateien mit den Werten rendern lassen. Es werden alle Dateien des Manifests mit den ersetzten Werten generiert und angezeigt.

```
helm template .
```

Wir können mit `--dry-run` schauen, wie das Chart im cluster installiert werden würde.

```
helm install --dry-run my-release nginx-chart
```

### Stellen Sie das Helm-Diagramm bereit
Wir können nun das Chart bereitstellen. Helm liest die passenden Werte aus der values.yamlDatei und generiert die Manifestdateien. Anschließend werden diese Dateien an den Kubernetes-API-Server gesendet und Kubernetes erstellt die angeforderten Ressourcen im Cluster.


Führen wir den folgenden Befehl aus, wird das Chart im **default** Namaspace inslliert, wobei wir ***nginx-release** als Release-Name und **nginx-chart** als Namen des Charts verwenden. 

```
helm install frontend nginx-chart
```

War die Installation erfolgreich sieht die Ausgabe wie unten aus.

```
NAME: frontend
LAST DEPLOYED: Tue June 14 21:15:06 2023
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
```


Jetzt können Sie die Release-Liste mit diesem Befehl überprüfen:
```
helm list
```

Mittels **kubectl** können wir nun gezielt die Services, Pods usw. überprüfen.
```
kubectl get deployment
kubectl get services
kubectl get configmap
kubectl get pods
```

![Helm](../../img/kubectl-get-deplyoment.webp)


Wir können die Bereitstellung sehen frontend-nginxund nginx-servicedie Pods sind in Betrieb, wie unten gezeigt.

### Dynamisches Deployment für eine Stage
Wir Eingangs davon gesprochen, wie ein einzelnes Helmdiagramm für mehrere Umgebungen unter Verwendung unterschiedlicher values.yaml Dateien installiert werden kann. 

Um unser Helm-Chart mit einer anderen **values.yaml** Datei zu installieren, können wir diese mittels `--values` und dem Pfad zu der Datei angeben.

```
helm install frontend nginx-chart --values env/prod.yaml
```

### Helm-Upgrade und Rollback
Angenommen, wir möchten das Diagramm anpassen und die aktualisierte Version installieren, können wir den folgenden Befehl verwenden:

```
helm upgrade frontend nginx-chart
```

Wenn wir nun die gerade vorgenommenen Änderungen rückgängig machen und die vorherige erneut bereitstellen möchten, können wir dazu den Befehl „rollback“ verwenden.

![Helm](../../img/helm-upgrade.webp)

```
helm rollback frontend
```

![Helm](../../img/helm-rollback.webp)


Wenn wir das Helm-Chart z.B. auf eine spezifische Version zurücksetzen möchten, können wir die Revisionsnummer wie folgt verwenden.

```
helm rollback <release-name> <revision-number>
```

### Deinstallieren des Helm-charts
Um das Helm-Chart zu deinstallieren, verwenden wir den Befehl uninstall. Dadurch werden alle mit der letzten Version des Diagramms verknüpften Ressourcen entfernt.

```
helm uninstall frontend
```

### Debuggen von Helm-Charts
Mit den folgenden Befehlen können wir die Helmdiagramme und -vorlagen debuggen.

* helm lint: Dieser Befehl nimmt einen Pfad zu einem Diagramm und führt eine Reihe von Tests durch, um zu überprüfen, ob das Diagramm valide ist.
* helm get values: Dieser Befehl gibt die im Cluster installierten Release-Werte aus.
* helm install --dry-run: Mit dieser Funktion können wir alle Ressourcenmanifeste überprüfen und sicherstellen, dass alle Vorlagen ordnungsgemäß funktionieren.
* helm get manifest: Dieser Befehl gibt die Manifeste aus, die im Cluster ausgeführt werden.
* helm diff: Es werden die Unterschiede zwischen den beiden Revisionen ausgegeben.

```
helm diff revision nginx-chart 1 2
```

### Mögliche Fehler im Helm-Chart

Beim Versuch ein vorhandenes Helmpaket zu installieren, wird die folgende Fehlermeldung angezeigt.

```

Error: INSTALLATION FAILED: cannot re-use a name that is still in use
```

Um die Version zu aktualisieren oder zu aktualisieren, müssen Sie den Upgrade-Befehl ausführen.

Beim Versuch das Chart von einem anderen Speicherort aus zu installieren, ohne den absoluten Pfad anzugeben, erscheint folgende Fehlermeldung.

```
Error: non-absolute URLs should be in form of repo_name/path_to_chart
```

Um dies zu beheben, müssen wir den Helm-Befehl in dem Verzeichnis ausführen, in dem sich das Chart befindet, oder den absoluten oder relativen Pfad angeben.

### Best Practices für Helm-Charts
Im Folgenden sind einige der Best Practices aufgeführt, die bei der Entwicklung eines eigenen Charts befolgt werden sollten.

* Dokumentiere dein Chart.
* Die Kubernetes-Manifestdateien sollten nach der Art des verwendeten Typs benannt werden. z.B. deployment.yaml, service.yaml
* Der Name des charts sollte ausschliesslich klein geschrieben sein. Enthält er mehr als ein Wort, sollten diese durch Bindestriche (-) getrennt werden.
* In der Datei „values.yaml“ sollte die Keys ausschliesslich in Kleinbuchstaben angegeben werden.
* String immer in Anführungszeichen einschliessen, auch wenn es theoretisch nicht notwendig ist.
* Am besten Helm Version 3 verwenden.

### Zusammenfassung

Wir haben das Helm-Chart und seine Struktur ausführlich besprochen. Wir haben ein Chart von Grund auf erstellt und dieses dann bereitgestellt.
Außerdem haben wir ein Upgrade durchgeführt, sowie ein Rollback und die Deinstallation. Helm ist ein sehr nützlicher Paketmanager für Kubernetes. Wenn Sie unterschiedliche Umgebungen mit unterschiedlichen Anforderungen haben, bietet Helm eine hervorragende Möglichkeit, 
Kubernetes-Manifeste entsprechend dynamisch aus dem Template zu erstellen.


Eine Alternative zu Helm ist Kustomize. Hier werden keine Vorlagen verwendet, sondern das Konzept der **Overlays** also überschreibungen. Weitere Informationen finden Sie im Kustomize-Tutorial .