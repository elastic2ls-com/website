---
layout: post
title: SSH - Einmalpasswörter
subtitle: SSH Authentifizierung richtig erweitert absichern. Ich zeige euch, wie Sie mit einer zwei Faktoren erweitert absichern können.
keywords: [SSH Authentifizierung Einmalpasswörter OTPW one time password]
categories: [Sicherheit]
---
# {{ page.title }}

![Openssh](../img/openssh-logo-150x150.png)

## Einleitung

SSH-OTPW Einmalpasswörter - es ist nicht so schwer wie es klingt. SSH kommt schon mit einigen Sicherheitsfeatures um sicher zu stellen, dass deine Verbindungn zu einem entfernten Host sicher sind und du dich sicher authentifizieren kannst ohne Bedenken. Wie auch immer. Es mag Situationen geben wo die Verwendung von SSH Keys nicht sinnvoll ist oder gar unsicher. Nehmen wir an du möchtest eine SSH Verbindung von einem öffentlichem Computer z.B. in einem Internetcafe aus eine Verbindung aufbauen. Das Public Key Verfahren nimmt an, dass der Computer von dem du dich aus verbindest sicher ist. Das ist aber nicht immer der Fall. Wenn du in diesem Szenario ein Schlüsselpaar verwenden würdest, auch wenn dein Schlüssel mit einem Passwort geschützt ist, wird der Schlüssel entschlüsselt und in den Arbeitsspeicher des Computers abgelegt um damit zu arbeiten bzw. um dich zu authentifizieren. Das bedeutet das die Verbindung verwundbar ist wenn du dem Computer nicht vertraust (kannst).Für solche Umstände wurde ein System entwickelt das "einmal Passwort Authentifizierung" oder OTPW heist. OTPW ist dazu gedacht, mit anderen Authorisationssystemen zusammen zu arbeiten wie z.B. SSH-OTPW Authentifizierung mit zwei Faktoren oder Single Sign-on Lösungen. Wir werden OTPW in einer Ubuntu 14.0.4 VM aufsetzen. Das wird es uns erlauben, uns mit einem Zwei Komponenten Passwort das nur einmal verwendet wird in ein System einzulogen. Dazu benutzt OTPW das PAM Authentifizierungssystem.

## Basis Konfiguration

Nachdem wir das System so konfiguriert haben, dass es OTPW benutzt um uns einzuloggen, generieren wir einen(mehrere) Passwort Prefix. Dieser ist der erste Teil des Einmal-Passwortes. Diesen kann man ausdrucken oder auf einem Device speichern dem wir vertrauen (z.b. verschlüsselt auf dem Telefon). also nicht der "unsichere" Computer von dem aus wir uns "sicher" verbinden wollen. Wenn du dich nun einloggen willst und die Passworteingabe siehst, siehst du eine Referenznummer. Nun musst du den Passwort Prefix sowie den zweiten Teil des Passwortes eingeben der mit der Referenznummer assoziert ist. Dieses Passwort wird nur einmal funktionieren. Wenn nun auf dem öffentlichen Computer nun ein key-logger installiert sein sollte oder jemand die Möglichkeit hatte dein Passwort mit zu lesen, wird das keinen Einfluss haben, da es nur gültig ist bis du dich eingeloggt hast.

## Installation der Komponenten

Um das System zu konfigurieren müssen wir zuerst die notwendigen Komponenten installieren. Da die SSH-OTPW Authentifikation ausschliesslich auf der Server Seite stattfindet werden wir die nötigen Pakete auf dem Server installieren. Zuerst erneuern wir den Pakete Cache und installieren anschliesend diese aus den Repositories.

```
sudo apt-get update
sudo apt-get install otpw-bin libpam-otpw
```

Wie du sehen kannst ist OTPW in zwei wesentliche Komponenten unterteilt. Teil eins wird benutzt um die Einmal-Passwörtet zu erstellen und zu verwalten. Der zweite Teil ist das notwendige Plugin das benutzt wird um PAM gegen die OTPW Passwortdateien zu authentifizieren.

## PAM Konfiguration für OTPW

Nun müssen wir OTPW als Option zu PAM hinzu zu fügen. Wir werden das Ganze so konfigurieren, dass der Login mit regulären Passwörtern verboten ist. Zusätzlich gehen wir davon aus, dass die SSH Schlüssel schon konfiguriert sind für ein passwortloses Login. In unserer Konfiguration werden primär SSH Schlüssel verwendet und als Fall Back Option nutzen wir den OTPW Mechanismus.Um das fertigstellen zu können werden wir nur die Dateien ändern die beim SSH Login involviert sind. Zuerst öffnen wir SSH PAM Konfigurationsdatei:

