---
layout: post
title: Terraform Tutorial Teil 2
subtitle: In diesem Beitrag stellen wir Ihnen die Grundlagen vor, wie wir Terraform zur Definition und Verwaltung Ihrer AWS Infrastruktur einsetzen können.
keywords: [Terraform AWS Amazon Infrastruktur]
categories: [DevOps]
---
# {{ page.title }}

In diesem Beitrag stellen wir die Grundlagen vor, wie wir Terraform zur Definition und Verwaltung Ihrer Infrastruktur einsetzen können. Terraform kann Infrastrukturen für viele verschiedene Arten von Cloud-Anbietern bereitstellen, darunter AWS, Azure, Google Cloud, DigitalOcean und viele andere.

> Hinweis: Diese Beispiele stellen Ressourcen in dem AWS-Konto bereit. Obwohl alle Ressourcen unter das AWS Free Tier fallen sollten, liegt es nicht in unserer Verantwortung, wenn dafür Geld berechnet wird.

  *  Installation von Terraform.
  *  Setzen der AWS-Anmeldeinformationen als Umgebungsvariablen `AWS_ACCESS_KEY_ID` und `AWS_SECRET_ACCESS_KEY`.
  *  cd in einen der Beispielordner.
  *  Starte `terraform init`.
  *  Starte `terraform apply`.
  *  Nachdem die Bereitstellung abgeschlossen ist, gibt das Beispiel URLs oder IPs aus, die wir ausprobieren können.
  *  Um alle Ressourcen zu bereinigen und zu löschen, nachdem wir fertig sind, führen wir terraform destroy aus.


