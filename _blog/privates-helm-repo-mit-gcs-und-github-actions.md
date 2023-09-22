---
layout: post
title: Helm-Charts mit Helmfile verwalten
subtitle: In diesem Beitrag werden wir schauen, wie man ein privates Helm-Diagramm-Repository auf Google Cloud Storage (GCS) eingerichtet und GitHub-Aktionen verwendet werden können, um Charts bei neuen Commits automatisch zu pushen.

keywords: [Helm Chart Helmfile]
categories: [DevOps]
---

# {{ page.title }}

![Helm](../../img/HELM-logox130.webp)

In diesem Beitrag werden wir schauen, wie man ein privates Helm-Diagramm-Repository auf Google Cloud Storage (GCS) eingerichtet und GitHub-Aktionen verwendet werden können, um Charts bei neuen Commits automatisch zu pushen.

## Einrichten des GCS-Buckets
Der erste Schritt besteht darin, einen GCS-Bucket zu erstellen, der als Storage für unsere Charts dient. Wir können dies über die CLI mit dem gcloud-sdk oder über die Web-Benutzeroberfläche tun. Wir werden die CLI für die folgenden Beispiele verwenden.

Um die Handhabung von Zugriffsberechtigungen zu vereinfachen, verwenden wir das `-b on` Argument, um einen einheitlichen Zugriff auf Bucket-Ebene zu ermöglichen. Damit können wir Berechtigungen auf Bucket-Ebene statt auf Objektebene verwalten:

```bash
$ gsutil mb -b auf gs://charts-elastic2ls
 Erstellen von gs://charts-elastic2ls/...
```

Damit wir Helm-Charts in diesen Bucket übertragen können, benötigen wir ein Cloud IAM Serviceaccount mit **_Storage Object Admin_** Berechtigungen:

```bash
$ gcloud iam service-accounts create charts-elastic2ls-svc-account
Created service account [charts-elastic2ls-svc-account].

$ gcloud iam service-accounts keys create service-account.json --iam-account=charts-elastic2ls-svc-account@PROJECT.iam.gserviceaccount.com
created key [987654321] of type [json] as [service-account.json] for [charts-elastic2ls-svc-account@PROJECT.iam.gserviceaccount.com]

$ gsutil iam ch serviceAccount:charts-elastic2ls-svc-account@PROJECT.iam.gserviceaccount.com:roles/storage.objectAdmin gs://charts-elastic2ls
```

Wenn wir uns auf den Serviceaccount beziehen, müssen wir die E-Mail-Adresse verwenden, die das Format **_SERVICE_ACCOUNT_NAME@PROJECT_ID.iam.gserviceaccount.com_** hat.

## Einrichten von GitHub-Actions
In diesem Schritt richten wir GitHub-Actions ein, um geänderte Charts zu erkennen und sie unserem Helm-Repository hinzuzufügen.

Wir beginnen mit der Erstellung der `.github/workflows/helm-ci.yml` Datei und fügen Folgendes hinzu:

```bash
name: Helm Charts
on: [push]

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          fetch-depth: 2
```

Standardmäßig klonen wir mit der Checkout-Aktion das Repo als **_detached HEAD_**. Um später Dateien zu vergleichen, die sich zwischen dem aktuellen HEAD und dem vorherigen Commit geändert haben, müssen wir `fetch-depth: 2` n die Aktion übergeben.

Nachdem wir den Code gepusht haben, können wir GitHub Actions im Browser öffnen und den Workflow überprüfen. Es sollte so aussehen:

![github-actions-workflow](../../img/github-actions-workflow-r.webp)

## Helm und helm-gcs installieren