```
sudo nano /etc/pam.d/sshd
```

Am Anfang der Datei findest du eine Zeile in der die Datei common-auth importiert wird. Dies würde die reguläre Passwort Authetifikation erlauben, was wir nicht wollen. Wir kommentieren das aus.

`#@include common-auth`

Darunter müsen wir nun folgende zwei Zeilen hinzufügen:

`auth    required    pam_otpw.so`
`session optional    pam_otpw.so`

## Konfigurieren des SSH Dienstes

Nun da wir die Pam Module für den SSH Dienst konfiguriert haben OTPW zu nutzen müssen wir dem Dienst selber auch noch die notwendigen Werte mitteilen.

```
sudo nano /etc/ssh/sshd_config
```

Wir brauchen nur einige wenige Werte in der Config Datei anpassen. Bitte versichere dich, dass die Werte wie die u.g. aussehen. Wenn diese nicht vorhanden sind füge diese einfac hinzu. Wenn Werte doppelt aufgeführt sind wird der Dienst den Neustart verweigern.

`UsePrivilegeSeparation yes`
`PubkeyAuthentication yes`
`ChallengeResponseAuthentication yes`
`PasswordAuthentication no`
`UsePAM yes`

Starte danach den SSHD Dienst neu.

## OTPW Passwort Dateien anlegen

Jetzt da unser System so konfiguriert ist um OTPW für SSH Logins zu nutzen, die keinen SSH Schlüssel hinterlegt haben, müssen wir die notwendigen Passwort Dateien anlegen. Die Datei, welche unter `~/.otpw` gespeichert wird, enthält den Hashwert des Passwortsegments, pro Zeile. Die zweite Datei enthält die Klartext One-Time Passwortsegmente, welche wir wie in der Einleitung beschrieben ausdrucken oder auf einem sicheren portablem Gerät speichern können. Wir müssen dazu das `otpw-gen` Kommando aufrufen. Normalerweise würde das Tool den Klartext Teil nach Stdout schreieben wir sollten es aber in eine Datei umleiten um es später weiter verwenden zu können.

```
cd ~
otpw-gen > supergeheim.txt
```

Das generiert einen Random seed und fragt nach einem Passwort Prefix. Nun findest du unter ~/.otpw die Datei welche den gehashten Wert der Passwort Suffixe enthält und zwar einen pro Zeile.

```
OTPW1
280 3 12 8
253tFMngG2PNYhn
132Kua%SZ+esb6t
237yH7D2FMbQsyW
125rrXfBRwnF+A%
106gJxhJE4jkknj
04135:5:knWIB4:
232/d4kI:n57IcD
244RASe8ka63b8Z
057GmqfFe=pXQqu
. . .
```

Die Klartext Teil der Passwortsegmente findest du nun unter `supergeheim.txt`

```
OTPW list generated 2014-04-03 18:06 on sshd              
000 /rGF h5Hq  056 /zi5 %yTJ  112 J7BT HdM=  168 fdBm X%Tn  224 69bi =9mE
001 GoOG jxYQ  057 E=o3 kuEF  113 zwit p27J  169 nHK9 CXRx  225 IihF =o8g
002 Xm=E PuXc  058 Ok27 ZJ++  114 On=5 pNYH  170 ZRDa mB5e  226 yYsb CAfn
003 deL+ iHs7  059 /WGS :J4M  115 ZZd/ 8zyU  171 acDd dESV  227 ddjg ipcR
004 KhDn NdfS  060 =tEz ACye  116 FkQ9 8kSu  172 iRSR nZWT  228 9hHd veZ9
005 rGFG K5=7  061 MvUW LRxc  117 2YwY axJJ  173 kEV5 T/Vz  229 wx%n Le6P
006 GWi2 fHjf  062 qOR: WN2x  118 FvD4 oNjT  174 99OT 8KPy  230 /I=Y hicP
007 XPom pEYp  063 8Xvm vZGa  119 UNjF :Kys  175 b95i SU3R  231 keLn aDcK
008 fJI% 3Qs2  064 3I7Q I2xc  120 5Tm9 REQK  176 AVg: 4ijE  232 :aIF op6V
009 P/Sn dSxA  065 A+J6 =4zo  121 LAyj 3m2+  177 TMuN 9rJZ  233 SWvB %+cL
. . .
```

