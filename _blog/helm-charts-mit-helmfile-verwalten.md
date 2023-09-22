---
layout: post
title: Helm-Charts mit Helmfile verwalten
subtitle: In diesem Blogbeitrag werden wir uns anschauen, wie ein Helmfile die Verwaltung von Helm-Charts und -Umgebungen erleichtert.

keywords: [Helm Chart Helmfile]
categories: [DevOps]
---
# {{ page.title }}

![Helm](../../img/HELM-logox130.webp)

In diesem Blogbeitrag werden wir uns anschauen, wie ein [Helmfile](https://github.com/roboll/helmfile) die Verwaltung von Helm-Charts und -Umgebungen erleichtert.

Dazu werden wir ein Beispiel durchgehen, bei dem wir zu Beginn mithilfe des `helm` Befehls Helm-Charts über die CLI installieren und dann den Code schrittweise umgestalten, um das Ganze letztendlich als Helmfile nutzen zu können.

## Setup
Unser Setup besteht aus 2 Anwendungen (Backend und Frontend) und Prometheus für Metriken. Wir haben Helm-Charts für:

* Backend (benutzerdefiniertes Chart)
* Frontend (benutzerdefiniertes Xhart)
* Prometheus (Chart aus dem Helm Stable Repo)

die in diesen Umgebungen bereitgestellt werden:

* Development
* Staging
* Production

Die Dateien sind in dieser Verzeichnisstruktur organisiert:

```bash
.
└── charts
   ├── backend
   │  ├── Chart.yaml
   │  ├── templates
   │  └── values-development.yaml
   │  └── values-staging.yaml
   │  └── values-production.yaml
   │  └── secrets-development.yaml
   │  └── secrets-staging.yaml
   │  └── secrets-production.yaml
   └── frontend
   │  ├── Chart.yaml
   │  ├── templates
   │  └── values-development.yaml
   │  └── values-staging.yaml
   │  └── values-production.yaml
   │  └── secrets-development.yaml
   │  └── secrets-staging.yaml
   │  └── secrets-production.yaml
   └── prometheus
      └── values-development.yaml
      └── values-staging.yaml
      └── values-production.yaml
```

Jede Datei „values-development.yaml“, „values-staging.yaml“ und „values-produktion.yaml“ enthält Werte, die für diese Umgebung spezifisch sind.  

Beispielsweise muss die Entwicklungsumgebung nur ein Replikat des Backends bereitstellen, während die Staging- und Produktionsumgebungen drei Replikate benötigen. 
Wir nutzen Helm-Secrets, um Geheimnisse zu verwalten. Jede Secrets Datei ist verschlüsselt und muss vor der Bereitstellung des Diagramms manuell entschlüsselt werden. Nach Abschluss der Bereitstellung muss die entschlüsselte Datei gelöscht werden.

## Installation und Upgrades
Mit dem obigen Setup verwenden wir die folgenden Befehle, um das Backend-Diagramm in der Staging-Umgebung bereitzustellen:

```bash
$ helm Secrets dec ./charts/backend/secrets-backend.yaml
$ helm upgrade --install --atomic --cleanup-on-fail -f ./charts/backend/values-staging.yaml -f ./charts/ backend/secrets-staging.yaml backend ./charts/backend
$ rm ./charts/backend/secrets-backend.yaml.dec
```

Wir verwenden den `helm upgrade` Befehl mit dem Argument `--install`, um Charts mit demselben Befehl installieren und aktualisieren zu können. Zusätzlich verwenden wir die Argumente `--atomic` und auch `--cleanup-on-fail`,
um Änderungen rückgängig zu machen, falls ein Chart-Upgrade fehlschlägt.

Um die anderen Diagramme bereitzustellen, müssen wir die Befehle wiederholen.

Das Problem besteht nun darin, dass es schwierig ist, sich die genauen Befehle zu merken, die beim Bereitstellen eines Diagramms ausgeführt werden müssen (insbesondere, wenn die Aktualisierungen nicht sehr häufig sind). 
Wenn mehrere Personen für Bereitstellungen verantwortlich sind, ist es außerdem schwierig sicherzustellen, dass dieselben Befehle verwendet werden. Wenn die Geheimnisse beispielsweise nicht zuvor entschlüsselt wurden, führt dies dazu, 
dass verschlüsselte Werte bereitgestellt werden und die Anwendung wahrscheinlich nicht mehr nutzbar ist. Grundsätzlich sind manuelle Updates aus den oben genannten Gründen zu vermeiden.

## Bash-Skripte 

Um die oben genannten Probleme zu beheben, könnten wir Bash-Skripte schreiben, die genau die Befehle ausführen, die für eine Bereitstellung erforderlich sind. Wir könnten uns ein Skript pro Umgebung erstellen, dass zu folgendem Verzeichnisbaum für das Backend-Diagramm führt:

```bash
. 
└── Diagramme 
   ├── Backend 
      ├── Chart.yaml 
      ├── Vorlagen/ 
      └── Values-Development.yaml 
      └── Values-Staging.yaml 
      └── Values-Production.yaml 
      └── Secrets-Development. yaml 
      └── Secrets-Staging.yaml 
      └── Secrets-Production.yaml 
      └── Deploy-Development.sh 
      └── Deploy-Staging.sh 
      └── Deploy-Production.sh
```

Wenn wir das Backend-Diagramm in der Staging-Umgebung bereitstellen möchten, können wir Folgendes ausführen:

```bash
$ ./charts/backend/deploy-staging.sh
```

Dies funktioniert gut für kleine Umgebungen wie im obigen Beispiel, aber für größere Umgebungen mit 15 oder 20 Charts führt es zu vielen ähnlich aussehenden Bash-Skripten mit großen Mengen an Codeduplizierungen.

Die Bereitstellung einer neuen Umgebung würde bedeuten, dass in jedem Diagrammverzeichnis ein neues Bereitstellungsskript erstellt werden muss. Wenn wir 15 Diagramme haben, bedeutet das, dass wir eines der vorhandenen Bereitstellungsskripte 15 Mal kopieren und den Inhalt suchen/ersetzen müssen, damit er mit dem neuen Umgebungsnamen übereinstimmt.

Um zu vermeiden, dass derselbe Code immer wieder dupliziert wird, könnten wir alle unsere kleinen Bereitstellungsskripte in einem großen Bereitstellungsskript zusammenfassen. Dies ist jedoch mit Kosten verbunden: Wir müssen Zeit für die Wartung, die Behebung von Fehlern und möglicherweise für die Erweiterung auf neue Umgebungen aufwenden.

An dieser Stelle ist Helmfile praktisch. Anstatt unser benutzerdefiniertes Bereitstellungsskript zu schreiben, können wir unsere Umgebungen in einer YAML-Datei deklarieren und die Bereitstellungslogik für uns übernehmen lassen.

## Verwendung einer Helmdatei
Am Beispiel des Backend-Charts können wir den folgenden Inhalt in eine `helmfile.yaml` Datei schreiben, um die Staging-Bereitstellung zu verwalten:

```yaml
releases:
- name: backend
  chart: charts/backend
  values:
  - charts/backend/values-staging.yaml
  secrets:
  - charts/backend/secrets-staging.yaml
```

Bereitstellen können wir das Chart mittels:

```bash
$ helmfile sync
```

Im Hintergrund führt Helmfile den gleichen `helm upgrade --install` ... Befehl wie zuvor aus.

> HINWEIS! Beachten Sie, dass Secrets nicht mehr manuell entschlüsselt werden müssen, da Helmfile über eine integrierte Unterstützung für Helm-Secrets verfügt. 
> Das bedeutet, dass alle unten aufgeführten Dateien Secrets automatisch entschlüsselt werden und nach Abschluss der Bereitstellung die entschlüsselte Datei automatisch entfernt wird.

## Environments

Das obige Beispiel verwendet die `values-staging.yaml` Datei als statischen Wert. Um mehrere Umgebungen dynamisch nutzen zu können, können wir diese unter dem Schlüssel `environments:`am Anfang der Helmdatei 
auflisten und dann die Umgebungsnamen als Variable in der Release-Definition verwenden. Die Datei sieht nun so aus:

{% raw %}
```yaml
environments:
  development:
  staging:
  production:

releases:
- name: backend
  chart: charts/backend
  values:
  - charts/backend/values-{{ .Environment.Name }}.yaml
  secrets:
  - charts/backend/secrets-{{ .Environment.Name }}.yaml
```
{% endraw %}

Beim Bereitstellen des Charts müssen wir nun `--environment/ -e` beim Ausführen des Helmfile Befehls als Option verwenden:

```bash
$ helmfile -e staging sync
```

Wir können jetzt ganz einfach neue Umgebungen hinzufügen, indem wir sie unter dem Schlüssel `environment:` auflisten, anstatt unsere Bash-Skripte zu duplizieren.

## Templates
Nachdem wir alle unsere Helm-Charts zur Helmdatei hinzugefügt haben, könnte der Dateiinhalt so aussehen:

{% raw %}
```yaml
environments:
  development:
  staging:
  production:

releases:
- name: backend
  chart: charts/backend
  values:
  - charts/backend/values-{{ .Environment.Name }}.yaml
  secrets:
  - charts/backend/secrets-{{ .Environment.Name }}.yaml

- name: frontend
  chart: charts/frontend
  values:
  - charts/frontend/values-{{ .Environment.Name }}.yaml
  secrets:
  - charts/frontend/secrets-{{ .Environment.Name }}.yaml

- name: prometheus
  chart: stable/prometheus
  version: 11.0.4
  values:
  - charts/prometheus/values-{{ .Environment.Name }}.yaml
```
{% endraw %}

Wie man sieht, wiederholen sich die Muster für `values:` und `secrets:` in der Datei. Während wir hier lediglich drei Umgebungen haben und alles noch überschaubar ist, könnte es beim weiteren hinzufügen von Umgebungen zu einer grossen Menge doppelten Codes führen.
Wir können das ständige replizieren der Release-Definitionen vermeiden, indem wir im Helmfile Vorlagen verwenden. Eine Vorlage wird oben in der Datei definiert und dann in der Version mithilfe von Ankern in YAML referenziert. 

Dies ist unsere Helmdatei nach der Verwendung von Vorlagen:

{% raw %}
```yaml
environments:
  development:
  staging:
  production:

templates:
  default: &default
    chart: charts/{{`{{ .Release.Name }}`}}
    missingFileHandler: Warn
    values:
    - charts/{{`{{ .Release.Name }}`}}/values-{{ .Environment.Name }}.yaml
    secrets:
    - charts/{{`{{ .Release.Name }}`}}/secrets-{{ .Environment.Name }}.yaml

releases:
- name: backend
  <<: *default

- name: frontend
  <<: *default

- name: prometheus
  <<: *default
  # override the defaults since it's a remote chart
  chart: stable/prometheus
  version: 11.0.4
```
{% endraw %}

Wir haben einen Großteil des duplizierten Codes aus unserer Helmdatei entfernt und können jetzt problemlos neue Umgebungen und Releases hinzufügen.

## Helm Defaults
Wir haben zuvor beim Bereitstellen von Diagrammen die Optionen `--atomic` und verwendet `--cleanup-on-fail` . Das können wir auch direkt im Helmfile deklarieren unter `helmDefaults:`

```yaml
helmDefaults: 
  atomic: true 
  cleanupOnFail: true
```

## Ausführen von Helmfile
Hier folgen noch einige Beispiele, wie wir den Helmfile Befehl aufrufen können.

Um alle Diagramme in einer Umgebung zu installieren oder zu aktualisieren (am Beispiel von Staging), führen wir Folgendes aus:

```bash
$ helmfile -e Staging-Synchronisierung
```

Wenn wir nur ein einzelnes Chart in einer spezifischen Umgebung synchronisieren möchten, können wir Selektoren verwenden. Dieser Befehl synchronisiert das Backend-Chart in der Staging-Umgebung:

```bash
$ helmfile -e staging -l name=backend sync
```

Um die Änderungen anzuzeigen, die eine Operation an einem Cluster durchführen würde, ohne sie tatsächlich anzuwenden, können wir den folgenden Befehl ausführen. Erfordert das [Helm-Diff](https://github.com/databus23/helm-diff) Plugin:

```bash
$ helmfile -e staging -l name=prometheus diff
```

## Beispiel Helmfile - komplett

{% raw %}
```yaml
environments:
  development:
  staging:
  production:

helmDefaults:
  atomic: true
  cleanupOnFail: true

templates:
  default: &default
    chart: charts/{{`{{ .Release.Name }}`}}
    missingFileHandler: Warn
    values:
    - charts/{{`{{ .Release.Name }}`}}/values-{{ .Environment.Name }}.yaml
    secrets:
    - charts/{{`{{ .Release.Name }}`}}/secrets-{{ .Environment.Name }}.yaml

releases:
- name: backend
  <<: *default

- name: frontend
  <<: *default

- name: prometheus
  <<: *default
  chart: stable/prometheus
  version: 11.0.4
```
{% endraw %}

Die Verzeichnisstruktur hat sich nicht geändert und ist dieselbe wie oben im Beitrag beschrieben.

## Fazit
In diesem Beitrag haben wir uns angeschaut, wie uns durch die Verwendung eines Helmfiles, die Bereitstellung von Charts in verschiedenen Umgebungen vereinfachen können. Wir reduzieren wesentlich die Komplexität und erhöhen die Wartbarkeit. 
Ausserdem reduzieren wir massiv doppelten Code.