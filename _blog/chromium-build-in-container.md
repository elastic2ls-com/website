---
layout: post
title: Chromium Build im Container
subtitle: In diesem Beitrag zeige ich euch, wie ihr Chromiun im Container bauen könnt. Das ganz  kann man dann prima in eine CI/CD Pipeline integrieren.
keywords: [Chromium Build Container]
categories: [DevOps]
---
# {{ page.title }}

![Chromium](../../img/chromium300x300.webp)


Wenn du diesen Felher angezeigt bekommst kann das u.a. daran liegen, dass du curl oder wget nicht installiert hast. 

```
root@459b0434b5e3:/# fetch
^C/depot_tools/vpython3: line 45: /depot_tools/.cipd_bin/vpython3: No such file or directory
root@1c6e3b6ae01a:/# gclient 
Updating depot_tools... Your platform is missing a supported fetch command. Please use your package manager to install one before continuing:

curl wget

Alternately, manually download:
https://chrome-infra-packages.appspot.com/client?platform=linux-amd64&version=git_revision:6e9be28a4c4e3a804f400dc6c2ed08b866f0a38b To /depot_tools/.cipd_client, and then re-run this command. Your platform is missing a supported fetch command. Please use your package
```
