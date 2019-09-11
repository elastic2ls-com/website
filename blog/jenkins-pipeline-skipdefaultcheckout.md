---
layout: post
title: Jenkins Pipeline skip DefaultCheckout
subtitle:  Beim benutzen der Deklarativen Pipline im Jenkins wird vor der Stage in er man das SCM auscheckt in den Workspace, im Jenkinswebinterface per default Declarative Checkout SCM angezeigt.
keywords: [Jenkins Deklarative Pipline checkoutscm Jenkinsfile webinterface]
---
# {{ page.title }}

![Jenkins Pipeline](https://s.elastic2ls.com/wp-content/uploads/2018/05/23160934/jenkins-300x182.png)

Beim benutzen der Deklarativen Pipline im Jenkins wird vor der Stage in er man das SCM auscheckt in den Workspace, im Jenkinswebinterface per default **Declarative: Checkout SCM** angezeigt.

```groovy
    stages {
      stage('Checkout') {
            steps {
                cleanWs()
                checkout scm
                }
        }
```
Wenn man aber eine Stage mit dem Namen Checkout angelegt hat erscheint erscheint der Schritt doppelt.

![Jenkins Pipeline](https://s.elastic2ls.com/wp-content/uploads/2018/07/09102445/Jenkins-checkout.png)

Das kann man im Jenkinsfile recht einfach verhindern mittels **skipDefaultCheckout**.

```groovy
    options {
        skipDefaultCheckout(true)
    }
```
Nun erscheint der Schritt im Jenkinswebinterface nicht mehr. ![Jenkins Pipeline](https://s.elastic2ls.com/wp-content/uploads/2018/07/09102822/Jenkins-checkout2.png)
