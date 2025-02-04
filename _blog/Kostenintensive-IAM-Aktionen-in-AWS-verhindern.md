---
layout: post
title: "Kostenintensive IAM-Aktionen in AWS"
subtitle:  "und wie man sie verhindert"
categories: [DevOps]
---
# {{ page.title }}
## {{ page.subtitle }}


![cost_an_detection](../../img/cad_vs_budgets_1170.webp)



AWS Identity and Access Management (IAM) ist ein leistungsfähiges Werkzeug zur Steuerung des Zugriffs auf AWS-Dienste. Allerdings gibt es bestimmte IAM-Aktionen, die erhebliche Kosten verursachen oder langfristige Verpflichtungen nach sich ziehen können. In diesem Beitrag analysieren wir diese Aktionen und zeigen auf, wie Sie deren Risiken minimieren können.

## Beispiele für IAM-Aktionen mit potenziellen Kosten oder langfristigen Auswirkungen

### Domain-Management

`route53domains:RegisterDomain`: Registrierung einer neuen Domain.

`route53domains:RenewDomain`: Verlängerung einer bestehenden Domain.

`route53domains:TransferDomain`: Transfer einer Domain zu AWS.

### EC2-Reservierungen

`ec2:ModifyReservedInstances`: Änderung bestehender Reserved Instances.

`ec2:PurchaseHostReservation`: Kauf von Host-Reservierungen.

`ec2:PurchaseReservedInstancesOffering`: Erwerb von Reserved Instances, was zu langfristigen finanziellen Verpflichtungen führt.

### RDS-Reservierungen

`rds:PurchaseReservedDBInstancesOffering`: Kauf von Reserved DB Instances.

### S3-Objektsperre

`s3:PutObjectRetention`: Festlegung von Aufbewahrungsrichtlinien für Objekte.

`s3:PutObjectLegalHold`: Anwendung eines rechtlichen Halts auf Objekte.

### ACM Private CA

`acm-pca:CreateCertificateAuthority`: Erstellen einer privaten Zertifizierungsstelle, die mit $400 pro Monat berechnet wird.

### AWS Marketplace

`aws-marketplace:Subscribe`: Abonnieren von kostenpflichtigen Produkten aus dem AWS Marketplace.

## Möglichkeiten zur Verhinderung kostenintensiver IAM-Aktionen

### 1. Berechtigungsgrenzen (Permissions Boundaries)

Berechtigungsgrenzen sind eine Funktion von AWS IAM, mit der Sie die maximalen Berechtigungen einer IAM-Rolle oder eines Benutzers festlegen können. Sie dienen als Sicherheitsnetz, sodass auch bei einer falschen Zuweisung von Berechtigungen keine kostspieligen Aktionen durchgeführt werden können.

Hier ist ein Beispiel für die Berechtigungsgrenze `EC2PermissionsBoundary`, die verhindert, dass kostenintensive Aktionen wie der Kauf von Reserved Instances durchgeführt werden:

```yaml
Resources:
  EC2PermissionsBoundary:
    Type: AWS::IAM::ManagedPolicy
    Properties:
      ManagedPolicyName: "EC2PermissionsBoundary"
      PolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Deny
            Action:
              - ec2:PurchaseReservedInstancesOffering
            Resource: "*"
```

Mit dieser Konfiguration wird sichergestellt, dass alle Rollen, die mit dieser Berechtigungsgrenze arbeiten, keine kostspieligen Aktionen wie den Kauf von Reserved Instances durchführen können.

Dokumentation: AWS Permissions Boundaries

### 2. AWS Service Catalog

Der AWS Service Catalog ermöglicht es Administratoren, vordefinierte Services bereitzustellen, die den Unternehmensrichtlinien entsprechen. Dadurch wird sichergestellt, dass Benutzer nur genehmigte und kosteneffiziente Ressourcen nutzen können.

AWS Service Catalog kann auch als Code definiert werden, indem man AWS CloudFormation verwendet. Hier ein Beispiel für die Definition eines Produkts im AWS Service Catalog, das **kleine On-Demand EC2-Entwicklungsmaschinen erlaubt**:

