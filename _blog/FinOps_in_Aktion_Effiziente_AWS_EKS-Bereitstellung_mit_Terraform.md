---
layout: post
title: "FinOps in Aktion: Effiziente AWS EKS-Bereitstellung mit Terraform"
subtitle:  "Ein Leitfaden mit FinOps-Kostenanalyse und Einrichtung von Connection Draining"
categories: [Howtos]
---
# {{ page.title }}
## {{ page.subtitle }}


![finops](../../img/AWS_EKS_mit_Terraform_und_FinOps-1170.webp)


---

## **Einführung**

Die Orchestrierung von Containern ist ein zentraler Bestandteil moderner Anwendungsbereitstellungen. **Amazon Elastic Kubernetes Service (EKS)** bietet eine verwaltete Kubernetes-Umgebung auf AWS, die die Einrichtung und Verwaltung von Kubernetes-Clustern vereinfacht. In Kombination mit **Terraform**, einem leistungsstarken Infrastructure-as-Code-Tool, können wir die Bereitstellung und Verwaltung von EKS-Clustern automatisieren und versionieren.

In diesem Blogbeitrag zeige ich dir, wie du mit Terraform einen EKS-Cluster auf AWS erstellen kannst. Darüber hinaus betrachten wir im Kontext von **FinOps** (Financial Operations) die Kostenoptimierung und vergleichen verschiedene Optionen vom Standard-Setup bis hin zu Spot-Instanzen mit Connection Draining. Eine Kostenübersichtstabelle hilft dabei, die finanziellen Auswirkungen der verschiedenen Optionen zu verstehen.

---

## **Teil 1: Bereitstellung des EKS Clusters mit Terraform**

### **Schritt 1: Projektstruktur einrichten**

Erstelle ein neues Verzeichnis für dein Terraform-Projekt:

```bash
mkdir terraform-eks
cd terraform-eks
```

---

### **Schritt 2: Provider konfigurieren**

Erstelle eine Datei namens `main.tf` und füge den AWS-Provider hinzu:

```hcl
provider "aws" {
  region = "eu-central-1" # Wähle deine gewünschte Region
}
```

---

### **Schritt 3: VPC erstellen**

Für unseren EKS-Cluster benötigen wir eine Virtual Private Cloud (VPC). Wir können entweder eine bestehende VPC nutzen oder eine neue erstellen.

**VPC-Modul verwenden:**

