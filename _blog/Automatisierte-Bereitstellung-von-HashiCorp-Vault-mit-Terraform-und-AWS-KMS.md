---
layout: post
title: "Automatisierte Bereitstellung von HashiCorp Vault mit Terraform und AWS KMS"
subtitle: "Ein umfassender Leitfaden zur Integration von Vault in AWS Lambda-Funktionen für sichere Authentifizierung"
categories: [DevOps]
---
# {{ page.title }}
## {{ page.subtitle }}

![vault](../../img/vault_setup-1170.webp)

---

## **Einführung**

In der heutigen digitalen Welt sind Sicherheit und Verwaltung sensibler Daten von entscheidender Bedeutung. **HashiCorp Vault** ist ein Tool, das entwickelt wurde, um den Zugriff auf Tokens, Passwörter, Zertifikate und andere vertrauliche Daten zu verwalten. In diesem Blogbeitrag zeige ich dir, wie du mittels **Terraform** einen Vault-Server vollständig automatisiert konfigurierst und eine einfache Website mit Login-Funktion erstellst, die als **AWS Lambda**-Funktion läuft und Vault zur Authentifizierung nutzt.

Wir werden sowohl die Vault-Konfiguration als auch die Erstellung der Lambda-Funktion und aller Abhängigkeiten mit Terraform umsetzen. Dabei ersetzen wir den manuellen Entsperrungsprozess durch die **Auto-Unseal-Funktion von Vault mit AWS KMS**, um den Entsperrprozess sicher zu automatisieren.

---

## **Voraussetzungen**

Bevor wir beginnen, stelle sicher, dass du folgende Voraussetzungen erfüllst:

- **AWS-Konto**: Mit ausreichenden Berechtigungen zum Erstellen von Ressourcen.
- **Terraform installiert**: Version >= 0.12 empfohlen.
- **AWS CLI installiert**: Für die Interaktion mit AWS-Diensten.
- **Grundlegende Kenntnisse in Terraform, AWS Lambda und Vault**.
- **Programmierkenntnisse**: In einer Sprache, die von AWS Lambda unterstützt wird (z. B. Python, Node.js).
- **HashiCorp Vault Provider für Terraform**: Wir werden diesen verwenden, um Vault zu konfigurieren.
- **AWS KMS Schlüssel**: Für die Auto-Unseal-Funktion benötigt.

> Den Code zu diesem Beispiel findet ihr hier https://github.com/AlexanderWiechert/terraform-vault-lambda

---

## **Teil 1: Einrichtung von HashiCorp Vault mit Terraform**

### **Schritt 1: Projektverzeichnis erstellen**

Erstelle ein neues Verzeichnis für dein Terraform-Projekt:

```bash
mkdir terraform-vault
cd terraform-vault
```

### **Schritt 2: Provider konfigurieren**

Erstelle eine Datei namens `main.tf` und füge die folgenden Provider hinzu:

```hcl
provider "aws" {
  region = "eu-central-1"
}

provider "local" {}

provider "null" {}

provider "template" {}

provider "vault" {
  address = "http://${aws_instance.vault.public_ip}:8200"
}
```

### **Schritt 3: VPC und Subnetz erstellen**

Wir erstellen eine VPC und ein öffentliches Subnetz für die EC2-Instanz.

```hcl
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "VaultVPC"
  }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "eu-central-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "VaultPublicSubnet"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "VaultInternetGateway"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "VaultPublicRouteTable"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}
```

### **Schritt 4: Sicherheitsgruppe für Vault konfigurieren**

Erstelle eine Sicherheitsgruppe, die den Zugriff auf Vault erlaubt.

```hcl
resource "aws_security_group" "vault_sg" {
  name        = "vault_sg"
  description = "Allow Vault traffic"
  vpc_id      = aws_vpc.main.id

  # Regel für den SSH-Zugriff
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Dies erlaubt SSH-Zugriff von überall; achten Sie auf die Sicherheit
  }

  # Regel für den Zugriff auf den Vault-Port (optional, wenn Vault über HTTP erreichbar ist)
  ingress {
    from_port   = 8200
    to_port     = 8200
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]  # Auch hier sollten Sie die IPs einschränken, die Zugriff haben
  }

  # Regel für den ausgehenden Zugriff (optional)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"  # Erlaubt allen ausgehenden Verkehr
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "VaultSecurityGroup"
  }
}
```

