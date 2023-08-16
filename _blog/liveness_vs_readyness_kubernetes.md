---
layout: post
title: Liveness vs. Readiness probes in Kubernetes und Spring Boot
subtitle: Was ist eigentlich der Unterschied zwischen den Liveness und Readiness Probes und wie konfiguriert man diese in Kubernetes bzw. Spring Boot. 
keywords: [Liveness vs. Readiness Kubernetes Spring Boot]
categories: [DevOps]
---

# {{ page.title }}

Ab Spring Boot 2.3 wird der Verfügbarkeitsstatus der Anwendung (einschließlich Liveness und Readiness) unterstützt
und kann als Kubernetes Probe mit Actuator verfügbar gemacht werden.

Der **/health** Endpunkt war eigentlich nicht wirklich dafür gedacht, den Anwendungsstatus offenzulegen und zu steuern, 
wie die Cloud-Plattform die App-Instanz behandelt und den Datenverkehr an sie weiterleitet. 
Er wurde in der Vergangenheit häufig auf diese Weise verwendet, da Spring Boot hier nichts Besseres zu bieten hatte.

Der **Liveness** Check sollte nur dann fehlschlagen, wenn die Anwendung einen nicht wiederherstellbaren Fehler verursacht.
Hier muss man aufpassen, was man in die Zustandsprüfung aufnimmt. 

Es kann gefährlich sein, hier einen Neustart der Anwendung zu initiieren, sobald ein externes System nicht mehr verfügbar ist. 
Die Plattform könnte im Extremfall alle Anwendungsinstanzen durchstarten und kaskadierende Ausfälle verursachen, 
da andere Systeme wiederrum von dieser Anwendung abhängen könnten. 

Bei der **Readiness** geht es eigentlich darum, ob die Anwendung in der Lage ist, den Datenverkehr zu verarbeiten. 
Spring Boot synchronisiert den Readiness-Status mit dem Lebenszyklus der Anwendung (die Webanwendung wurde gestartet, ein graceful shutdown wurde angefordert und wir sollten keinen Datenverkehr mehr weiterleiten, usw.). 
Es gibt eine Möglichkeit, eine "Readiness"-Zustandsgruppe zu konfigurieren, die einen benutzerdefinierten Satz von Zustandsprüfungen für Ihren speziellen Anwendungsfall enthält.

Mit dem neuen Spring Boot-Lebenszyklus sollten alle langlaufenden Startup-Tasks als ApplicationRunner-Beans genutzt werden - sie werden ausgeführt, nachdem Liveness positiv geprüft ist, aber bevor Readiness erfolgreich ist. 
Wenn der Anwendungsstart immer noch zu langsam für die konfigurierten Proben ist, kann man die StartupProbe mit einem längeren Timeout nutzen und sie auf den Liveness-Endpunkt verweisen.

## Spring Boot

![Spring Boot](../../img/spring-boot-logo-png-4-transparent-150x150.webp)

Wenn wir mit Spring Boot 2.3.2 arbeiten, können wir die neuen Eigenschaften verwenden, um Liveness- und Readiness-Prüfungen zu ermöglichen:

```python
management.endpoint.health.probes.enabled=true
management.health.livenessState.enabled=true
management.health.readinessState.enabled=true
```

### Übergänge zwischen Bereitschafts- und Aktivitätszustand
In Spring Boot können die Bereitschafts- und Aktivitätszustände mit folgenden Werten abgebildet werden:
Der Zustand **ACCEPTING_TRAFFIC** bedeutet, dass die Anwendung bereit ist, Datenverkehr anzunehmen.
Der Zustand **REFUSING_TRAFFIC** bedeutet, dass die Anwendung noch nicht bereit ist, Anfragen anzunehmen

In ähnlicher Weise stellt LivenessState den Liveness-Status der Anwendung mit zwei Werten dar:
Der Wert **CORRECT** bedeutet, dass die Anwendung läuft und ihr interner Zustand korrekt ist.
Andererseits bedeutet der Wert **BROKEN**, dass die Anwendung mit einigen fatalen Fehlern läuft.

### Verwaltung der Verfügbarkeit der Anwendung
Anwendungskomponenten können den aktuellen Bereitschafts- und Aktivitätsstatus abrufen, 
indem sie die Schnittstelle ApplicationAvailability verwenden:

```
@Autowired private ApplicationAvailability applicationAvailability;
```
Dann können wir es wie folgt verwenden.

```
assertThat(applicationAvailability.getLivenessState())
.isEqualTo(LivenessState.CORRECT);
assertThat(applicationAvailability.getReadinessState())
.isEqualTo(ReadinessState.ACCEPTING_TRAFFIC);
assertThat(applicationAvailability.getState(ReadinessState.class))
.isEqualTo(ReadinessState.ACCEPTING_TRAFFIC);
```

### Update des Verfügbarkeitsstatus

Wir können den Anwendungsstatus aktualisieren, indem wir ein AvailabilityChangeEvent-Ereignis publishen.

```
assertThat(applicationAvailability.getLivenessState())
.isEqualTo(LivenessState.CORRECT);
mockMvc.perform(get("/actuator/health/liveness"))
.andExpect(status().isOk())
.andExpect(jsonPath("$.status").value("UP"));

AvailabilityChangeEvent.publish(context, LivenessState.BROKEN);

assertThat(applicationAvailability.getLivenessState())
.isEqualTo(LivenessState.BROKEN);
mockMvc.perform(get("/actuator/health/liveness"))
.andExpect(status().isServiceUnavailable())
.andExpect(jsonPath("$.status").value("DOWN"));
```

