---
layout: post
title: Scheduling in kubernetes
subtitle: Was ist eigentlich der Unterschied zwischen den verschiedenen Methoden zu entscheiden, wo, welche Ressourcen innerhalb des Clusters ausgeführt werden sollen?
keywords: [Scheduling in kubernetes]
categories: [DevOps]
---
# {{ page.title }}

![Kubernetes](../../img/k8s.webp)

## Erweiterte Kubernetes Scheduling Techniken um Resourcen optimal auszunutzen

Wie Sie wissen, ist Kubernetes eine leistungsstarke Plattform zur Orchestrierung von Containern, die die Bereitstellung, Skalierung und Verwaltung von containerisierten Anwendungen automatisiert.

Eine der Schlüsselkomponenten ist der Scheduler, der entscheidet, wo und wann Pods innerhalb des Clusters ausgeführt werden.


**Bevor wir uns mit dem Scheduling befassen, wollen wir uns mit einigen Grundlagen vertraut machen**


### Pod Affinity und Anti-Affinity

Pod-Affinität und Anti-Affinität sind Merkmale, die beeinflussen, wo ein Pod letztendlich ausgeführt werden soll.

Pod-Affinität stellt sicher, dass Pods auf Knoten eingeplant werden, die bestimmte Eigenschaften oder Labels haben.

Andererseits verhindert die Pod-Anti-Affinität, dass Pods auf Knoten eingeplant werden, auf denen sich bereits Pods mit bestimmten Eigenschaften befinden, und hilft so, die Arbeitslast zu verteilen und die Fehlertoleranz zu verbessern.

**Beispiel:**
Ein Pod wird nur auf Knoten geplant, auf denen ein bestehender Pod den Schlüsselnamen mit dem Wert "web-app" hat.

```yaml
spec:
  affinity:
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchExpressions:
              - key: name
                operator: In
                values:
                  - web-app
  ```

**Beispiel:**
Im unten stehenden Manifest wird ein neuer Pod nicht auf dem Knoten eingeplant, wenn ein Pod den Schlüssel app-name und den Wert database hat.
```yaml
spec:
  affinity:
    podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
        matchExpressions:
          - key: app-name
            operator: In
            values:
              - database
  ```

### Node Affinity
Kubernetes-Node-Affinität ist eine Funktion, die es Administratoren ermöglicht, Pods anhand der Labels auf den Nodes zuzuordnen.

Sie ähnelt dem nodeSelector, bietet jedoch eine genauere Kontrolle über den Auswahlprozess. Die Knotenaffinität ermöglicht einen bedingten Ansatz mit logischen Operatoren im Abgleichsprozess, während der nodeSelector auf die Suche nach exakten Übereinstimmungen von 
Schlüssel-Wert-Paaren für Labels beschränkt ist. Die Knotenaffinität wird in der PodSpec mit dem Feld nodeAffinity im Abschnitt affinity angegeben.

**Beispiel:**
Hier wird ein Pod ausschliesslich auf Knoten mit dem Label worker-node ausgeführt.

```yaml
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: name
                operator: In
                values:
                  - worker-node      
  ```

### Node Selektoren

Node- bzw. Knotenselektoren sind ein einfaches, aber effektives Mittel zur Beeinflussung von Planungsentscheidungen. Indem wir diese Selektoren auf Pods anwenden, können wir die Nodes angeben, an denen bestimmte Pods ausgeführt werden sollen.

Diese Technik ist hilfreich, wenn Sie über Knoten mit unterschiedlichen Hardwarekapazitäten verfügen und sicherstellen möchten, dass Pods mit bestimmten Ressourcenanforderungen auf Knoten mit entsprechenden Ressourcen verteilt werden.

**Beispiel:**
Hier wird für den Nginx Pod mittels des Node Selektors ein Knoten ausgewählt, der das Label ssd trägt.

```yaml
apiVersion: v1
kind: Pod
metadata:
name: nginx
labels:
env: test
spec:
containers:
- name: nginx
  image: nginx
  imagePullPolicy: IfNotPresent
  nodeSelector:
  disktype: ssd
```

### Benutzerdefinierte Scheduler

Kubernetes ermöglicht es Ihnen, Ihre eigenen benutzerdefinierten Scheduler zu implementieren und den Scheduler an Ihre Bedürfnisse anzupassen.

Benutzerdefinierte Scheduler können anwendungsspezifische Beschränkungen, Richtlinien und Prioritäten berücksichtigen, um den optimalen Knoten für jeden Pod zu bestimmen.


## Wie können diese o.g. Techniken unsere Ressourcenauslastung positiv beeinflussen?

**1. Verbesserte Ressourcenauslastung**: Durch die Verwendung von Pod-Affinität und -Anti-Affinität können Sie sicherstellen, dass zusammengehörige Pods gemeinsam platziert werden, wodurch die Kommunikationslatenz zwischen den Pods verringert und die gemeinsame Nutzung von Ressourcen maximiert wird. Dies führt zu einer besseren Nutzung von CPU-, Speicher- und Netzwerkressourcen.

**2. High Availability und Ausfallsicherheit**: Pod-Anti-Affinität verhindert, dass sich kritische Pods denselben Knoten teilen, was die Fehlertoleranz erhöht, indem die Arbeitslasten auf mehrere Knoten verteilt werden. Im Falle von Knotenausfällen kann Kubernetes betroffene Pods automatisch auf gesunde #Knoten umplanen.

**3. Ressourcenspezifische Anforderungen**: Mit Hilfe von Knotenselektoren können Sie Pods mit bestimmten Ressourcenanforderungen an Knoten mit kompatiblen Fähigkeiten anpassen. Dadurch wird eine Überlastung der Knoten vermieden und die Ressourcenzuweisung optimiert.

**4. Massgeschneiderte Policies**: Benutzerdefinierte Scheduler ermöglichen Ihnen eine Feinabstimmung des Planungsprozesses auf der Grundlage der spezifischen Anforderungen Ihrer Anwendung.