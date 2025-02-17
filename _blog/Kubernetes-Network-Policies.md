---
layout: post
title: "Kubernetes Network Policies"
subtitle:  "Sicherheit und Kontrolle im Cluster"
categories: [DevOps]
---
# {{ page.title }}
## {{ page.subtitle }}


![finops](../../img/ingress_controller-1170.webp)

Kubernetes ist eine vielseitige Plattform zur Orchestrierung containerisierter Anwendungen. Ohne zusätzliche Sicherheitsmechanismen wie Network Policies kommunizieren alle Pods in einem Cluster standardmäßig uneingeschränkt miteinander. Dies birgt erhebliche Sicherheitsrisiken, wie unkontrollierte Datenflüsse und potenzielle Angriffe auf sensible Workloads. Network Policies bieten dir die Möglichkeit, diese Risiken zu minimieren, indem du gezielt steuerst, welcher Verkehr zwischen deinen Pods erlaubt ist. Standardmäßig kommunizieren alle Pods in einem Cluster uneingeschränkt miteinander, was Sicherheitsrisiken birgt. Mit Network Policies steuerst du gezielt den Datenverkehr zwischen Pods und verhinderst unerwünschte Verbindungen. Hier erfährst du, wie du Network Policies effektiv einsetzt, inklusive praktischer Beispiele und Code-Auszüge.

Was sind Kubernetes Network Policies?

Mit Network Policies regulierst du den Netzwerkverkehr innerhalb deines Clusters. Du bestimmst, welche Pods miteinander kommunizieren dürfen, und isolierst so Anwendungen, um die Sicherheit zu erhöhen. Durch das Festlegen von Regeln für eingehenden (Ingress) und ausgehenden (Egress) Verkehr kontrollierst du präzise den Datenfluss.

Ein praktisches Beispiel:

Wenn du sicherstellen möchtest, dass nur Pods mit dem Label role=frontend auf Pods mit dem Label role=backend zugreifen können, kannst du eine entsprechende Network Policy erstellen:

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
name: allow-frontend-to-backend
namespace: default
spec:
podSelector:
matchLabels:
role: backend
ingress:
- from:
    - podSelector:
      matchLabels:
      role: frontend

Diese Policy erlaubt nur Verbindungen von Pods mit dem Label role=frontend zu den Pods mit role=backend.

Funktionsweise von Network Policies

Eine Network Policy setzt sich aus folgenden Komponenten zusammen:

PodSelector: Definiert die Ziel-Pods, auf die die Policy angewendet wird, basierend auf Labels.

PolicyTypes: Legt fest, ob die Policy eingehenden (Ingress) oder ausgehenden (Egress) Verkehr steuert.

Ingress/Egress-Regeln: Bestimmen erlaubte Verbindungen, z. B. von bestimmten Pods, Namespaces oder IP-Bereichen.

Network Policies wirken additiv. Das bedeutet, du kannst mehrere Policies kombinieren, wobei die kumulierten "Erlauben"-Regeln gelten. Verbindungen, die keiner "Erlauben"-Regel entsprechen, werden blockiert, sofern eine "Verweigern"-Policy existiert.

Ein erweitertes Beispiel für eingehenden und ausgehenden Verkehr:

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
name: custom-policy
namespace: default
spec:
podSelector:
matchLabels:
app: my-app
policyTypes:
- Ingress
- Egress
  ingress:
- from:
    - namespaceSelector:
      matchLabels:
      environment: production
    - ipBlock:
      cidr: 192.168.1.0/24
      egress:
- to:
    - podSelector:
      matchLabels:
      role: database
    - ipBlock:
      cidr: 10.0.0.0/16

In diesem Beispiel erlaubst du nur eingehenden Verkehr von Pods im Namespace mit environment=production und aus einem bestimmten IP-Bereich. Ausgehender Verkehr ist nur zu Datenbank-Pods oder einem definierten Subnetz möglich.

Kubernetes Default Network Policy Examples

Hier sind einige nützliche Beispiele für Network Policies, die du in deinem Cluster verwenden kannst:

Deny All Traffic (Standardblockierung):
Diese Policy blockiert jeglichen eingehenden und ausgehenden Verkehr für alle Pods im Namespace:

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
name: deny-all-traffic
namespace: default
spec:
podSelector: {}
policyTypes:
- Ingress
- Egress

Allow All Ingress Traffic:
Erlaube allen eingehenden Verkehr für die Pods im Namespace:

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
name: allow-all-ingress
namespace: default
spec:
podSelector: {}
policyTypes:
- Ingress
  ingress:
- {}

Restrict Traffic to a Specific Namespace:
Erlaube nur eingehenden Verkehr von Pods in einem bestimmten Namespace:

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
name: restrict-to-namespace
namespace: default
spec:
podSelector:
matchLabels:
app: my-app
policyTypes:
- Ingress
  ingress:
- from:
    - namespaceSelector:
      matchLabels:
      environment: production

Allow Traffic from Specific Pods:
Erlaube eingehenden Verkehr nur von Pods mit bestimmten Labels:

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
name: allow-from-specific-pods
namespace: default
spec:
podSelector:
matchLabels:
app: backend
policyTypes:
- Ingress
  ingress:
- from:
    - podSelector:
      matchLabels:
      role: frontend

Best Practices für Network Policies

Die richtige Anwendung von Network Policies bringt entscheidende Vorteile für die Sicherheit und Effizienz deines Kubernetes-Clusters. Hier sind einige bewährte Praktiken und Gründe, warum sie sinnvoll sind:

Minimierung der Angriffsfläche:
Durch das Zulassen von nur notwendigem Netzwerkverkehr wird die Angriffsfläche für potenzielle Bedrohungen drastisch reduziert. Dies schützt deine sensiblen Daten und Services.

Verbesserte Isolation:
Network Policies ermöglichen es, Workloads voneinander zu isolieren, was besonders in Multi-Tenant-Umgebungen oder bei sensiblen Anwendungen von Vorteil ist.

Regelmäßige Audits:
Policies sollten regelmäßig überprüft und aktualisiert werden, um sicherzustellen, dass sie den aktuellen Anforderungen entsprechen und neue Sicherheitsbedrohungen adressieren.

Erhöhung der Sichtbarkeit:
Durch Network Policies erhältst du eine klare Übersicht, welche Verbindungen zwischen deinen Pods erlaubt sind, was die Fehlersuche und Optimierung erleichtert.

Kombination mit anderen Sicherheitsmechanismen:
Network Policies sollten nicht isoliert betrachtet werden. Sie wirken am effektivsten, wenn sie mit anderen Kubernetes-Sicherheitsfeatures wie Role-Based Access Control (RBAC) und Pod Security Policies kombiniert werden.

Mit Network Policies schützt du deinen Kubernetes-Cluster gezielt vor unerwünschten Netzwerkaktivitäten und erhöhst die Sicherheit und Effizienz deiner Anwendungen deutlich.