### **Schritt 5: AWS KMS Schlüssel erstellen**

Wir erstellen einen AWS KMS-Schlüssel, den Vault für das Auto-Unseal verwendet.

```hcl
resource "aws_kms_key" "vault_unseal_key" {
  description             = "KMS key for Vault auto-unseal"
  deletion_window_in_days = 10
  enable_key_rotation     = true

  tags = {
    Name = "VaultAutoUnsealKey"
  }
}
```

### **Schritt 6: IAM-Rolle und -Policy für EC2-Instanz erstellen**

Vault benötigt Zugriff auf den KMS-Schlüssel. Wir erstellen eine IAM-Rolle und -Policy.

```hcl
resource "aws_iam_role" "vault_ec2_role" {
  name = "VaultEC2Role"

  assume_role_policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [{
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "vault_kms_policy" {
  name = "VaultKMSPolicy"
  role = aws_iam_role.vault_ec2_role.id

  policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:Encrypt",
        "kms:GenerateDataKey",
        "kms:DescribeKey"
      ],
      "Resource": aws_kms_key.vault_unseal_key.arn
    }]
  })
}
```

### **Schritt 7: EC2-Instance Profile erstellen**

```hcl
resource "aws_iam_instance_profile" "vault_instance_profile" {
  name = "VaultInstanceProfile"
  role = aws_iam_role.vault_ec2_role.name
}
```

### **Schritt 8: EC2-Instanz für Vault erstellen**

Wir erstellen eine EC2-Instanz, auf der Vault installiert wird.

```hcl
resource "aws_instance" "vault" {
  ami                         = "ami-0c55b159cbfafe1f0"  # Amazon Linux 2 AMI
  instance_type               = "t2.micro"
  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.vault_sg.id]
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.vault_instance_profile.name
  key_name                    = "your-key-pair-name"  # Ersetze durch deinen Schlüssel

  user_data = data.template_file.user_data.rendered

  tags = {
    Name = "VaultServer"
  }
}
```

### **Schritt 9: Vault installieren und konfigurieren mit Auto-Unseal**

Wir verwenden eine `template_file`, um das User Data Skript zu generieren.

```hcl
data "template_file" "user_data" {
  template = file("${path.module}/vault-user-data.tpl")

  vars = {
    kms_key_id = aws_kms_key.vault_unseal_key.key_id
    region     = var.region
  }
}
```

**Erstelle die Datei `vault-user-data.tpl`:**

```bash
#!/bin/bash
sudo yum update -y
sudo yum install -y wget unzip jq

# Vault installieren
wget https://releases.hashicorp.com/vault/1.9.0/vault_1.9.0_linux_amd64.zip
sudo unzip vault_1.9.0_linux_amd64.zip -d /usr/local/bin/
sudo chmod +x /usr/local/bin/vault

# Vault Benutzer und Verzeichnisse einrichten
sudo mkdir /etc/vault
sudo useradd --system --home /etc/vault --shell /bin/false vault
sudo chown -R vault:vault /etc/vault
sudo mkdir -p /var/lib/vault/data
sudo chown -R vault:vault /var/lib/vault/

# Vault-Konfiguration mit Auto-Unseal

cat << EOF > /etc/vault/config.hcl
echo 'ui = true

listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1
}

storage "file" {
  path = "/var/lib/vault/data"
}

seal "awskms" {
  region     = "${region}"
  kms_key_id = "${kms_key_id}"
}
EOF



# Systemd Service für Vault erstellen
cat <<EOF >/etc/systemd/system/vault.service
[Unit]
Description=Vault service
Requires=network-online.target
After=network-online.target

[Service]
User=vault
Group=vault
ExecStart=/usr/local/bin/vault server -config=/etc/vault/config.hcl
ExecReload=/bin/kill --signal HUP \$MAINPID
KillMode=process
Restart=on-failure
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

# Vault starten
sudo systemctl daemon-reload
sudo systemctl start vault
sudo systemctl enable vault

# Warten, bis Vault startet
sleep 30

# Vault initialisieren
vault operator init -format=json > /home/ec2-user/vault_init.json

# Root Token sichern
echo "Root Token: $(jq -r '.root_token' /home/ec2-user/vault_init.json)" >> /home/ec2-user/root_token.txt

# SSH Public Key in authorized_keys hinzufügen
echo "${ssh_pub_key}" | sudo tee /home/ec2-user/.ssh/authorized_keys > /dev/null
sudo chmod 600 /home/ec2-user/.ssh/authorized_keys
sudo chown ec2-user:ec2-user /home/ec2-user/.ssh/authorized_keys
```

