---
layout: single
title:  "Optimieren Sie Ihre Cloud-Kosten mit Infracost in GitLab CI"
# subtitle:  "Ein praktischer Leitfaden zur Integration von Kostenschätzungen in Ihre CI-Pipeline"

date:   2025-02-11 16:58:22 -0600
categories: [devops]
---


# {{ page.title }}
## {{ page.subtitle }}


![finops](/img/infracost-1170.webp)



### Infracost in einer GitLab CI Pipeline: Kostenverwaltung für Terraform-Projekte

Die Verwaltung von Cloud-Kosten ist für viele Unternehmen eine entscheidende Aufgabe, insbesondere wenn Infrastruktur als Code (IaC) in Form von Terraform verwendet wird. Infracost ist ein hervorragendes Tool, das Ihnen dabei hilft, die Kosten Ihrer Infrastrukturprojekte frühzeitig zu schätzen. In diesem Beitrag zeigen wir Ihnen, wie Sie Infracost in Ihre GitLab CI Pipeline integrieren können, um die Kosten Ihrer Terraform-Ressourcen zu überwachen und zu optimieren.

#### Voraussetzungen

Bevor wir mit der Integration von Infracost in Ihre GitLab CI Pipeline beginnen, stellen Sie sicher, dass Sie die folgenden Voraussetzungen erfüllt haben:

