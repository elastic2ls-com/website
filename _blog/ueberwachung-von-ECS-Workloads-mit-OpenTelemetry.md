---
layout: post
title: "Überwachung von ECS Workloads mit OpenTelemetry"
subtitle: "Telemetriedaten mit OpenTelemetry"
categories: [DevOps]
---
# {{ page.title }}
## {{ page.subtitle }}


![grafana](../../img/aws-managed-grafana.png)

Deployment des AWS Distro for OpenTelemetry (ADOT) Collectors auf ECS mit Terraform und GitLab CI/CD

In diesem Artikel führen wir dich durch die Bereitstellung des AWS Distro for OpenTelemetry (ADOT) Collectors auf AWS ECS mit Terraform. Zusätzlich integrieren wir eine Dummy Node.js-Anwendung, die über eine GitLab CI/CD-Pipeline gebaut und in ECR-Repositories gepusht wird. Ein Application Load Balancer (ALB) wird vor dem ECS-Cluster bereitgestellt, und wir führen Tests durch, um sicherzustellen, dass die Anwendung korrekt funktioniert.

## Warum OpenTelemetry für ECS?

OpenTelemetry bietet eine herstellerunabhängige Methode zur Instrumentierung, Generierung, Sammlung und Exportierung von Telemetriedaten (Metriken, Logs und Traces) zur Analyse. Durch die Integration von OpenTelemetry mit ECS können wir tiefere Einblicke in die Performance und das Verhalten unserer Anwendung gewinnen, was uns ermöglicht, Probleme effizienter zu identifizieren und zu beheben.

## Voraussetzungen

Stelle sicher, dass die folgenden Voraussetzungen erfüllt sind:

- AWS CLI installiert und konfiguriert
- Terraform installiert
- Ein bestehender AWS ECS-Cluster (Fargate oder EC2)
- Ein eingerichteter Amazon Managed Service for Prometheus (AMP)-Workspace
- Zugriff auf Amazon Managed Grafana
- Eine IAM-Rolle für die ECS-Tasks mit den notwendigen Berechtigungen

## Schritt 1: Erstellen eines Amazon Elastic Container Registry (ECR) Repositorys

Erstelle ECR-Repositories für den OpenTelemetry Collector und die Beispielanwendung:

```hcl
resource "aws_ecr_repository" "adot_collector" {
  name = "adot-collector"
}

resource "aws_ecr_repository" "app_container" {
  name = "example-app"
}
```

## Schritt 2: Dummy Node.js Anwendung

Erstelle eine einfache Node.js-Anwendung, die HTTP-Anfragen verarbeitet und eine 200-Antwort zurückgibt.

**app.js:**

```javascript
const express = require('express');
const app = express();
const port = 8080;

app.get('/', (req, res) => {
  res.status(200).send('Hello, World!');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
```

**Dockerfile:**

```dockerfile
FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080
CMD [ "node", "app.js" ]
```

## Schritt 3: GitLab CI/CD Pipeline

Erstelle eine `.gitlab-ci.yml`-Datei, um die Docker-Images zu bauen und in die ECR-Repositories zu pushen.

**.gitlab-ci.yml:**

```yaml
stages:
  - build
  - push
  - deploy
  - test

variables:
  ECR_REGISTRY: <your-ecr-registry>
  APP_IMAGE: example-app
  COLLECTOR_IMAGE: adot-collector

before_script:
  - amazon-linux-extras install docker
  - aws --version
  - $(aws ecr get-login --no-include-email --region <your-region>)

build:
  stage: build
  script:
    - docker build -t $ECR_REGISTRY/$APP_IMAGE:latest .
    - docker build -t $ECR_REGISTRY/$COLLECTOR_IMAGE:latest -f Dockerfile.collector .

push:
  stage: push
  script:
    - docker push $ECR_REGISTRY/$APP_IMAGE:latest
    - docker push $ECR_REGISTRY/$COLLECTOR_IMAGE:latest

deploy:
  stage: deploy
  script:
    - terraform init
    - terraform apply -auto-approve

test:
  stage: test
  script:
    - curl -s -o /dev/null -w "%{http_code}" http://<alb-dns-name>/ | grep "200"
```

## Schritt 4: ECS Task Definition

Definiere eine ECS Task Definition, die sowohl die Anwendung als auch den OpenTelemetry Collector als Sidecar-Container enthält:

```hcl
resource "aws_ecs_task_definition" "example_app" {
  family                   = "example-app"
  execution_role_arn       = aws_iam_role.ecs_task_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  memory                   = "512"
  cpu                      = "256"
  container_definitions    = jsonencode([
    {
      "name": "example-app",
      "image": "${aws_ecr_repository.app_container.repository_url}:latest",
      "cpu": 256,
      "memory": 256,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        { "name": "OTEL_EXPORTER_OTLP_ENDPOINT", "value": "http://localhost:4317" }
      ]
    },
    {
      "name": "otel-collector",
      "image": "public.ecr.aws/aws-observability/aws-otel-collector",
      "cpu": 256,
      "memory": 256,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 4317,
          "protocol": "tcp"
        }
      ]
    }
  ])
}
```

## Schritt 5: Application Load Balancer (ALB)

Erstelle einen Application Load Balancer (ALB) vor dem ECS-Cluster:

```hcl
resource "aws_lb" "example" {
  name               = "example-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public[*].id
}

resource "aws_lb_target_group" "example" {
  name     = "example-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path = "/"
  }
}

resource "aws_lb_listener" "example" {
  load_balancer_arn = aws_lb.example.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.example.arn
  }
}

output "alb_dns_name" {
  value = aws_lb.example.dns_name
}
```

## Schritt 6: ECS Service

Erstelle den ECS Service, um die Beispielanwendung mit dem OpenTelemetry Collector auf Fargate auszuführen:

```hcl
resource "aws_ecs_service" "example_app" {
  name            = "example-app"
  cluster         = aws_ecs_cluster.my_cluster.id
  task_definition = aws_ecs_task_definition.example_app.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.example.arn
    container_name   = "example-app"
    container_port   = 8080
  }
}
```

## Schritt 7: Visualisierung mit Amazon Managed Grafana

1. Öffne Amazon Managed Grafana und erstelle ein neues Dashboard.
2. Füge Amazon Managed Prometheus als Datenquelle hinzu.
3. Nutze PromQL-Abfragen, um die erfassten Metriken in Dashboards darzustellen.

## Fazit

Mit dieser Terraform-Konfiguration und der GitLab CI/CD-Pipeline wird ein vollständiges Monitoring-Setup bereitgestellt, bestehend aus:

- Einer Dummy Node.js-Anwendung, die Metriken produziert
- Einem OpenTelemetry Collector, der Daten erfasst
- Amazon Managed Prometheus, um Metriken zu speichern
- Amazon Managed Grafana, um die Daten zu visualisieren
- Einem Application Load Balancer, um den Zugriff auf die Anwendung zu ermöglichen

Dieses Setup bietet eine skalierbare, Cloud-native Observability-Lösung für unsere Anwendungen auf ECS Fargate.