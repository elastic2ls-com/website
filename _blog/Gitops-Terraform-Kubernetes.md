---
layout: post
title: "Wie du GitOps mit Terraform und Kubernetes nutzt"
subtitle:  "Schritt für Schritt"
categories: [DevOps]
---
# {{ page.title }}
## {{ page.subtitle }}


![finops](../../img/flux_1170.webp)


In der modernen Cloud-Infrastruktur wird GitOps zunehmend als Standard für das Management von Cloud-Ressourcen angesehen. GitOps verspricht einen klaren, deklarativen Ansatz zur Verwaltung von Anwendungen und Infrastruktur, bei dem Git als Single Source of Truth fungiert. In diesem Artikel erfährst du, wie du mit dem **KubeVela Terraform Controller** aus einem Kubernetes-Cluster heraus AWS-Ressourcen mithilfe von Terraform verwaltest.

**Das vollständige GitOps Terraform Repository findest du hier:**  
[GitOps Terraform Kubernetes Repository](git@github.com:AlexanderWiechert/gitops-terraform-kubernetes.git)

## Voraussetzungen

Bevor du beginnst, stelle sicher, dass folgende Voraussetzungen erfüllt sind:

- Ein funktionierender Kubernetes-Cluster.
- `kubectl` ist installiert und konfiguriert.
- Helm CLI ist installiert (Version ≥ 3).
- Flux ist im Cluster installiert.
- Terraform ist auf deinem System eingerichtet.
- Ein Git-Repository zur Speicherung deiner Konfigurationsdateien.
- AWS-Zugangsdaten für die Authentifizierung, z. B. als Kubernetes-Secret hinterlegt.

## Schritt 1: Einrichtung von Flux

Flux ist ein Open-Source-Tool, das es ermöglicht, Kubernetes-Ressourcen direkt aus einem Git-Repository zu synchronisieren und Terraform-Konfigurationen anzuwenden. Es kann entweder mit Helm oder mit `kubectl apply` installiert werden.

### **Installation mit Helm (empfohlen)**
Diese Methode ermöglicht eine einfache Verwaltung von Updates und Konfigurationen über Helm.

```bash
helm repo add fluxcd https://charts.fluxcd.io
helm repo update
helm install flux fluxcd/flux --namespace flux-system --create-namespace
```

**Optional:** Falls du **Flux mit GitOps-Funktionalität** bootstrappen möchtest, verwende:

```bash
flux bootstrap github   --owner=AlexanderWiechert   --repository=gitops-terraform-kubernetes   --branch=main   --path=clusters/my-cluster
```

> ⚠️ Diese Methode benötigt ein GitHub-Personal Access Token (PAT) mit den entsprechenden Rechten.

### **Installation mit `kubectl apply` (Alternative Methode)**
Falls Helm nicht verfügbar ist oder nicht genutzt werden soll, kann Flux auch mit `kubectl apply` direkt installiert werden:

```bash
kubectl apply -f https://github.com/fluxcd/flux2/releases/latest/download/install.yaml
```

Nach der Installation kannst du den Status von Flux überprüfen mit:

```bash
kubectl get pods -n flux-system
```

## Schritt 2: Installation des KubeVela Terraform Controllers

Der KubeVela Terraform Controller ersetzt den archivierten Rancher Terraform Controller und ermöglicht die Ausführung von Terraform innerhalb von Kubernetes zur Verwaltung von AWS-Ressourcen. Installiere den Controller mit Helm:

```bash
helm repo add kubevela-addons https://charts.kubevela.net/addons
helm upgrade --install terraform-controller -n terraform --create-namespace kubevela-addons/terraform-controller
```

## Schritt 3: AWS-Zugangsdaten als Kubernetes-Secret speichern

Um die Authentifizierung sicher zu handhaben, speichere deine AWS-Zugangsdaten als Secret im Kubernetes-Cluster:

```bash
kubectl create secret generic aws-secret   --from-literal=AWS_ACCESS_KEY_ID=<your-access-key>   --from-literal=AWS_SECRET_ACCESS_KEY=<your-secret-key>   -n terraform
```

## Schritt 4: Änderungen an der Terraform-Konfiguration automatisch anwenden

Um sicherzustellen, dass Änderungen an der Terraform-Konfiguration automatisch angewendet werden, kannst du folgende **Vorher-Nachher-Prüfung** durchführen.

### **Schritt 4.1: Vorherige Konfiguration überprüfen**
Bevor du eine Änderung vornimmst, überprüfe die aktuelle Instanzkonfiguration:

```bash
aws ec2 describe-instances --query "Reservations[*].Instances[*].InstanceType" --output table
```

Erwartete Ausgabe (vor der Änderung, z. B. `t3.nano`):

```
------------------
| InstanceType  |
------------------
| t3.nano       |
------------------
```

### **Schritt 4.2: Instanztyp in Terraform ändern**
Ändere den Instanztyp in der Datei `terraform/ec2-alb.yaml` von `t3.nano` auf `t3.micro`:

```yaml
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  security_groups = [aws_security_group.web_sg.name]
  user_data = <<-EOF
            #!/bin/bash
            echo "<h1>Hello, Terraform & GitOps!</h1>" > /var/www/html/index.html
            nohup python3 -m http.server 80 &
            EOF
}
```

### **Schritt 4.3: Änderungen committen und pushen**

```bash
git add terraform/ec2-alb.yaml
git commit -m "Ändere EC2 Instanztyp auf t3.micro"
git push
```

Flux erkennt die Änderung automatisch und synchronisiert sie mit dem Kubernetes-Cluster. Der KubeVela Terraform Controller übernimmt die Anwendung der aktualisierten Konfiguration.

### **Schritt 4.4: Nachher-Prüfung in AWS**

Nachdem Flux und Terraform die Änderung angewendet haben, überprüfe erneut die Instanzkonfiguration:

```bash
aws ec2 describe-instances --query "Reservations[*].Instances[*].InstanceType" --output table
```

Erwartete Ausgabe (nach der Änderung, z. B. `t3.micro`):

```
------------------
| InstanceType  |
------------------
| t3.micro      |
------------------
```

Falls die Änderung erfolgreich war, sollte nun `t3.micro` als Instanztyp angezeigt werden.

## Fazit

Mit Flux und dem **KubeVela Terraform Controller** kannst du aus einem Kubernetes-Cluster heraus AWS-Ressourcen verwalten und bereitstellen. 

Im Vergleich zur klassischen Bereitstellung mit einer CI/CD-Pipeline bietet GitOps mit Terraform mehrere Vorteile:
- **Automatische Synchronisation:** Änderungen im Git-Repository werden automatisch erkannt und angewendet, ohne dass manuell eine Pipeline ausgeführt werden muss.
- **Single Source of Truth:** Die Infrastruktur wird deklarativ im Git gespeichert, was Versionierung, Rollbacks und Nachvollziehbarkeit erleichtert.
- **Erhöhte Konsistenz:** GitOps stellt sicher, dass die gewünschte Konfiguration jederzeit mit der tatsächlich bereitgestellten Infrastruktur übereinstimmt.
- **Weniger manuelle Eingriffe:** Anstatt manuell eine Pipeline auszuführen, übernimmt Flux automatisch die Anwendung der Änderungen.