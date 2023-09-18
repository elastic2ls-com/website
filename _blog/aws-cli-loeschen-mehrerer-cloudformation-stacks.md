---
layout: post
title: AWS cli löschen mehrerer Cloudformation stacks
subtitle: Wenn man zu Testzwecken mal viele Stacks erstellt hat und diese nicht mehr benötigt ist es sehr lästig diese über die Webconsole zu löschen.
keywords: [AWS Cloudformation cli Stacks Webconsole Bash --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE StackName StackStatus list-stacks]
categories: [Howtos]
---
# {{ page.title }}

Wenn man zu Testzwecken mal viele Stacks erstellt hat und diese nicht mehr benötigt ist es sehr lästig diese über die Webconsole zu löschen. ![stackoverview_1](../../img/stackoverview_1.webp)

Dies geht super einfach mit der AWS cli und ein bischen Kenntniss der Bash. Zuerst lassen wir uns die Stacks, die den Status CREATE_COMPLETE und UPDATE_COMPLETE haben, ausgeben als json.

```
bash-4.2$ aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE
        {
            "StackId": "arn:aws:cloudformation:eu-central-1:892918223948:stack/service-stats-frontend-integration/f4590d30-2858-11e8-8ce2-503f2ad2e59a",
            "StackName": "test1",
            "CreationTime": "2018-03-15T13:58:35.660Z",
            "LastUpdatedTime": "2018-03-20T14:32:58.841Z",
            "StackStatus": "CREATE_COMPLETE"
        },
```

Danach grepen wir nach den Stacknamen und entfernen das erste und die letzten zwei Zeichen.

```
bash-4.2$aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE|grep StackName |awk {' print $2'}| awk '{print substr($0,2,length($0)-3)}'
test1
test2
test3
```

Mit dem Output, umgeleitet in eine Datei könne wir nun eine while Schleife füttern, welche uns alle Stacks löscht.

```
bash-4.2$aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE|grep StackName |awk {' print $2'}| awk '{print substr($0,2,length($0)-3)}'  >stacks.txt
-bash-4.2$while read stack; do aws cloudformation delete-stack --stack-name $stack; done
```

![](../../img/stackoverview_2.webp)
