---
layout: post
title: Argo Workflows Tutorial
subtitle: In diesem Tutorial will ich euch zeigen, wie man Argo Events in einem lokalen Kubernetes Cluster installiert und ein Beispiel, wie man ein Webhook Event triggern kann.
keywords: [Argo Events, Events, Gitops, Helm, Kubernetes]
categories: [DevOps]
---
# {{ page.title }}

![](../../img/argocd-200x200.png)

In diesem Tutorial will ich euch zeigen, wie man Argo Events in einem lokalen Kubernetes Cluster installiert und ein Beispiel, wie man ein Webhook Event triggern kann.

Asynchronität ist das Herzstück ereignisgesteuerter, entkoppelter, cloudnativer Anwendungen. Da Anwendungen immer mehr Funktionen und Anwendungsfälle abdecken sollen, erhöhen sich die Aufwände für eine reibungslose Integration mit anderen 
Services. Folglich werden Anwendungsabläufe komplexer und es bestehen mehr wechselseitige Abhängigkeiten. Dies macht die unabhängige Skalierung der verschiedenen Anwendungskomponenten/Microservices zu einer Herausforderung, 
insbesondere bei unvorhersehbaren Arbeitslasten. Containerbasierte Deployments, die mit Hilfe von effizienten Workflow-Automatisierungs-Engines wie [Argo-Events](https://argoproj.github.io/argo-events/) können zur Lösung solcher Problems beitragen.

## Funktion von Argo-Events
Argo-Events hilft uns, komplexe Szenarien und Abläufe in Kubernetes nachzubilden. Wir haben die Möglichkeit dynamische, ereignisgesteuerte Workflows für alle unsere Daten und Webanwendungen erstellen. 

Argo Events besteht aus drei Hauptkomponenten: 
* EventSources
* Sensoren
* Trigger.

**EventSources**: sind, wie der Name sagt, die verschiedenen Quellen, von denen Ihre Anwendung möglicherweise Ereignisse empfängt, z. B. Amazon S3 , Amazon SNS , Amazon SQS , Webhooks, Nachrichtenwarteschlangen und Google Cloud Pub/Sub. 
Die von diesen Quellen empfangenen Nachrichten werden in einem EventBus gespeichert, der in Argo als Publish-Subscribe-System fungiert. Alle Ereignisse von EventSources werden im EventBus gesammelt und dann von verschiedenen Sensoren verarbeitet. 

**Sensoren**: sind das Herzstück des Abhängigkeitsmanagements in Argo Events. Ein Sensor überwacht den EventBus auf bestimmte Ereignisse, bedingte Auslöser und Aktionen. 
Basierend auf der Geschäftslogik können Sensoren verschiedene Aktionen auslösen, um einen Event-Workflow abzuschließen. Einige Beispiele für diese Aktionen umfassen das Aufrufen einer AWS Lambda-Funktion, 
das Erstellen von Kubernetes-Ressourcen oder das Auslösen eines [Argo-Workflows](https://argoproj.github.io/argo-workflows/) oder eines [Argo-Rollouts](https://argoproj.github.io/argo-rollouts/).

**Eventbus**
Der Eventbus ist eine benutzerdefinierte Ressource in Kubernetes, die als Transportlayer fungiert und Ereignisse zwischen Ereignisquellen und Sensoren überträgt.
Eine Ereignisquelle veröffentlicht Ereignisse, und ein Sensor abonniert sie, um Trigger auszuführen. Die derzeitige Implementierung des Eventbuses basiert auf NATS-Streaming.

**Trigger**: sind die Ressource/Arbeitslast, die vom Sensor ausgeführt wird, sobald die Ereignisabhängigkeiten aufgelöst sind. z.B. 
* AWS Lambda
* Azure Event Hubs messages
* Argo Rollouts & Argo Workflows
* Kafka Messages 
* Slack Notifications
* HTTP Requests

![Argo-Events-Architecture](../../img/1-Argo-Events-Architecture.webp)

## Voraussetzungen
Für dieses Tutorial benötigen wir folgendes:

* [Rancher-Desktop](https://rancherdesktop.io/) oder eine vergleichbare Engine zum Ausführen von Containern
* lokaler Kubernetes Cluster, ich nutze [Kind](https://kind.sigs.k8s.io/)
* [kubectl](https://kubernetes.io/docs/tasks/tools/)

## Installation ein Verbinden mit dem Kubernetes Cluster

Als Erstes benötigen wir einen lokalen Kubernetes Cluster. Wir werden hier Kind nutzen.

Auf dem Mac installieren wir Kind mit `brew`
```bash
brew install kind
```
Um mit dem CLuster zu interagieren setzen wir den Context.

```bash
kubectl cluster-info --context kind-argo-events
Kubernetes control plane is running at https://127.0.0.1:59275
CoreDNS is running at https://127.0.0.1:59275/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'.
```

## Argo Events installieren
Wir haben mehrere Möglichkeiten, Argo Events zu installieren. Dieses Tutorial zeigt den Installationsprozess mit `kubectl`, [Kustomize](https://kustomize.io/) und [Helm](https://helm.sh/).

Zuerst legen wir uns einen Namespace an und setzen mittels `kubectl` den Context so, dass wir alle Ressourcen in diesem Namespace installieren können.

```bash
kubectl create namespace argo-events     

namespace/argo-events created
```

```bash
kubectl config set-context --current --namespace=argo-events

Context "kind-argo-events" modified.
```

### Argo-Events Controller, Serviceaccount, ClusterRole

#### Installation mit kubectl
Wir können den folgenden Befehl verwenden, um die Installation von Argo Events und Abhängigkeiten wie ClusterRoles, Sensor Controller und EventSource Controller mit diesem Befehl ausführen:

```bash
kubectl apply -f https://raw.githubusercontent.com/argoproj/argo-events/stable/manifests/install.yaml
```

> Hinweis: Wir können Argo Events mit einem Webhook zur Validierung installieren. Dies benachrichtigt über Fehler, wenn Sie eine fehlerhafte Spezifikation anwenden, sodass wir den CRD-Objektstatus später nicht auf Fehler überprüfen müssen. 

```bash
kubectl apply -f https://raw.githubusercontent.com/argoproj/argo-events/stable/manifests/install-validating-webhook.yaml
```

#### Installation mit Helm
Wir fügen zuerst das Helm Repository lokal hinzu und installieren es.
```bash
helm repo add argo https://argoproj.github.io/argo-helm
helm install argo-events argo/argo-events
```

#### Installation mit Kustomize
Wenn wir den Ordner cluster-install oder cluster-install-with-extension als Basis für Kustomize verwenden, müssen wir Folgendes `kustomization.yaml` hinzufügen:

```yaml
bases:

  - github.com/argoproj/argo-events/manifests/cluster-install
```
Falls wir den Namespace-Installationsordner als Basis für Kustomize verwenden, müssen wir Folgendes zu `kustomization.yaml` hinzufügen:

```yaml
bases:

  - github.com/argoproj/argo-events/manifests/namespace-install
```

### Argo-Events EventBus

Der EventBus is eine Kubernetes Custom-Ressource und übermittelt Nachrichten von EventSourcen an die Sensoren. Es handelt sich im Wesentlichen um ein quell- und zielunabhängiges Pub-Sub-System, bei dem EventSources Ereignisse veröffentlichen 
und Sensoren diese Ereignisse abonnieren, um weitere Maßnahmen zu ergreifen (z. B. Argo-Workflows auszulösen).

Der folgende Befehl ruft die Konfigurationsdatei von der Argo Project-Website ab und erstellt den EventBus:

```bash
kubectl apply -f https://raw.githubusercontent.com/argoproj/argo-events/stable/examples/eventbus/native.yaml

eventbus.argoproj.io/default created
```

Die Standardkonfiguration des EventBuses legt die Anzahl der Replikas standardmäßig auf drei fest, sodass ein Service und drei Pods erstellt werden, nachdem wir den Befehl ausgeführt haben. Das sieht dann so aus:

```bash
kubectl get pods  
NAME                                READY   STATUS    RESTARTS   AGE
controller-manager-7d9ffb8f-6flq2   1/1     Running   0          10m
eventbus-default-stan-0             2/2     Running   0          108s
eventbus-default-stan-1             2/2     Running   0          96s
eventbus-default-stan-2             2/2     Running   0          95s
```
und 

```bash
kubectl get services 
NAME                        TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)                      AGE
eventbus-default-stan-svc   ClusterIP   None         <none>        4222/TCP,6222/TCP,8222/TCP   2m47s
```

### Argo-Events Webhooks EventSource

EventSources sind dafür verantwortlich, im EventBus gesammelte Nachrichten zu veröffentlichen, damit die Sensoren sie verarbeiten können. 
Wie bereits im Tutorial erwähnt, gibt es viele verschiedene EventSources, wie z.B.Amazon SNS, Amazon SQS, Google Cloud Pub/Sub, GitHub, Slack, Webhooks usw.

Der folgende Befehl installiert eine allgemeine Webhook-EventSource:

```bash
kubectl apply -f https://raw.githubusercontent.com/argoproj/argo-events/stable/examples/event-sources/webhook.yaml


eventsource.argoproj.io/webhook created
```

```bash
kubectl get pods                                                                     
NAME                                         READY   STATUS    RESTARTS      AGE
controller-manager-7d9ffb8f-6flq2            1/1     Running   0             15m
eventbus-default-stan-0                      2/2     Running   0             7m3s
eventbus-default-stan-1                      2/2     Running   0             6m51s
eventbus-default-stan-2                      2/2     Running   0             6m50s
webhook-eventsource-6dtxf-7cf79c874c-768rr   0/1     Error     2 (29s ago)   32s
```

### Argo-Events Webhook Sensor
Sensoren hören nicht nur auf Events; Sie reagieren auch darauf und lösen Aktionen aus. Sensoren sind daher eine Kombination aus Ereignissen und Auslösern. 
Beispielsweise ist AWS Lambda ein solcher Sensor, denn es hört auf jede verknüpfte EventSource und löst eine definierte Aktion aus.

Zuerst müssen wir uns einen Serviceaccount mit RBAC-Einstellungen, damit der Sensor Workflows auslösen kann und Workflows funktionieren können.

```bash
kubectl apply -n argo-events -f https://raw.githubusercontent.com/argoproj/argo-events/master/examples/rbac/workflow-rbac.yaml                                                                 

role.rbac.authorization.k8s.io/executor created
rolebinding.rbac.authorization.k8s.io/executor-default created
```

```bash
kubectl apply -n argo-events -f https://raw.githubusercontent.com/argoproj/argo-events/master/examples/rbac/sensor-rbac.yaml                                                                     

serviceaccount/operate-workflow-sa created
role.rbac.authorization.k8s.io/operate-workflow-role created
rolebinding.rbac.authorization.k8s.io/operate-workflow-role-binding created
```

So installieren wir den Webhook Sensor:

```bash
kubectl apply -f https://raw.githubusercontent.com/argoproj/argo-events/stable/examples/sensors/webhook.yaml

sensor.argoproj.io/webhook created
```

## Argo-Events nutzen
Nachdem wir die Befehle in den vorherigen Abschnitten erfolgreich ausgeführt haben, sollten wir die  Installation mit dem folgenden Befehl testen können, der den Dienst für die EventSource auflistet:

```bash

kubectl get services                                                                 
NAME                        TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)                      AGE
eventbus-default-stan-svc   ClusterIP   None           <none>        4222/TCP,6222/TCP,8222/TCP   21m
webhook-eventsource-svc     ClusterIP   10.96.32.145   <none>        12000/TCP                    14m
```

Während die Dienste und Pods ausgeführt werden, müssen wir die Portweiterleitung für die Nachrichtenzustellung und -nutzung über HTTP verfügbar machen.

Um die Portweiterleitung einzurichten, müssen wir den Pod-Namen der Webhook-EventSource abrufen und können diesen in der Variablen `EVENT_SOURCE_POD_NAME` speichern, um uns so den Zugriff zu erleichtern:

```bash
export EVENT_SOURCE_POD_NAME=$(kubectl get pods -o custom-columns=":metadata.name" | grep webhook-eventsource)
kubectl port-forward $EVENT_SOURCE_POD_NAME 12000:12000

kubectl -n argo-events port-forward $(kubectl -n argo-events get pod -l eventsource-name=webhook -o name) 12000:12000

Forwarding from 127.0.0.1:12000 -> 12000
Forwarding from [::1]:12000 -> 12000
```

Sobald die Portweiterleitung eingerichtet ist, sollte Argo-Events in der Lage sein, Anfragen zu empfangen und die Erstellung von Kubernetes-Ressourcen auszulösen, um diese Anfragen zu bedienen.

### Triggern eine Events
Im folgenden Beispiel werden wir einen POST Request and den EventSource Pod schicken, der auf Port 12000 hört.

```bash
curl -d '{"message":"Das ist eine Testnachricht an ARGO-Events!!"}' -H "Content-Type: application/json" -X POST http://localhost:12000/app
```

Diese POST Anfrage an die EventSource löst eine die Veröffentlichung einer Nachricht im EventBus aus, was wiederrum den EventSensor dazu veranlasst eine neuen POD zu erstellen, umd die Anfrage zu verarbeiten.

Das sieht dann so aus:

```bash
kubectl get pods                                                                                                                                                                                 
NAME                                         READY   STATUS             RESTARTS      AGE
argo-workflows-server-54cf69897f-hlklw                1/1     Running           0             87s
argo-workflows-workflow-controller-7c86454b49-6h4hj   1/1     Running           0             87s
controller-manager-7d9ffb8f-bb4bk                     1/1     Running           0             54m
eventbus-default-stan-0                               2/2     Running           0             53m
eventbus-default-stan-1                               2/2     Running           0             53m
eventbus-default-stan-2                               2/2     Running           0             53m
events-webhook-568c8c8989-pk86j                       1/1     Running           0             53m
webhook-eventsource-n8r5p-7cf79c874c-sfkqj            1/1     Running           1 (52m ago)   52m
webhook-l792s                                         0/2     PodInitializing   0             34s
webhook-sensor-wcr5r-5c648f6cf5-9zdwj                 1/1     Running           0             42m
```

Wenn Sie die POST-Anfrage ein zweites Mal senden, sollte ein zweiter Workload-Pod erstellt werden:

```bash
curl -d '{"message":"Das ist eine 2. Testnachricht an ARGO-Events!!"}' -H "Content-Type: application/json" -X POST http://localhost:12000/app
```

Dann sehen wir, dass ein zweiter Pod gestartet wurde.

```bash
kubectl get pods
NAME                                                  READY   STATUS      RESTARTS      AGE
argo-workflows-server-54cf69897f-hlklw                1/1     Running     0             2m9s
argo-workflows-workflow-controller-7c86454b49-6h4hj   1/1     Running     0             2m9s
controller-manager-7d9ffb8f-bb4bk                     1/1     Running     0             54m
eventbus-default-stan-0                               2/2     Running     0             54m
eventbus-default-stan-1                               2/2     Running     0             53m
eventbus-default-stan-2                               2/2     Running     0             53m
events-webhook-568c8c8989-pk86j                       1/1     Running     0             54m
webhook-eventsource-n8r5p-7cf79c874c-sfkqj            1/1     Running     1 (53m ago)   53m
webhook-j4nqf                                         2/2     Running     0             5s
webhook-l792s                                         0/2     Completed   0             76s
webhook-sensor-wcr5r-5c648f6cf5-9zdwj                 1/1     Running     0             43m
```

Schauen wir uns das Log des Webhook-sensor Pods an sehen wir, dass die Nachricht erfolgreich verarbeitet wurde.

```bash
kubectl logs webhook-sensor-wcr5r-5c648f6cf5-9zdwj -f


{"level":"info","ts":1695910634.9379156,"logger":"argo-events.sensor","caller":"standard-k8s/standard-k8s.go:158","msg":"creating the object...","sensorName":"webhook","triggerName":"webhook-workflow-trigger","triggerType":"Kubernetes"}
{"level":"info","ts":1695910634.9457114,"logger":"argo-events.sensor","caller":"sensors/listener.go:417","msg":"Successfully processed trigger 'webhook-workflow-trigger'","sensorName":"webhook","triggerName":"webhook-workflow-trigger","triggerType":"Kubernetes","triggeredBy":["test-dep"],"triggeredByEvents":["35363738323061622d646539632d343962392d613530622d326336663466373030303131"]}
```

Und wir können im Log des Webhook Pods, also der Pod, der die Nachricht letztendlich verarbeitet hat folgendes sehen.

```bash
kubectl logs webhook-j4nqf
 __________________________________
/ {"message":"Das ist eine 2.      \
\ Testnachricht an ARGO-Events!!"} /
 ----------------------------------
    \
     \
      \
                    ##        .
              ## ## ##       ==
           ## ## ## ##      ===
       /""""""""""""""""___/ ===
  ~~~ {~~ ~~~~ ~~~ ~~~~ ~~ ~ /  ===- ~~~
       \______ o          __/
        \    \        __/
          \____\______/
time="2023-09-28T14:16:14.581Z" level=info msg="sub-process exited" argo=true error="<nil>"
```

oder per `kubectl describe pod webhook-...`

```bash
    Args:
      {"message":"Das ist eine 2. Testnachricht an ARGO-Events!!"}
    State:          Terminated
      Reason:       Completed
      Exit Code:    0
      Started:      Thu, 28 Sep 2023 16:17:18 +0200
      Finished:     Thu, 28 Sep 2023 16:17:19 +0200
    Ready:          False
    Restart Count:  0
    Environment:
      ARGO_CONTAINER_NAME:                main
      ARGO_TEMPLATE:                      {"name":"whalesay","inputs":{"parameters":[{"name":"message","value":"{\"message\":\"Das ist eine 2. Testnachricht an ARGO-Events!!\"}"}]},"outputs":{},"metadata":{},"container":{"name":"","image":"docker/whalesay:latest","command":["cowsay"],"args":["{\"message\":\"Das ist eine 2. Testnachricht an ARGO-Events!!\"}"],"resources":{}}}

...
                             node.kubernetes.io/unreachable:NoExecute op=Exists for 300s
Events:
  Type    Reason     Age   From               Message
  ----    ------     ----  ----               -------
  Normal  Scheduled  5m4s  default-scheduler  Successfully assigned argo-events/webhook-gwlnv to argo-events-control-plane
  Normal  Pulled     5m3s  kubelet            Container image "quay.io/argoproj/argoexec:v3.4.11" already present on machine
  Normal  Created    5m3s  kubelet            Created container init
  Normal  Started    5m3s  kubelet            Started container init
  Normal  Pulled     5m2s  kubelet            Container image "quay.io/argoproj/argoexec:v3.4.11" already present on machine
  Normal  Created    5m2s  kubelet            Created container wait
  Normal  Started    5m2s  kubelet            Started container wait
  Normal  Pulling    5m2s  kubelet            Pulling image "docker/whalesay:latest"
  Normal  Pulled     5m    kubelet            Successfully pulled image "docker/whalesay:latest" in 2.340005184s (2.340010879s including waiting)
  Normal  Created    5m    kubelet            Created container main
  Normal  Started    5m    kubelet            Started container main
```


Um eine Gesamtübersicht über die Aktionen, wie das erstellen der Pods zu sehen können wir den Befehl unten verwenden.

```bash
kubectl get events

57m         Normal    ScalingReplicaSet       deployment/webhook-sensor-lnptv                            Scaled up replica set webhook-sensor-lnptv-5c648f6cf5 to 1
47m         Normal    Scheduled               pod/webhook-sensor-wcr5r-5c648f6cf5-9zdwj                  Successfully assigned argo-events/webhook-sensor-wcr5r-5c648f6cf5-9zdwj to argo-events-control-plane
47m         Normal    Pulling                 pod/webhook-sensor-wcr5r-5c648f6cf5-9zdwj                  Pulling image "quay.io/argoproj/argo-events:v1.7.6"
47m         Normal    Pulled                  pod/webhook-sensor-wcr5r-5c648f6cf5-9zdwj                  Successfully pulled image "quay.io/argoproj/argo-events:v1.7.6" in 645.029569ms (645.035123ms including waiting)
47m         Normal    Created                 pod/webhook-sensor-wcr5r-5c648f6cf5-9zdwj                  Created container main
47m         Normal    Started                 pod/webhook-sensor-wcr5r-5c648f6cf5-9zdwj                  Started container main
47m         Normal    SuccessfulCreate        replicaset/webhook-sensor-wcr5r-5c648f6cf5                 Created pod: webhook-sensor-wcr5r-5c648f6cf5-9zdwj
47m         Normal    ScalingReplicaSet       deployment/webhook-sensor-wcr5r                            Scaled up replica set webhook-sensor-wcr5r-5c648f6cf5 to 1
6m2s        Normal    LeaderElection          lease/workflow-controller                                  argo-workflows-workflow-controller-7c86454b49-6h4hj became leader
```

