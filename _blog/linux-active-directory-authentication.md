---
layout: post
title: Linux mit Active Directory Authentication Teil1
subtitle:  In dieser Anleitung erlären wir euch wie man den Benutzerlogin für Linux mit Active Directory Authentication einrichtet. Da jede Firma ein Active Directory besitzt bietet es sich an dieses als SSO Backend zu nutzen. Die Anleitung basiert auf Ubuntu 14.04 und Windows Server 2012.
keywords: [Active Directory Linux Authentication ldap samba]
categories: [LinuxInside]
---
# {{ page.title }}

In dieser Anleitung erlären wir euch wie man den Benutzerlogin für Linux mit Active Directory Authentication einrichtet. Da jede Firma ein Active Directory besitzt bietet es sich an dieses als SSO Backend zu nutzen. Die Anleitung basiert auf Ubuntu 14.04 und Windows Server 2012.

### Voraussetzungen

SSSD und realmd finden Sie in den Ubuntu-Repositories, so dass die Installation sehr einfach ist. Aber ein paar Voraussetzungen müssen vorab erfüllt werden. 1\. DNS Server Der Linux Server den wir ins Active Directory integrieren wollen muss zwingen den Active Directory-DNS-Server verwenden. Dazu tragen wir die IP Addresse des Windows DNS Server in die resolv.conf Datei ein. Nehmen wir an der DNS Server hat die IP 192.168.1.1

```
[alex@linux-server~]$ nano /etc/resolv.conf
nameserver 192.168.1.1
```

2\. Zeitserver Der Linux Server sollte möglichst die gleiche Zeit verwenden wie der AD Domain-Controller. Der AD Controller bietet einen eigenen Zeitdienst an um sich mit den verbundenen Maschinen zu synchronisieren. Dazu trage wir die IP Addresse in die Datei ntp.conf ein.

```
[alex@linux-server~]$ nano /etc/ntp.conf
driftfile /var/lib/ntp/drift
server 192.168.1.1
restrict -4 default kod notrap nomodify nopeer noquery
restrict -6 default kod notrap nomodify nopeer noquery
restrict 127.0.0.1
restrict ::1
```

### Installation des Kerberos client, SSSD

Nun installieren wir den Kerberos-Client, das Realm-Registrierungswerkzeug, den System Security Services-Daemon, das AD-Clienttool und Samba-Tools:

```
apt-get install krb5-user realmd sssd sssd-tools adcli samba-common-bin
```

Wenn Sie dazu aufgefordert werden, geben Sie Ihren AD Kerberos-Bereich ein. Es sollte in der Regel Ihr Domain-Name in Großbuchstaben ("elastic2ls.com" wird "ELASTIC2LS.COM"). Wenn Ihr DNS ordnungsgemäß funktioniert, sollte das alles sein, das für den Kerberos-Client benötigt wird, um ordentlich zu arbeiten. Andernfalls müssen Sie Ihre Server direkt in der Datei /etc/krb5.conf hinzufügen.

### Authentifizieren mit Kerberos

```
[alex@linux-server~]$ kinit admin|ELASTIC2SL.COM
[alex@linux-server~]$ klist
Ticket cache: FILE:/tmp/krb5cc_0
Default principal: admin@ELASTIC2SL.COM

Valid starting     Expires            Service principal
01/05/17 16:23:22  01/06/17 02:23:22  krbtgt/ELASTIC2SL.COM@ELASTIC2SL.COM
	renew until 01/06/17 16:23:18
```

Wir haben jetzt ein Ticket,dass für einige Stunden gültig, was bedeutet, dass die Kerberos-Authentifizierung funktioniert. Wir können mit dem Konfigurieren des Realmd Realm-Registrierungswerkzeugs fortfahren, das uns mit der Domäne verbindet.

### realmd konfigurieren

Dazu editieren wir die Datei /etc/realmd.conf

```
[service]
automatic-install = no

[users]
default-home = /home/%D/%U
default-shell = /bin/bash

[koo.fi]
computer-ou = OU=Linux,DC=elastic2ls,DC=com
automatic-id-mapping = yes
fully-qualified-names = no
```