Die offizielle Terraform [Getting Started-Dokumentation](https://www.terraform.io/intro/getting-started/install.html) leistet gute Arbeit bei der Einführung der einzelnen Elemente von Terraform (d.h. Ressourcen, Eingangsvariablen, Ausgangsvariablen usw.), daher werden wir uns in diesem Tutorial darauf konzentrieren, wie man diese Elemente zusammenfügt, um ein halbwegs realistisches Beispiel zu erstellen. Insbesondere werden wir mehrere Server auf AWS in einem Cluster bereitstellen und einen Load Balancer einsetzen, um die Last auf diesen Cluster zu verteilen. Die Infrastruktur, die Sie in diesem Beispiel erstellen werden, ist ein grundlegender Ausgangspunkt für den Betrieb skalierbarer, hochverfügbarer Webservices und Microservices.

> Hinweis: Beispielcode für die Beispiele findet ihr unter: [https://github.com/elastic2ls-com/terraform-tutorial](https://github.com/elastic2ls-com/terraform-tutorial).


## Vorbereitungen AWS Account

Wenn man sich zum ersten Mal für AWS registriert, melden man sich zunächst als [root-Benutzer](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user.html) an. Dieses Benutzerkonto hat Zugriffsberechtigungen für alles, daher empfiehlt es sich aus Sicherheitssicht, es nur für die Erstellung anderer Benutzerkonten mit eingeschränkteren Berechtigungen zu verwenden ([siehe IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)). Um ein eingeschränkteres Benutzerkonto zu erstellen, gehen wir zur [Identitäts- und Zugriffsverwaltung (IAM)](https://console.aws.amazon.com/iam/home?region=eu-central-1-1#home) Konsole, klicken auf "Benutzer" und dann auf die blaue Schaltfläche "Neue Benutzer erstellen". Wir geben einen Namen für den Benutzer ein und stellen sicher, dass "Generieren Sie einen Zugriffsschlüssel für jeden Benutzer" aktiviert ist:

![terraform-tutorial-aws-1](../../img/terraform-tutorial-aws-1.png){: width="600px" }

Wir klicken auf die Schaltfläche "Erstellen", um die Sicherheitsinformationen für diesen Benutzer anzuzeigen, die aus der Zugriffsschlüssel-ID und einem geheimen Zugriffsschlüssel bestehen. Du MUSST diese sofort speichern, da sie nie wieder angezeigt werden. Wir empfehlen, sie an einem sicheren Ort aufzubewahren (z.B. in einem Passwortmanager wie Keychain oder 1Password), damit wir sie später in diesem Tutorial verwenden können.

![terraform-tutorial-aws-2](../../img/terraform-tutorial-aws-2.png){: width="600px" }

Standardmäßig hat ein neuer IAM-Benutzer keine Berechtigung, etwas im AWS-Konto zu tun. Um Terraform für die Beispiele in dieser Blog-Postserie verwenden zu können, fügen wir folgende Berechtigung hinzu

* `AmazonEC2FullAccess`

![terraform-tutorial-aws-3](../../img/terraform-tutorial-aws-3.png){: width="600px" }


## Installation Terraform

Folgend den [Anweisungen hier](https://learn.hashicorp.com/terraform/getting-started/install.html), um Terraform zu installieren. Wenn du fertig bist, solltest du den Terraform-Befehl ausführen können:
```
$ terraform
Usage: terraform [-version] [-help] <command> [args](...)
```

Damit Terraform Änderungen in Ihrem AWS-Konto vornehmen kann, müssen wir die AWS-Anmeldeinformationen für den zuvor erstellten Benutzer konfigurieren. Es gibt mehrere Möglichkeiten, dies zu tun ), von denen eine der einfachsten darin besteht, die folgenden Umgebungsvariablen einzustellen:

```
export AWS_ACCESS_KEY_ID=(your access key id)
export AWS_SECRET_ACCESS_KEY=(your secret access key)
```

> Hinweis: Die oben genannte Methode ist zwar die einfachste aber zugleich auch die unsicherste. Da diese einfach in der Shell ausgelesen werden können.

## Konfiguration eines einzelnen Servers

Terraform-Code wird in einer Sprache namens HCL in Dateien mit der Erweiterung.tf geschrieben. Es ist eine deklarative Sprache, daher ist es Ihr Ziel, die gewünschte Infrastruktur zu beschreiben, und Terraform kümmert sich darum, wie man diese erstellt.

Der erste Schritt zur Verwendung von Terraform ist in der Regel die Konfiguration des/der provider(s), den wir verwenden möchten. Erstelle eine Datei namens main.tf und füge den folgenden Code ein:

```
provider "aws" {
  region = "eu-central-1"
}
```

Dies teilt Terraform mit, dass wir den AWS-Anbieter nutzen werden und dass die Infrastruktur in der Region eu-central-1 bereitstellen möchten. eu-central-1 ist der Name des Standortes in Frankfurt am Main.

Für jeden Anbieter gibt es viele verschiedene Arten von Ressourcen, die erstellt können, wie Server, Datenbanken und Load Balancer. Bevor wir einen ganzen Cluster von Servern bereitstellen, sollten wir zunächst herausfinden, wie wir einen einzelnen Server bereitstellen, der auf HTTP-Anfragen antwortet. Im AWS-Jargon wird ein Server als EC2-Instanz bezeichnet. Füge den folgenden Code zur main.tf hinzu, die die aws_instance-Ressource verwendet, um eine EC2-Instanz bereitzustellen:

```
resource "aws_instance" "tutorial" {
  ami           = "ami-de486035"
  instance_type = "t2.micro"
}
```

Die allgemeine Syntax für eine Terraform-Ressource lautet:

```
resource "<PROVIDER>_<TYPE>" "<NAME>" {
 [CONFIG …]
}
```

* PROVIDER = ist der Name des Cloudproviders, (hier AWS).
* TYPE = ist die Art der Resource die ich bei dem Provider erstellen möchte.
* NAME = ist der Bezeichner, den Sie im gesamten Terraform-Code verwenden können, um auf diese Ressource zu verweisen, (hier tutorial).
* CONFIG = besteht aus einem oder mehreren Argumenten, die spezifisch für diese Ressource sind, (hier ami = "ami-de486035").

Für die Ressource aws_instance gibt es viele verschiedene Argumente, aber im Moment müssen wir nur die folgenden setzen:

* ami: Das Amazon Machine Image (AMI), das auf der EC2-Instanz läuft. Kostenlose und bezahlte AMIs finden sich im AWS Marketplace oder wir erstellen Eigene mit Tools wie Packer.
* instance_type: Der Typ der auszuführenden EC2-Instanz. Jeder Typ von EC2-Instanz bietet eine unterschiedliche Menge an CPU, Speicher, Festplattenspeicher und
    Netzwerkkapazität.

Gehen wir in einem Terminal in den Ordner, in dem wir main.tf erstellt haben, und führen den terraform init-Befehl aus:

```
$ terraform init

Initializing the backend...

Initializing provider plugins...
- Checking for available provider plugins...
- Downloading plugin for provider "aws" (...)* provider.aws: version = "~> 2.10"

Terraform has been successfully initialized!
```

Die Terraform Installation enthält die grundlegende Funktionalität für Terraform, aber sie enthält nicht den Code für einen der Provider, so dass wir bei der ersten Nutzung von Terraform `terraform init` ausführen müssen, um Terraform anzuweisen, den Code zu scannen, herauszufinden, welche Anbieter wir verwenden.  Standardmäßig wird der Provider-Code in einen .terraform-Ordner heruntergeladen, (sollte zu.gitignore hinzugefügt werden).


Nachdem dem Ausführen von `terraform init` können wir nun erstmals `terraform plan` aufrufen:

```
$ terraform plan
Refreshing Terraform state in-memory prior to plan...(...)+ aws_instance.example
    ami:                      ami-de486035"
    availability_zone:        "<computed>"
    ebs_block_device.#:       "<computed>"
    ephemeral_block_device.#: "<computed>"
    instance_state:           "<computed>"
    instance_type:            "t2.micro"
    ...
    vpc_security_group_ids.#: "<computed>"

Plan: 1 to add, 0 to change, 0 to destroy.
```

Mit dem Befehl `terraform plan wir können wir sehen, was Terraform tun wird. Dies ist eine großartige Möglichkeit, Ihre Änderungen zu überprüfen. Die Ausgabe des Planbefehls ähnelt der Ausgabe des diff-Befehls: Ressourcen mit einem Pluszeichen (+) werden erstellt, Ressourcen mit einem Minuszeichen (-) werden gelöscht, und Ressourcen mit einem Tildezeichen (~) werden vor Ort geändert. In der obigen Ausgabe sehen wir, dass Terraform plant, eine einzige EC2-Instanz zu erstellen.

Um die Instanz tatsächlich zu erstellen, führen Sie den Befehl terraform apply aus:

```
$ terraform apply(...)Terraform will perform the following actions:  # aws_instance.example will be created
  + resource "aws_instance" "tutorial" {
      + ami                          = "ami-de486035"
      + arn                          = (known after apply)
      + associate_public_ip_address  = (known after apply)
      + availability_zone            = (known after apply)
      + cpu_core_count               = (known after apply)
      + cpu_threads_per_core         = (known after apply)
      + get_password_data            = false
      + host_id                      = (known after apply)
      + id                           = (known after apply)
      + instance_state               = (known after apply)
      + instance_type                = "t2.micro"
      + ipv6_address_count           = (known after apply)
      + ipv6_addresses               = (known after apply)
      + key_name                     = (known after apply)
      (...)
  }

Plan: 1 to add, 0 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

  Enter a value:
```

Geben Sie "yes" ein und drücken Sie die Eingabetaste, um die EC2-Instanz zu installieren:

```
Do you want to perform these actions?

 Terraform will perform the actions described above.
 Only 'yes' will be accepted to approve.

Enter a value: yes

aws_instance.example: Creating…
aws_instance.example: Still creating… [10s elapsed]
aws_instance.example: Still creating… [20s elapsed]
aws_instance.example: Still creating… [30s elapsed]
aws_instance.example: Creation complete after 38s

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
```


Wir haben gerade einen Server mit Terraform bereitgestellt! Um dies zu überprüfen, können wir uns sich bei der EC2-Konsole anmelden:

![terraform-tutorial-aws-4](../../img/terraform-tutorial-aws-4.png){: width="600px" }

Es funktioniert, aber es ist nicht das beste Beispiel. Zum einen hat die Instanz keinen Namen. Um einen hinzuzufügen, können Sie der EC2-Instanz ein Tag hinzufügen:

```
resource "aws_instance" "tutorial" {
  ami           = "ami-de486035"
  instance_type = "t2.micro"
  tags = {
    Name = "terraform-elastic2ls-ec2"
  }
}
```

Führen Sie `terraform apply` erneut aus:

```
$ terraform apply

aws_instance.tutorial: Refreshing state...
(...)

Terraform will perform the following actions:

  # aws_instance.example will be updated in-place
  ~ resource "aws_instance" "example" {
        ami                          = "ami-0c55b159cbfafe1f0"
        availability_zone            = "eu-central-1"
        instance_state               = "running"
        (...)
        + tags                         = {
          + "Name" = "terraform-elastic2ls-ec2"
        }

        (...)
    }
Plan: 0 to add, 1 to change, 0 to destroy.

Do you want to perform these actions?
  Terraform will perform the actions described above.
  Only 'yes' will be accepted to approve.

Enter a value:
```

## Konfiguration eines einzelnen Web Servers

Als nächstes wollen wir einen Webserver auf der EC2 Instanz starten. Dies machen wir im Part `user_data` der Resource `aws_instance`

```
resource "aws_instance" "tutorial" {
  ami           = "ami-de486035"
  instance_type = "t2.micro"

  user_data = <<-EOF
              #!/bin/bash
              echo "Hello, World" > index.html
              while true ; do nc -l 80 < test.html ; done &
              EOF

  tags = {
    Name = "terraform-elastic2ls-ec2"
  }
}
```

Die Zeichen <<<-EOF und EOF supporten Multiline Strings, so muss man nicht überall ein newline \n anhängen.

Du musst noch eine weitere Sache erledigen, bevor der Webserver erreichbar ist. Standardmäßig erlaubt AWS keinen ein- oder ausgehenden Datenverkehr von einer EC2-Instanz. Damit die EC2-Instanz den Datenverkehr empfangen kann, müssen wir eine Sicherheitsgruppe erstellen:

```
resource "aws_security_group" "instance" {
    name = "terraform-elastic2ls-sg-ec2"
    ingress {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

Dieser Part erstellt eine neue Ressource namens aws_security_group (alle Ressourcen für den AWS Provider beginnen mit aws_) und gibt an, dass diese Gruppe eingehende TCP-Anfragen auf Port 80 aus dem CIDR-Block 0.0.0.0.0.0/0 und eingehenden Verkehr erlaubt. Der `egress` Teil erlaubt ausgehenden Verkehr aus der Instanz heraus. Das benötigen wir um die Sourcen aus den Ubuntu Paketquellen zu laden und den Apache Webserver zu installieren.

Das einfache Erstellen einer Sicherheitsgruppe reicht nicht aus; Sie müssen der EC2-Instanz auch sagen, dass sie diese tatsächlich verwenden soll, indem Sie die Expression ID der Sicherheitsgruppe in das Argument vpc_security_group_ids der aws_instance-Ressource übergeben.


Eine Expression in Terraform ist alles, was einen Wert zurückgibt. Im einfachsten Fall gibt sie einen String "ami-de486035" oder eine Zahl wieder.

Eine besonders sinnvolle Expression ist eine Referenz, mit der Sie auf Werte aus anderen Teilen Ihres Codes zugreifen können. Um auf die ID der Sicherheitsgruppenressource zugreifen zu können, wird die die folgende Syntax verwendet:

```
<PROVIDER>_<TYPE>.<NAME>.<ATTRIBUTE>
```

Wobei PROVIDER der Name des Anbieters (z.B. aws), TYPE der Typ der Ressource (z.B. security_group), NAME der Name dieser Ressource (z.B. die Sicherheitsgruppe wird als "instance" bezeichnet) und ATTRIBUTE eines der Argumente dieser Ressource (z.B., Name) oder eines der von der Ressource exportierten Attribute (die Liste der verfügbaren Attribute finden Sie in der Dokumentation zu jeder Ressource - z.B. hier sind die Attribute für aws_security_group). Die Sicherheitsgruppe exportiert ein Attribut namens id, so dass der Ausdruck, auf den verwiesen wird, so aussieht:

```
aws_security_group.instance.id
```

Wir können nun diese Sicherheitsgruppen-ID im Parameter vpc_security_group_ids der aws_instance verwenden: Der Codeblock sieht nun so aus.


```md
resource "aws_instance" "tutorial" {
  ami           = "ami-de486035"
  instance_type = "t2.micro"
  vpc_security_group_ids = [aws_security_group.instance.id]
  user_data = <<-EOF
              #!/bin/bash
              echo "Hello, World" > index.html
              while true ; do nc -l 80 < test.html ; done &
              EOF
  tags = {
    Name = "terraform-elastic2ls-ec2"
  }
}
```

Wenn wir nun `terraform apply`ausführen, sehen wir, dass die SecurityGroup hinzugefügt wird und eine neue Ec2 Instanz mit der Referenz auf die SecurityGroup erstellt wird.

```
$ terraform apply

(...)

Terraform will perform the following actions:

# aws_instance.example must be replaced
-/+ resource "aws_instance" "example" {
        ami                      = "ami-de486035"
        instance_type            = "t2.micro"

        (...)

        + user_data                = "c766498..." # forces replacement
      ~ vpc_security_group_ids   = [
          - "sg-649fa9df",
        ] -> (known after apply)

        (...)

    }

    # aws_security_group.instance will be created
  + resource "aws_security_group" "instance" {
      + arn                    = (known after apply)
      + description            = "Managed by Terraform"
      + egress                 = (known after apply)
      + id                     = (known after apply)
      + ingress                = [
          + {
              + cidr_blocks      = [
                  + "0.0.0.0/0",
                ]
              + description      = ""
              + from_port        = 80
              + ipv6_cidr_blocks = []
              + prefix_list_ids  = []
              + protocol         = "tcp"
              + security_groups  = []
              + self             = false
              + to_port          = 80
            },
        ]
      + name                   = "terraform-elastic2ls-ec2"
      (...)
    }

Plan: 2 to add, 0 to change, 1 to destroy.

  Do you want to perform these actions?
    Terraform will perform the actions described above.
    Only 'yes' will be accepted to approve.

  Enter a value:
```

In der Ausgabe bedeutet "forces replacement" bei dem Part User_data, dass die EC2 Instanz ersetzt wird. So wie das Ganze aktuell konfiguriert ist würde jeder Benutzer des Webserver eine Downtime sehen.

![terraform-tutorial-aws-5](../../img/terraform-tutorial-aws-5.png){: width="600px" }

Im Beschreibungsfenster am unteren Bildschirmrand sehen Sie auch die öffentliche IP-Adresse dieser EC2-Instanz. Geben wir der Instanz ein oder zwei Minuten Zeit, um zu booten und testen dann mit curl den Webserver.

```
$ curl http://<EC2_INSTANCE_PUBLIC_IP>
Hello, World
```

### Konfiguration des Web Servers mittels Variablen

Vielleicht ist aufgefallen, dass der Webservercode den Port 80 sowohl in der Sicherheitsgruppe als auch in der Konfiguration der Benutzerdaten dupliziert hat. Das ist grundsätzlich okay, aber bietet Raum für Fehler, da man den Port vielleicht an der einen Stelle updated aber an der anderen vergisst. Und schon geht der Spass los.

Um das zu vermeiden kann man in Terraform Variablen definieren. Die Syntax sieht so aus.

```
variable "NAME" {
 [CONFIG ...]
}
```

Die Variablendeklaration kann drei Parameter enthalten, die alle optional sind:

* Beschreibung: Es ist immer eine gute Idee, mit diesem Parameter zu dokumentieren, wie eine Variable verwendet wird. Deine Teamkollegen werden diese Beschreibung nicht nur beim Lesen des Codes sehen können, sondern auch beim Ausführen des Plans oder beim Anwenden von Befehlen (du wirst in Kürze ein Beispiel dafür sehen).

* Standard: Es gibt verschiedene Möglichkeiten, einen Wert für die Variable bereitzustellen, einschließlich der Übergabe an die Befehlszeile (mit der Option -var), über eine Datei (mit der Option -var-file) oder über eine Umgebungsvariable (Terraform sucht nach Umgebungsvariablen mit dem Namen TF_VAR_<variable_name>). Wenn kein Wert übergeben wird, greift die Variable auf diesen Standardwert zurück. Wenn es keinen Standardwert gibt, fragt Terraform den Benutzer interaktiv nach einem solchen.

* Typ: Auf diese Weise können Sie Typbeschränkungen für die Variablen erzwingen, in die ein Benutzer eingreift. Terraform unterstützt eine Reihe von Typbeschränkungen, einschließlich Zeichenkette, Anzahl, Bool, Liste, Map, Set, Objekt, Tupel und andere. Wenn Sie keinen Typ angeben, geht Terraform davon aus, dass der Typ ein beliebiger ist.

Für den Webserver sieht das so aus:

```
variable "server_port" {
  description = "The port the server will use for HTTP requests"
  type        = number
}
```

Beachte bitte, dass die Eingabevariable server_port keinen Default Wert hat. Wenn der Befehl apply jetzt ausgeführen wird, fordert Terraform interaktiv auf, einen Wert für server_port einzugeben.


```
$ terraform apply

var.server_port
  The port the server will use for HTTP requests

  Enter a value:
```

Alternativ kann man den Wert auch über die Befehlszeilenoption `-var` angeben.

```
$ terraform apply -var "server_port=80"
```

Ausserdem ist es möglich ein Default Wert in der Variablendeklaration zu setzen.

```
variable "server_port" {
  description = "The port the server will use for HTTP requests"
  type        = number
  default     = 80
}
```

Um den Wert einer Eingabevariablen in Ihrem Terraform-Code zu verwenden, kann man eine Variablenreferenz verwenden:

```
var.<VARIABLE_NAME>
```

Im Code sieht das dann so aus:

```
resource "aws_security_group" "instance" {
  name = "terraform-elastic2ls-sg-ec2"  ingress {
    from_port   = var.server_port
    to_port     = var.server_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

Wenn wir die Variablenreferenz in der User_data der EC2 Instanz verwenden möchten muss dies so notiert werden.

```
user_data = <<-EOF
            #!/bin/bash
            echo "Hello, World" > index.html
            while true ; do nc -l "${var.server_port}" < index.html ; done &
            EOF
```

Terraform ermöglicht es auch, Ausgabevariablen mit der folgenden Syntax zu definieren:

```
output "<NAME>" {
 value = <VALUE>
 [CONFIG ...]
}
```

Der NAME ist der Name der Ausgabevariablen und VALUE kann jeder Terraform-Ausdruck sein, den Sie ausgeben möchten. Die CONFIG kann zwei zusätzliche Parameter enthalten, die beide optional sind:

* description: Ein sinnvolle Bschreibung.

* sensitive: Setzen Sie diesen Parameter auf true, um Terraform anzuweisen, diese Ausgabe nicht am Ende von terraform apply zu protokollieren. Dies ist nützlich, wenn die Ausgabevariable sensible Informationen oder Geheimnisse wie Passwörter oder private Schlüssel enthält.

Anstatt beispielsweise manuell um die EC2-Konsole suchen zu müssen, um die IP-Adresse Ihres Servers zu finden, können Sie die IP-Adresse als Ausgabevariable angeben:

```
output "public_ip" {
  value       = aws_instance.example.public_ip
  description = "The public IP of the web server"
}
```

Nach einem erneuten `terraform apply` sieht die Ausgabe wie folgt aus:

```
$ terraform apply

(...)

aws_security_group.instance: Refreshing state...
aws_instance.example: Refreshing state...

Apply complete! Resources: 0 added, 0 changed, 0 destroyed.

Outputs:public_ip = 18.195.169.133
```

Man kann natürlich auch direkt `terraform output verwenden`

```
terraform output
public_ip = 18.195.169.133
```

Man kann auch gezielt einen bestimmten Output aufrufen:

```
terraform output public_ip
18.195.169.133
```

Dies ist besonders praktisch für das Scripting. Man kann beispielsweise ein Skript erstellen, das terraform apply für die Bereitstellung des Webservers ausführt, die `terraform output public_ip` verwendet, um die öffentliche IP herauszufinden, um diese dann mittels curl 18.195.169.133 als Smoketest aufzurufen.