Wie oben gezeigt, gibt der Endpunkt /actuator/health/liveness vor der Veröffentlichung eines Ereignisses eine 200 OK-Antwort mit dem folgenden JSON zurück:
```
{
"status": "OK"
}
```
Nach der Unterbrechung des Liveness-Status gibt derselbe Endpunkt eine 503 Service Unavailable-Antwort mit dem folgenden JSON zurück.
```
{
"status": "DOWN"
}
```

## Kubernetes

![Kubernetes](../../img/k8s.webp)

Das Kubelet verwendet **Liveness Probes**, um zu wissen, wann ein Container neu gestartet werden muss. 
Liveness Probes können zum Beispiel einen Deadlock erkennen, bei dem eine Anwendung zwar läuft, aber nicht vorankommt. 
Der Neustart eines Containers in einem solchen Zustand kann dazu beitragen, dass die Anwendung trotz Fehlern verfügbar ist.

Das Kubelet verwendet **Readiness Probes**, um zu wissen, wann ein Container bereit ist, Datenverkehr zu empfangen. 
Ein Pod gilt als bereit, wenn alle seine Container bereit sind. Dieses Signal wird u. a. verwendet, um zu steuern, welche Pods als Backends für Dienste verwendet werden. 
Wenn ein Pod nicht bereit ist, wird er aus den Dienst-Lastverteilern entfernt.

Das Kubelet verwendet **Startup-Probes**, um zu wissen, wann eine Container-Anwendung gestartet wurde. Wenn eine solche Prüfung konfiguriert ist, werden Liveness- und Readiness-Checks erst dann gestartet, 
wenn der Startup Check erfolgreich war.

Manchmal haben Sie es mit Legacy-Anwendungen zu tun, die bei ihrer ersten Initialisierung eine zusätzliche Startzeit benötigen könnten. 
In solchen Fällen kann es knifflig sein, Parameter für eine Liveness-Probe einzurichten, ohne die schnelle Reaktion auf Deadlocks zu beeinträchtigen, die eine solche Probe motiviert hat. 
Der Trick besteht darin, eine Startup-Probe mit demselben Check, mit einem failureThreshold * periodSeconds einzurichten, der lang genug ist, um den schlimmsten Fall einer Startup-Zeit abzudecken.

## Unterschiede
Was unterscheidet denn dann nun liveness und readiness Checks?
Im einfachsten Fall unterscheiden sich beide nicht und man setzt beide Werte gleich. Eigentlich aber sollte man in soweit unterscheiden:

> **_NOTE:_** 
> 
> **readiness** => Die Applikation kann prinzipiell Trafic enpfangen, also ist z.B. aufrufbar im Browser
> 
> **liveness**  => Die Applikation kann voll verwendet werden, also kann z.B. im Hintergrund mit einer Datenbank sprechen.

## Konfiguration 

Im Helm Chart, das wir für unsere Anwendung erstellen, fügen wir das Deployment folgendes in die values.yaml ein.
```
deployment:
    image:
        name: my-springboot-app
        repository: docker-private.elastic2ls.com
    startupProbe:
        failureThreshold: 30
        periodSeconds: 5
        path: /my-springboot-app/actuator/health
    readinessProbe:
        initialDelaySeconds: 5
        timeoutSeconds: 5
        path: /my-springboot-app/actuator/health/readiness
    livenessProbe:
        initialDelaySeconds: 5
        timeoutSeconds: 5
        path: /my-springboot-app/actuator/health/liveness
```

Probes haben eine Reihe von Werten, über die wir das Verhalten von Start-, Liveness- und Readiness-Checks genauer steuern können:

**initialDelaySeconds** Anzahl der Sekunden nach dem Start des Containers, bevor die Start-, Liveness- oder Readiness-Probes eingeleitet werden. 
Wenn eine Startup-Probe definiert ist, beginnen die Liveness- und Readiness-Proben erst, 
wenn die Startup-Probe erfolgreich war. Der Standardwert ist 0 Sekunden. Der Mindestwert ist 0.

**periodSeconds** Wie oft (in Sekunden) die Prüfung durchgeführt werden soll. Standardwert ist 10 Sekunden. Der Mindestwert ist 1.
timeoutSekunden: Anzahl der Sekunden, nach denen die Prüfung abgebrochen wird. Der Standardwert ist 1 Sekunde. Der Mindestwert ist 1.

**successThreshold** Mindestanzahl aufeinanderfolgender Erfolge, damit die Prüfung nach einem Fehlschlag als erfolgreich gilt. 
Der Standardwert ist 1. Muss 1 für Liveness und Startup Probes sein. Der Mindestwert ist 1.

**failureThreshold** Wenn eine Probe N mal hintereinander fehlschlägt, geht Kubernetes davon aus, dass die gesamte Prüfung fehlgeschlagen ist. 
Heisst der Container ist nicht bereit. Im Falle einer Startup- oder Liveness-Probe, wenn mindestens die Proben, wie definiert N mal fehlgeschlagen sind, 
behandelt Kubernetes den Container als ungesund und löst einen Neustart für diesen spezifischen Container aus. 
Das Kubelet beachtet die Einstellung von **terminationGracePeriodSeconds** für diesen Container.

**terminationGracePeriodSeconds** Konfiguriert eine Karenzzeit, die das Kubelet abwartet, bevor es ein Herunterfahren des ausgefallenen Containers 
erzwungen wird. Standardmäßig wird der Wert auf 30 Sekunden, falls nicht angegeben gesetzt und der Mindestwert beträgt 1.

## Zusammenfassung

Wir haben im Detail auf die Konfiguration der verschiedenen Probes in Spring Boot, sowie deren Verwendung um den zustand des Containers in Kubernetes zu
prüfen, geschaut. Wir haben einige Beispiele aufgeführt und die Werte, welche ich in Kubernetes setzen kann genauer beleuchtet. 