+  Die Option **automatic-install = no** deaktiviert die automatische Installation der Pakete durch realmd.
+ Mit der Option **default-home = /home/%D/%U** werden die Home-Verzeichnisse der Benutzer in dem Schema /home/DOMAIN/USERNAME angelegt. Z.B. /home/elastic2ls.com/admin
+ **default-shell** gibt die Standard Shell für die Benutzer an.
+ Die Option **computer-ou** gibt an, wo das Computerkonto in AD hinzugefügt werden soll.
+ Mit der Option **automatic-id-mapping = yes** wird die automatische ID-Zuordnung von SSSD anstelle von Benutzer- und Gruppen-IDs, die in POSIX-Attributen in AD gespeichert sind, verwendet. Die automatische ID-Zuordnung von SSSD ist intelligent, da sie die gleiche UNIX-UID und GID auf verschiedenen Hosts garantieren kann, wenn alle Hosts SSSD verwenden.
+ Die Option **full-qualified-names = no** entfernt standardmäßig den Domänenteil aus Benutzer- und Gruppennamen. Es kann zu Namenkollisionen führen, ist aber eine Erleichterung für die Benutzer, da sie nur ihren Benutzernamen und nicht den Domain-Teil jedes Mal eingeben müssen.

### Den Linux Server der Active Directory Domain hinzufügen

Sie können den Befehl "realm discover" nun verwenden, um zu sehen, ob die Active Directory-Domäne entdeckt werden kann. Es benötigt ein gültiges Kerberos-Ticket als Domänenadministrator.

```
[alex@linux-server~]$ realm discover elastic2ls.com
elastic2ls.com
  type: kerberos
  realm-name: ELASTIC2SL.COM
  domain-name: elastic2ls.com
  configured: no
  server-software: active-directory
  client-software: sssd
  required-package: sssd-tools
  required-package: sssd
  required-package: libnss-sss
  required-package: libpam-sss
  required-package: adcli
  required-package: samba-common-bin
```

Nun fügen wir den Server der Domain hinzu.

```
[alex@linux-server~]$ realm join elastic2ls.com
realm list
elastic2ls.com
  type: kerberos
  realm-name: ELASTIC2SL.COM
  domain-name: elastic2ls.com
  configured: kerberos-member
  server-software: active-directory
  client-software: sssd
  required-package: sssd-tools
  required-package: sssd
  required-package: libnss-sss
  required-package: libpam-sss
  required-package: adcli
  required-package: samba-common-bin
  login-formats: %U
  login-policy: allow-realm-logins
```

Nach dem erfolgreichen Hinzufügen sollten Sie in der Lage sein, einzelne Benutzer und Gruppen mit getent zu aufzulösen:

```
[alex@linux-server~]$ getent passwd admin
admin:*:1035001181:1035000513:Admin Admin:/home/elastic2ls.com/admin:/bin/bash
[alex@linux-server~]$ getent group 'Domain Admins'
# domain admins:*:364000512:admin
```

#### Fehlerbehandlung

**ACHTUNG!!! Wenn das nicht funktioniert und diese Meldung "Failed to join the domain" auftritt, solltet ihr es mit der zusätzlichen Angabe der Benutzers versuchen. Dieser muss in der Gruppe Domain-Administratoren sein.**

```
[alex@linux-server~]$ realm join -v --user=admin elastic2ls.com
```

**ACHTUNG!!! Sollte die Meldung "Necessary packages are not installed" auftreten sollte das Paket packagekit nachinstalliert werden.**

```
[alex@linux-server~]$ apt-get install packagekit
killall aptd
killall realmd
```

Danach sollte es klappen.

### Kontrollieren wer sich einlogen kann

An diesem Punkt sollten wir in der Lage sein, uns mit jeder AD-Benutzer-ID anzumelden. Wir können steuern, wer sich anmelden kann und wer nicht.

```
[alex@linux-server~]$ realm deny --all
realm permit administrator
realm permit -g 'Domain Admins'
realm list
elastic2ls.com
  type: kerberos
  realm-name: ELASTIC2SL.COM
  domain-name: elastic2ls.com
  configured: kerberos-member
  server-software: active-directory
  client-software: sssd
  required-package: sssd-tools
  required-package: sssd
  required-package: libnss-sss
  required-package: libpam-sss
  required-package: adcli
  required-package: samba-common-bin
  login-formats: %U
  login-policy: allow-permitted-logins
  permitted-logins: administrator
  permitted-groups: Domain Admins
```

### Automatisiertes Erstellen der Home Verzeichnisse

Um Home-Verzeichnisse automatisiert zu erstellen, fügen Sie eine Zeile pam_mkhomedir.so in /etc/pam.d/common-session hinzu:

```
[alex@linux-server~]$ nano /etc/pam.d/common-session
session [default=1]   pam_permit.so
session requisite     pam_deny.so
session required      pam_permit.so
session optional      pam_umask.so
session required      pam_unix.so
session required      pam_mkhomedir.so  skel=/etc/skel umask=0022
session optional      pam_sss.so
session optional      pam_systemd.so
```

Quelle:

[httpss://help.ubuntu.com/lts/serverguide/sssd-ad.html](httpss://help.ubuntu.com/lts/serverguide/sssd-ad.html)
