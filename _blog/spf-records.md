---
layout: post
title: SPF Records
subtitle: SPF steht für Sender Policy Framework und wird verwendet zur Vermeidung von Spam- oder Virenmails mit gefälschtem Absender.
keywords: [SPF Sender Policy Framework Antispam DNS named bind]
categories: [dns]
---
# {{ page.title }}

## Überblick

SPF steht für **Sender Policy Framework** und wird verwendet zur Vermeidung von Spam- oder Virenmails mit gefälschtem Absender. Da mittels SPF in der Zonendatei des Nameservers der **Absenderdomain** ein spezieller Eintrag TXT genutzt wird, kann gewährleistet werden, dass keine Manipulationen vorgenommen werden kann. SPF hilft nicht gegen Spam, für den der Versender eine eigene Domain hat und greift auch nicht bei nicht existierenden Domains.

## Details

Bei SPF wird ein Record vom Typ TXT in die Zonendatei der Domain eingetragen. In diesem Eintrag werden die berechtigten SMTP-Server zu einer Domäne eingetragen. Mailserver können bei eingehenden Mails anhand der Absenderdomäne und den Informationen aus dem SPF-Eintrag dieser Domäne feststellen, ob der sendende SMTP-Server überhaupt berechtigt war, diese Mails zu versenden. Ein SPF-Record sieht beispielsweise so aus:

```@		IN	TXT	"v=spf1 mx ip4:213.133.98.98 a:mail.beisspiel.de -all"```

*   es sind alle Rechner, für die MX-Records in dieser Domäne existieren, gültig
*   zusätzlich sind Mails vom Rechner mit der IP "213.133.98.98" erlaubt
*   Mails vom Rechner "mail.beispiel.de" werden ebenfalls akzeptiert
*   alle anderen Mailserver sind nicht autorisiert

## Beispiel

Wir haben einen eigenen Mailserver und verwalten die Domain "beispiel.de". Mails werden über diesen Rechner versendet und empfangen. Es genügt in diesem Fall folgender TXT-Record:

```  @		IN	TXT	"v=spf1 mx -all" ```

*   es ist nur der Rechner, der in der Domain als Mailserver (=MX) eingetragen ist, berechtigt zum senden von Mails mit Absender "@beispiel.de"
*   allen anderen Mailservern ist es nicht gestattet, die Domain "beispiel.de" als Absender zu verwenden

## Weiterleitungen

Weiterleitungen von E-Mails werden nur unterstützt, wenn die Absenderadresse im Envelope vom weiterleitenden Server so umgeschrieben wird, dass die SPF-Einträge der unsprünglichen Absenderdomain nicht mehr stören. **Beispiel 1** Eine Bestellung ist bei "beispiel.de" eingegangen. Die Bestellbestätigung wird versendet:

```
Absender:       vertrieb@beispiel.de
Sendeserver:    mail.beispiel.de
Empfänger:      irgendwer@irgendwas.de
Empfangsserver: mail.irgendwas.de     ---> SPF-Prüfung "beispiel.de": **ok**
```

Sie landet beim Mailserver von "irgendwas.de". Wir nehmen mal an, dass diese Adresse auf "irgendwer@aol.com" weitergeleitet wird:

```
Absender:       vertrieb@beispiel.de
Sendeserver:    mail.irgendwas.de
Empfänger:      irgendwer@aol.com
Empfangsserver: mail.aol.com              ---> SPF-Prüfung "beispiel.de": **fehlgeschlagen**
```

Die Mail wird also nicht zugestellt, weil der empfangende Mailserver von AOL bei der SPF-Prüfung feststellt, dass der weiterleitende Server "mail.irgendwas.de" nicht für das Senden von "@beispiel.de"-Mails freigegeben ist. Das Problem lässt sich mit SRS umgehen: SRS (Sender Rewriting Scheme) ist ein Verfahren, mit dem weiterleitende Mailsever standardkonform Absenderadressen anpassen können. **Beispiel 2 mit SRS:** Die Bestellbestätigung wird wieder versendet:

```
Absender:       vertrieb@beispiel.de
Sendeserver:    mail.beispiel.de
Empfänger:      kunde@coole-adresse.de
Empfangsserver: mail.coole-adresse.de      ---> SPF-Prüfung "beispiel.de": **ok**
```

Bis hierher ist noch alles unverändert. Doch der weiterleitende Server ändert nun den Absender:

```
Absender:       kunde+vertrieb#beispiel.de@coole-adresse.de
Sendeserver:    mail.irgendwas.de
Empfänger:      irgendwer@aol.com
Empfangsserver: mail.aol.com               ---> SPF-Prüfung "irgendwas.de": **ok**
```

In der Praxis wird allerdings nicht einfach nur die Domain durch die neue Domain ersetzt, da dies von Spammern gezielt für Bounce-Attacken ausgenutzt werden könnte. Eine genaue Beschreibung des SRS-Verfahrens findet man bei [https://www.libsrs2.org/](https://www.libsrs2.org/) unter "I want to find out about SRS" (PDF-Datei).

## Nachteile von SPF

*   leider haben sich die SPF-Einträge noch nicht sehr verbreitet, daher zeigen SPF-Filter noch relativ wenig "Treffer"
*   das für Mail-Weiterleitungen wichtige SRS-Verfahren hat sich in der Praxis ebenfalls noch nicht sehr weit herumgesprochen.
*   ein Providerwechsel erfordert genaue Planung und Anpassung der SPF-Einträge während der Umzugsphase
*   viele Anwender wissen nichts von Ihren SPF-Einträgen (bzw. den SPF-Einträgen Ihrer Firma) und verwenden nicht autorisierte Mailserver Ihrer lokalen Einwahlprovider. Dies führt natürlich zu Bounces.

Die Nachteile von SPF sollten aber nicht überbewertet werden, SPF ist eine hervorragende Möglichkeit, sich gegen den Missbrauch der eigenen Domain zu schützen.

## Testen eines SPF Records

Testen des SPF Records [https://www.kitterman.com/spf/validate.html](https://www.kitterman.com/spf/validate.html)

## Quellen

SMTP+SPF, Sender Policy Framework: [https://www.openspf.org/](https://www.openspf.org/)
SPF-Mechanismus und Syntax: [https://www.openspf.org/SPF_Record_Syntax](https://www.openspf.org/SPF_Record_Syntax)
SPF-Tester: [https://www.dnsstuff.com/](https://www.dnsstuff.com/)
SRS-Verfahren: [https://www.openspf.org/SRS](https://www.openspf.org/SRS)
