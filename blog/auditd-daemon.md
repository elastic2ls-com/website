---
layout: post
title: Auditd daemon Linux
subtitle: Der Auditd daemon hilft dem System Administrator einen sogenannten Audit trail zu erstellen, eine Art Logbuch für jegliche Aktion auf einem spezifischen Server.
tags: [Auditd daemon Linux Administrator /etc/audit/auditd.conf num_logs max_log_file rsyslog auditctl msg=audit syscall ausearch ausearch autrace /etc/audit/rules.d/audit.rules]
---

# Auditd daemon Linux

Der Auditd daemon hilft dem System Administrator einen sogenannten Audit trail zu erstellen, eine Art Logbuch für jegliche Aktion auf einem spezifischen Server. Wir können Sicherheits relavante Erreignisse nach verfolgen, können die Erreignisse in Logfiles aufzeichnen und können Missbrauch oder unauthorisierte Aktivitäten finden anhand der eigenen Logfiles. Wir können festlegen welche Aktionen bzw. Erreignisse auf dem Server wir monitoren wollen. Audit stellt keine zusätzliche Sicherheit für dein System dar, eher hilft es dir Verletzungen der Systemrichtlinien nach zu verfolgen und gibt dir die Möglichkeit an die Hand zusätzliche Sicherheitsmassnahmen zu errgreifen um diese zu verhindern. Diese Tutorial erklärt das Audit System, wie es konfiguriert wird, wie man Reports erstellt und wie man diese liest bzw. interpretiert. Ausserdem zeigen wir auf wie man die Audit Logs nach spezifischen Erreignissen durchsucht.

## Verifizieren der Audit Installation

Es gibt zwei Hauptbestandteile des Audit Systems:

1.  Die Audit Kernel Komponente fängt System Aufrufe von Benutzer Applikationen, zeichnet die Erreignisse auf und sendet die Audit Nachrichten an den Audit Daemon.
2.  Der ```auditd``` Daemon enpfängt die Informatione vom Kernel und schreibt diese in eine Logdatei.

Das Audit System braucht die folgenden Pakete: ```audit``` und ```audit-libs```. Diese sind in CentOS schon vorinstalliert. Bei Ubuntu müssen wir diese noch zusätzlich installieren.
```
apt-get install auditd audispd-plugins
```

## Konfiguren von Audit

Die Hauptkonfigurationsdatei für ```auditd``` ist
```
/etc/audit/auditd.conf
```

Diese Datei beinhaltet die Konfigurations Parameter die sagen wohin Erregnisse gelogt werden sollen, wie sich der Daemon verhalten soll wenn die Festplatten voll sind und wie das Logfile rotiert werden soll. Um die Datei editieren zu können braucht der Benutzer den du verwendest sudo Rechte.


Um z.B., die Anzalh der Logfiles die auf dem System verbleiben sollen auf 10 zu erhöhen, verändere die folgende Option:
```
num_logs = 10
```

Du kannst aber genauso einfach die maximal Größe der Logs in MB konfigurieren und was passieren soll, wenn diese Größe erreicht wird:

```
max_log_file = 30
max_log_file_action = ROTATE
```


Wenn du Änderungen an der Konfiguration vorgenommen hast, musst du den Auditd Service neu starten:

```
sudo service auditd restart
```

Die andere wichtige Konfigurationsdatei ist
```/etc/audit/rules.d/audit.rules``` . In CentOS befindet sich die Datei ```/etc/audit/audit.rules``` hier. Die Datei beinhalten permanente Audit Regeln die dem Daemon bei jedem Neustart über die init Skripte mitgegeben werden. Audit Benachrichtigungen werden nach folgende Datei geschrieben.

```
/var/log/audit/audit.log
```

## Verstehen/Interpretieren der Audit Log Einträge

