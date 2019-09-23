---
layout: post
title: SRV Ressource Records
subtitle:  SRV Ressource Records - Mittels SRV (Service) Resource Records kann per Domain Name System propagiert werden, welche IP-basierenden Dienste (Services) in einer Domain (z. B. Firma) angeboten werden. Zu jedem Dienst werden weitere Informationen geliefert, wie zum Beispiel der Server-Name, der diesen Dienst bereitstellt.
keywords: [SRV Ressource Records DNS named bind]
categories: [dns]
---
# {{ page.title }}

SRV Ressource Records - Mittels SRV (Service) Resource Records kann per Domain Name System propagiert werden, welche IP-basierenden Dienste (Services) in einer Domain (z. B. Firma) angeboten werden. Zu jedem Dienst werden weitere Informationen geliefert, wie zum Beispiel der Server-Name, der diesen Dienst bereitstellt.

Ein Dienst wird durch den Namen und das mit einem Punkt angehängte Protokoll bezeichnet. Beiden Komponenten wird ein underscore vorangestellt, um Verwechslungen mit anderen Domain-Namen zu verhindern.


## Aufbau

**Service**
Dienst + Protokoll + Domain

**TTL**
gibt an, wie lange dieser RR im Cache gehalten werden darf

**IN**
Internet

**SRV**
Priorität falls mehrere identische Dienste angeboten werden, hat die niedrigste Priorität Vorrang

**Gewicht**
bei gleicher Priorität hat das höhere Gewicht Vorrang

**Port**
Transmission Control Protocol - oder User Datagram Protocol -Portnummer

**Server** Server, der diesen Dienst bereitstellt (dabei darf es sich nicht um einen Alias, also eine Domain mit einem CNAME RR, handeln)

## Beispiele

`_ldap._tcp.example.com. 3600 IN SRV 10 0 389 ldap01.example.com.`

`_jabber._tcp.example.com. 3600 IN SRV 10 0 5222 talk.example.com.`

Ein Client kann in diesem Beispiel per DNS ermitteln, dass in der DNS-Domain example.com der Lightweight Directory Access Protocol-Server ldap01 existiert, der über TCP Port 389 erreichbar ist.

## Verwendung

SRV-RRs werden häufig von Microsoft-Windows 2000-Clients verwendet, um für einen benötigten Dienst den zuständigen Domain Controller zu ermitteln.

Weiter sind SRV-Einträge üblich bei folgenden standardisierten Protokollen:

* Extensible Messaging and Presence Protocol
* Session Initiation Protocol
* Lightweight Directory Access Protocol
* Kerberos