**Hinweis:** Die Variablen `${kms_key_id}`, `${region}`, `${public_ip}` und `${private_ip}` werden durch die Werte aus der Terraform-Konfiguration ersetzt.

### **Schritt 10: Vault Provider konfigurieren**

Wir konfigurieren den Vault Provider, um Vault weiter zu konfigurieren.

```hcl
provider "vault" {
  address = "http://${aws_instance.vault.public_ip}:8200"
}
```

### **Schritt 11: Warten, bis Vault verfügbar ist**

Wir verwenden einen `null_resource`, um sicherzustellen, dass Vault bereit ist, bevor wir fortfahren.

```hcl
resource "null_resource" "wait_for_vault" {
  provisioner "local-exec" {
    command = "sleep 30"
  }
}
```



### **Schritt 14: UserPass Auth-Methode aktivieren und Benutzer erstellen**

```hcl
resource "vault_auth_backend" "userpass" {
  type = "userpass"

  depends_on = [vault_initialization.vault_init]
}

resource "vault_generic_endpoint" "userpass_user" {
  path      = "auth/userpass/users/testuser"
  data_json = jsonencode({
    password = "pass123"
    policies = ["default"]
  })
  depends_on = [vault_auth_backend.userpass]
}
```

---

## **Teil 2: Erstellen der Lambda-Funktion und aller Abhängigkeiten mit Terraform**

### **Schritt 1: Erstellen der Lambda-Funktion**

Wir verwenden Python für die Lambda-Funktion.

**Erstelle einen Ordner `lambda_function` und eine Datei `lambda_function.py`:**

```bash
mkdir lambda_function
cd lambda_function
```

**Datei:** `lambda_function.py`

```python
import json
import os
import hvac

def lambda_handler(event, context):
    username = event.get('username')
    password = event.get('password')

    if not username or not password:
        return {
            'statusCode': 400,
            'body': json.dumps('Username and password are required.')
        }

    client = hvac.Client(
        url=os.environ['VAULT_ADDR']
    )

    try:
        client.auth.userpass.login(
            username=username,
            password=password
        )
        return {
            'statusCode': 200,
            'body': json.dumps('Login erfolgreich!')
        }
    except hvac.exceptions.InvalidRequest:
        return {
            'statusCode': 401,
            'body': json.dumps('Ungültige Anmeldeinformationen.')
        }
```

**Erstelle eine `requirements.txt`-Datei:**

```txt
hvac==0.11.2
requests==2.25.1
```

**Hinweis:** Möglicherweise musst du zusätzliche Abhängigkeiten hinzufügen, abhängig von der `hvac`-Version.

### **Schritt 2: Erstellen des Deployment-Pakets**

Erstelle das Deployment-Paket für die Lambda-Funktion.

```bash
cd lambda_function
pip install -r requirements.txt -t .
zip -r ../lambda_function.zip .
cd ..
```

### **Schritt 3: Terraform-Konfiguration für die Lambda-Funktion**

Erstelle eine neue Datei `lambda.tf`:

