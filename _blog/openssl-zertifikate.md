---
layout: post
title: OpenSSL-Zertifikat
subtitle:  OpenSSL-Zertifikate CSR erzeugen/anzeigen (Certificate Signing Request) Wenn Ihr ein offizielles OpenSSL-Zertifikat beantragen wollt, dann ist normalerweise
keywords: [OpenSSL OpenSSL CSR Keyfile Passphrase konvertieren]
categories: [Howtos]
---
# {{ page.title }}


![OpenSSL](../../img/openssl-300x81.jpg)


## OpenSSL-Zertifikat CSR erzeugen/anzeigen (Certificate Signing Request)

Wenn Ihr ein offizielles OpenSSL-Zertifikat beantragen wollt, dann ist normalerweise nur diese Datei `zertifikatsname.csr` nötig. CSR steht in dem Fall für Certificate Signing Request oder auf deutsch Zertifizierungsanforderung. Diese wird auf der Webseite Eurer CA (z.B. Godaddy, Geotrust, Startssl) hochgeladen und damit dann das endgültige OpenSSL-Zertifikat erzeugt, das ihr dann zusammen mit den Zwischenzertifikaten (intermediate-certificate) herunterladen könnt. Mit diesen Kommandos könnt ihr einen Key und das dazu gehörende CSR erstellen.

### 4096 Bit RSA-Key erzeugen
`openssl genrsa -out certificate.key`

### den CSR dazu erzeugen
`openssl req -new -sha256 -key certificate.key -out certificate.csr`

jetzt sind ein paar Fragen zu beantworten (gibt man nur einen . ein so bleibt das Feld leer)

```
Country Name (2 letter code) [AU]:DE
State or Province Name (full name) [Some-State]:NRW
Locality Name (eg, city) []:Fuerth
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Deine Firma
Organizational Unit Name (eg, section) []:.

Common Name (eg, YOUR name) []:www.meinedomain.de
Email Address []:webmaster@meinedomain.de

Please enter the following 'extra' attributes to be sent with your certificate request
A challenge password []:
An optional company name []:
```

Optional kann man den Key mit einer Passphrase versehen. Diese Passphrase wird dann z.B. beim Starten von Apache abgefragt. Aber Vorsicht: Ein automatischer Start des Apachen ist dann nur noch mit weiteren Tricks möglich.

`openssl rsa -des3 -in certificate.key -out certificate.sec`


### einen CSR (Zertifikatsrequest) anzeigen

`openssl req -noout -text -in request.csr`


## Anzeigen/Prüfen

### OpenSSL-Zertifikat komplett anzeigen

`openssl x509 -noout -text -in certificate.crt`

### den Herausgeber des Zertifikats anzeigen

`openssl x509 -noout -issuer -in certificate.crt`

### Für wen wurde das Zertifikat ausgestellt?

`openssl x509 -noout -subject -in certificate.crt`

### Für welchen Zeitraum ist das OpenSSL-Zertifikat gültig?

`openssl x509 -noout -dates -in certificate.crt`

### das obige kombiniert anzeigen

`openssl x509 -noout -issuer -subject -dates -in certificate.crt`

### den hash anzeigen

`openssl x509 -noout -hash -in certificate.crt`

### den MD5-Fingerprint anzeigen

`openssl x509 -noout -fingerprint -in certificate.crt`

### ein SSL-Zertifikat prüfen

`openssl verify -CApath /etc/pki/tls/certs -verbose certificate.crt`

### einen SSL-Port auf Zertifikate abfragen

`echo QUIT | openssl s_client -CApath /etc/pki/tls/certs -connect localhost:636 -showcerts`

### ein HTTPS-Serverzertifikat runterladen

`echo QUIT | openssl s_client -connect www.elastic2ls.com:443 | sed -ne '/BEGIN CERT/,/END CERT/p'`

### Gültigkeit eines HTTPS-Serverzertifikats anzeigen

`echo QUIT | openssl s_client -connect www.elastic2ls.com:443 2>/dev/null | sed -ne '/BEGIN CERT/,/END CERT/p' | openssl x509 -noout -text | grep -A2 Validity`

## Passphrase entfernen/ändern

### Passphrase für ein Keyfile entfernen

`openssl rsa -in certificate.key -out new-certificate.key`

### Passphrase für ein Keyfile ändern

`openssl rsa -des3 certificate.key -in -out new-certificate.key`