Die linke Spalte ist die Refernznummer, gefolgt von den acht Zeichen fürden Suffix. Das Leerzeichen zwischen den ersten und letzten 4 Zeichen dient nur der Lesbarkeit und kann optional weggelassen werden wenn du den Suffix ein gibst. Der Vorgang muss für jeden Benutzer wiederholt werden.

## Test

Um das Einmal-Passwort System zu testen, logst du dich am besten von einem Computer ein, der noch nicht mit deinem SSH Schlüssel Konfiguriert wurde. Logge dich mit dem Benutzernamen ein, den du für OTPW konfiguriert hast.

```
ssh demouser@server1.com
Password 253:
```

Wie du sehen kannst steht bei der Passworteingabe eine Referenznummer für den Suffix den wir eingeben sollen. Zuerst geben wir das Prefix Passwortsegment ein gefolgt direkt vom referenziertem Suffix, in der selben Zeile und ohne Leerzeichen.

### Beispiel

Nehmen wir an, das Prefix Passwort ist `Str5ng!G5heim`, und die referenzierte Suffix in der Spalte in der Datein `~/.otpw` schaut folgendermassen aus:

```
249 N4HY RsbH
250 +vAz fawn
251 O4/R ZrhM
252 c6kP jgUT
253 I=aA OKSz
254 aYzA :F64
255 3ezp ZpIq
256 ggIi TD2v
```

In diesem Fall würden wir entweder `Str5ng!G5heimI=aA OKSz`"` oder `Str5ng!G5heimI=aAOKSz` (ohne Leerzeichen im Suffix) als Einmal-Passwort verwenden können. Wenn du nun die Datei `~/.otpw` öffnest kannst du sehen, dass der Wert in einer der Zeilen mit Strichen ersetzt wurde.

```
. . .
091icM5kSPVOdcU
274Uf3q/=kTYcu8
229fHfmIsCj7mjQ
---------------
115EzDO6=jM/sOT
143iWCdteSk3kg7
265S+QTGcg+MAZO
174UgXchxsI2g:G
. . .
```

Das bedeutet, dass dieses Suffix nicht mehr gültig ist und nicht mehr verwendet werden kann. Wenn nun zwei Benutzer versuchen sich gleichzeitig mit dem selben Account anzumelden wird OTPW das Prefix Passwort abfragen gefolgt von drei Suffix Passwörtern. Jedes der Suffix Passwörter ist verschieden. In diesem Fall sieht die Passworteingabe folgendermassen aus.

```
Password 161/208/252:
```

In dieser Situation wird eine `~/.otpw.lock` Datei erstellt. Nach erfolgreichem Login sollte die Datei entfernt werden, aber es gibt einen Bug bei dem es passieren kann, dass die Datei nicht entfernt wird. Die Datei muss dann manuell entfernt werden.

```
rm ~/.otpw.lock
```

Beim nächsten Login wird wieder nur ein Suffix Passwort abgefragt.

## Vorbehalte und Bugs

Wie vorhin erwähnt kann es vorkommen, dass die lock Datei nicht automatisch entfernt wird nach einem erfolgreichen Login. Das passiert insbesondere wenn ein Benutzer den Login abbricht mit `CTRL-C`. Ein anderer Fehler ist es, dass die Anzahlt der gültigen OTPW Einträge falsch angezeigt wird. Ein Workarround ist folgendes Bash Script von Wolfgang Kroener aus der Debian Mailliste. Das Script kann auf verschiedenste Arten implementiert werden, aber am einfachsten ist es das ganze ans Ende der `~/.bashrc` Datei einzufügen.

```
if [ "$SSH_TTY" -a -f $HOME/.otpw ]; then
  PW_LINES=$(wc -l <$HOME/.otpw)
  PW_USED=$(grep -- ---- $HOME/.otpw | wc -l)
  echo "OTPW $PW_USED/`echo $PW_LINES-2 | bc` used"
fi
```

Nach dem Login per SSH sollte nun folgendes angezeigt werden.

```
OTPW 6/280 used
```

OTPW empfiehlt die Passwortliste bei ca 50% verfügbarer Passwörter zu regenerieren.

```
otpw-gen > nochwasgeheimes.txt
```

Das sorgt dafür, dass u.a. die vorherigen Passwort Suffixe nicht mehr verwendbar sind.

## Zusammenfassung

OTPW kann dir eine zusätzliche Option liefern um sich von "unsicheren" Machinenen auf deine Server einzulogen. Es kann helfen Schlüsselbasierenden Login zu verhindern von unsicheren Machinen oder Umgebungen.

Quellen:
[https://www.cl.cam.ac.uk/~mgk25/otpw.html](https://www.cl.cam.ac.uk/~mgk25/otpw.html)
