---
layout: post
title: Test cloudformation Route53 records
subtitle:  Wie schon im Beitrag Testen von DNS Records beschrieben habe ich das Script erweitert um einen automatisierten Test zu schreiben, welcher die zu testenden Subdomains aus einen Cloudformation Template nimmt.
keywords: [Test cloudformation Route53 records]
categories: [DevOps]
---
# {{ page.title }}
Wie schon im Beitrag [Testen von DNS Records](https://www.elastic2ls.com/testen-von-dns-records/) beschrieben habe ich das Script erweitert um einen automatisierten Test zu schreiben, welcher die zu testenden Subdomains aus einen Cloudformation Template nimmt.

## Script

```bash
#!/bin/bash
set -e

getsub=$(grep  "Name" elastic2ls-com.yaml |awk {'print $3'}|sed 's/\\052/*/g')

records=(NS SOA MX A CNAME AAAA TXT PTR)
getrecords=${#records[@]}

for subdomains in $getsub
        do
                for ((i=0; i<$getrecords; i++))
                        do
                                OUTPUT=$(dig $1 $subdomains ${records[$i]} |grep $subdomains |grep -v ";" |cut -d ":" -f2|grep ${records[$i]}|awk {'print $1 " " $4 " " $5'})
                                echo -e "$OUTPUT\n"|sed -e '/^ *$/d'
                        done
done
```

## Cloudformation

```yaml
AWSTemplateFormatVersion: 2010-09-09
Resources:
  zoneelastic2lscom:
    Type: 'AWS::Route53::HostedZone'
    Properties:
      Name: elastic2ls.com.
  dnselastic2lscom:
    Type: 'AWS::Route53::RecordSetGroup'
    Properties:
      HostedZoneId: !Ref zoneelastic2lscom
      RecordSets:
        - Name: elastic2ls.com.
          Type: MX
          TTL: '3600'
          ResourceRecords:
            - 50 mx0.elastic2ls.com.
  dns052elastic2lscom:
    Type: 'AWS::Route53::RecordSetGroup'
    Properties:
      HostedZoneId: !Ref zoneelastic2lscom
      RecordSets:
        - Name: \052.elastic2ls.com.
          Type: A
          TTL: '3600'
          ResourceRecords:
            - 18.197.126.221
  dnselastic2lscom:
    Type: 'AWS::Route53::RecordSetGroup'
    Properties:
      HostedZoneId: !Ref zoneelastic2lscom
      RecordSets:
        - Name: elastic2ls.com.
          Type: A
          TTL: '3600'
          ResourceRecords:
            - 18.197.126.221
  dnselastic2lscom:
    Type: 'AWS::Route53::RecordSetGroup'
    Properties:
      HostedZoneId: !Ref zoneelastic2lscom
      RecordSets:
        - Name: elastic2ls.com.
          Type: CNAME
          TTL: '3600'
          ResourceRecords:
            - www.elastic2ls.com
  dnstxtelastic2lscom:
    Type: 'AWS::Route53::RecordSetGroup'
    Properties:
      HostedZoneId: !Ref zoneelastic2lscom
      RecordSets:
        - Name: elastic2ls.com..
          Type: TXT
          TTL: '600'
          ResourceRecords:
            - >-
              "google-site-verification=nv1IwH7ZXh0VqBi4Lids5-jA_pQZ52rYJ8DGUSjRzWk"
```

## Output

```bash
elastic2ls.com. NS ns2.hans.hosteurope.de.
elastic2ls.com. NS ns1.hans.hosteurope.de.
elastic2ls.com. SOA ns1.hans.hosteurope.de.
elastic2ls.com. MX 50 mx0.elastic2ls.com
elastic2ls.com. A 18.197.126.221
elastic2ls.com. TXT "google-site-verification=nv1IwH7ZXh0VqBi4Lids5-jA_pQZ52rYJ8DGUSjRzWk"
```