Standardmässig logt das Audit System alle Erreigniss in der ```/var/log/audit/audit.log``` Datei. Diese Datei enthält viele nützliche Informationen, aber das Lesen und verstehen des Inhaltes ist recht unangenehm aufgrund der unglaublich großen Menge an Informationen, der verwendeten Abkürzungen und dem verwendeten Code der Darstellung usw. In diesem Abschnitt widmen wir uns dem Verständniss einiger Felder der typischen Nachrichten in der Logdatei.

 **INFO:** Wen der ```auditd``` Daemon nicht läuft werden alle Nachrichten and ```rsyslog``` gesendet.

Für das folgende Beispiel nehmen wir an wir hätten ein Audit Regel angelegt mit den Label ```(key) sshconfigchange``` um jeglichen Zugriff oder gar Modifikation der Datei
```/etc/ssh/sshd_config``` aufzuzeichnen. Du kannst diese temporär anlegen mit folgendem Kommando:
```
sudo auditctl -w /etc/ssh/sshd_config -p rwxa -k sshconfigchange
```

Der korrelierende Event dazu in der Logdatei sieht folgendermassen aus.

```
type=SYSCALL msg=audit(1434371271.277:135496): arch=c000003e syscall=2 success=yes exit=3 a0=7fff0054e929 a1=0 a2=1fffffffffff0000 a3=7fff0054c390 items=1 ppid=6265 pid=6266 auid=1000 uid=0 gid=0 euid=0 suid=0 fsuid=0 egid=0 sgid=0 fsgid=0 tty=pts0 ses=113 comm="cat" exe="/usr/bin/cat" key="sshconfigchange"

type=CWD msg=audit(1434371271.277:135496):  cwd="/home/alex"

type=PATH msg=audit(1434371271.277:135496): item=0 name="/etc/ssh/sshd_config" inode=392210 dev=fd:01 mode=0100600 ouid=0 ogid=0 rdev=00:00 objtype=NORMAL
```

WEITERHIER

