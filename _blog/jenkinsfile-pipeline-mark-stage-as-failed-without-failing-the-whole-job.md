---
layout: post
title: Jenkins declarative Pipeline Stage als fehlerhaft markieren ohne den Build abzubrechen
subtitle:  In der deklarativen Jenkins Pipeline eine Stage als fehlerhaft markieren ohne den Build abzubrechen.
keywords: [Jenkins Builds Pipline Stage mark failed]
categories: [DevOps]
---
# {{ page.title }}

![Jenkinsfile Pipeline](../../img/jenkins-300x182.png)

Wenn man innnerhalb der deklarativen Jenkinspipeline eine Stage als fehlerhaft markieren will/soll, da z.B. ein Test fehlschlägt, man aber deswegen nicht den ganzen Job abbrechen lassen will, geht das wie folgt.

 ![Jenkinsfile Pipeline](../../img/Jenkins_mark_stage_as_failed.png)

```
pipeline {
    agent any
    stages {
        stage('start') {
            steps {
                sh 'exit 0'
            }
        }
        stage('weiter') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    sh "exit 1"
                }
            }
        }
        stage('fertig') {
            steps {
                sh 'exit 0'
            }
        }
    }
}
```

Im obigen Beispiel wird die Stage "weiter" mit _exit 1_ nun als fehlerhaft markiert, aber der Buildjob als ganzes nicht mehr abgebrochen. Ausserdem markieren wir den Buildjob als UNSTABLE, was zur folge hat, dass der Job nicht mehr grün eingefärbt ist sondern gelb.