## Selbstsignierte OpenSSL-Zertifikat erstellen

Diese Zertifikate können für interne Zwecke eingesetzt werden oder für den Zeitraum bis man von der Trusted CA sein richtiges Zertifikat bekommt. Mit wenigen Schritten ist ein solches Zertifikat erstellt, diese Beispiel erzeugt ein für 60 Tage gültiges Zertifikat:

```
openssl genrsa -out certificate.key
[...]
openssl req -new -sha256 -key certificate.key -out certificate.csr #(siehe oben)
[...]
openssl x509 -req -sha256 -days 60 -in certificate.csr -signkey certificate.key -out certificate.crt
[...]
```

## Prüfen ob ein Zertifikat zu einem Key passt

Der private Teil eines Schlüssels enthält verschiedene Zahlen. Zwei dieser Zahlen bilden den „Publiy Key“ (diese Zahlen sind dann auch im Zertifikat erhalten), der Rest gehört zum „Private Key“. Um zu prüfen, ob der public key zum private key passt, können diese beiden Zahlen ausgelesen und verglichen werden.

### Zertifikate

`$ openssl x509 -noout -modulus -in server.crt | openssl md5`

### Private Schlüssel

`$ openssl rsa -noout -modulus -in server.key | openssl md5`

### Zertifikatsanforderung
`$ openssl req -noout -modulus -in server.csr | openssl md5`

## Zertifikate konvertieren

### CRT nach PEM

`openssl x509 -in certificate.crt -out certificate.pem -outform PEM`

### PEM nach DER

`openssl x509 -outform der -in certificate.pem -out certificate.der`

### PEM nach P7B

`openssl crl2pkcs7 -nocrl -certfile certificate.cer -out certificate.p7b -certfile CACert.cer`

### PEM nach PKCS12 (P12)

`openssl pkcs12 -export -out certificate.p12 -inkey userkey.pem -in usercert.pem`

### PEM nach PFX

`openssl pkcs12 -export -out certificate.pfx -inkey privateKey.key -in certificate.crt -certfile CACert.crt`

### DER nach PEM

`openssl x509 -inform der -in certificate.cer -out certificate.pem`

### P7B nach PEM

`openssl pkcs7 -print_certs -in certificate.p7b -out certificate.cer`

### P7B nach PFX

`openssl pkcs7 -print_certs -in certificate.p7b -out certificate.cer
openssl pkcs12 -export -in certificate.cer -inkey privateKey.key -out certificate.pfx -certfile CACert.cer`
### PFX nach PEM

`openssl pkcs12 -in certificate.pfx -out certificate.cer -nodes`

Mit OpenSSL ist es auch möglich für den Tomcat einen Key im PKCS12 Format zu erstellen.

```
openssl pkcs12 -export -in domain.de.crt -inkey domain.de.key -out domain.de.p12 -CAfile domain.ca -caname domain.de -name tomcat -chain
```

Achtung -name gibt den Alias an, der verwendet wird um den Key mit keytool in den Java Keystore zu importieren.

```
/usr/java/latest/bin/keytool -importkeystore -deststorepass "changeit" -destkeypass "changeit" -destkeystore "/etc/tomcat/domain.de.keystore" -srckeystore "domain.de.p12" -srcstoretype PKCS12 -srcstorepass "changeit" -alias tomcat
```
Wenn ihr den Fehler _**Error unable to get local issuer certificate getting chain.**_ erhaltet müsst ihr zuerst das intermediate Zertifikat und das eurer Domain zusammen in einer Datei speichern.

```
cat domain.de.ca /etc/pki/tls/certs/ca-bundle.crt > combined.ca
openssl pkcs12 -export -in domain.de.crt -inkey domain.de.key -out domain.de.p12 -name tomcat -CAfile combined.ca -caname domain.de -chain
```


Anschließend sollte man den Keystore prüfen.

```
keytool -list -v -storetype pkcs12 -keystore domain.de.p12
Keystore-Kennwort eingeben:
Keystore-Typ: PKCS12
Keystore-Provider: SunJSSE

Keystore enthält 1 Eintrag

Aliasname: tomcat
Erstellungsdatum: 10.05.2017
Eintragstyp: PrivateKeyEntry
Zertifikatskettenlänge: 3
Zertifikat[1]:
Eigentümer: CN=*.domain.de
```
