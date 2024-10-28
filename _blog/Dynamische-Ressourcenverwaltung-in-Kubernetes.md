---
layout: post
title: "Dynamische Ressourcenverwaltung in Kubernetes"
subtitle:  "Der Cluster Autoscaler im Detail"
categories: [DevOps]
---
# {{ page.title }}
## {{ page.subtitle }}


![finops](../../img/resource_scheduler-1170.webp)

In modernen, cloud-basierten Anwendungen ist Flexibilität bei der Ressourcenzuweisung entscheidend, um die Balance zwischen Leistung und Kosten zu optimieren. Der Kubernetes Cluster Autoscaler (CAS) bietet hier eine effektive Lösung zur automatischen Anpassung der Cluster-Größe, um Workloads dynamisch zu unterstützen und Ressourcen effizient zu nutzen. Dieser Artikel gibt einen detaillierten Überblick über die Funktionsweise, Einrichtung und wichtigsten technischen Merkmale des Cluster Autoscalers.

---

### Was ist der Kubernetes Cluster Autoscaler?

Der Kubernetes Cluster Autoscaler (CAS) ist ein Tool zur automatischen Skalierung von Kubernetes-Clustern. Es überwacht die Ressourcenanforderungen im Cluster und passt die Knotenanzahl dynamisch an. Der CAS prüft kontinuierlich die API-Server auf „nicht planbare“ Pods – also Pods, für die momentan keine passenden Ressourcen vorhanden sind – und skaliert die Cluster-Größe entsprechend. Dabei wird stets das optimale Gleichgewicht zwischen Leistungsfähigkeit und Kosteneffizienz angestrebt.

### Die Funktionsweise des Cluster Autoscalers

Der Cluster Autoscaler basiert auf einem kontinuierlichen Prüfzyklus und steuert sowohl das Hoch- als auch das Herunterskalieren der Cluster-Knoten. Dies wird ermöglicht durch:

1. **Automatisches Hochskalieren:** CAS prüft alle 10 Sekunden die API-Server des Clusters und identifiziert Pods, die nicht geplant werden können, weil nicht genügend Ressourcen (z. B. CPU oder Arbeitsspeicher) verfügbar sind. Ist dies der Fall, skaliert CAS den Cluster, indem es neue Knoten hinzufügt. Diese neuen Knoten werden gemäß den definierten Vorlagen der Node-Gruppen erstellt und stehen dann für das Hosting von Pods bereit.

2. **Effizientes Herunterskalieren:** Um Kosten zu optimieren, entfernt der CAS ungenutzte Knoten aus dem Cluster. Ein Knoten wird als ungenutzt betrachtet, wenn die CPU- und Speicherauslastung unter 50 % liegt und alle Pods auf andere Knoten migriert werden können. Solche Knoten werden nach einer Standardzeit von zehn Minuten heruntergefahren, was sich durch spezifische Parameter steuern lässt.

### Wichtige technische Funktionen des Cluster Autoscalers

#### Ressourcenbewusste Skalierung

Eine der Hauptfunktionen des CAS ist die bewusste Berücksichtigung der Ressourcenanforderungen im Cluster. Der CAS stellt sicher, dass ausreichend Ressourcen für alle Pods im Cluster vorhanden sind und verhindert gleichzeitig, dass ungenutzte Knoten Ressourcen verbrauchen. Hierbei respektiert der CAS Kubernetes-spezifische Mechanismen wie **Pod Disruption Budgets (PDBs)** und **Scheduling Constraints**. PDBs stellen sicher, dass wichtige Workloads bei der Skalierung nicht unterbrochen werden.

#### Mehrere Node-Gruppen und Expanders

Der Cluster Autoscaler unterstützt die Verwendung mehrerer Node-Gruppen, um unterschiedliche Workload-Anforderungen zu erfüllen. Durch sogenannte „Expanders“ können spezielle Skalierungsstrategien festgelegt werden, die steuern, welche Node-Gruppe bei Skalierungsbedarf bevorzugt genutzt wird. Folgende Expander stehen zur Verfügung:

- **Random:** Wählt zufällig eine Node-Gruppe aus.
- **Most-pods:** Erhöht die Node-Gruppe, die die meisten Pods aufnehmen kann.
- **Least-waste:** Nutzt die Ressourcen so effizient wie möglich, um Ressourcenverschwendung zu minimieren.
- **Price:** Bevorzugt kosteneffiziente Knoten.
- **Priority:** Skalierung nach vordefinierten Benutzerpräferenzen.

Ab Version 1.23.0 lassen sich mehrere Expanders kombinieren, um eine erweiterte Hierarchie von Skalierungsregeln zu definieren. Beispielsweise können die Expander „Priority“ und „Least-waste“ kombiniert werden, um Prioritäten mit Ressourceneffizienz zu vereinen.

### Einrichtung des Cluster Autoscalers

Die Einrichtung des CAS erfolgt entweder über **Autodiscovery** oder durch **manuelle Konfiguration**. Beide Methoden bieten verschiedene Vorteile, die je nach Umgebung zu berücksichtigen sind.