```hcl
# Lokale Dateien einlesen
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda_function.zip"
  output_path = "${path.module}/lambda_function_deploy.zip"
}

# IAM-Rolle für Lambda-Funktion
resource "aws_iam_role" "lambda_role" {
  name = "vault_lambda_role"

  assume_role_policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [{
      "Action": "sts:AssumeRole",
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      }
    }]
  })
}

# Anfügen von Richtlinien an die IAM-Rolle
resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda-Funktion erstellen
resource "aws_lambda_function" "vault_login_function" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "vault_login_function"
  role             = aws_iam_role.lambda_role.arn
  handler          = "lambda_function.lambda_handler"
  runtime          = "python3.8"
  timeout          = 10
  source_code_hash = filebase64sha256(data.archive_file.lambda_zip.output_path)

  environment {
    variables = {
      VAULT_ADDR = "http://${aws_instance.vault.public_ip}:8200"
    }
  }

  depends_on = [aws_iam_role_policy_attachment.lambda_basic_execution]
}
```

### **Schritt 4: API Gateway einrichten**

Wir richten eine API Gateway REST API ein, um die Lambda-Funktion aufzurufen.

Ergänze in `lambda.tf`:

```hcl
resource "aws_api_gateway_rest_api" "vault_api" {
  name        = "VaultLoginAPI"
  description = "API Gateway für Vault Login"
}

resource "aws_api_gateway_resource" "login_resource" {
  rest_api_id = aws_api_gateway_rest_api.vault_api.id
  parent_id   = aws_api_gateway_rest_api.vault_api.root_resource_id
  path_part   = "login"
}

resource "aws_api_gateway_method" "login_method" {
  rest_api_id   = aws_api_gateway_rest_api.vault_api.id
  resource_id   = aws_api_gateway_resource.login_resource.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.vault_api.id
  resource_id             = aws_api_gateway_resource.login_resource.id
  http_method             = aws_api_gateway_method.login_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.vault_login_function.invoke_arn
}

resource "aws_lambda_permission" "api_gateway_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.vault_login_function.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.vault_api.execution_arn}/*/*"
}

resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on   = [aws_api_gateway_integration.lambda_integration]
  rest_api_id  = aws_api_gateway_rest_api.vault_api.id
  stage_name   = "prod"
}

output "api_invoke_url" {
  value = "${aws_api_gateway_deployment.invoke_url}login"
}
```

### **Schritt 5: Aktualisiere die Terraform-Konfiguration**

Füge in `main.tf` die folgenden Zeilen hinzu, um die Abhängigkeiten sicherzustellen:

```hcl
depends_on = [
  vault_initialization.vault_init
]
```

Setze dies in Ressourcen ein, die auf Vault angewiesen sind.

### **Schritt 6: Terraform erneut ausführen**

```bash
terraform init
terraform apply
```

Bestätige die Ausführung und warte, bis Terraform abgeschlossen ist.

Notiere dir die Ausgabe `api_invoke_url`.

### **Schritt 7: Testen der Anwendung**

Sende eine HTTP-POST-Anfrage an die API-URL:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"username": "testuser", "password": "pass123"}' <api_invoke_url>
```

Erwarte eine erfolgreiche Login-Antwort.

---

## **Fazit**

In diesem Blogbeitrag haben wir gezeigt, wie man mit **Terraform** und der **Auto-Unseal-Funktion von Vault mit AWS KMS** einen HashiCorp Vault-Server auf AWS vollständig automatisiert einrichtet und eine AWS Lambda Login-Funktion erstellt, die Vault zur Authentifizierung nutzt. Durch die Automatisierung aller Schritte mit Terraform und die Verwendung von AWS KMS für den Entsperrprozess kannst du eine sichere und effiziente Infrastruktur aufbauen.

---

## **Weiterführende Ressourcen**

- [HashiCorp Vault Dokumentation](https://www.vaultproject.io/docs)
- [Vault Auto-Unseal mit AWS KMS](https://www.vaultproject.io/docs/configuration/seal/awskms)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Terraform Vault Provider](https://registry.terraform.io/providers/hashicorp/vault/latest/docs)
- [AWS KMS Dokumentation](https://docs.aws.amazon.com/kms/index.html)
- [AWS Lambda Dokumentation](https://docs.aws.amazon.com/lambda/index.html)
- [AWS API Gateway Dokumentation](https://docs.aws.amazon.com/apigateway/index.html)

---