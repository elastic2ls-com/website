---
layout: post
title: Testen von DNS records
subtitle:  Zum Thema Testen von DNS records habe ich unten stehends kurzes Bash Script welches die gängigsten DNS Recordtypen abfragt gebaut.
keywords: [DNS named bind testen records Recordtypen]
categories: [dns]
---
# {{ page.title }}

Zum Thema Testen von DNS records habe ich unten stehends kurzes Bash Script welches die gängigsten DNS Recordtypen abfragt gebaut.

```bash
#!/bin/bash

records=(NS SOA MX CNAME A AAAA TXT PTR)
getrecords=${#records[@]}

if [[ -z $1 ]];then
        echo -e "Usage $0 domainname\nOptionaly with the nameserver you want to query. $0 domainname @1.1.1.1"
else

        for ((i=0; i&lt;$getrecords; i++))
                do
                        OUTPUT=$(dig $1 $2 ${records[$i]} |grep $1 |grep -v ";" |grep ${records[$i]})
                        echo -e "$OUTPUT\n"
                done
fi
```
## Beispiel ohne Parameter:

```
alex@host1:~$ ./dnscheck.sh
Usage ./dnscheck.sh domainname
Optionaly with the nameserver you want to query. ./dnscheck.sh domainname @1.1.1.1
```

## Beispiel mit Domain als Parameter:

```
alex@host1:~$ ./dnscheck.sh elastic2ls.com
elastic2ls.com.		172800	IN	NS	ns1.hans.hosteurope.de.
elastic2ls.com.		172800	IN	NS	ns2.hans.hosteurope.de.
elastic2ls.com.		2560	IN	SOA	ns1.hans.hosteurope.de. hostmaster.elastic2ls.com. 2018051703 16384 2048 1048576 2560
elastic2ls.com.		86400	IN	MX	50 mx0.elastic2ls.com.
elastic2ls.com.		86400	IN	A	18.197.126.221
elastic2ls.com.		86400	IN	TXT	"google-site-verification=nv1"
```

## Beispiel mit Domain und Nameserver als Parameter:

```
alex@host1:~$ ./dnscheck.sh elastic2ls.com @1.1.1.1
elastic2ls.com.		172800	IN	NS	ns1.hans.hosteurope.de.
elastic2ls.com.		172800	IN	NS	ns2.hans.hosteurope.de.
elastic2ls.com.		2560	IN	SOA	ns1.hans.hosteurope.de. hostmaster.elastic2ls.com. 2018051703 16384 2048 1048576 2560
elastic2ls.com.		86400	IN	MX	50 mx0.elastic2ls.com.
elastic2ls.com.		86400	IN	A	18.197.126.221
elastic2ls.com.		86400	IN	TXT	"google-site-verification=nv1"
```
