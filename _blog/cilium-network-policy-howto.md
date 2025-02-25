---
layout: post
title: "Cilium-Netzwerkrichtlinien"
subtitle:  "Erweiterte Sicherheit und Kontrolle für Kubernetes-Cluster"
categories: [DevOps]
---
# {{ page.title }}
## {{ page.subtitle }}


![cillium](../../img/cilliuma_k8s_1170.webp)


## Einführung

In der dynamischen Welt der Container-Orchestrierung bietet Kubernetes eine robuste Plattform zur Verwaltung von Anwendungen. Während die Standard-Netzwerkrichtlinien von Kubernetes grundlegende Sicherheitsfunktionen bieten, stoßen sie schnell an ihre Grenzen, wenn es um feingranulare Kontrolle und erweiterte Sicherheitsanforderungen geht. Hier kommt Cilium ins Spiel. Cilium erweitert die Netzwerkrichtlinien von Kubernetes erheblich und bietet eine Reihe von Vorteilen, die es zu einer bevorzugten Wahl für sicherheitsbewusste Umgebungen machen.

Cilium nutzt eBPF (extended Berkeley Packet Filter), um Netzwerkrichtlinien effizient und sicher durchzusetzen. Diese Technologie ermöglicht es, Sicherheitsrichtlinien auf einer granulareren Ebene zu implementieren und bietet gleichzeitig eine bessere Leistung und Skalierbarkeit. In diesem Artikel werden wir die Vorteile von Cilium gegenüber den Standard-Netzwerkrichtlinien von Kubernetes untersuchen und praktische Beispiele durchgehen, die zeigen, wie Cilium Ihre Kubernetes-Cluster absichern kann.

## Einrichtung der Übungsumgebung

Um die Vorteile von Cilium voll auszuschöpfen, empfehlen wir, eine praktische Übungsumgebung einzurichten. Hier sind zwei Ansätze, die Sie ausprobieren können:

    Lokaler Kubernetes-Cluster: Starten Sie einen lokalen Kubernetes-Cluster mit Kind und installieren Sie Cilium.

### Lokaler Kubernetes-Cluster

Für eine lokale Einrichtung installieren Sie Kind und verwenden die folgende Konfiguration, um einen lokalen Kubernetes-Cluster mit deaktiviertem Standard-CNI zu erstellen. Verwenden Sie dann die Cilium-CLI, um Cilium zu installieren.

```yaml
# kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
networking:
  disableDefaultCNI: true

```

```bash
❯ kind create cluster --config kind-config.yaml
❯ cilium install
❯ cilium status
❯ cilium connectivity test
```

## Verständnis der Cilium-Netzwerkrichtlinien

Standardmäßig verwendet Kubernetes eine flache Netzwerktopologie, die eine uneingeschränkte Kommunikation zwischen Pods ermöglicht. Um Cilium-Netzwerkrichtlinien zu verstehen, ist es wichtig, zwei grundlegende Bausteine zu kennen: den Cilium-Endpoint und die Cilium-Identität.

### Cilium-Endpoint und -Identität

Wenn ein Pod erstellt wird, erstellt Cilium einen Endpoint, der den Pod im Netzwerk repräsentiert. Dem Endpoint wird eine interne IP-Adresse zugewiesen, und die Identität des Endpoints wird aus den Pod-Labels abgeleitet.

Erstellen wir einen einfachen Pod und untersuchen dann den zugehörigen Endpoint und die Identität, die Cilium für diesen Pod generiert.

```bash
❯ kubectl run simple-pod --image nginx
pod/simple-pod created

❯ kubectl get ciliumendpoints.cilium.io
NAME         SECURITY IDENTITY   ENDPOINT STATE   IPV4          IPV6
simple-pod   26830               ready            10.244.1.15

❯ kubectl get ciliumidentities.cilium.io 26830
NAME    NAMESPACE   AGE
26830   default     7m51s
```

Cilium aktualisiert die Identität des Endpunkts, wenn sich die Pod-Labels ändern.

