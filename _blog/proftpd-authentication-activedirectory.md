---
layout: post
title: proftp - Authentifikation per ActiveDirectory
subtitle:  Snippets from proftpd.conf erweitert um proftp - Authentifikation per ActiveDirectory, ergänzt sind Beispielwerte für den Connector ans Active Directory.
keywords: [proftp Authentifikation ActiveDirectory]
categories: [LinuxInside]
---
# {{ page.title }}

## Konfiguration

Snippets der Konfigirationsdatei proftpd.conf erweitert um eine Authentifikation per ActiveDirectory.
```
<IfModule mod_auth_pam.c>
AuthPAM off
</IfModule>
``

<IfModule mod_ldap.c>
LoadModule mod_ldap.c
AuthOrder mod_ldap.c
LDAPServer ldap://192.168.0.1 # your server IP
LDAPAttr uid sAMAccountName
LDAPattr gidNumber primaryGroupID
LDAPDNInfo "CN=adminuser,cn=Users,DC=domain,DC=com " "somepassword"
LDAPAuthBinds on
LDAPDoAuth on "CN=Users,DC=domain,DC=com" (&(sAMAccountName=%v)(objectclass=*))
</IfModule>

RequireValidShell off
UseFtpUsers off
PersistentPasswd off
```

## Test
starten von Proftpd im Debug Modus:

```
proftpd -nd10
```
Die Authentifizierung bei ProFTP über das Active Directory zeigt folgendes im Log.

```
ldapserver (testmachine) - mod_ldap/2.8.17: connected to 192.168.0.1:389
ldapserver (testmachine) - mod_ldap/2.8.17: set protocol version to 3
ldapserver (testmachine) - mod_ldap/2.8.17: successfully bound as CN=adminuser,cn=Users,DC=domain,DC=com with password somepassword
ldapserver (testmachine) - mod_ldap/2.8.17: set dereferencing to 0
ldapserver (testmachine) - mod_ldap/2.8.17: set query timeout to 0s
ldapserver (testmachine) - mod_ldap/2.8.17: generated filter (sAMAccountName=testuser) from template (sAMAccountName=%u) and value testuser
ldapserver (testmachine) - mod_ldap/2.8.17: searched using filter (sAMAccountName=testuser)
ldapserver (testmachine) - mod_ldap/2.8.17: no entries for filter (sAMAccountName=testuser)
ldapserver (testmachine) - no such user 'testuser'
```

## Erweiteres Testen

Mit ldapsearch können wir im Fehlerfall die zugrunde liegende LDAP Verbindung zum Active Directory prüfen.

```
ldapsearch -D CN=adminuser,cn=Users,DC=domain,DC=com -h 192.168.0.1 -W -x -b "cn=Users,dc=domain,dc=com" sAMAccountName="testuser"
```

Das Resultat

```
# extended LDIF
#
# LDAPv3
# base <cn=Users,dc=domain,dc=com> with scope subtree
# filter: sAMAccountName=testuser
# requesting: ALL
#
dn: CN=test user,CN=Users,DC=domain,DC=com
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: testuser one

distinguishedName: CN=testuser one,CN=Users,DC=talend,DC=com
instanceType: 4
whenCreated: 20101113212128.0Z
whenChanged: 20130710072816.0Z

sAMAccountName: testuser

mail: testuser@domain.com
# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1 </code>
```
