---
layout: post
title: Apache entfernen X-Powered-By Header
subtitle: Es folgt eine bespielhafte Erklärung wie man im Apache-VirtualDocumentRoot nutzt. Ziel ist es die Verwendung dynamischer zu gestallten. Ebenso werden wir Active Directory als Backend
tags: [Apache VirtualDocumentRoot dynamischer Konfiguration Subdomainnamen Htpasswd Zugriffsschutz AuthLDAPBindDN AuthLDAPBindPassword AuthLDAPURL AuthBasicProvider Apache/2.4.29]
categories: [Howtos]
---
# {{ page.title }}

![apache-logo](../../img/apache-logo-300x300.png) 

Es folgt eine bespielhafte Erklärung wie man im Apache-VirtualDocumentRoot nutzt. Ziel ist es die Verwendung dynamischer zu gestallten. Ebenso werden wir Active Directory als Backend für die Benutzerauthentifizierung verweden.

## Apache Config

Unten seht ihr eine bespielhafte Konfiguration für eine dynamische Verwendung des Apache Webservers mit Apache-VirtualDocumentRoot. %-3 wird aufgelöst in den Subdomainnamen. Z.B. www.elastic2ls.com würde im Verzeichniss /var/www/elastic2ls.com/www landen. Der Aufruf demo.elastic2ls.com im Verzeichniss /var/www/elastic2ls.com/demo.

```
UseCanonicalName Off

LogFormat "%V %h %l %u %t \"%r\" %s %b" vcommon

 < VirtualHost *:80>
        ServerAdmin admin@www.elastic2ls.com
        ServerName elastic2ls.com
        ServerAlias *.elastic2ls.com

        VirtualDocumentRoot "/var/www/elastic2ls.com/%-3/"
        ErrorLog "/var/log/httpsd/demo_error"
        CustomLog "/var/log/httpsd/demo_access" vcommon
 < /VirtualHost>

 < VirtualHost *:443>
        ServerAdmin admin@www.elastic2ls.com
        ServerName elastic2ls.com
        ServerAlias *.elastic2ls.com

        VirtualDocumentRoot "/var/www/elastic2ls.com/%-3/"

        ErrorLog "/var/log/httpsd/demo_ssl_error"
        CustomLog "/var/log/httpsd/demo-ssl_access" vcommon

        LogLevel warn
        SSLEngine on
        SSLProtocol all -SSLv2
        SSLCipherSuite DEFAULT:!EXP:!SSLv2:!DES:!IDEA:!SEED:+3DES
        SSLCertificateFile /etc/pki/tls/certs/elastic2ls.com.crt
        SSLCertificateKeyFile /etc/pki/tls/private/elastic2ls.com.key
        SSLCACertificateFile /etc/pki/tls/certs/elastic2ls.com.ca

        < Files ~ "\.(cgi|shtml|phtml|php3?)$">      
                 SSLOptions +StdEnvVars
        < /Files>

        SetEnvIf User-Agent ".*MSIE.*" \
                 nokeepalive ssl-unclean-shutdown \
                 downgrade-1.0 force-response-1.0
 < /VirtualHost>
```

Um nun für alle Verzeichnisse ein und den selben Zugriffschutz zu verwenden legen wir den Schutz an dem Übergeordneten Verzeichniss fest. Dieser wird dann für alle daruntern befindlichen Verzeichnisse www, demo, usw verwendet und muss so nur einmalig konfiguriert werden.

```
 < Directory /var/www/elastic2ls.com/>
        AuthUserFile "/var/www/elastic2ls.com/.htpasswd"
        AuthName "Prototyp"
        AuthType Basic
        Require valid-user
        AllowOverride All
 < /Directory>
```

### Htpasswd Datei erstellen

Anschliessend erstellen wir uns die .htpasswd Datei.

```
[alex@https$] htpasswd -c /var/www/elastic2ls.com/.htpasswd alex
New password:
Re-type new password:
```

### Zugriffsschutz mit AD Backend

```
< Directory /var/www/dfl/>
        AuthLDAPBindDN "CN=admin,cn=Users,dc=testdomain,dc=local"
        AuthLDAPBindPassword "passwort"
        AuthLDAPURL "ldap://192.168.1.1:389/OU=prototyp,DC=dftest,DC=local?sAMAccountName?sub?(objectClass=*)" None
        AuthType Basic
        AuthName "PROTOYP"
        AuthBasicProvider ldap
        AuthzLDAPAuthoritative off
        Require valid-user
        AllowOverride All
 < /Directory>
```

Quelle: [httpss://httpsd.apache.org/docs/2.4/vhosts/mass.html](httpss://httpsd.apache.org/docs/2.4/vhosts/mass.html)