#### Autodiscovery Setup

Beim Autodiscovery erkennt der Cluster Autoscaler automatisch die relevanten Auto Scaling Groups (ASGs) des Clusters anhand spezifischer Tags. Diese Methode eignet sich besonders für Umgebungen, in denen ASGs oft hinzugefügt oder geändert werden. Die Schritte umfassen:

1. **Erstellen einer IAM-Rolle:** Die Rolle benötigt Berechtigungen für das Verwalten von Knoten in einer ASG. Ein Beispiel für die Konfiguration der IAM-Rolle:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "autoscaling:DescribeAutoScalingGroups",
           "autoscaling:DescribeAutoScalingInstances",
           "autoscaling:DescribeLaunchConfigurations",
           "autoscaling:SetDesiredCapacity",
           "autoscaling:TerminateInstanceInAutoScalingGroup",
           "ec2:DescribeInstanceTypes"
         ],
         "Resource": ["*"]
       }
     ]
   }
   ```
2. **Tagging der ASGs:** Jede ASG muss mit speziellen Tags versehen werden, um die Autodiscovery zu ermöglichen. Typische Tags sind:
   ```shell
   k8s.io/cluster-autoscaler/enabled: ""
   k8s.io/cluster-autoscaler/<CLUSTER_NAME>: ""
   ```
3. **Installation des CAS:** Nach dem Herunterladen der Manifest-Datei für Autodiscovery wird der Cluster Autoscaler installiert und konfiguriert.

#### Manuelles Setup

Die manuelle Konfiguration ermöglicht präzise Kontrolle über die zu skalierenden ASGs und eignet sich für stabile Umgebungen. Die Schritte umfassen:

1. **Erstellen einer spezifischen IAM-Rolle:** Die Rolle benötigt spezifische Berechtigungen für die definierten ASGs, die skalierbar sein sollen.
2. **Definieren der Node-Gruppen:** Die zu skalierenden ASGs werden manuell in der CAS-Konfiguration definiert.
3. **Installation und Konfiguration des CAS:** Durch die YAML-Datei wird CAS entsprechend angepasst und installiert.

Ein Beispiel für die CAS-Startparameter:
```shell
./cluster-autoscaler --cloud-provider=aws --nodes=1:10:<ASG_NAME_1> --nodes=2:20:<ASG_NAME_2>
```

### Herausforderungen und Einschränkungen des Cluster Autoscalers

#### Skalierungsgranularität

Der CAS kann aufgrund statischer Schwellenwerte Schwierigkeiten haben, stets die exakte Anzahl an Knoten zu skalieren, was entweder zu Über- oder Unterversorgung führen kann. Dies wird durch präzise Definition der Skalierungsparameter verbessert. Regelmäßiges Monitoring und Anpassung der Schwellenwerte an die Workload-Charakteristik helfen, diese Herausforderungen zu meistern.

#### Einschränkungen bei Node-Gruppen

In heterogenen Cluster-Umgebungen, die unterschiedliche Knotentypen erfordern (z. B. High-CPU oder GPU), kann CAS ineffizient arbeiten, da er nicht immer den optimalen Knoten für die Workload auswählen kann. Hier empfiehlt sich die detaillierte Planung der Node-Gruppen und Festlegung klarer Prioritäten.

#### Performance-Overhead

Die kontinuierliche Überwachung und Skalierung verbraucht selbst Ressourcen und kann besonders in großen Clustern Performance-Einbußen verursachen. CAS kann so konfiguriert werden, dass Skalierungszyklen optimiert und unnötige Abfragen vermieden werden.

### Cluster Autoscaler vs. Karpenter: Eine moderne Alternative

Während der Cluster Autoscaler eine bewährte Lösung für automatische Skalierung in Kubernetes-Umgebungen darstellt, bringt das neuere Tool **Karpenter** einige Vorteile mit sich:

1. **Schnellere Skalierungszeit:** Karpenter reagiert schneller auf Ressourcenanforderungen.
2. **Optimierte Ressourcenverteilung und Spot-Instanz-Support:** Karpenter unterstützt kostengünstige Spot-Instanzen und konsolidiert Knoten effizienter.
3. **Flexibilität ohne Node-Gruppen:** Karpenter benötigt keine vordefinierten Node-Gruppen, was die Skalierung noch flexibler macht.

### Fazit

Der Cluster Autoscaler ist ein wertvolles Werkzeug zur automatischen Anpassung der Kubernetes-Cluster-Größe und erleichtert den Betrieb durch automatisiertes Ressourcenmanagement. CAS ermöglicht es, dynamische Workloads effektiv zu bedienen und gleichzeitig die Kosten im Rahmen zu halten. Während der Cluster Autoscaler für viele Anwendungsfälle bestens geeignet ist, könnte Karpenter für spezifische Anforderungen wie extrem schnelle Skalierung oder den vermehrten Einsatz von Spot-Instanzen eine lohnende Alternative sein.