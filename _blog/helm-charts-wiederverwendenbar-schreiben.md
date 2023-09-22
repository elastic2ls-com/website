---
layout: post
title: Schreiben wiederverwendbarer Helm-charts
subtitle: Um ein Helm-Diagramm projektübergreifend mit unterschiedlichen Anforderungen verwenden zu können, muss es wiederverwendbar sein. 
keywords: [Helm Chart wiederverwendbar]
categories: [DevOps]
---
# {{ page.title }}

![Helm](../../img/HELM-logox130.webp)

[Helm-Charts](https://helm.sh/) ermöglichen es, [Kubernetes](https://kubernetes.io/)-Manifeste einfach zu packen, zu versionieren und mit anderen Entwicklern zu teilen. 
Um ein Helm-Diagramm projektübergreifend mit unterschiedlichen Anforderungen verwenden zu können, muss es wiederverwendbar sein. 
Das bedeutet, dass gemeinsame Teile der Kubernetes-Manifeste in einer Wertedatei geändert werden können, ohne dass die Vorlagen neu geschrieben werden müssen.

Nehmen wir an, wir überlegen, Prometheus über Helm in unserem Kubernetes-Cluster bereitzustellen. Wir suchen herum und finden ein Diagramm, das stabil, gut dokumentiert und aktiv gepflegt ist. 
Es scheint eine gute Wahl zu sein. Es gibt jedoch einige Optionen, die Sie ändern müssen, um unseren Anforderungen gerecht zu werden. `values.yaml` 
Normalerweise kann dies durch Erstellen einer Datei und Überschreiben der Standardeinstellungen erfolgen. A
allerdings ist das verfügbare Diagramm nicht wiederverwendbar genug und die Optionen, die wir ändern müssen, sind nicht verfügbar.

In einem solchen Fall besteht die einzige Möglichkeit für uns darin, das gesamte Diagramm zu kopieren und an die Anforderungen anzupassen, selbst wenn die Änderung nur 1 oder 2 Codezeilen umfasst.
Nach dem Kopieren des Diagramms müssen wir es auch pflegen und mit dem vorgelagerten Zweig auf dem neuesten Stand halten. 
Es hätte uns viel Zeit und Arbeit gespart, wenn das Diagramm einige Optionen hinzugefügt hätte, um es für Projekte mit unterschiedlichen Anforderungen wiederverwendbar zu machen.

In den nächsten Abschnitten werden wir die Vorlagen der Standard-Helm-Diagrammvorlage (die beim Ausführen erstellt wird) durchgehen und klären, 
was sie wiederverwendbar macht und was verbessert werden kann.

## Ingress
Ein Ingress ermöglicht externen Benutzern den Zugriff auf Kubernetes-Dienste. Es bietet einen Reverse-Proxy, konfigurierbares Traffic-Routing und TLS-Terminierung. 
Es stehen mehrere Ingress-Controller zur Verfügung, z. B. Nginx, GCE, Traefik, HAProxy und mehr.

Für eine wiederverwendbare Ingress-Vorlage müssen wir die folgenden Anforderungen berücksichtigen:

* Die Verwendung des Ingress sollte optional sein. 
* Es sollte möglich sein, einen Ingress-Controller wie Nginx oder GCE auszuwählen.
* Das Traffic-Routing sollte konfigurierbar sein
* TLS sollte optional sein

Die [Standard-Ingress-Vorlage](https://gist.github.com/AlexanderWiechert/10353ec342de648d0075cedd4ade270c) erfüllt alle unsere Anforderungen und ist ein hervorragendes Beispiel für eine wiederverwendbare Vorlage. 
Die Custom Annotations sind ein sehr wichtiger Teil. Ein typisches Anwendungsbeispiel würde so aussehen:

```yaml
ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/server-snippet: |
      add_header X-Frame-Options "DENY";
      proxy_set_header X-Frame-Options "DENY";
    certmanager.k8s.io/cluster-issuer: letsencrypt
    certmanager.k8s.io/acme-challenge-type: dns01
    certmanager.k8s.io/acme-dns01-provider: acme-dns
```

Wir haben den Ingress aktiviert und verwenden Nginx als Controller. Wir geben einen benutzerdefinierten Code an server-snippet, der von nginx-ingress verwendet wird, 
um benutzerdefinierten Code in die Serverkonfiguration einzufügen, der einen benutzerdefinierten Header **X-Frame-Options** hinzufügt. 
Wir verwenden Annotations, um dem Zertifikatsmanager zu signalisieren, ein SSL-Zertifikat für diesen Host bereitzustellen.

Auch andere Ingress-Controller wie [GCE](https://github.com/kubernetes/ingress-gce) nutzen Annotationen zur Integration in Google Cloud-Dienste. 
In diesem Beispiel weisen wir eine externe statische IP zu und stellen ein SSL-Zertifikat bereit mit [gke-managed-certs](http://github.com/GoogleCloudPlatform/gke-managed-certs).

```yaml
ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: gce
    kubernetes.io/ingress.global-static-ip-name: example-org-external-address
    kubernetes.io/ingress.allow-http: 'false'
    networking.gke.io/managed-certificates: example-org-certificate
  hosts:
    - host: example.org
      paths:
        - "/*"
  tls:
    - hosts:
        - example.org
      secretName: "example-org-tls"
```

## Service
Ein Service ist eine Abstraktion für eine Gruppierung von Pods. Es wählt Pods anhand von Labels aus und ermöglicht den Netzwerkzugriff darauf. 
Es gibt mehrere Servicetypen, die Kubernetes unterstützt, z. B. ClusterIP, LoadBalancer oder NodePort.

Die Anforderungen für eine Service-Vorlage in einem wiederverwendbaren Helm-Diagramm sind:

* Es sollte möglich sein, einen Servicetyp auszuwählen.
* Es sollte möglich sein, Annotations hinzuzufügen
* Dies sind recht einfache Anforderungen, und die [Standard-Servicevorlage](https://gist.github.com/AlexanderWiechert/7c53d91c8138def8db630014e037951a) erfüllt sie alle.

```yaml
service:
  type: ClusterIP
  port: 80
  annotations:
    prometheus.io/scrape: "true"
    prometheus.io/port: "4000"
```

Der Service nutzt `ClusterIP`. Die Annotations im Beispiel werden vom Prometheus-Helm-Diagramm verwendet: Der Prometheus-Server sucht nach allen Diensten in einem Cluster, 
die über die prometheus.io/scrape: "true" Annotation verfügen  und durchsucht sie automatisch jede Minute.

## Deployment
Ein Deployment ist eine Abstraktion für Pods. Es führt mehrere Replikate einer Anwendung aus und hält sie im gewünschten Zustand. Wenn eine Anwendung ausfällt oder nicht mehr reagiert, wird sie automatisch ersetzt.

In einer wiederverwendbaren Deployment-Vorlage sollten wir in der Lage sein:

* Anzahl der Replikate festlegen: Abhängig von der Umgebung sollten wir diesen Wert anpassen können. In einer Testumgebung müssen nicht so viele Replikate ausgeführt werden wie in einer Produktionsumgebung.
* Pod-Annotations hinzufügen: Anwendungen wie Linkerd verwenden diese, um Pods zu identifizieren, in die ein Sidecar-Container eingefügt werden soll **_linkerd.io/inject: enabled_**.
* Argumente und Umgebungsvariablen ändern: Als Beispiel sollten wir in der Lage sein, `-log.level=debug` an einen Container zu übergeben, um Debug-Protokolle anzuzeigen, 
falls wir Probleme mit unserer Anwendung identifizieren müssen. Umgebungsvariablen wie z.B. `MIX_ENV=prod`. teilen der Anwendung häufig mit, in welcher Umgebung sie ausgeführt wird und welche Konfiguration sie laden soll.
* Benutzerdefinierte ConfigMaps und Secrets hinzufügen: Es sollte möglich sein, anwendungsspezifische Konfigurationsdateien oder Secrets zu laden, die extern hinzugefügt wurden z. B. SSL-Zertifikate für eine Datenbankverbindung oder API-Schlüssel.
* Liveness- und Readiness-Probes, um zu überprüfen, ob der Container gestartet und aktiv ist
*Konfigurieren von Container-Ressourcenlimits und -requests : In Test- oder Staging-Umgebungen sollten wir es deaktivieren oder auf einen niedrigen Wert festlegen können.
* Sidecar-Container ausführen: Wenn die Anwendung eine Datenbankverbindung erfordert, sich die Datenbank jedoch auf CloudSQL befindet, wird häufig empfohlen, **cloudsql-proxy** als Sidecar-Container auszuführen, um eine sichere Verbindung zur Datenbank herzustellen.
* Festlegen von Affinität und Toleranzen: Um die Leistung der Anwendung zu optimieren, sollten wir in der Lage sein, sie auf demselben Computer wie bestimmte andere Anwendungen auszuführen oder sie auf einem bestimmten Knotenpool zu planen.

### Verbesserungen
Im Gegensatz zu den Ingress- und Service-Vorlagen erfüllt die Standardvorlage nicht die oben genannten Anforderungen. Insbesondere müssen wir Folgendes erweitern:

* Pod-Annotations, damit andere Anwendungen wie Linkerd wissen, wo Sidecar-Container eingefügt werden müssen
* Ersetzen der `appVersion` durch `image.tag`. Dies ermöglicht es, ein anderes Container-Image zu nutzen, ohne das Chart neu zur Verfügung stellen zu müssen.
* Hinzufügen von `extraArgs`, um die Übergabe zusätzlicher Argumente an den Container zu ermöglichen.
* Fügen Sie hinzu `env`, um die Übergabe zusätzlicher Umgebungsvariablen an den Container zu ermöglichen.
* Ersetzen des Standardwert `livenessProbe` bzw. `readinessProbe` durch einen Block, der es uns ermöglicht, die Werte beliebig anzupassen.
* Hinzufügen von `extraVolumes` und `extraVolumeMounts`, um das Mounten benutzerdefinierter ConfigMaps und Secrets zu ermöglichen.
* Hinzufügen von `sidecarContainers`, um die Injektion zusätzlicher Container in den Pod zu ermöglichen.


{% raw %}
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "chart.fullname" . }}
  labels:
    {{- include "chart.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "chart.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "chart.selectorLabels" . | nindent 8 }}
      annotations:
      {{- if .Values.podAnnotations }}
        {{- toYaml .Values.podAnnotations | nindent 8 }}
      {{- end }}
    spec:
    {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
    {{- end }}
      serviceAccountName: {{ include "chart.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .Chart.Name }}
          securityContext:
            {{- toYaml .Values.securityContext | nindent 12 }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          args:
          {{- range $key, $value := .Values.extraArgs }}
            - --{{ $key }}={{ $value }}
          {{- end }}
          {{- if .Values.env }}
          env:
            {{ toYaml .Values.env | nindent 12}}
          {{- end }}
          ports:
            - name: http
              containerPort: 80
              protocol: TCP
          {{- with .Values.livenessProbe }}
          livenessProbe:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          {{- with .Values.readinessProbe }}
          readinessProbe:
            {{- toYaml . | nindent 12 }}
          {{- end }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          volumeMounts:
          {{- if .Values.extraVolumeMounts }}
          {{ toYaml .Values.extraVolumeMounts | nindent 12 }}
          {{- end }}
       {{- if .Values.sidecarContainers }}
       {{- toYaml .Values.sidecarContainers | nindent 8 }}
       {{- end }}
      volumes:
      {{- if .Values.extraVolumes }}
      {{ toYaml .Values.extraVolumes | nindent 8}}
      {{- end }}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
    {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
    {{- end }}
    {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
    {{- end }}
```
{% endraw %}

## Fazit
Die Standard-Helm-Chart ist ein guter Ausgangspunkt für die Erstellung wiederverwendbarer Charts. Die Ingress- und Service-Vorlagen sind perfekte Beispiele. Der Deploymentvorlage fehlen einige Optionen, 
um ausreichend wiederverwendbar zu sein, sie kann jedoch leicht geändert und verbessert werden.

Gute Beispiele wiederverwendbarer Helm-Charts finden [helm/charts Repository](https://github.com/helm/charts/tree/master/stable). Charts wie Prometheus, Grafana oder Nginx-ingress werden aktiv gepflegt 
und ständig verbessert. Sie sind gute Referenzen, die Sie sich beim Schreiben eines neuen Helm-Diagramms ansehen sollten.