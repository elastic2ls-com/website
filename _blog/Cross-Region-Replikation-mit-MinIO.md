---
layout: post
title: Cross-Region Replikation mit MinIO
subtitle: Eine Schritt-für-Schritt-Anleitung
categories: [Howtos]
---
# {{ page.title }}
## {{ page.subtitle }}

![minio](../../img/minio-1170.webp)

---

## **Einführung**

In einer Zeit, in der Datenintegrität und -verfügbarkeit von entscheidender Bedeutung sind, bietet **MinIO** eine leistungsstarke Lösung für die Verwaltung und Replikation von Objektspeichern. In diesem Beitrag zeige ich dir, wie du eine **Cross-Region Replikation (CRR)** zwischen einem lokalen Server und einem gemieteten vServer einrichtest. Dies ermöglicht dir, Daten automatisch zu synchronisieren, Backups zu erstellen und die Ausfallsicherheit zu erhöhen.

---

## **Voraussetzungen**

Bevor wir beginnen, stelle sicher, dass du folgende Voraussetzungen erfüllst:

- **Zwei MinIO-Server**:
    - **Quell-Server**: Dein lokaler Server.
    - **Ziel-Server**: Dein gemieteter vServer.
- **MinIO Client (`mc`)**: Auf deinem lokalen Rechner installiert.
- **Netzwerkzugriff**: Beide Server müssen über das Netzwerk erreichbar sein.
- **Zugangsdaten**: Access Key und Secret Key für beide MinIO-Server.
- **Offene Ports**: Standardmäßig verwendet MinIO den Port `9000`.

---

## **Schritt 1: Installation des MinIO Clients (`mc`)**

Der MinIO Client ist ein Kommandozeilenwerkzeug, das die Verwaltung von MinIO-Servern erleichtert.

### **Für Linux/macOS:**

```bash
# Herunterladen des MinIO Clients
wget https://dl.min.io/client/mc/release/linux-amd64/mc

# Ausführbar machen
chmod +x mc

# Verschieben in ein Verzeichnis im PATH
sudo mv mc /usr/local/bin/
```

### **Für Windows:**