```yaml
Resources:
  MyServiceCatalogProduct:
    Type: AWS::ServiceCatalog::CloudFormationProduct
    Properties:
      Name: "EC2 Developer Instance"
      Owner: "IT Department"
      ProvisioningArtifactParameters:
        - Name: "v1"
          Info:
            LoadTemplateFromURL: "https://s3.amazonaws.com/my-cf-templates/ec2-developer-instance.yaml"
          Type: "CLOUD_FORMATION_TEMPLATE"
```

Das zugehörige `ec2-developer-instance.yaml`, das für die Bereitstellung einer kleinen On-Demand EC2-Instanz verwendet wird, könnte so aussehen:

```yaml
Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t3.micro  # Beispiel für eine kostengünstige Entwicklerinstanz
      ImageId: ami-12345678
      KeyName: my-key-pair
      SecurityGroups:
        - Ref: MySecurityGroup
      Tags:
        - Key: Environment
          Value: Development

  MySecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: "Enable SSH access"
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 22
          ToPort: 22
          CidrIp: 0.0.0.0/0
```

Der AWS Service Catalog arbeitet auf einer Allow-List-Basis, das heißt, dass nur explizit dort hinterlegte Services genutzt werden können. Es gibt keine direkte "Deny"-Funktion im Service Catalog selbst, aber durch die Kombination mit AWS Organizations Service Control Policies (SCPs) oder IAM-Richtlinien kann verhindert werden, dass nicht genehmigte Ressourcen verwendet werden.

### 3. AWS Organizations und SCPs (Service Control Policies)

AWS Organizations ermöglicht die Durchsetzung von Service Control Policies (SCPs), die verhindern können, dass bestimmte Aktionen innerhalb einer Organisation oder eines Kontos durchgeführt werden. SCPs sind eine effektive Möglichkeit, um zentral sicherzustellen, dass kostenintensive Aktionen wie der Kauf von Reserved Instances nicht erlaubt sind.

#### Wie funktionieren SCPs?

SCPs sind **Regeln auf Organisationsebene** in **AWS Organizations**, die festlegen, welche Aktionen innerhalb einer AWS-Organisation erlaubt oder verboten sind. Sie steuern den maximal möglichen Zugriff für alle Mitglieder einer Organisation oder Organizational Unit (OU).

**SCPs sind keine klassischen Allow-Listen!** SCPs gewähren keine Berechtigungen, sondern **begrenzen nur die maximal möglichen Berechtigunge**n.

**SCPs können explizite Deny-Regeln enthalten**. Diese Regeln haben Vorrang und blockieren bestimmte Aktionen, selbst wenn eine IAM-Richtlinie sie erlauben würde.

**SCPs gelten für ganze AWS-Konten oder Organizational Units (OUs)**, wodurch eine zentrale Kontrolle über Berechtigungen gewährleistet wird.

#### Beispiel für eine SCP zur Verhinderung von Reserved Instances-Käufen

Hier ist ein Beispiel für eine SCP, die den Kauf von Reserved Instances (`ec2:PurchaseReservedInstancesOffering`) unterbindet:

```yaml
Resources:
  DenyReservedInstancesSCP:
    Type: AWS::Organizations::Policy
    Properties:
      Name: "DenyReservedInstances"
      Description: "Verhindert den Kauf von Reserved Instances"
      Type: SERVICE_CONTROL_POLICY
      Content: |
        {
          "Version": "2012-10-17",
          "Statement": [
            {
              "Effect": "Deny",
              "Action": "ec2:PurchaseReservedInstancesOffering",
              "Resource": "*"
            }
          ]
        }
      TargetIds:
        - "r-xxxxxxxx"  # Die ID der Root- oder Organizational Unit (OU)
```

Diese SCP stellt sicher, dass keine Reserved Instances innerhalb der Organisation gekauft werden können, unabhängig von den zugewiesenen IAM-Richtlinien oder Berechtigungsgrenzen.

Dokumentation: AWS Organizations SCPs

### 4. Budgetalarme und AWS Cost Anomaly Detection

AWS Budgets und AWS Cost Anomaly Detection helfen dabei, kostspielige Service-Nutzungen frühzeitig zu erkennen und Maßnahmen zu ergreifen, um unerwartete Kosten zu vermeiden.

#### AWS Budgets

Mit **AWS Budgets** können Administratoren Kosten- und Nutzungsgrenzen für AWS-Services festlegen. Sobald diese Grenzen überschritten oder fast erreicht werden, können Warnungen ausgelöst werden.