Der nächste Schritt in der CI-Pipeline ist die Installation von Helm und dem Plugin [helm-gcs](https://github.com/hayorov/helm-gcs). Wir fügen unserem Workflow den folgenden Schritt hinzu:

```yaml
- name: Install helm and plugins
  run: ./scripts/install.sh
```

und erstellen Sie dann die scripts/install.shDatei mit folgendem Inhalt:

{% raw %}
```bash
#!/usr/bin/env bash

set -o errexit

HELM_VERSION=3.1.1
HELM_GCS_VERSION=0.3.1

echo "Installing Helm..."
wget -q https://get.helm.sh/helm-v${HELM_VERSION}-linux-amd64.tar.gz
tar -zxf helm-v${HELM_VERSION}-linux-amd64.tar.gz
sudo mv linux-amd64/helm /usr/local/bin/helm
helm version

echo "Installing helm-gcs plugin..."
helm plugin install https://github.com/hayorov/helm-gcs --version ${HELM_GCS_VERSION}
```


Mittels `chmod u+x scripts/install.sh` machen wir die Datei ausführbar und pushen diese ins Repo Wir können GitHub-Actions überprüfen, um sicherzustellen, dass alles korrekt installiert wurde:

![GitHub-Actions](../../img/gh-actions-2.webp)
Dies zeigt uns, dass Helm 3.1.1 und helm-gcs 0.3.0 erfolgreich installiert wurden

Wir können jetzt das Helm-Repository initialisieren. Damit dies funktioniert, müssen wir unseren zuvor erstellten Schlüssel des Service-Accounts zu GitHub hinzufügen.
Dazu navigieren wir zum Repository und klicken auf "Settings" → "Secrets" → "Add a new secret". Dort legen wir den Namen fest `GCLOUD_SERVICE_ACCOUNT_KEY` und fügen als Wert den Inhalt der Datei service-account.json hinzu. 
Nach dem Speichern des Geheimnisses sollte es so aussehen:

![GitHub-Actions](../../img/gh-actions-3.webp)

Wir können jetzt den Workflow anpassen, um das Secret als Umgebungsvariable an unser nächstes Shell-Skript zu übergeben:

{% raw %}
```yaml
- name: Release charts
  run: ./scripts/release.sh
  env:
    GCLOUD_SERVICE_ACCOUNT_KEY: ${{ secrets.GCLOUD_SERVICE_ACCOUNT_KEY }}
```
{% endraw %}

Im Skript `release.sh` speichern wir den Inhalt des Secrets GCLOUD_SERVICE_ACCOUNT_KEY in einer Datei und setzen die Umgebungsvariable GOOGLE_APPLICATION_CREDENTIALS auf den gleichen Wert.
Dies ist für die Authentifizierung des Helm-GCS-Plugins erforderlich. Anschließend initialisieren wir das GCS-Repo, wodurch eine leere Datei mit dem Namen `index.yaml` im GCS-Bucket erstellt wird.
Schließlich können wir das Repo zu Helm hinzufügen, damit es auf seine Pakete zugreifen kann.

{% raw %}
```bash
#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

GCS_BUCKET_NAME="gs://charts-elastic2ls"

# setup service account for helm-gcs plugin
echo "${GCLOUD_SERVICE_ACCOUNT_KEY}" > svc-acc.json
export GOOGLE_APPLICATION_CREDENTIALS=svc-acc.json

# initializing helm repo
# (only needed on first run but will do nothing if already exists)
echo "Initializing helm repo"
helm gcs init ${GCS_BUCKET_NAME}

# add gcs bucket as helm repo
echo "Adding gcs bucket repo ${GCS_BUCKET_NAME}"
helm repo add private ${GCS_BUCKET_NAME}
```
{% endraw %}

Vor dem commiten der Datei diese noch ausführbar machen mit: `chmod u+x scripts/release.sh`

## Package und Pushen der angepassten Charts
Im letzten Schritt unseres CI-Skripts müssen wir identifizieren, welche Charts sich geändert haben, und sie dann packen und in das Helm-Repository pushen. Wir tun dies, indem wir `git diff` auf der vorherigen Revision mit den folgenden Argumenten ausführen:

* `--find-renames` Erkennen Sie, ob eine Datei umbenannt wurde
* `--diff-filter=d` ignoriert gelöschte Dateien (wir können ein gelöschtes Diagramm nicht packen/pushen)
* `--name-only` Gibt nur den Namen der geänderten Datei aus
* `cut -d '/' -f 2 | uniq` Wir benötigen nur eindeutige Verzeichnisnamen von Dateien, die sich geändert haben


Wir fügen der Datei release.sh den folgenden Inhalt hinzu:

```bash
prev_rev=$(git rev-parse HEAD^)
echo "Identifying changed charts since git rev ${prev_rev}"

changed_charts=()
readarray -t changed_charts <<< "$(git diff --find-renames --diff-filter=d --name-only "$prev_rev" -- charts | cut -d '/' -f 2 | uniq)"

if [[ -n "${changed_charts[*]}" ]]; then
    for chart in "${changed_charts[@]}"; do
        echo "Packaging chart '$chart'..."
        chart_file=$(helm package "charts/$chart" | awk '{print $NF}')

        echo "Pushing $chart_file..."
        helm gcs push "$chart_file" private
    done
else
    echo "No chart changes detected"
fi
```

Wir pushen die Änderungen ins Repository. Nachdem der CI-Lauf abgeschlossen ist, wird der GCS-Bucket initialisiert und enthält eine `index.yaml` Datei. 
Diese Datei ist ein Index aller Helm-Charts im Repo. Da wir derzeit keine Charts indiziert haben, hat es folgenden Inhalt:

```yaml
$ gsutil cat gs://charts-elastic2ls/index.yaml
 apiVersion: v1
Einträge: {}
generiert: „2023-09-08T15:51:49.496233811Z“
```

## Veröffentlichung unseres ersten Charts
Jetzt können wir das erste Chart erstellen und zu unserem Helm-Repository hinzufügen. Dazu führen wir `helm create` im Ordner charts um ein Standard Chart zu erstellen:

```bash
$ mkdir charts
$ helm create charts/foo
Creating von charts/foo
```

Im Anschluss pushen wir dieses Beispiel Chart ins Repo und prüfen GitHub Actions. Dort können wir sehen, dass das Chart erfolgreich gepackt und ins Helm-Repository übertragen wurde.

> HINWEIS! Beachten Sie, dass es nicht möglich ist, dieselbe Chartversion in dasselbe Repository zu übertragen. Der Push wird scheitern. Wir müssen immer darauf achten, den Versionswert in der `Chart.yaml` Datei zu erhöhen, wenn wir ein neues Chart veröffentlichen.

## Probieren wir es aus
Um unser privates Helm-Repo auszuprobieren, können wir es zu Helm auf unserem Client-Rechner hinzufügen und den Repo-Inhalt auflisten:

```bash
$ helm plugin install https://github.com/hayorov/helm-gcs
$ gcloud auth application-default login
$ helm repo add private-repo gs://my-chart-repo-arthurk
$ helm repo update
$ helm search repo private-repo -l
NAME            	CHART VERSION	APP VERSION	DESCRIPTION
private-repo/foo	0.1.0        	1.16.0     	A Helm chart for Kubernetes
```

Wie wir sehen können, wurde das Chart erfolgreich zur Registry hinzugefügt. Es kann nun wie jedes andere Chart verwendet werden, indem es beispielsweise mit dem Befehl `helm install private-repo/foo --version 0.1.0` installiert wird.

Der Quellcode für alle Beispiele ist in diesem [GitHub-Repo](https://github.com/AlexanderWiechert/private-gcs-helm) verfügbar.