```bash
# Label überschreiben
❯ kubectl label pod/simple-pod run=not-simple-pod --overwrite

# Überprüfen Sie, ob sich die Cilium-Identität geändert hat
❯ kubectl get ciliumendpoints.cilium.io
NAME         SECURITY IDENTITY   ENDPOINT STATE   IPV4          IPV6
simple-pod   8710                ready            10.244.1.15
```

### Wie funktionieren Cilium-Netzwerkrichtlinien?

Während Kubernetes-Netzwerkrichtlinien eine Netzwerkisolierung bieten, sind sie in Bezug auf Granularität, Flexibilität und Funktionen eingeschränkt. Cilium erweitert das Standardmodell der Netzwerkrichtlinien und bietet fortschrittlichere Funktionen, wie z.B. feingranulare Regeln auf den Ebenen 3, 4 und 7 des OSI-Modells, die mit Kubernetes-Netzwerkrichtlinien nicht möglich sind.

Cilium führt zwei neue benutzerdefinierte Ressourcendefinitionen (CRDs) ein, um dies zu erreichen:

    CiliumNetworkPolicy – namespaced
    CiliumClusterwideNetworkPolicy – clusterweit

> Hinweis: Während CiliumClusterwideNetworkPolicy wahrscheinlich nicht in der Prüfung vorkommt, ist es gut, davon zu wissen.

Die CiliumNetworkPolicy kann in drei Teile unterteilt werden: Endpoint-Selektor, Ingress- und Egress-Richtlinien.

* Der Endpoint-Selektor wählt Endpunkte basierend auf den Pod-Labels aus und gibt an, auf welche Pods eine Richtlinie angewendet werden soll.
* Die Ingress- und Egress-Abschnitte ermöglichen die Definition von Regeln für eingehenden und ausgehenden Datenverkehr.

```yaml
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: database-policy
  namespace: default
spec:
  endpointSelector:
    matchLabels:
      tier: db
  ingress:
    - {}
  egress:
    - {}
```
## Zero-Trust-Sicherheit mit Cilium

Um den Datenverkehr zwischen zwei Pods zuzulassen, müssen sowohl die Egress-Seite des sendenden Pods als auch die Ingress-Seite des empfangenden Pods den Datenverkehr zulassen. Dies stellt sicher, dass jedes Pod seine eigene Richtlinie durchsetzen kann, anstatt sich auf die Richtlinien anderer Pods zu verlassen, und entspricht damit den Zero-Trust-Prinzipien.

## Praktische Übungen mit Cilium-Netzwerkrichtlinien

### Keine Policy, keine Einschränkungen

Die Standard-Netzwerksicherheitskonfiguration von Kubernetes mit Cilium erlaubt standardmäßig den gesamten Netzwerkverkehr und enthält keine vordefinierte Richtlinie.

```bash
kubectl get ciliumnetworkpolicies.cilium.io -A
```
Um die Standardkonnektivität zu überprüfen, testen wir die Kommunikation zwischen Pods. Erstellen Sie zwei Pods – einen Webserver und einen Client – und stellen Sie den Webserver als Service bereit. Anfangs werden Sie feststellen, dass der Client-Pod den Webserver-Pod erfolgreich erreichen kann.

```bash
# Webserver-Pod
kubectl -n web run server --image=nginx
kubectl -n web expose pod server --port=80

# Client-Pod
kubectl -n web run client --image=busybox -it -- wget web
```

### Default deny Policy

Sie sind dafür verantwortlich, die gesamte Kommunikation durch die Einführung einer "default deny"-Richtlinie zu beschränken und dann nur den gewünschten Netzwerkverkehr zuzulassen.

In der folgenden endpointbasierten Netzwerkrichtlinie blockieren wir den gesamten Ingress- (eingehenden) und Egress- (ausgehenden) Datenverkehr für Pods im Standard-Namespace.