##### Wie trägt das zur Kostenkontrolle bei?

Unternehmen können **Grenzwerte für Reserved Instances, EC2-Nutzung oder andere kostenintensive Services** festlegen.

Falls ein Nutzer eine **ungewünschte oder teure Ressource** bereitstellt (z. B. eine Reserved Instance), wird **sofort ein Alarm ausgelöst**.

In Verbindung mit **AWS Lambda** kann ein Budgetalarm sogar **automatisch Ressourcen abschalten oder IAM-Berechtigungen** anpassen, um weitere Kosten zu vermeiden.

##### CloudFormation-Beispiel für einen Budgetalarm:

```yaml
Resources:
  MyBudget:
    Type: AWS::Budgets::Budget
    Properties:
      Budget:
        BudgetName: "ReservedInstancesBudget"
        BudgetLimit:
          Amount: 500
          Unit: "USD"
        TimeUnit: "MONTHLY"
        BudgetType: "COST"
      NotificationsWithSubscribers:
        - Notification:
            NotificationType: "ACTUAL"
            ComparisonOperator: "GREATER_THAN"
            Threshold: 90
          Subscribers:
            - SubscriptionType: "EMAIL"
              Address: "admin@example.com"
```

#### AWS Cost Anomaly Detection

AWS **Cost Anomaly Detection** nutzt maschinelles Lernen, um **unerwartete Kostenanstiege** zu erkennen.

##### Wie trägt das zur Kostenkontrolle bei?

Automatische Überwachung der **Nutzungskosten für Reserved Instances, EC2, S3 und andere AWS-Services**.

Erkennt **ungewöhnliche Kostenveränderungen**, selbst wenn keine festen Budgetgrenzen überschritten wurden.

Kann mit **AWS SNS oder AWS Lambda** kombiniert werden, um **automatisch Maßnahmen zu ergreifen** (z. B. Benutzer sperren, Ressourcen abschalten oder neue Berechtigungen setzen).

##### Beispiel für ein Cost Anomaly Detection Setup mit CloudFormation:

```yaml
Resources:
  MyAnomalyDetector:
    Type: AWS::CE::AnomalyDetector
    Properties:
      AnomalyDetectorName: "EC2-Cost-Monitor"
      ResourceTags:
        - Key: "Service"
          Value: "EC2"
      Threshold: 10  # Prozentuale Abweichung, die als Anomalie erkannt wird
      Granularity: "DAILY"
```


### 5. Logging und Monitoring mit AWS CloudTrail

AWS **CloudTrail** bietet eine umfassende Überwachung aller API-Aufrufe und Aktivitäten innerhalb eines AWS-Kontos. Dadurch kann nachvollzogen werden, wer, wann und wie auf AWS-Ressourcen zugegriffen hat. Im Kontext der **Vermeidung kostspieliger Aktionen** ist CloudTrail ein essenzielles Tool, um unerlaubte oder unerwartete Vorgänge zu identifizieren und darauf zu reagieren.

#### Wie trägt CloudTrail zur Kostenkontrolle bei?

**1. Überwachung von API-Aufrufen in Echtzeit**

CloudTrail speichert alle API-Aufrufe in Protokollen, sodass jeder Zugriff auf kostenintensive Ressourcen wie EC2 Reserved Instances nachvollziehbar ist.

Unternehmen können damit ungeplante oder nicht autorisierte Aktionen erkennen und Gegenmaßnahmen ergreifen.

**2. Erstellung von Alarmen bei verdächtigen Aktivitäten**

In Kombination mit **Amazon CloudWatch Logs** lassen sich Alarme einrichten, die ausgelöst werden, wenn z. B. ein Versuch erkannt wird, eine Reserved Instance (`ec2:PurchaseReservedInstancesOffering`) zu kaufen.

Diese Alarme können automatisch Maßnahmen auslösen, wie das Sperren eines Benutzerkontos oder das Deaktivieren einer bestimmten Berechtigung.

**3. Langfristige Analyse von Kostenmustern und Richtlinienverletzungen**

Durch die Protokollierung der API-Aufrufe über einen längeren Zeitraum können **Kostenmuster analysiert** werden.

Falls ein bestimmter Benutzer regelmäßig kostenintensive Services nutzt, können Maßnahmen wie **Berechtigungsanpassungen** oder **zusätzliche Budgetalarme** ergriffen werden.

