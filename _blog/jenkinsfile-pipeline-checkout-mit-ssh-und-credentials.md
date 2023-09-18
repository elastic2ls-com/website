---
layout: post
title: Jenkinsfile Pipeline checkout mit SSH und Credentials
subtitle:  Wenn man innnerhalb der Jenkinspipeline ein anderes Repository auschecken muss, abseits von dem in welchem die Configuration (Jenkinsfile u.a.), geht das mit folgendem Snippet.
keywords: [Jenkins Builds Pipline checkout Jenkinsfile SSH Credentials ]
categories: [DevOps]
---
# {{ page.title }}

![Jenkinsfile Pipeline](../../img/jenkins-300x182.webp)

Wenn man innnerhalb der Jenkinspipeline ein anderes Repository auschecken muss, abseits von dem in welchem die Konfiguration (Jenkinsfile u.a.) gespeichert ist, geht das mit folgendem Snippet. ![Jenkinsfile Pipeline](../../img/credentials-1024x938.webp)

```
         stage('Checkout') {
            steps {
              checkout([
              $class: 'GitSCM', branches: [[name: '*/master']],
              userRemoteConfigs: [[url: 'git@github.com:elastic2ls-com/lighthouse.git',credentialsId: 'deployKey']]
              ])
            }
        }
```