```yaml 
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: default-deny
  namespace: web
spec:
  # Leerer Selektor entspricht allen Pods im Namespace
  endpointSelector: {}

  # Keine Regeln für Ingress, alle eingehenden Verbindungen verweigern
  ingress:
    - {}

  # Keine Regeln für Egress, alle ausgehenden Verbindungen verweigern
  egress:
    - {}
```

Nach dem Anwenden der Netzwerkrichtlinie führen Sie denselben Test erneut durch. Diesmal werden Sie feststellen, dass die Verbindung fehlschlägt, was bestätigt, dass unsere Richtlinie erfolgreich den gesamten Pod-Verkehr im Web-Namespace blockiert hat.

```bash
kubectl -n web run client --image=busybox -it -- wget web
```

### Datenverkehr ausschliesslich im Namespace

In dieser endpointbasierten Netzwerkrichtlinie sperren wir den Web-Namespace, indem wir den gesamten Datenverkehr aus anderen Namespaces blockieren, aber den Datenverkehr innerhalb des Namespace zulassen.

> Kein Egress-Feld bedeutet, dass der gesamte ausgehende Datenverkehr aus dem Namespace zugelassen ist

```yaml
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: lockdown-web
  namespace: web
spec:
  # Leerer Selektor entspricht allen Pods im Namespace
  endpointSelector: {}

  # Alle Labels im gleichen Namespace entsprechen
  ingress:
    - fromEndpoints:
        - matchLabels: {}

```

### Policy für Namespace übergreifenden Datenverkehr

In dieser endpointbasierten Netzwerkrichtlinie sperren wir den Datenbank-Namespace, um nur eingehenden Datenverkehr von Backend-Pods im Web-Namespace zuzulassen.

> # Kein Egress-Feld bedeutet, dass der gesamte ausgehende Datenverkehr aus dem Namespace zugelassen ist

```yaml
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: lockdown-database
  namespace: database
spec:
  # Leerer Selektor entspricht allen Pods im Namespace
  endpointSelector: {}

  # Alle Pods im gleichen Namespace und Backend-Pod im Web-Namespace zulassen
  ingress:
    - fromEndpoints:
        - matchLabels: {}
        - matchLabels:
            k8s:io.kubernetes.pod.namespace: web
            app: backend
```

### Noch restriktivere Richtlinie

In dieser endpointbasierten Netzwerkrichtlinie schränken wir den Datenbank-Namespace weiter ein, um nur eingehenden MySQL-Datenverkehr von Backend-Pods im Web-Namespace und nur ausgehenden DNS-Datenverkehr zu kube-dns-Pods im kube-system-Namespace zuzulassen.

```yaml
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: lockdown-database
  namespace: database
spec:
  # Gilt für alle Pods im Datenbank-Namespace
  endpointSelector: {}

  # Nur eingehenden Datenverkehr von Backend-Pods im Web-Namespace zulassen
  ingress:
    - fromEndpoints:
        - matchLabels: {}
        - matchLabels:
            k8s:io.kubernetes.pod.namespace: web
            app: backend
      toPorts:
        - ports:
            - port: "3306"
              protocol: TCP

  # Nur ausgehenden DNS-Datenverkehr zu kube-dns zulassen
  egress:
    - toEndpoints:
        - matchLabels:
            k8s:io.kubernetes.pod.namespace: kube-system
            k8s-app: kube-dns
      toPorts:
        - ports:
            - port: "53"
              protocol: UDP
            - port: "53"
              protocol: TCP

```
Dieser Artikel beleuchtet die Vorteile von Cilium im Vergleich zu den Standard-Netzwerkrichtlinien von Kubernetes, insbesondere in Bezug auf die effiziente und sichere Durchsetzung von Sicherheitsrichtlinien. Durch praktische Beispiele wird gezeigt, wie Cilium eine granulare Kontrolle über den Datenverkehr ermöglicht und Zero-Trust-Sicherheitsprinzipien implementiert. Diese Einblicke und Anleitungen helfen dabei, die Sicherheit und Leistungsfähigkeit von Kubernetes-Umgebungen zu verbessern.