1. **Terraform**: Installieren Sie Terraform und stellen Sie sicher, dass Sie über eine funktionierende Terraform-Konfiguration verfügen.
2. **Infracost**: Installieren Sie Infracost auf Ihrer lokalen Maschine. Verwenden Sie dazu den Befehl:
   ```bash
   brew install infracost
   ```
   (Für andere Betriebssysteme finden Sie die Installationsanleitungen auf der [Infracost-Website](https://infracost.io)).
3. **API-Schlüssel**: Registrieren Sie sich für einen kostenlosen Infracost API-Schlüssel, indem Sie den folgenden Befehl ausführen:
   ```bash
   infracost auth login
   ```
   Speichern Sie den API-Schlüssel als Umgebungsvariable, z.B. `INFRACOST_API_KEY`.

#### Schritt 1: einen Kostereport ersrtellen
Um zuerst einmal zu schauen, was uns die definierte Infrastruktur kosten würde lassen wir infracost im terraform Verzeichniss laufen.
```bash
$ infracost breakdown --path=.                                                                              

INFO Autodetected 1 Terraform project across 1 root module
INFO Found Terraform project main at directory .
WARN Input values were not provided for following Terraform variables: "variable.key_name". Use --terraform-var-file or --terraform-var to specify them.

Project: main

 Name                                                         Monthly Qty  Unit                        Monthly Cost   
                                                                                                                      
 aws_instance.vault                                                                                                   
 ├─ Instance usage (Linux/UNIX, on-demand, t3.micro)                  730  hours                              $8.76   
 └─ root_block_device                                                                                                 
    └─ Storage (general purpose SSD, gp2)                               8  GB                                 $0.95   
                                                                                                                      
 aws_kms_key.vault_unseal_key                                                                                         
 ├─ Customer master key                                                 1  months                             $1.00   
 ├─ Requests                                          Monthly cost depends on usage: $0.03 per 10k requests           
 ├─ ECC GenerateDataKeyPair requests                  Monthly cost depends on usage: $0.10 per 10k requests           
 └─ RSA GenerateDataKeyPair requests                  Monthly cost depends on usage: $0.10 per 10k requests           
                                                                                                                      
 aws_api_gateway_rest_api.vault_api                                                                                   
 └─ Requests (first 333M)                             Monthly cost depends on usage: $3.70 per 1M requests            
                                                                                                                      
 aws_lambda_function.vault_login_function                                                                             
 ├─ Requests                                          Monthly cost depends on usage: $0.20 per 1M requests            
 ├─ Ephemeral storage                                 Monthly cost depends on usage: $0.0000000367 per GB-seconds     
 └─ Duration (first 6B)                               Monthly cost depends on usage: $0.0000166667 per GB-seconds     
                                                                                                                      
 OVERALL TOTAL                                                                                              $10.71 

*Usage costs can be estimated by updating Infracost Cloud settings, see docs for other options.

──────────────────────────────────
20 cloud resources were detected:
∙ 4 were estimated
∙ 16 were free

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┳━━━━━━━━━━━━┓
┃ Project                                            ┃ Baseline cost ┃ Usage cost* ┃ Total cost ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━╋━━━━━━━━━━━━┫
┃ main                                               ┃           $11 ┃           - ┃        $11 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━┻━━━━━━━━━━━━┛

```

#### Schritt 2: Vergleichen
Wenn wir nun eine Ressource ändern, z.B. den Instanztypen für den Vault von t3.micro auf t3.small, sollten wir einen Unterschied reportet bekommen.
Wir sehen nun einfach, dass die Kosten deutlich gestiegen sind.

```bash
$ infracost breakdown --path=.                                                                              rbenv:system 

INFO Autodetected 1 Terraform project across 1 root module
INFO Found Terraform project main at directory .
WARN Input values were not provided for following Terraform variables: "variable.key_name". Use --terraform-var-file or --terraform-var to specify them.

Project: main

 Name                                                         Monthly Qty  Unit                        Monthly Cost   
                                                                                                                      
 aws_instance.vault                                                                                                   
 ├─ Instance usage (Linux/UNIX, on-demand, t3.small)                  730  hours                             $17.52   
 └─ root_block_device                                                                                                 
    └─ Storage (general purpose SSD, gp2)                               8  GB                                 $0.95   
                                                                                                                      
 aws_kms_key.vault_unseal_key                                                                                         
 ├─ Customer master key                                                 1  months                             $1.00   
 ├─ Requests                                          Monthly cost depends on usage: $0.03 per 10k requests           
 ├─ ECC GenerateDataKeyPair requests                  Monthly cost depends on usage: $0.10 per 10k requests           
 └─ RSA GenerateDataKeyPair requests                  Monthly cost depends on usage: $0.10 per 10k requests           
                                                                                                                      
 aws_api_gateway_rest_api.vault_api                                                                                   
 └─ Requests (first 333M)                             Monthly cost depends on usage: $3.70 per 1M requests            
                                                                                                                      
 aws_lambda_function.vault_login_function                                                                             
 ├─ Requests                                          Monthly cost depends on usage: $0.20 per 1M requests            
 ├─ Ephemeral storage                                 Monthly cost depends on usage: $0.0000000367 per GB-seconds     
 └─ Duration (first 6B)                               Monthly cost depends on usage: $0.0000166667 per GB-seconds     
                                                                                                                      
 OVERALL TOTAL                                                                                              $19.47 

*Usage costs can be estimated by updating Infracost Cloud settings, see docs for other options.

──────────────────────────────────
20 cloud resources were detected:
∙ 4 were estimated
∙ 16 were free

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┳━━━━━━━━━━━━┓
┃ Project                                            ┃ Baseline cost ┃ Usage cost* ┃ Total cost ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━╋━━━━━━━━━━━━┫
┃ main                                               ┃           $19 ┃           - ┃        $19 ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━┻━━━━━━━━━━━━┛
```

Wenn wir nun genau sehen wollen, wie sich die Kosten verändern erstellen wir uns einen Report im JSON Format.

```bash
$ infracost breakdown --path . --out-file old_config.json --format json                                    
INFO Autodetected 1 Terraform project across 1 root module
INFO Found Terraform project main at directory .
WARN Input values were not provided for following Terraform variables: "variable.key_name". Use --terraform-var-file or --terraform-var to specify them.
INFO Output saved to old_config.json
```

und vergleichen nun nach der Anpassung

```bash
infracost diff --path . --compare-to old_config.json                                                      

INFO Autodetected 1 Terraform project across 1 root module
INFO Found Terraform project main at directory .
WARN Input values were not provided for following Terraform variables: "variable.key_name". Use --terraform-var-file or --terraform-var to specify them.

Key: * usage cost, ~ changed, + added, - removed

──────────────────────────────────
Project: main

~ aws_instance.vault
  +$9 ($10 → $18)

    ~ Instance usage (Linux/UNIX, on-demand, t3.micro → t3.small)
      +$9 ($9 → $18)

Monthly cost change for AlexanderWiechert/terraform-vault-lambda
Amount:  +$9 ($11 → $19)
Percent: +82%

──────────────────────────────────
Key: * usage cost, ~ changed, + added, - removed

*Usage costs can be estimated by updating Infracost Cloud settings, see docs for other options.

20 cloud resources were detected:
∙ 4 were estimated
∙ 16 were free

Infracost estimate: Monthly estimate increased by $9 ↑
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━┳━━━━━━━━━━━━━━┓
┃ Changed project                                    ┃ Baseline cost ┃ Usage cost* ┃ Total change ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━╋━━━━━━━━━━━━━╋━━━━━━━━━━━━━━┫
┃ AlexanderWiechert/terraform-vault-lambda           ┃           +$9 ┃           - ┃   +$9 (+82%) ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━┻━━━━━━━━━━━━━━┛

```
Jetzt bekommen wir einen sehr deutlichen Hinweis darauf, dass wir eine Änderung in der Infrastruktur haben die womöglich aussergewöhlich ist.
Der Anstieg der Kosten beträgt nun `+82%`. 

#### Schritt 3: GitLab CI Pipeline konfigurieren

Um Infracost in Ihre GitLab CI Pipeline zu integrieren, müssen Sie die `.gitlab-ci.yml`-Datei anpassen. Hier ist ein einfaches Beispiel:

```yaml
stages:
  - cost-estimation
  - deploy

cost_estimation:
  image: infracost/infracost:latest
  stage: cost-estimation
  variables:
    INFRACOST_API_KEY: $INFRACOST_API_KEY
  script:
    - infracost breakdown --path . --format json --out-file infracost.json
    - infracost diff --path . --format json --out-file infracost.json
  artifacts:
    paths:
      - infracost.json
      - infracost_diff.json

deploy:
  image: hashicorp/terraform:latest
  stage: deploy
  script:
    - terraform init
    - terraform apply -auto-approve
```

#### Schritt 4: Pipeline-Erklärung

- **Stages**: Wir definieren zwei Stufen in unserer Pipeline: `cost-estimation` und `deploy`.
- **Cost Estimation Job**:
    - Verwendet das Infracost-Docker-Image.
    - Setzt die Umgebungsvariable für den API-Schlüssel.
    - Führt den `infracost breakdown`-Befehl aus, um die Kosten der in Terraform definierten Ressourcen zu berechnen. Die Ergebnisse werden in `infracost.json` gespeichert.
    - Führt den `infracost diff`-Befehl aus, um Änderungen an den Kosten im Vergleich zu vorherigen Commits zu ermitteln und speichert die Ergebnisse in `infracost_diff.json`.
    - Die generierten JSON-Dateien werden als Artefakte gespeichert, sodass Sie sie nach dem Job einsehen können.

- **Deploy Job**: Hier wird Terraform initialisiert und die Änderungen angewendet.

#### Schritt 3: Benachrichtigungen und Anpassungen

Sie können weitere Anpassungen vornehmen, um Benachrichtigungen für Kostenüberschreitungen oder Änderungen in Ihrer Pipeline einzurichten. Beispielsweise könnten Sie Bedingungen hinzufügen, um den Deploy-Job zu stoppen, wenn die geschätzten Kosten einen bestimmten Schwellenwert überschreiten. Dies könnte mit einem zusätzlichen Schritt im `cost_estimation`-Job realisiert werden, der die JSON-Daten analysiert und bei Bedarf eine Fehlermeldung zurückgibt.

#### Fazit

Die Integration von Infracost in Ihre GitLab CI Pipeline ist ein effektiver Weg, um die Cloud-Kosten für Ihre Terraform-Projekte zu schätzen und zu überwachen. Mit der richtigen Konfiguration können Sie sicherstellen, dass Ihr Team stets über die Kosten seiner Infrastruktur informiert ist, bevor Änderungen vorgenommen werden. Durch frühzeitige Kostenschätzungen können fundierte Entscheidungen getroffen und unerwartete Ausgaben vermieden werden. Nutzen Sie die Möglichkeiten von Infracost, um Ihre Cloud-Kosten proaktiv zu managen!