##### CloudFormation-Beispiel: Aktivierung von AWS CloudTrail mit CloudWatch Alarmen

Mit diesem CloudFormation-Template wird CloudTrail aktiviert und ein Alarm für versuchte Käufe von Reserved Instances (`ec2:PurchaseReservedInstancesOffering`) eingerichtet.

```yaml
Resources:
  CloudTrailLogs:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: my-cloudtrail-logs

  MyCloudTrail:
    Type: AWS::CloudTrail::Trail
    Properties:
      TrailName: "OrgTrail"
      S3BucketName: !Ref CloudTrailLogs
      IsMultiRegionTrail: true
      EnableLogFileValidation: true
      IncludeGlobalServiceEvents: true
      EventSelectors:
        - ReadWriteType: "WriteOnly"
          IncludeManagementEvents: true
          DataResources:
            - Type: "AWS::EC2::Instance"
              Values:
                - "arn:aws:ec2:*:*:instance/*"

  CloudWatchLogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: "CloudTrailLogGroup"

  CloudWatchAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: "ReservedInstancePurchaseAlert"
      MetricName: "EventsProcessed"
      Namespace: "AWS/CloudTrail"
      Statistic: "Sum"
      Period: 300
      EvaluationPeriods: 1
      Threshold: 1
      ComparisonOperator: "GreaterThanOrEqualToThreshold"
      AlarmActions:
        - !Sub "arn:aws:sns:${AWS::Region}:${AWS::AccountId}:SecurityAlerts"
```



Aktivieren Sie AWS CloudTrail, um alle API-Aufrufe zu protokollieren und auffällige Aktivitäten zu identifizieren. Sie können Alarme einrichten, um bestimmte Aktionen sofort zu melden.

## Fazit

Die Verwaltung von Berechtigungen und Kosten in AWS erfordert eine Kombination aus präventiven und reaktiven Maßnahmen. Dieser Artikel zeigt verschiedene Ansätze auf, um ungewollte oder kostspielige Aktionen zu vermeiden.

### 1. Präventive Maßnahmen zur Kostenkontrolle

**Berechtigungsgrenzen (Permissions Boundaries)** helfen dabei, den maximalen Berechtigungsrahmen für IAM-Rollen zu definieren und verhindern, dass Nutzer übermäßige Berechtigungen erhalten.

**AWS Service Catalog** stellt sicher, dass nur genehmigte und kosteneffiziente Ressourcen bereitgestellt werden können, indem es eine Allow-List für erlaubte Services bereitstellt.

**AWS Organizations mit Service Control Policies (SCPs)** bieten eine zentralisierte Möglichkeit, kostenintensive Aktionen wie den Kauf von Reserved Instances für die gesamte Organisation zu unterbinden.

### 2. Überwachung und Reaktion auf ungewöhnliche Kostenentwicklungen

**AWS Budgets und Cost Anomaly Detection** ermöglichen es, Budgets festzulegen und ungewöhnliche Kostensteigerungen frühzeitig zu erkennen. In Kombination mit AWS Lambda lassen sich sogar automatisierte Gegenmaßnahmen ergreifen.

**AWS CloudTrail mit CloudWatch** erlaubt eine detaillierte Überwachung aller API-Aufrufe. Mit Alarmen und Logging können Unternehmen sicherstellen, dass kostspielige Aktionen nachverfolgt werden und bei verdächtigen Aktivitäten umgehend reagiert wird.

### 3. Fazit und Empfehlung

Die Kombination dieser Maßnahmen führt zu einer **proaktiven Kostenkontrolle und Risikominimierung in AWS**. Während **Berechtigungsgrenzen und SCPs** eine präventive Sicherheitsschicht bilden, sorgen **Budgetalarme**, **Anomalieerkennung** und **Logging** für eine **laufende Überwachung und Reaktionsfähigkeit**. Unternehmen sollten ihre AWS-Umgebung regelmäßig überprüfen, um sicherzustellen, dass Berechtigungen und Kostenrichtlinien den aktuellen Anforderungen entsprechen.

Durch den gezielten Einsatz dieser Sicherheits- und Überwachungsmaßnahmen können **unerwartete Kosten vermieden** und gleichzeitig **Compliance- und Sicherheitsanforderungen** erfüllt werden.