Das obige Event besteht aus drei Einträgen (jeder startet mit dem
```type=</pre>

Schlüsselwort), welche alle den gleichen Timestamp (
```1434371271.277</pre>

) sowie die gleiche ID haben (
```135496</pre>

). Jeder Eintrag beinhaltet einige _name=value_ Paare, welche mit einem Leerzeichen oder Komma getrennt werden. Schauen wir uns an wofür die einzelnen Felder stehen. Der erste Eintrag:

*   <pre>type=SYSCALL</pre>

Das
```type</pre>

Feld enthält den Typ der Audit Nachricht. In userem Fall den Wert
```SYSCALL</pre>

, welcher anzeigt das die Nachricht durch einen Systemcall an den Kernel erzeugt wurde.

*   <pre>msg=audit(1434371271.277:135496):</pre>

Das ist der Timestamp im Format
```audit(time_stamp:ID)</pre>

. Multiple Audit Nachrichten/Einträge können sich den selben Timestamp sowie die selbe ID teilen, wenn sie als Teil des selben Audit Events erzeugt wurden. In unserem Bespiel ist der Timestamp sowie die ID in allen drei Erreignissen, welches das Audit Sytem erzeugt hat, gleich.

*   <pre>arch=c000003e</pre>

Das
```arch</pre>

Feld enhält Informationen über die CPU Architektur. Der Wert, c000003e, ist die hexadezimale Notation für ein x64_64 System.

*   <pre>syscall=2</pre>

Das
```syscall</pre>

Feld beschreibt den Typen des System Calls der zum Kernel gesendet wurde. In diesen Fall, 2 ist es der
```open</pre>

System Call. Das
```ausyscall</pre>

Werkzeug konvertiert System Call Werte in ein lesbares Format. Als Beispiel für einfacheres Verständniss, erzeugt das folgende Kommando den Wert 2 in ein lesbares Format.

*   sudo ausyscall 2

Das Ergebniss

<pre class="code-pre ">
```open```
```

**Note:** Du kannst das Kommando
```sudo ausyscall --dump</pre>

verwenden um eine Liste mit allen System Calls mit ihren dazu gehörigen Nummern anzeigen lassen.

*   <pre>success=yes</pre>

Das
```success</pre>

Feld zeigt an ob der Aufrauf entweder erfolgreich=succeeded oder fehlgeschlagen=failed ist. In unserem Fall war der Aufruf erfolgreich. Der Benutzer Alex konnte die Datei
```sshd_config</pre>

erfolgreich öffnen und lesen mit dem Kommando
```sudo cat /etc/ssh/sshd_config</pre>

.

*   <pre>ppid=6265</pre>

Das
```ppid</pre>

Feld enthält die sogenannte Parent Process ID (PPID) hier die
```6265</pre>

welches der PID des
```bash</pre>

Prozesses entspricht.

*   <pre>pid=6266</pre>

Das
```pid</pre>

Feld enthält die Process ID (PID). In unserem Fall die ID das
```cat</pre>

Prozesses.

*   <pre>auid=1000</pre>
```auid</pre>

ist die Audit UID oder die originale UID des Benutzers, welcher die Audit Nachricht erzeugt hat. Das Audit System speichert die original UID auch wenn du deine Rechte mittels su oder sudo erweitert hast nach dem Login in das System.

*   <pre>uid=0</pre>

Das
```uid</pre>

Feld enthält die Benutzer ID des jenigen, der den Analyse Prozess gestartet hatte (Den Aufruf der Logdatei). In userem wurde es von root mit der uid 0 gestartet.

*   <pre>comm="cat"</pre>
```comm</pre>

enthält das Kommando welches die Audit Nachricht erzeugt hat.

*   <pre>exe="/usr/bin/cat"</pre>

Das
```exe</pre>

Feld enthält den Pfad des Kommandos das benutzt wurde um die Nachricht zu erzeugen.

*   <pre>key="sshconfigchange"</pre>

Dieses
```key</pre>

Feld beinhaltet den vordefinierten Key mit dem wir die Audit Regel beim Anlegen benannt hatte. Keys erleichtern das durchsuchen der Logdateien für bestimmte Typen von Events. Der zweite Eintrag

*   <pre>type=CWD</pre>

Im zweiten Eintrag entspricht der Typ
```CWD</pre>

— Current Working Directory. Diese Teil wird dazu benutzt um das Verzeichniss aufzunehmen aus welchem der Prozessauftruf kam, der den Audit Eintrag erzeugt hat.

*   <pre>cwd="/home/alex"</pre>

Das
```cwd</pre>

Feld beinhaltet den Pfad zu dem Verzeichniss aus dem das Kommando aufgerufen wurde. In userem Fall wurde
```cat</pre>

aufgerufen aus dem Home Verzeichniss des Benutzers Alex. Der dritte Teil

*   <pre>type=PATH</pre>

Im dritten Eintrag ist der Typ
```PATH</pre>

. Ein Audit Event enthält den
```PATH</pre>

Eintrag um den Pfad aufzuzeichnen der an den Systemaufruf übergeben wurde. In unserem Fall wurde der Pfad (
```/etc/ssh/sshd_config</pre>

) als Argument an cat übergeben.

*   <pre>msg=audit(1434371271.277:135496):</pre>

Das
```msg</pre>

Feld enthält den oben näher beschriebene Timestamp und ID, welche für alle drei Einträge verwendet wir, da sie ja Teil des selben Events sind.

*   <pre>name="/etc/ssh/sshd_config"</pre>

Das
```name</pre>

Feld enthält den vollen Pfad der Datei oder des Verzeichnisses welcher dem System Call als Argument übergeben wurde.

*   <pre>ouid=0</pre>

Das
```ouid</pre>

Feld enthält die UID des Besitzer des Objektes, welches wir aufrufen. In unserem FAll das der Datei
```/etc/ssh/sshd_config</pre>

.
## Durchsuchen des Audit Logs nach Erreignissen

Das Audit System bring ein sehr nützliches Werkzeug, genannt
```ausearch</pre>

, mit zum durchsuchen der Audit Logs. Mittels
```ausearch</pre>

, kannst einfach die Ergenisse filtern und nach Ergeigniss Typen suchen. Es kann ausserdem Events interpretieren und die nummerischen Werte umsetzen in Werte für die Arten der System Calls sowie der Benutzernamen. Ein paar Beispiel: Das folgende Kommando durchsucht die Audit Logs nach allen audit Events des Typen LOGIN vom heutigen Tag und interpretiert die Benutzernamen
```-i</pre>

.

*   sudo ausearch -m LOGIN --start today -i

Das u.g. Kommando sucht nach allen Erreignissen mit der ID 27020.

*   sudo ausearch -a 27020

Das nächste Kommando sucht nach Erreignissen (wenn vorhanden) in dem die Datei
```/etc/ssh/sshd_config</pre>

geöffnet/angezeigt wurde und interpretiert diese
```-i</pre>

*   sudo ausearch -f /etc/ssh/sshd_config -i
## Generieren von Audit Reports

Statt die Log Dateien zu lesen, gibt es ein Werkzeug, welches eine Zusammenfassung/Übersicht der Audit Nachrichten erzeugen kann, welches dir weiterhelfen kann detailiertere Analysen vorzunehmen. Wenn
```aureport</pre>

ohne weitere Optionen aufgerufen wird, zeigt es eine Zusammenfassung der verschiedenen Typen von Events aus der Audit Log Datei. Beispiele: Für eine Übersicht über alle ausgeführten Kommandos auf einem Server:

*   sudo aureport -x --summary

Das ergibt eine Report der ähnlich aussehen wird:
```Executable Summary Report
=================================
total file
=================================
117795 /usr/sbin/sshd
1776 /usr/sbin/crond
210 /usr/bin/sudo
141 /usr/bin/date
24 /usr/sbin/autrace
18 /usr/bin/su```

Die erste Spalte zeigt wie oft ein Komando aufgerufen wurde, die zweite das Kommando selbst. Es werden allerdings nicht alle Kommandos angezeigt, sondern nur die Sicherheits-relevanten werden gelogt. Das folgende Kommando zeigt alle fehlerhaften Events an:

*   sudo aureport --failed
```Failed Summary Report
======================
Number of failed logins: 11783
Number of failed authentications: 41679
Number of users: 3
Number of terminals: 4
Number of host names: 203
Number of executables: 3
Number of files: 4
Number of AVC's: 0
Number of MAC events: 0
Number of failed syscalls: 9```

Für eine Report von Systemcalls und den dazugehörigen Benutzernamen:

*   sudo aureport -f -i
```File Report
===============================================
# date time file syscall success exe auid event
===============================================
1\. Monday 15 June 2015 08:27:51 /etc/ssh/sshd_config open yes /usr/bin/cat alex 135496
2\. Tuesday 16 June 2015 00:40:15 /etc/ssh/sshd_config getxattr no /usr/bin/ls root 147481
3\. Tuesday 16 June 2015 00:40:15 /etc/ssh/sshd_config lgetxattr yes /usr/bin/ls root 147482
4\. Tuesday 16 June 2015 00:40:15 /etc/ssh/sshd_config getxattr no /usr/bin/ls root 147483
5\. Tuesday 16 June 2015 00:40:15 /etc/ssh/sshd_config getxattr no /usr/bin/ls root 147484
6\. Tuesday 16 June 2015 05:40:08 /bin/date execve yes /usr/bin/date root 148617```

**Achtung:** Das
```aureport</pre>

tool can auch mit dem Imput von stdin anstatt statt log files arbeiten, solange dieser dem _raw log data format_ entspricht.
## Analysieren eines Prozesses mit autrace

Um einen individuellen Przess zu auditieren können wir
```autrace</pre>

benutzen. Diese Werkzeug ermitteld die system calls die von dem Prozess aufgerufen werden. Das kann z.B. nützlich sein wenn man einen möglichen Trojaner oder einen problematischen Prozess untersuchen möchte. Der Output von
```autrace</pre>

wird nach
```/var/log/audit/audit.log</pre>

geschrieben. Nach dem Ausführen von
```autrace</pre>

wird ein Beispiel des
```ausearch</pre>

Kommandos angezeigt wie man die Log Dateien untersuchen kann. Es sollte immer der volle Pfad zu der ausführbaren Datei angegeben werden wenn man diesen mit autrace aufzeichnen will. **Beispiel:**
```sudo autrace /bin/ls /tmp</pre>

**Achtung:** Wenn
```autrace</pre>

ausgeführt wird entfernt es alle benutzerdefinierten auditing Regeln. Es ersetzt diese mit spezifischen Regeln, die benötigt werden um den Prozess zu tracen den man festgelegt hat. Aus dem selben Grund wird
```autrace</pre>

nicht funktionieren, wenn die auditing Regeln unveränderlich gesetzt sind. **Beispiel:** Nehmen wir an wir wollen den Prozess
```date</pre>

untersuchen und uns die Dateien und System Calls ansehen, die es nutzt.
```sudo autrace /bin/date</pre>

Der Output sollte ähnlich aussehen:
```Waiting to execute: /bin/date
Wed Jun 17 07:22:03 EDT 2015
Cleaning up...
Trace complete. You can locate the records with 'ausearch -i -p 27020'```

Wir können jetzt das
```ausearch</pre>

Kommando vom obigen Output nutzen um uns die zugehören Logs anzeigen zu lassen oder den Output nach
```aureport</pre>

zu übergeben um einen vernünftig lesbaren Report zu erstellen.
```sudo ausearch -p 27020 --raw | aureport -f -i</pre>

Das obige Kommando sucht nach dem Erreigniss mit der Event ID
```27020</pre>

aus dem audit Log, extrahiert diese ins
```raw log format</pre>

und übergibt es an
```aureport</pre>

, welches wiederum das Resultat in einem besser lesbarerem Format ausgibt. Der Output sollte ähnlich aussehen:
```File Report
===============================================
# date time file syscall success exe auid event
===============================================
1\. Wednesday 17 June 2015 07:22:03 /bin/date execve yes /usr/bin/date alex 169660
2\. Wednesday 17 June 2015 07:22:03 /etc/ld.so.preload access no /usr/bin/date alex 169663
3\. Wednesday 17 June 2015 07:22:03 /etc/ld.so.cache open yes /usr/bin/date alex 169664
4\. Wednesday 17 June 2015 07:22:03 /lib64/libc.so.6 open yes /usr/bin/date alex 169668
5\. Wednesday 17 June 2015 07:22:03 /usr/lib/locale/locale-archive open yes /usr/bin/date alex 169683
6\. Wednesday 17 June 2015 07:22:03 /etc/localtime open yes /usr/bin/date alex 169691```
## Zusammenfassung

Du solltest jetzt ein gutes Verständniss haben wie der Auditd daemon funktioniert, wie man die Audit Logs liest und wie man die verschiedenen Werkzeuge benutzt um eure Server zu einfacher zu untersuchen. Per Default werden nur einige wenige Systemeintrage auditiert wie z.B. das protokollieren der Benutzer Aktivitäten oder die Nutzung von
```sudo</pre>

. SELinux Nachrichten werden auch geloggt. Der Auditd daemon nutzt ein Regelwerk um spezifische Erreignisse zu monitoren und Logeinträge zu generieren. Es ist möglich benutzerdefinerte Regeln zu erstellen um Aktivitäten zu monitoren und aufzuzeichnen. Das ist der Punkt an dem der Auditd daemon ein sehr mächtiges Werkzeug wird für den System Administrator. Wir können Regeln hinzufügen, entweder mittels des command line tools
```auditctl</pre>

oder wir fügen diese permanent in die Datei
```/etc/audit/rules.d/audit.rules</pre>

hinzu. Quellen: [https://linux-audit.com/configuring-and-auditing-linux-systems-with-audit-daemon/](https://linux-audit.com/configuring-and-auditing-linux-systems-with-audit-daemon/) [httpss://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Security_Guide/sec-Audit_Record_Types.html](httpss://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/7/html/Security_Guide/sec-Audit_Record_Types.html)
