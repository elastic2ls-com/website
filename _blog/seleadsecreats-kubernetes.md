---
layout: post
title: Kubernetes Secrets mit SeleadSecrets verschlüsseln
subtitle: Sealed Secrets ist eine Lösung zum Speichern verschlüsselter Kubernetes-Secrets in der Versionskontrolle.
keywords: [Sealed Secrets Kubernertes kubeseal]
categories: [DevOps]
---
# {{ page.title }}

![](../../img/kubernetes-logo-256.png)

Sealed Secrets ist eine Lösung zum Speichern verschlüsselter Kubernetes- Geheimnisse in der Versionskontrolle.

In diesem kompakten Tutorial wollen wir schaune, wie wir es installieren und verwenden können.

## Vergleich mit Helm-Secrets und Sops

Eine beliebte Alternative zu Sealed Secrets ist [Helm-Secrets](https://github.com/zendesk/helm-secrets), das [Sops](https://github.com/zendesk/helm-secrets) als Backend verwendet.

Der Hauptunterschied ist:

* Sealed Secrets entschlüsselt das Geheimnis serverseitig.
* Helm-secrets entschlüsselt das Geheimnis clientseitig.

Die clientseitige Entschlüsselung mit Helm-Geheimnissen kann ein Sicherheitsrisiko darstellen, da der Client z. B. ein CI/CD-System Zugriff auf den Verschlüsselungsschlüssel haben muss, um die Bereitstellung durchzuführen. 
Dies stellt kein Problem dar, wenn wir dem GitOps Ansatz mit Tools, wie Argo CD oder Flux folgen.  Mit Sealed Secrets und serverseitiger Entschlüsselung können wir dieses Sicherheitsrisiko vermeiden. 
Der Verschlüsselungskey existiert nur im Kubernetes-Cluster und wird niemals offengelegt.

Sealed Secrets ist nicht in der Lage, Cloud-KMS-Lösungen wie AWS KMS zu nutzen. Wenn dies eine Anforderung ist, dann müssen wir uns Sops/Helm-Secrets genauer anschauen.

## Installation über Helm-Chart
Sealed Secrets besteht aus zwei Komponenten:

* Clientseitiges CLI-Tool zum verschlüsseln von Geheimnissen und zum Erstellen der Sealed Secrets.
* Serverseitiger Controller, der zum Entschlüsseln der Sealed Secrets und zum Erstellen von Secrets verwendet wird.

Um den Controller in unserem Kubernetes-Cluster zu installieren, verwenden wir das offizielle Helm-Chart aus dem Sealed-Secrets-Repository.

Wir fügen das Repository hinzu und installieren es im `kube-system` Namespace:

```bash
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets

helm install sealed-secrets --namespace kube-system --version 2.13.0 sealed-secrets/sealed-secrets
```

## Installation des CLI-Tools
Secrets  werden clientseitig mit dem `kubeseal` CLI-Tool verschlüsselt.

Auf macOS können `kubeseal` mittels `brew` insrallieren. Für Linux können wir die Binärdatei von der [GitHub-Release-Seite](https://github.com/bitnami-labs/sealed-secrets/releases) herunterladen.

# macos
```bash
brew install kubeseal
```

# linux
```bash
wget https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.13.1/kubeseal-linux-amd64 -O kubeseal
sudo install -m 755 kubeseal /usr/local/bin/kubeseal
```

Die `kubeseal` CLI verwendet den aktuellen `kubectl` Kontext, um auf den Cluster zuzugreifen. Bevor Sie fortfahren, stellen Sie sicher, dass `kubectl` eine Verbindung zu dem Cluster besteht, in dem Sealed Secrets installiert werden soll.

## Ein Sealed Secret erstellen
Die `kubeseal` CLI nimmt ein Kubernetes Secret Manifest als Eingabe, verschlüsselt es und gibt ein Sealed Secret Manifest aus.

In diesem Tutorial verwenden wir dieses Manifest als Eingabe:

```yaml
apiVersion: v1
kind: Secret
metadata:
  creationTimestamp: null
  name: secret
data:
  password: cGFzc3dvcmQ=
```

Nun speichern wir das Manifest in einer Datei mit dem Namen secret.yaml und verschlüsseln es:

> HINWEIS! Falls die Fehlermeldung auftaucht "error: error unmarshaling JSON: while decoding JSON: illegal base64 data at input byte 4" 
> Das Password bzw. der Benutzername in dem Secretfile muss base64 encoded sein.
> z.B.  
> echo -n "password" | base64
> cGFzc3dvcmQ=
 
### Update

Die neueren Versionen von Kubernetes unterstützen die optionale stringData Eigenschaft, mit der der Wert für jeden Schlüssel ohne Decodierung bereitgestellt werden kann.

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dummy-secret
type: Opaque
stringData:
  API_KEY: mega_secret_key
  API_SECRET: really_secret_value1

```

```bash
cat secret.yaml | kubeseal \
    --controller-namespace kube-system \
    --controller-name sealed-secrets \
    --format yaml \
    > sealed-secret.yaml
```

Der Inhalt der `sealed-secret.yaml` Datei sollte so aussehen:

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  creationTimestamp: null
  name: secret
  namespace: default
spec:
  encryptedData:
    password: AgA...
  template:
    metadata:
      creationTimestamp: null
      name: secret
      namespace: default
```

Um das Sealed Secret bereitzustellen, wenden wir das Manifest mit kubectl an:

```bash
kubectl apply -f sealed-secret.yaml                                                                                                                                                              
sealedsecret.bitnami.com/secret created
```

Nun können wir das Secret abrufen, um sicherzustellen, dass der Controller es erfolgreich entsiegelt hat.

```bash
kubectl get secret secret -o yaml                                                                                                                                                                
```

```yaml
apiVersion: v1
data:
  password: cGFzc3dvcmQ=
kind: Secret
metadata:
  creationTimestamp: "2023-09-21T14:32:23Z"
  name: secret
  namespace: default
  ownerReferences:
  - apiVersion: bitnami.com/v1alpha1
    controller: true
    kind: SealedSecret
    name: secret
    uid: 0476c9c9-3184-4ca1-a730-fc9ddd851bee
  resourceVersion: "1428"
  uid: aa627405-2e28-4f31-8de7-82781592131d
```

## Ein Sealed Secret aktualisieren
Um einen Wert in einem Sealed Secret zu aktualisieren, müssen wir lokal ein neues Manifest erstellen und es mit der `--merge-into` Option in ein vorhandenes einbinden.

Im folgenden Beispiel aktualisieren wir den Wert des Passwortschlüssels `-from-file=password` auf `new-password`.

```bash
echo -n "new-password" | kubectl create secret generic xxx --dry-run=client --from-file=password=/dev/stdin -o yaml | kubeseal --controller-namespace=kube-system --controller-name=sealed-secrets --format yaml --merge-into sealed-secret.yaml
```

## Einem Sealed Secret einen neuen Wert hinzufügen
Der Unterschied zwischen dem Aktualisieren eines Werts und dem Hinzufügen eines neuen Werts ist der Name des Schlüssels. Wenn ein benannter Schlüssel `password` bereits vorhanden ist, wird er aktualisiert. Wenn es nicht existiert, wird es hinzugefügt.

`api_key` zUm beispielsweise einen neuen Schlüssel `--from-file=api_key`zu unserem Geheimnis hinzuzufügen, führen wir Folgendes aus:


```bash
echo -n "my secret api key" \
    | kubectl create secret generic xxx --dry-run=client --from-file=api_key=/dev/stdin -o json \
    | kubeseal --controller-namespace=kube-system --controller-name=sealed-secrets --format yaml --merge-into sealed-secret.yaml

kubectl apply -f sealed-secret.yaml
```

## Einen Wert aus einem Sealed Secret löschen

```bash
# BSD sed (macOS)
sed -i '' '/api_key:/d' sealed-secret.yaml

# GNU sed
sed -i '/api_key:/d' sealed-secret.yaml

kubectl apply -f sealed-secret.yaml
```

Nach dem Anwenden der Datei aktualisiert der Controller die Datei Secret automatisch und entfernt den Wert `api_key`.

## Löschen Sie des Sealed Secrets
Um das Geheimnis zu löschen, verwenden wir kubectl, um die Ressource zu löschen:

```bash
kubectl delete -f sealed-secret.yaml
```

Dadurch wird die Ressource `SealedSecret` sowie die entsprechende Ressource `Secret` aus dem Cluster gelöscht.

## Fazit:
Sealed Secrets ist eine sichere Möglichkeit, Kubernetes-Geheimnisse in der Versionskontrolle zu verwalten. Der Verschlüsselungsschlüssel wird gespeichert und Geheimnisse werden im Cluster entschlüsselt. 
Der Client hat keinen Zugriff auf den Verschlüsselungsschlüssel. Der Client verwendet das `kubeseal` CLI-Tool, um Sealed Secret Manifeste zu generieren, die verschlüsselte Daten enthalten. 
Nach dem Anwenden der Datei erkennt der serverseitige Controller eine neue Sealed Secrets  Ressource und entschlüsselt sie, um eine SecretRessource zu erstellen.