- Lade `mc.exe` von der offiziellen [MinIO Download-Seite](https://dl.min.io/client/mc/release/windows-amd64/mc.exe) herunter.
- Füge das Verzeichnis, in dem sich `mc.exe` befindet, zur Umgebungsvariable `PATH` hinzu.

---

## **Schritt 2: Konfiguration der Server-Aliase**

Wir richten Aliase für die beiden MinIO-Server ein, um die Befehle zu vereinfachen.

### **Alias für den Quell-Server (lokal):**

```bash
mc alias set source http://<QUELLE_IP>:9000 <ACCESS_KEY_SOURCE> <SECRET_KEY_SOURCE>
```

### **Alias für den Ziel-Server (vServer):**

```bash
mc alias set target http://<ZIEL_IP>:9000 <ACCESS_KEY_TARGET> <SECRET_KEY_TARGET>
```

**Hinweis:** Ersetze die Platzhalter:

- `<QUELLE_IP>`: IP-Adresse des lokalen Servers.
- `<ZIEL_IP>`: IP-Adresse des vServers.
- `<ACCESS_KEY_SOURCE>` und `<SECRET_KEY_SOURCE>`: Zugangsdaten des Quell-Servers.
- `<ACCESS_KEY_TARGET>` und `<SECRET_KEY_TARGET>`: Zugangsdaten des Ziel-Servers.

---

## **Schritt 3: Erstellung der Buckets**

Wir erstellen auf beiden Servern Buckets mit demselben Namen.

### **Auf dem Quell-Server:**

```bash
mc mb source/mein-bucket
```

### **Auf dem Ziel-Server:**

```bash
mc mb target/mein-bucket
```

---

## **Schritt 4: Aktivierung der Versionierung**

Die Versionierung ist für die Replikation erforderlich und muss auf beiden Buckets aktiviert werden.

### **Auf dem Quell-Bucket:**

```bash
mc version enable source/mein-bucket
```

### **Auf dem Ziel-Bucket:**

```bash
mc version enable target/mein-bucket
```

---

## **Schritt 5: Konfiguration der Zugriffsrichtlinien auf dem Ziel-Server**

Damit der Quell-Server Daten in den Ziel-Bucket replizieren kann, müssen wir die entsprechenden Berechtigungen einstellen.

### **5.1 Erstellung der Replikationsrichtlinie**

Erstelle eine Datei namens `replication-policy.json` mit folgendem Inhalt:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "s3:GetBucketVersioning",
        "s3:ReplicateObject",
        "s3:ReplicateDelete",
        "s3:ReplicateTags",
        "s3:GetObjectVersionTagging"
      ],
      "Effect": "Allow",
      "Resource": [
        "arn:aws:s3:::mein-bucket",
        "arn:aws:s3:::mein-bucket/*"
      ],
      "Principal": {
        "AWS": ["<ACCESS_KEY_SOURCE>"]
      }
    }
  ]
}
```

**Hinweis:** Ersetze `<ACCESS_KEY_SOURCE>` mit dem Access Key deines Quell-Servers.

### **5.2 Hinzufügen der Richtlinie zum Ziel-Server**

```bash
mc admin policy add target replication-policy replication-policy.json
```

### **5.3 Zuweisung der Richtlinie zum Benutzer**

```bash
mc admin policy set target replication-policy user=<ACCESS_KEY_SOURCE>
```

---

## **Schritt 6: Konfiguration der Replikation auf dem Quell-Server**

Jetzt richten wir die Replikation ein, damit der Quell-Server Daten zum Ziel-Server sendet.

### **6.1 Erstellung der Replikationskonfiguration**

Erstelle eine Datei namens `replication-config.json` mit folgendem Inhalt:

```json
{
  "Rule": [
    {
      "ID": "rule1",
      "Status": "Enabled",
      "Priority": 1,
      "DeleteMarkerReplication": {
        "Status": "Enabled"
      },
      "Filter": {},
      "Destination": {
        "Bucket": "arn:aws:s3:::mein-bucket",
        "Endpoint": "http://<ZIEL_IP>:9000",
        "AccessKey": "<ACCESS_KEY_TARGET>",
        "SecretKey": "<SECRET_KEY_TARGET>",
        "SSL": false
      }
    }
  ]
}
```

**Hinweise:**

- Ersetze die Platzhalter mit den Daten deines Ziel-Servers.
- Wenn du SSL verwendest, setze `"SSL": true` und passe den `Endpoint` entsprechend an (`https://`).

### **6.2 Setzen der Replikationskonfiguration**

```bash
mc admin bucket replication set source/mein-bucket replication-config.json
```

---

## **Schritt 7: Test der Replikation**

Zeit, unsere Einrichtung zu testen!

### **7.1 Hochladen einer Datei zum Quell-Bucket**

```bash
mc cp /pfad/zu/deiner/datei.txt source/mein-bucket
```

### **7.2 Überprüfung des Ziel-Buckets**

```bash
mc ls target/mein-bucket
```

Die Datei `datei.txt` sollte nun im Ziel-Bucket sichtbar sein.

---

## **Fehlersuche und Tipps**

- **Firewall-Einstellungen:** Stelle sicher, dass die benötigten Ports offen sind.
- **SSL/TLS-Konfiguration:** Für eine sichere Übertragung ist die Verwendung von SSL/TLS empfehlenswert.
- **Logs prüfen:** Bei Problemen helfen die MinIO-Logs weiter.

---

## **Fazit**

Mit dieser Anleitung hast du erfolgreich eine Cross-Region Replikation zwischen zwei MinIO-Servern eingerichtet. Dies ermöglicht dir eine automatische Synchronisation deiner Daten und erhöht die Ausfallsicherheit deines Systems.

---

## **Weiterführende Ressourcen**

- [MinIO Dokumentation](https://docs.min.io)
- [MinIO GitHub Repository](https://github.com/minio/minio)
- [MinIO Slack Community](https://slack.min.io)

---