---
layout: post
title: Argo Workflows Tutorial
subtitle: In diesem Tutorial will ich euch zeigen, wie man Argo Workflow in einem lokalen Kubernetes Cluster installiert und ein paar Beispiel Workflows ausführen kann.
keywords: [Argo Workflows, Workflows, Gitops, Helm, Kubernetes]
categories: [DevOps]
---
# {{ page.title }}

![](../../img/argocd-200x200.webp)

In diesem Tutorial will ich euch zeigen, wie man Argo Workflow in einem lokalen Kubernetes Cluster installiert und ein paar Beispiel Workflows ausführen kann.
Argo Workflows ist eine Workflow-Engine zum Erstellen, Verwalten und Orchestrieren paralleler Jobs in Kubernetes. Diese Workflows sind als Kubernetes CustomResourceDefinitions(CRDs) implementiert und 
ermöglichen u.a. die Ausführung von rechenintensiven ELT Jobs, maschinelle Lernaufgaben und Datenverarbeitungsaufgaben.


## Funktion von Argo-Workflows
Argo Workflows bietet eine Reihe nützlicher Funktionen::

* Webbasierte Benutzeroberfläche
* Native Unterstützung zum Speichern von Artefakten (MinIO, S3, Artifactory, HDFS, OSS, HTTP, Git, GCS, Raw)
* Templates- und zeitgesteuerte Workflows
* Workflow Archiv
* REST-API
* Argo CLI

Die Workflow Ressource wird verwendet, um die Ausführung des Workflows sowie seinen Speicherstatus zu definieren. Workflows bestehen aus Anweisungen, die Funktionen ähneln und in Argo als Templates bezeichnet werden.
Templates beschreiben detailliert die Ausführungsschritte im Workflow. Die Spezifikation ist der wichtigste Teil des Workflow Manifests. 


Die Spezifikation besteht aus zwei Abschnitten:

* **Templates**: Hier definieren Sie die verschiedenen Arten von Vorlagen, die Sie verwenden möchten.
* **Entrypoint**: Der Einstiegspunkt bestimmt, welche Vorlage zuerst verwendet wird.


Eine Vorlage kann eine der folgenden sein:

* **Container**: Dies ist wahrscheinlich der häufigste Vorlagentyp und plant, wie der Name schon sagt, einen Container. Seine Spezifikation ist identisch mit der eines Kubernetes-Containers.
* **Script**: Dies ist ein praktischer Wrapper um den Container. Die Spezifikation ist mit der des Containers identisch, verfügt zusätzlich über ein `source` Feld, in dem wir ein Skript definieren können. Das Skript wird in einer Datei gespeichert und von dort ausgeführt.
* **Ressource**: Mit dieser Vorlage können CRUD-Vorgänge (Erstellen, Lesen, Aktualisieren, Löschen) direkt für Ressourcen im Cluster ausgeführt werden.
* **Suspend**: Dieses Template wird verwendet, um die Ausführung eines Workflows anzuhalten.
* **Directed Acyclic Graph (DAG)**: Mit dieser Vorlage können Sie die Aufgaben in einem Workflow als Diagramm von Abhängigkeiten definieren.
* **Steps**: Mit dieser Vorlage können Sie die Aufgaben in Ihrem Workflow als aufeinanderfolgende Schritte definieren. Sie können parallel oder nacheinander ausgeführt werden.


## Voraussetzungen
Für dieses Tutorial benötigen wir folgendes:

