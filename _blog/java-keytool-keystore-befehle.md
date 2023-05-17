---
layout: post
title: Java-Keystore erklärt
subtitle: Ein schnelle Übersicht über den Java Keystore und die gängigsten Optionen um eure Schlüssel- und Zertifikate zu verwalten. z.B. (auflisten, hinzufügen, löschen, prüfen) Es ermöglicht euch, eigenenSchlüsselpaare und Zertifikate zu verwalten.
tags: [Java Keystore Schlüsselverwaltung Zertifikatsverwaltung Befehle Erstellen Importieren Prüfen Default Passwort]
categories: [Howtos]
---
# {{ page.title }}

Java Keystore ist ein Schlüssel- und Zertifikatsverwaltungsprogramm. Es ermöglicht Benutzern, ihre eigenen öffentlichen / privaten Schlüsselpaare und Zertifikate zu verwalten. Außerdem können Benutzer Zertifikate zwischenspeichern. Java Keystore speichert die Schlüssel und Zertifikate in einem sogenannten Keystore. Der Java-Schlüsselspeicher ist standardmäßig als Datei implementiert. Es schützt private Schlüssel mit einem Passwort. Ein Keytool-Schlüsselspeicher enthält den privaten Schlüssel und alle Zertifikate, die erforderlich sind, um eine Kette von Vertrauen abzuschließen und die Vertrauenswürdigkeit des primären Zertifikats festzulegen.


![Java-Keystore](../../img/java.png)

 Jedes Zertifikat in einem Java-Schlüsselspeicher ist mit einem eindeutigen Alias verknüpft. Beim Erstellen eines Java-Keystores erstellen Sie zunächst die .jks-Datei, die zunächst nur den privaten Schlüssel enthält. Sie werden dann eine CSR generieren und ein Zertifikat generieren lassen. Anschließend importieren Sie das Zertifikat in den Schlüsselspeicher einschließlich aller Stammzertifikate. Java Keytool auch mehrere andere Funktionen, mit denen Sie die Details eines Zertifikats oder die Liste der in einem Keystore enthaltenen Zertifikate oder ein Zertifikat exportieren können.

### Java Keytool Befehle zum Erstellen und Importieren

[![Java-Keystore](../../img/keystore-300x219.webp)

Mit diesen Befehlen können Sie eine neue Java Keytool Keystore-Datei erstellen, eine CSR erstellen und Zertifikate importieren. Alle Stamm- oder Zwischenzertifikate müssen importiert werden, bevor das primäre Zertifikat für Ihre Domäne importiert wird. Erstellen Sie einen Java-Keystore und ein Schlüsselpaar

```
Keytool -genkey -alias mydomain -keyalg RSA -keystore keystore.jks -keysize 2048
```

Erstellen Sie eine Zertifikatsignierungsanforderung (CSR) für einen vorhandenen Java-Schlüsselspeicher

```
Keytool -certreq -alias mydomain -keystore keystore.jks -file mydomain.csr
```

Importieren Sie ein Stamm- oder Zwischen-CA-Zertifikat in einen vorhandenen Java-Schlüsselspeicher

```
Keytool -import -trustcacerts -alias root -datei mydomain.ca -keystore keystore.jks
```

Importieren Sie ein signiertes primäres Zertifikat in einen vorhandenen Java-Schlüsselspeicher

```
Keytool -import -trustcacerts -alias mydomain -datei mydomain.crt -keystore keystore.jks
```

Erstellen Sie einen Keystore und ein selbst signiertes Zertifikat (siehe Erstellen eines selbst signierten Zertifikats mithilfe von Java Keytool für weitere Informationen)

```
Keytool -genkey -keyalg RSA -alias selfsigned -keystore keystore.jks -storepass password -validity 360 -keysize 2048
```

### Java Keytool Befehle für die Prüfung

Wenn Sie die Informationen in einem Zertifikat oder einem Java-Schlüsselspeicher überprüfen müssen, verwenden Sie diese Befehle. Überprüfen Sie ein eigenständiges Zertifikat

```
Keytool -printcert -v -file mydomain.crt
```

Überprüfen Sie, welche Zertifikate sich in einem Java-Schlüsselspeicher befinden

```
Keytool -list -v -keystore keystore.jks
```

Überprüfen Sie einen bestimmten Keystore-Eintrag mithilfe eines Alias

```
Keytool -list -v -keystore keystore.jks -alias mydomain
```

Prüfen wie lang ein Zertifikat gültig ist.

```
Keytool -printcert -v -file ~/mydomain.crt |grep "Valid from"
Valid from: Sat Aug 06 23:35:07 UTC 2016 until: Sun Aug 06 23:35:07 UTC 2017
```

### Andere Java Keytool Befehle

Löschen Sie ein Zertifikat aus einem Java Keytool-Schlüsselspeicher

```
Keytool -delete -alias mydomain -keystore keystore.jks
```

Ändern eines Java Keystore-Kennworts

```
Keytool -storepasswd -new new_storepass -keystore keystore.jks
```

Exportieren Sie ein Zertifikat aus einem Schlüsselspeicher

```
Keytool -export -alias mydomain -file mydomain.crt -keystore keystore.jks
```

Liste Vertrauenswürdige CA Certs

```
Keytool -list -v -keystore $JAVA_HOME/jre/lib/security/cacerts
```

Importieren Sie neue CA in vertrauenswürdige Certs

```
Keytool -import -trustcacerts -file /home/user/mydomain.ca -alias CA_ALIAS -keystore $JAVA_HOME/jre/lib/security/cacerts
```

Wenn Sie ein Zertifikat von Java Keytool auf Apache oder einen anderen Systemtyp verschieben möchten, schauen Sie sich diese Anleitung zum Konvertieren eines Java Keytool Keystores mit OpenSSL an.
Weitere Informationen finden Sie in der Java Keytool-Dokumentation oder in unseren Tomcat SSL-Installationsanweisungen, die Java Keytool verwenden.

**ACHTUNG** das Default Passwort für den Keystore ist _**changeit**_ . Sonst muss _**keystorePass = 'userpassword'**_ in die server.xml file.
