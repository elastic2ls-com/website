---
layout: post
title: Java-Keystore erklärt
subtitle: Ein schnelle Übersicht über den Java Keystore und die gängigsten Optionen um eure Schlüssel- und Zertifikate zu verwalten. z.B. (auflisten, hinzufügen, löschen, prüfen) Es ermöglicht euch, eigenenSchlüsselpaare und Zertifikate zu verwalten.
tags: [Java Keystore Schlüsselverwaltung Zertifikatsverwaltung Befehle Erstellen Importieren Prüfen Default Passwort]
categories: [automation]
<!-- image: https://s.elastic2ls.com/wp-content/uploads/2018/02/27202543/java.png -->
---
# {{ page.title }}

Java Keystore ist ein Schlüssel- und Zertifikatsverwaltungsprogramm. Es ermöglicht Benutzern, ihre eigenen öffentlichen / privaten Schlüsselpaare und Zertifikate zu verwalten. Außerdem können Benutzer Zertifikate zwischenspeichern. Java Keystore speichert die Schlüssel und Zertifikate in einem sogenannten Keystore. Der Java-Schlüsselspeicher ist standardmäßig als Datei implementiert. Es schützt private Schlüssel mit einem Passwort. Ein Keytool-Schlüsselspeicher enthält den privaten Schlüssel und alle Zertifikate, die erforderlich sind, um eine Kette von Vertrauen abzuschließen und die Vertrauenswürdigkeit des primären Zertifikats festzulegen.


[![Java-Keystore](https://s.elastic2ls.com/wp-content/uploads/2018/02/27202543/java.png)](https://s.elastic2ls.com/wp-content/uploads/2018/02/27202543/java.png)

 Jedes Zertifikat in einem Java-Schlüsselspeicher ist mit einem eindeutigen Alias verknüpft. Beim Erstellen eines Java-Keystores erstellen Sie zunächst die .jks-Datei, die zunächst nur den privaten Schlüssel enthält. Sie werden dann eine CSR generieren und ein Zertifikat generieren lassen. Anschließend importieren Sie das Zertifikat in den Schlüsselspeicher einschließlich aller Stammzertifikate. Java Keytool auch mehrere andere Funktionen, mit denen Sie die Details eines Zertifikats oder die Liste der in einem Keystore enthaltenen Zertifikate oder ein Zertifikat exportieren können.

### Java Keytool Befehle zum Erstellen und Importieren

[![Java-Keystore](https://s.elastic2ls.com/wp-content/uploads/2018/02/27202839/keystore-300x219.jpg)](https://s.elastic2ls.com/wp-content/uploads/2018/02/27202839/keystore.jpg)

Mit diesen Befehlen können Sie eine neue Java Keytool Keystore-Datei erstellen, eine CSR erstellen und Zertifikate importieren. Alle Stamm- oder Zwischenzertifikate müssen importiert werden, bevor das primäre Zertifikat für Ihre Domäne importiert wird. Erstellen Sie einen Java-Keystore und ein Schlüsselpaar

<pre lang="bash">Keytool -genkey -alias mydomain -keyalg RSA -keystore keystore.jks -keysize 2048</pre>

Erstellen Sie eine Zertifikatsignierungsanforderung (CSR) für einen vorhandenen Java-Schlüsselspeicher

<pre lang="bash">Keytool -certreq -alias mydomain -keystore keystore.jks -file mydomain.csr</pre>

Importieren Sie ein Stamm- oder Zwischen-CA-Zertifikat in einen vorhandenen Java-Schlüsselspeicher

<pre lang="bash">Keytool -import -trustcacerts -alias root -datei mydomain.ca -keystore keystore.jks</pre>

Importieren Sie ein signiertes primäres Zertifikat in einen vorhandenen Java-Schlüsselspeicher

<pre lang="bash">Keytool -import -trustcacerts -alias mydomain -datei mydomain.crt -keystore keystore.jks</pre>

Erstellen Sie einen Keystore und ein selbst signiertes Zertifikat (siehe Erstellen eines selbst signierten Zertifikats mithilfe von Java Keytool für weitere Informationen)

<pre lang="bash">Keytool -genkey -keyalg RSA -alias selfsigned -keystore keystore.jks -storepass password -validity 360 -keysize 2048</pre>

### Java Keytool Befehle für die Prüfung

Wenn Sie die Informationen in einem Zertifikat oder einem Java-Schlüsselspeicher überprüfen müssen, verwenden Sie diese Befehle. Überprüfen Sie ein eigenständiges Zertifikat

<pre lang="bash">Keytool -printcert -v -file mydomain.crt</pre>

Überprüfen Sie, welche Zertifikate sich in einem Java-Schlüsselspeicher befinden

<pre lang="bash">Keytool -list -v -keystore keystore.jks</pre>

Überprüfen Sie einen bestimmten Keystore-Eintrag mithilfe eines Alias

<pre lang="bash">Keytool -list -v -keystore keystore.jks -alias mydomain</pre>

Prüfen wie lang ein Zertifikat gültig ist.

<pre lang="bash">Keytool -printcert -v -file ~/mydomain.crt |grep "Valid from"
Valid from: Sat Aug 06 23:35:07 UTC 2016 until: Sun Aug 06 23:35:07 UTC 2017
</pre>

### Andere Java Keytool Befehle

Löschen Sie ein Zertifikat aus einem Java Keytool-Schlüsselspeicher

<pre lang="bash">Keytool -delete -alias mydomain -keystore keystore.jks</pre>

Ändern eines Java Keystore-Kennworts

<pre lang="bash">Keytool -storepasswd -new new_storepass -keystore keystore.jks</pre>

Exportieren Sie ein Zertifikat aus einem Schlüsselspeicher

<pre lang="bash">Keytool -export -alias mydomain -file mydomain.crt -keystore keystore.jks</pre>

Liste Vertrauenswürdige CA Certs

<pre lang="bash">Keytool -list -v -keystore $JAVA_HOME/jre/lib/security/cacerts</pre>

Importieren Sie neue CA in vertrauenswürdige Certs

<pre lang="bash">Keytool -import -trustcacerts -file /home/user/mydomain.ca -alias CA_ALIAS -keystore $JAVA_HOME/jre/lib/security/cacerts</pre>

Wenn Sie ein Zertifikat von Java Keytool auf Apache oder einen anderen Systemtyp verschieben möchten, schauen Sie sich diese Anleitung zum Konvertieren eines Java Keytool Keystores mit OpenSSL an.
Weitere Informationen finden Sie in der Java Keytool-Dokumentation oder in unseren Tomcat SSL-Installationsanweisungen, die Java Keytool verwenden.

**ACHTUNG** das Default Passwort für den Keystore ist _**changeit**_ . Sonst muss _**keystorePass = 'userpassword'**_ in die server.xml file.