Füge folgendes in `vpc.tf` hinzu:

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.14.0"

  name = "eks-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["eu-central-1a", "eu-central-1b", "eu-central-1c"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnets = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "eks-vpc"
  }
}
```

Dieses Modul erstellt eine VPC mit öffentlichen und privaten Subnetzen über drei Availability Zones.

---

### **Schritt 4: IAM-Rollen und -Policies definieren**

EKS benötigt bestimmte IAM-Rollen und -Policies. Erstelle eine Datei `iam.tf`:

```hcl
data "aws_iam_policy_document" "eks_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["eks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "eks_cluster_role" {
  name               = "eks_cluster_role"
  assume_role_policy = data.aws_iam_policy_document.eks_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy_attachment" {
  role       = aws_iam_role.eks_cluster_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

resource "aws_iam_role_policy_attachment" "eks_service_policy_attachment" {
  role       = aws_iam_role.eks_cluster_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSServicePolicy"
}
```

---

### **Schritt 5: EKS-Cluster erstellen**

Füge in `eks-cluster.tf` folgendes hinzu:

```hcl
resource "aws_eks_cluster" "eks_cluster" {
  name     = "my-eks-cluster"
  role_arn = aws_iam_role.eks_cluster_role.arn

  vpc_config {
    subnet_ids = module.vpc.private_subnets
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy_attachment,
    aws_iam_role_policy_attachment.eks_service_policy_attachment,
  ]
}
```

Dies erstellt den eigentlichen EKS-Cluster unter Verwendung der zuvor erstellten IAM-Rolle und VPC-Subnetze.

---

### **Schritt 6: Node Group hinzufügen**

Für die Worker Nodes benötigen wir eine Node Group. Füge in `node-group.tf` hinzu:

```hcl
data "aws_iam_policy_document" "eks_worker_assume_role_policy" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "eks_worker_role" {
  name               = "eks_worker_role"
  assume_role_policy = data.aws_iam_policy_document.eks_worker_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "worker_node_policy_attachment" {
  role       = aws_iam_role.eks_worker_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "cni_policy_attachment" {
  role       = aws_iam_role.eks_worker_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "registry_policy_attachment" {
  role       = aws_iam_role.eks_worker_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_eks_node_group" "eks_node_group" {
  cluster_name    = aws_eks_cluster.eks_cluster.name
  node_group_name = "eks-node-group"
  node_role_arn   = aws_iam_role.eks_worker_role.arn
  subnet_ids      = module.vpc.private_subnets

  scaling_config {
    desired_size = 2
    max_size     = 3
    min_size     = 1
  }

  instance_types = ["t3.medium"]

  depends_on = [
    aws_eks_cluster.eks_cluster,
    aws_iam_role_policy_attachment.worker_node_policy_attachment,
    aws_iam_role_policy_attachment.cni_policy_attachment,
    aws_iam_role_policy_attachment.registry_policy_attachment,
  ]
}
```

---

### **Schritt 7: Outputs definieren**

Erstelle eine Datei `outputs.tf`, um wichtige Informationen auszugeben:

```hcl
output "cluster_endpoint" {
  description = "EKS Cluster Endpoint"
  value       = aws_eks_cluster.eks_cluster.endpoint
}

output "cluster_certificate" {
  description = "EKS Cluster Certificate Authority"
  value       = aws_eks_cluster.eks_cluster.certificate_authority[0].data
}

output "cluster_name" {
  description = "EKS Cluster Name"
  value       = aws_eks_cluster.eks_cluster.name
}
```

---

### **Schritt 8: Terraform ausführen**

#### **Initialisieren**

```bash
terraform init
```

#### **Plan erstellen**

```bash
terraform plan -out=eks.plan
```

Überprüfe den Plan und stelle sicher, dass alles korrekt ist.

#### **Anwenden**

```bash
terraform apply eks.plan
```

Dieser Schritt kann einige Minuten dauern, da AWS die Ressourcen bereitstellt.

---

### **Schritt 9: Kubernetes-Kontext konfigurieren**

Um `kubectl` mit dem neuen Cluster zu verbinden, benötigen wir eine Konfigurationsdatei.

Führe folgendes Skript aus (du kannst es in `update-kubeconfig.sh` speichern):

```bash
#!/bin/bash

aws eks update-kubeconfig --region eu-central-1 --name my-eks-cluster
```

Dadurch wird die `kubeconfig` aktualisiert und du kannst mit dem Cluster interagieren:

```bash
kubectl get nodes
```

Du solltest die Worker Nodes sehen, die im Cluster registriert sind.

---

### **Schritt 10: Testen des Clusters**

Erstelle eine einfache Anwendung, um den Cluster zu testen. Zum Beispiel ein Nginx-Deployment:

```bash
kubectl create deployment nginx --image=nginx
kubectl expose deployment nginx --port=80 --type=LoadBalancer
```

Überprüfe den Status:

```bash
kubectl get services
```

Nach einigen Minuten sollte ein ELB-Endpunkt verfügbar sein, über den du auf Nginx zugreifen kannst.

---

### **Aufräumen**

Wenn du den Cluster nicht mehr benötigst, kannst du die Ressourcen entfernen:

```bash
terraform destroy
```

---

## **Teil 2: Kostenbetrachtung im Kontext von FinOps**

### **Warum FinOps?**

In der heutigen Cloud-Ära ist die Kostenoptimierung ein wesentlicher Aspekt der Infrastrukturverwaltung. **FinOps** (Financial Operations) kombiniert Finanzmanagement und DevOps-Prinzipien, um die Effizienz und Transparenz der Cloud-Ausgaben zu maximieren. Bei der Bereitstellung eines EKS-Clusters auf AWS gibt es verschiedene Optionen, um Kosten zu optimieren, ohne die Leistung zu beeinträchtigen.

### **Standard-Setup vs. Spot-Instanzen mit Connection Draining**

#### **Standard-Setup (On-Demand-Instanzen)**

Im Standard-Setup verwenden wir **On-Demand-EC2-Instanzen** für unsere Worker Nodes. Diese bieten:

- **Vorteile:**
    - **Stabilität:** Instanzen werden nicht unerwartet beendet.
    - **Flexibilität:** Skalierung nach Bedarf ohne Unterbrechungen.
    - **Einfache Verwaltung:** Weniger Komplexität bei der Einrichtung.

- **Nachteile:**
    - **Höhere Kosten:** On-Demand-Preise sind im Vergleich zu anderen Optionen höher.

#### **Spot-Instanzen mit Connection Draining**

**Spot-Instanzen** ermöglichen es, ungenutzte EC2-Kapazitäten zu einem deutlich reduzierten Preis zu nutzen. Allerdings können sie jederzeit von AWS beendet werden, wenn die Kapazität benötigt wird.

- **Vorteile:**
    - **Kosteneinsparungen:** Bis zu 90 % günstiger als On-Demand-Instanzen.
    - **Skalierbarkeit:** Möglichkeit, große Workloads kostengünstig zu betreiben.

- **Nachteile:**
    - **Unterbrechungen:** Instanzen können kurzfristig beendet werden.
    - **Komplexität:** Erfordert zusätzliche Mechanismen, um Unterbrechungen zu handhaben.

**Connection Draining** hilft dabei, laufende Verbindungen sauber zu beenden, bevor eine Instanz entfernt wird. In Kombination mit Spot-Instanzen kann dies dazu beitragen, die Auswirkungen von Unterbrechungen zu minimieren.

### **Implementierung von Spot-Instanzen in Terraform**

Wir können unsere **Node Group** so konfigurieren, dass sie Spot-Instanzen verwendet:

```hcl
resource "aws_eks_node_group" "eks_spot_node_group" {
  cluster_name    = aws_eks_cluster.eks_cluster.name
  node_group_name = "eks-spot-node-group"
  node_role_arn   = aws_iam_role.eks_worker_role.arn
  subnet_ids      = module.vpc.private_subnets

  scaling_config {
    desired_size = 4
    max_size     = 6
    min_size     = 2
  }

  instance_types = ["t3.medium"]

  capacity_type = "SPOT"

  labels = {
    lifecycle = "Ec2Spot"
  }

  taints = [{
    key    = "spotInstance",
    value  = "true",
    effect = "NoSchedule"
  }]

  depends_on = [
    aws_eks_cluster.eks_cluster,
    aws_iam_role_policy_attachment.worker_node_policy_attachment,
    aws_iam_role_policy_attachment.cni_policy_attachment,
    aws_iam_role_policy_attachment.registry_policy_attachment,
  ]
}
```

---

## **Teil 3: Einrichtung von Connection Draining**

### **Warum ist Connection Draining wichtig?**

Beim Einsatz von Spot-Instanzen besteht die Möglichkeit, dass AWS diese mit einer Vorwarnzeit von nur 2 Minuten beendet. Ohne entsprechende Maßnahmen können laufende Anwendungen abrupt unterbrochen werden, was zu Datenverlust oder Dienstunterbrechungen führen kann.

**Connection Draining** ermöglicht es, laufende Verbindungen sauber zu beenden und Pods auf anderen verfügbaren Nodes neu zu starten, bevor die Instanz tatsächlich heruntergefahren wird.

### **Implementierung des AWS Node Termination Handlers**

Der **AWS Node Termination Handler** ist ein DaemonSet, das Benachrichtigungen über bevorstehende Instanzunterbrechungen überwacht und automatisch das Drainieren der betroffenen Nodes initiiert.

#### **Schritt 1: Hinzufügen des Node Termination Handlers**

**Option 1: Installation mit Helm**

Falls du **Helm** noch nicht installiert hast, kannst du es mit folgendem Befehl installieren:

```bash
curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash
```

**Füge das Helm-Repository hinzu:**

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update
```

**Installiere den Node Termination Handler:**

```bash
helm install aws-node-termination-handler eks/aws-node-termination-handler \
  --namespace kube-system \
  --set enableSpotInterruptionDraining=true \
  --set enableRebalanceMonitoring=true \
  --set enableRebalanceDraining=true \
  --set enableScheduledEventDraining=true \
  --set enablePrometheusMetrics=true
```

**Option 2: Installation mit kubectl**

Du kannst die YAML-Manifeste direkt von GitHub anwenden:

```bash
kubectl apply -f https://github.com/aws/aws-node-termination-handler/releases/download/v1.14.1/all-resources.yaml
```

*Hinweis:* Überprüfe die neueste Version auf der [GitHub-Seite des Projekts](https://github.com/aws/aws-node-termination-handler).

#### **Schritt 2: Konfiguration des Node Termination Handlers in Terraform**

Wenn du den Node Termination Handler mit Terraform verwalten möchtest, kannst du ein Helm-Release direkt in Terraform definieren.

**Füge in `helm.tf` folgendes hinzu:**

```hcl
provider "helm" {
  kubernetes {
    host                   = aws_eks_cluster.eks_cluster.endpoint
    cluster_ca_certificate = base64decode(aws_eks_cluster.eks_cluster.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.eks_auth.token
  }
}

data "aws_eks_cluster_auth" "eks_auth" {
  name = aws_eks_cluster.eks_cluster.name
}

resource "helm_release" "aws_node_termination_handler" {
  name       = "aws-node-termination-handler"
  repository = "https://aws.github.io/eks-charts"
  chart      = "aws-node-termination-handler"
  namespace  = "kube-system"
  version    = "0.18.0" # Überprüfe die neueste Version

  values = [
    <<EOF
enableSpotInterruptionDraining: true
enableRebalanceMonitoring: true
enableRebalanceDraining: true
enableScheduledEventDraining: true
enablePrometheusMetrics: true
EOF
  ]

  depends_on = [aws_eks_cluster.eks_cluster]
}
```

#### **Schritt 3: Überprüfen der Installation**

Nach der Installation kannst du überprüfen, ob das DaemonSet läuft:

```bash
kubectl get daemonset -n kube-system aws-node-termination-handler
```

Die Pods sollten auf allen Nodes im Cluster laufen.

### **Anpassen der Pod-Termination-Grace-Period**

Stelle sicher, dass deine Pods eine ausreichende **Termination Grace Period** haben, um laufende Verbindungen sauber zu beenden.

**Beispiel für ein Deployment:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      terminationGracePeriodSeconds: 120
      containers:
      - name: my-app-container
        image: my-app-image
        # Weitere Container-Konfiguration
```

*Hinweis:* Die `terminationGracePeriodSeconds` sollte mindestens 120 Sekunden betragen, um die 2-Minuten-Vorwarnzeit von Spot-Instanzunterbrechungen abzudecken.

### **Testen des Connection Draining**

Du kannst das Verhalten simulieren, indem du eine Node manuell drainst:

```bash
kubectl drain <node-name> --ignore-daemonsets --delete-emptydir-data
```

Überprüfe, ob die Pods sauber auf andere Nodes verschoben werden und keine Verbindungen abrupt beendet werden.

### **Automatische Skalierung mit Cluster Autoscaler**

In Kombination mit dem **Kubernetes Cluster Autoscaler** kannst du sicherstellen, dass bei Wegfall von Nodes automatisch neue Nodes hinzugefügt werden, um die gewünschte Kapazität zu halten.

**Installation des Cluster Autoscalers mit Helm:**

```bash
helm repo add autoscaler https://kubernetes.github.io/autoscaler
helm repo update

helm install cluster-autoscaler autoscaler/cluster-autoscaler-chart \
  --namespace kube-system \
  --set autoDiscovery.clusterName=my-eks-cluster \
  --set awsRegion=eu-central-1 \
  --set expander=random \
  --set cloudProvider=aws \
  --set extraArgs.balance-similar-node-groups=true \
  --set extraArgs.skip-nodes-with-system-pods=false \
  --set rbac.create=true
```

**Konfiguration in Terraform:**

Du kannst auch den Cluster Autoscaler als Helm-Release in Terraform hinzufügen.

### **Anpassen der Node Group für Auto Scaling**

Stelle sicher, dass deine Node Groups das Auto Scaling unterstützen, indem du die richtigen Parameter setzt.

**Beispiel:**

```hcl
resource "aws_eks_node_group" "eks_spot_node_group" {
  # ... (wie zuvor)

  scaling_config {
    desired_size = 4
    max_size     = 10
    min_size     = 2
  }

  # ... (restliche Konfiguration)
}
```

---

## **Aktualisierte Kostenübersicht**

Mit der zusätzlichen Implementierung von Connection Draining und dem Cluster Autoscaler kannst du die Vorteile von Spot-Instanzen voll ausschöpfen und gleichzeitig die Servicequalität aufrechterhalten.

| **Option**                                | **Kosten pro Stunde** | **Monatliche Kosten** (730 Std.) | **Einsparungen** |
|-------------------------------------------|-----------------------|----------------------------------|------------------|
| **On-Demand-Instanzen**                   | 0,0416 USD            | 30,37 USD                        | -                |
| **Spot-Instanzen mit Connection Draining**| 0,0125 USD            | 9,13 USD                         | **~70%**         |

---

## **Fazit**

Die Einrichtung von **Connection Draining** in Kombination mit **Spot-Instanzen** und dem **Cluster Autoscaler** ermöglicht eine kosteneffiziente und robuste Kubernetes-Infrastruktur auf AWS EKS. Durch die Verwendung von Terraform und Helm kannst du diese Konfigurationen automatisieren und versionieren, was die Verwaltung deiner Cloud-Ressourcen erheblich erleichtert.

---

## **Weiterführende Ressourcen**

- [AWS Node Termination Handler GitHub Repository](https://github.com/aws/aws-node-termination-handler)
- [AWS Spot Instances Dokumentation](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-spot-instances.html)
- [Kubernetes Cluster Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler)
- [Helm Charts für EKS](https://github.com/aws/eks-charts)
- [FinOps Foundation](https://www.finops.org/)
- [Terraform AWS EKS Modul](https://registry.terraform.io/modules/terraform-aws-modules/eks/aws/latest)

---

**Hast du weitere Fragen oder benötigst du Unterstützung bei der Implementierung? Kontaktiere uns direkt!**

---