* [Rancher-Desktop](https://rancherdesktop.io/) oder eine vergleichbare Engine zum Ausführen von Containern
* lokaler Kubernetes Cluster, ich nutze [Kind](https://kind.sigs.k8s.io/)
* [kubectl](https://kubernetes.io/docs/tasks/tools/)
* [Helm](https://helm.sh/docs/intro/install/)
* [K9s (optional)](https://k9scli.io/)


## Installation ein Verbinden mit dem Kubernetes Cluster 

Als Erstes benötigen wir einen lokalen Kubernetes Cluster. Wir werden hier Kind nutzen.

Auf dem Mac installieren wir Kind mit `brew`
```bash
brew install kind
```

Und erstellen eine Cluster. Wir nennen ihn `argo-workflows`. 
```bash
kind create cluster --name argo-workflows
```

Um mit dem CLuster zu interagieren setzen wir den Context.

```bash
kubectl cluster-info --context kind-argo-workflows
```

## Argo CLI installieren
Der nächste Schritt besteht darin, die Argo-CLI zu installieren. Dazu führen wir Folgendes aus.

```bash
# Download the binary
curl -sLO https://github.com/argoproj/argo-workflows/releases/download/v3.4.5/argo-darwin-amd64.gz

# Unzip
gunzip argo-darwin-amd64.gz

# Make binary executable
chmod +x argo-darwin-amd64

# Move binary to path
mv ./argo-darwin-amd64 /usr/local/bin/argo

# Test installation
argo version
```

## Argo Workflows installieren
Der einfachste Weg ist es das Installationsmanifest per `kubectl apply` zu installieren. 

```bash
kubectl create ns argo-workflows
kubectl apply -n argo-workflows -f https://github.com/argoproj/argo-workflows/releases/download/v3.4.5/install.yaml
```

Wir werden aber in diesem Tutorial das Ganze mittels Helm installieren.

Dazu legen wir uns die Ordnerstruktur an `mkdir -p charts/argo-workflows`. Dort erstellen wir uns die Datei `Chart.yaml` mit folgendem Inhalt. Wichtig ist dabei die Referenz auf die Versionsnummer. Diese findet ihr [hier](https://github.com/argoproj/argo-helm/releases).

```yaml
apiVersion: v2
name: argo-workflows
version: 1.0.0
dependencies:
  - name: argo-workflows
    version: 0.33.3
    repository: https://argoproj.github.io/argo-helm
```
Nun können wir das Argo Workflow Chart installieren, mit folgenden Schritten.

```bash
helm repo add argo-workflows https://argoproj.github.io/argo-helm

"argo-workflows" has been added to your repositories
```

```bash
helm dependency build charts/argo-workflows

Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "argo-workflows" chart repository
Update Complete. ⎈Happy Helming!⎈
Saving 1 charts
Downloading argo-workflows from repo https://argoproj.github.io/argo-helm
Deleting outdated charts
```

```bash
helm install -n argo-workflows argo-workflows charts/argo-workflows

NAME: argo-workflows
LAST DEPLOYED: Tue Sep 26 12:23:43 2023
NAMESPACE: default
STATUS: deployed
REVISION: 1
TEST SUITE: None
```

```bash
kubectl get pods --watch -n argo-workflows
NAME                                                  READY   STATUS      RESTARTS   AGE
argo-workflows-server-54cf69897f-4bsbv                0/1     Running     0          19s
argo-workflows-workflow-controller-7c86454b49-jqxn2   1/1     Running     0          19s

```


## Zusätzliche Resourcen im Cluster

Um sich am Argo-Workflows Dienst anzumelden, müssen wir uns einen `ServiceAccount` **Access-Token** erstellen. Hierfür müssen wir uns eine Rolle bzw. Cluster-Rolle, das dazugehörige Rolebinding, einen ServiceAccount und ein Secret, im Kubernetes-Cluster anlegen.

### Clusterrole

Die Rolle bzw. Clusterrolle wird verwendet, um eine Reihe zulässiger Vorgänge für bestimmte Kubernetes-Ressourcen in einem bestimmten/allen Namespace(s) zu bestimmen. 

````yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: argo-clusterrole
rules:
  - apiGroups:
      - ""
    resources:
      - pods
      - pods/exec
      - pods/log
    verbs:
      - create
      - get
      - list
      - watch
      - update
      - patch
      - delete
  - apiGroups:
      - ""
    resources:
      - configmaps
    verbs:
      - get
      - watch
      - list
  - apiGroups:
      - ""
    resources:
      - persistentvolumeclaims
      - persistentvolumeclaims/finalizers
    verbs:
      - create
      - update
      - delete
      - get
  - apiGroups:
      - argoproj.io
    resources:
      - workflows
      - workflows/finalizers
      - workflowtasksets
      - workflowtasksets/finalizers
      - workflowartifactgctasks
    verbs:
      - get
      - list
      - watch
      - update
      - patch
      - delete
      - create
  - apiGroups:
      - argoproj.io
    resources:
      - workflowtemplates
      - workflowtemplates/finalizers
      - clusterworkflowtemplates
      - clusterworkflowtemplates/finalizers
    verbs:
      - get
      - list
      - watch
  - apiGroups:
      - argoproj.io
    resources:
      - workflowtaskresults
    verbs:
      - list
      - watch
      - deletecollection
  - apiGroups:
      - ""
    resources:
      - serviceaccounts
    verbs:
      - get
      - list
  - apiGroups:
      - argoproj.io
    resources:
      - cronworkflows
      - cronworkflows/finalizers
    verbs:
      - get
      - list
      - watch
      - update
      - patch
      - delete
  - apiGroups:
      - ""
    resources:
      - events
    verbs:
      - create
      - patch
  - apiGroups:
      - "policy"
    resources:
      - poddisruptionbudgets
    verbs:
      - create
      - get
      - delete
````
## ClusterRoleBinding
RoleBinding bzw. ClusterRoleBinding wird verwendet, um zu bestimmen, welche Benutzer oder `ServiceAccounts` berechtigt sind, Vorgänge für bestimmte Ressourcen in einem/allen Namespace(s) auszuführen.
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: argo-clusterrolebinding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: argo-clusterrole
subjects:
  - kind: ServiceAccount
    name: argo-serviceaccount
    namespace: default
```

### ServiceAccount
`ServiceAccount` wird zur Authentifizierung von Prozessen auf Maschinenebene verwendet, um Zugriff auf Ihren Kubernetes-Cluster zu erhalten. Der API-Server in der Control-Plane verwaltet die Authentifizierung für die im Pod ausgeführten Prozesse.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: argo-serviceaccount
  namespace: default
secrets:
  - name: argo-secret
  - apiVersion: v1
```

### Secret
Das Secret wird verwendet um konkret den Typ **service-account-token** festzulegen, der letztendlich unser benötigtes Access Token beinhaltet.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: argo-secret
  namespace: default
  annotations:
    kubernetes.io/service-account.name: argo-serviceaccount
type: kubernetes.io/service-account-token
```

### Login in UI
Um auf die Benutzeroberfläche von Argo Workflows zugreifen zu können, müssen Sie diese freigeben. Wir machen dies mittels Portweiterleitung.
```bash
kubectl port-forward svc/argo-workflows-server 8080:2746 --namespace=argo-workflows

Forwarding from 127.0.0.1:8080 -> 2746
Forwarding from [::1]:8080 -> 2746
Handling connection for 8080
```

Im Browser können wir nun die http://localhost:2746 aufrufen. Dort sollten wir folgende Seite sehen, auf der wir zum Login aufgefordert werden. Im Schritt vorher haben wir uns die zusätzlichen Ressourcen angelegt um überhaupt mit dem Server interagieren zu können.
Nun holen wir uns das Access-Token für den Loging.

```bash
SECRET=$(kubectl get sa argo-serviceaccount -n argo-workflows -o=jsonpath='{.secrets[0].name}')
ARGO_TOKEN="Bearer $(kubectl get secret $SECRET -n argo-workflows -o=jsonpath='{.data.token}' | base64 --decode)"
echo $ARGO_TOKEN
Bearer eyJhbG...
```

![](../../img/1-argo-workflows-login.webp)

Warum verwenden wir oben eigentlich ClusterRole statt eine "einfachen" Role?
Dies ist einem [Bug in Argo Workflows](https://github.com/argoproj/argo-workflows/issues/4885) geschuldet.

> HINWEIS! Forbidden: workflows.argoproj.io is forbidden: User "system:serviceaccount:argo-workflows:argo-serviceaccount" cannot list resource "workflows" in API group "argoproj.io" at the cluster scope
> Wie man in der Meldung schon sieht, scheint es so zu sein, dass sich Argo nicht damit begnügt im eigens dafür erstellten Namespace zu operieren. Nach ein bisschen Recherche fand ich [hier](https://github.com/argoproj/argo-workflows/blob/master/manifests/cluster-install/argo-server-rbac/argo-server-clusterole.yaml) eine Antwort.
> Nachdem ich mir die Clusterrolle angelegt hatte verschwand der Fehler.

![](../../img/2-argo-workflows-forbidden.webp)
![](../../img/3-argo-workflows-fixed.webp)

## Ausführen von Workflows

### Hello-World Beispiel
Zunächst ein Klassiker, wir erstellen ein Hello-World Bespiel, um uns mit dem Workflow-Manifest vertraut zu machen.

Dazu erstellen wir uns die Datei `hello_world.yaml` mit folgendem Inhalt.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: hello-world-
  labels:
    workflows.argoproj.io/archive-strategy: "false"
  annotations:
    workflows.argoproj.io/description: |
      This is a simple hello world example.
      You can also run it in Python: https://couler-proj.github.io/couler/examples/#hello-world
spec:
  entrypoint: whalesay
  templates:
  - name: whalesay
    container:
      image: docker/whalesay:latest
      command: [cowsay]
      args: ["hello world"] 
```

Um diesen Workflow auszuführen, können wir im Kontext, den wir mit kubectl gesetzt haben weiter arbeiten. Argo wird diesen benutzen um mit dem API Server zu kommunizieren. So starten wir den Workflow.

```bash
argo submit -n argo-workflows --watch hello-world.yaml 
```

![](../../img/4-argo-workflows-submit.webp)
![](../../img/5-argo-workflows-submit-pending.webp)
![](../../img/6-argo-workflows-submit-pending.webp)
![](../../img/7-argo-workflows-finish-logs.webp)

### Beispiel für die Artefaktübergabe
Als Nächstes stellen wir einen erweiterten Workflow bereit, der darin besteht, ein Artefakt zu generieren und es in aufeinanderfolgenden Schritten in und aus Containern zu übergeben. 
Das Artefakt wird in MinIO gespeichert, einer Kubernetes-nativen Objektspeicherlösung.

Da Argo Workflows bereits in unserem Cluster ausgeführt wird, müssen wir nur MinIO auf Ihrem Cluster installieren:

```bash
helm repo add minio https://helm.min.io/

"minio" has been added to your repositories
````

```bash
helm repo update

Hang tight while we grab the latest from your chart repositories...
...Successfully got an update from the "minio" chart repository
...Successfully got an update from the "argo-workflows" chart repository
Update Complete. ⎈Happy Helming!⎈
```

```bash
helm install argo-artifacts minio/minio -n argo-workflows --set service.type=LoadBalancer --set defaultBucket.enabled=true --set defaultBucket.name=artifacts --set persistence.enabled=false --set fullnameOverride=argo-artifacts


NAME: argo-artifacts
LAST DEPLOYED: Tue Sep 26 14:19:28 2023
NAMESPACE: argo-workflows
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
Minio can be accessed via port 9000 on an external IP address. Get the service external IP address by:
kubectl get svc --namespace argo-workflows -l app=argo-artifacts

Note that the public IP may take a couple of minutes to be available.

You can now access Minio server on http://<External-IP>:9000. Follow the below steps to connect to Minio server with mc client:

  1. Download the Minio mc client - https://docs.minio.io/docs/minio-client-quickstart-guide

  2. Get the ACCESS_KEY=$(kubectl get secret argo-artifacts --namespace argo-workflows -o jsonpath="{.data.accesskey}" | base64 --decode) and the SECRET_KEY=$(kubectl get secret argo-artifacts --namespace argo-workflows -o jsonpath="{.data.secretkey}" | base64 --decode)
  3. mc alias set argo-artifacts http://<External-IP>:9000 "$ACCESS_KEY" "$SECRET_KEY" --api s3v4

  4. mc ls argo-artifacts

Alternately, you can use your browser or the Minio SDK to access the server - https://docs.minio.io/categories/17
```

Nachdem MinIO bereitgestellt wurde, ist der Artefaktserver betriebsbereit. Um auf den Artefaktserver zuzugreifen, können wir die Portweiterleitung mit dem folgenden Befehl einrichten:

```bash
kubectl -n argo port-forward service/argo-artifacts 9000:9000 
```

Wir müssen nun die Anmeldeinformationen (Zugriffsschlüssel und geheimer Schlüssel) aus dem generierten argo-artifacts Secret verwenden, um uns anzumelden. 
Diese Werte sind üblicherweise Base64-codiert und müssen decodiert werden.

{% raw %}
```yaml
kubectl get secrets/argo-artifacts --template={{.data.accesskey}} -n argo-workflows | base64 -D
kubectl get secrets/argo-artifacts --template={{.data.secretkey}} -n argo-workflows | base64 -D
```
{% endraw %}

![](../../img/8-argp-workflows-minio.webp)
![](../../img/9-argp-workflows-minio-logedin.webp)

Als Nächstes konfigurieren wir Argo so, dass es MinIO als Artefakt-Repository verwendet und die relevanten Anmeldeinformationen für die Authentifizierung verwendet.

kubectl  edit configmap argo-workflows-workflow-controller-configmap -n argo-workflows

```yaml
  data:
    artifactRepository: |
      archiveLogs: true
      s3:
        bucket: artifacts
        endpoint: argo-artifacts:9000
        insecure: true
        accessKeySecret:
          name: argo-artifacts
          key: accesskey
        secretKeySecret:
          name: argo-artifacts
          key: secretkey
```

```bash
kubectl patch configmap argo-workflows-workflow-controller-configmap -n argo-workflows --patch "$(cat charts/argo-workflows/artifact-configmap.yaml)"

configmap/argo-workflows-workflow-controller-configmap patched
```

````bash
argo submit -n argo-workflows workflows/artifact-passing.yaml

````

> HINWEIS! Wenn der Befehl oben mit diesem Fehler abbricht: Error (exit code 1): pods "artifact-passing-7krxv-whalesay-3022019614" is forbidden: User "system:serviceaccount:argo-workflows:default" cannot patch resource "pods" in API group "" in the namespace "argo-workflows"
> Fehlt Argo die Referenz welcher ServiceAccount genutzt werden soll.  Siehe [hier](https://stackoverflow.com/questions/64924481/argo-workflow-always-using-default-serviceaccount).
> Hier ist in der [values.yaml](https://github.com/argoproj/argo-helm/blob/03c1be1c6d92eae55a77b4d691dcdb470f8c68c9/charts/argo-workflows/values.yaml#L45) der Hinweis, wie es notiert werden muss. 
> Zusätzlich muss im Workflow selber noch der spec.serviceAccountName angegeben werden

Das Ganze denn per `helm upgrade` patchen.

```bash
helm upgrade argo-workflows charts/argo-workflows

WARNING: Kubernetes configuration file is group-readable. This is insecure. Location: /Users/awiechert/.kube/config
WARNING: Kubernetes configuration file is world-readable. This is insecure. Location: /Users/awiechert/.kube/config
Release "argo-workflows" has been upgraded. Happy Helming!
NAME: argo-workflows
LAST DEPLOYED: Tue Sep 26 15:02:57 2023
NAMESPACE: argo-workflows
STATUS: deployed
REVISION: 2
TEST SUITE: None
```

Beim erneuten Ausführen wird dieser dann auch genutzt.

```bash
argo submit -n argo-workflows workflows/artifact-passing.yaml

Name:                artifact-passingb7bwc
Namespace:           argo-workflows
ServiceAccount:      argo-serviceaccount
Status:              Pending
Created:             Tue Sep 26 15:37:51 +0200 (now)
```
![](../../img/10-argo-workflows-passing-artifacts.webp)
![](../../img/11-argo-workflows-minio-artifacts.webp)
![](../../img/11-argo-workflows-minio-download.webp)

## Fazit

Wie wir in diesem Tutorial gesehen haben, kann Argo Workflows als leistungsstarkes Tool zum Erstellen von Kubernetes-nativen Workflows für verschiedene Anwendungsfälle genutzt werden. 
Allerdings ist die Einstiegshürde recht hoch und komplexere Projekte können schnell zu Schwierigkeiten bei der Skalierung und Optimierung führen.

Alle Ressourcen aus diesem Tutorial findet ihr hier [https://github.com/AlexanderWiechert/argo-workflows-example/tree/main](https://github.com/AlexanderWiechert/argo-workflows-example/tree/main)