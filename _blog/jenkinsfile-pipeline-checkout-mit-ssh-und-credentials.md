---
layout: post
title: Jenkinsfile Pipeline checkout mit SSH und Credentials
subtitle:  Wenn man innnerhalb der Jenkinspipeline ein anderes Repository auschecken muss, abseits von dem in welchem die Configuration (Jenkinsfile u.a.), geht das mit folgendem Snippet.
keywords: [Jenkins Builds Pipline checkout Jenkinsfile SSH Credentials ]
categories: [DevOps]
---
# {{ page.title }}

![Jenkinsfile Pipeline](https://s.elastic2ls.com/wp-content/uploads/2018/05/23160934/jenkins-300x182.png)

Wenn man innnerhalb der Jenkinspipeline ein anderes Repository auschecken muss, abseits von dem in welchem die Konfiguration (Jenkinsfile u.a.) gespeichert ist, geht das mit folgendem Snippet. [![](https://s.elastic2ls.com/wp-content/uploads/2018/07/16104247/credentials-1024x938.png)](https://s.elastic2ls.com/wp-content/uploads/2018/07/16104247/credentials.png)

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

[Quelle]

[https://stackoverflow.com/questions/39451345/using-credentials-from-jenkins-store-in-a-jenkinsfile](https://stackoverflow.com/questions/39451345/using-credentials-from-jenkins-store-in-a-jenkinsfile)
