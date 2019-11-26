---
layout: post
title: Jenkins trigger another job with parameters
subtitle:  Wenn man innnerhalb der Jenkinspipeline ein anderes Repository auschecken muss, abseits von dem in welchem die Configuration (Jenkinsfile u.a.), geht das mit folgendem Snippet.
keywords: [Jenkins Builds Pipline checkout Jenkinsfile SSH Credentials ]
categories: [DevOps]
---
# {{ page.title }}

![Jenkinsfile Pipeline](../../img/jenkins-300x182.png)

Nehmen wir an ich möchte einen Jenkinsjob haben, der einen zweiten Job triggert. Dies ist recht einfach möglich mittels der Post Aktion einer Stage. Natürlich müssen beide Jobs zuerst engelegt werden.

## Job1

```
pipeline {
    agent any
    environment {
      Passed_Param = "elastic2ls_apache:$BUILD_NUMBER"
    }
    stages {
        stage('Beispiel') {
            steps {
                echo "$Passed_Param"
            }
        }
    }
    post {
        always {
                 build job: 'test2'
        }
    }
}
```

## Job2
```
pipeline {
    agent any
    stages {
        stage('Example') {
            steps {
                echo "erfolgreich von Job1 gestartet."
            }
        }
    }
}
```

### Ergebnis
In der Jenkinsoberfläche sind beide Jobs nun erfolgreich gelaufen. Und man sieht im Consolen Output, dass Job2 von Job1 gestartet wurde. ***Started by upstream project "job1" build number 41***

![Jenkinsjob1console](../../img/Jenkins-job1_console.png)
![Jenkinsjob2console](../../img/Jenkins-job2_console.png)

Wie man sieht lief Job1 und hat erfolgreich Job2 gestartet. In meinem Projekt war mir das aber nicht genug, sondern ich benötige einen Parameter aus dem ersten Job. Das war in diesem Fall der Name und Tag eines Dockerimages, welches aus dem Namen **elastic2ls_apache** und dem Tag **$BUILD_NUMBER** besteht. Der Tag ist die Jenkinsvariable der Buildnummer.

Eine minimalistische Pipeline legt den zu übergeben Parameter als Environment Variable an.  In der Stage *Beispiel* wird die angelegte Variable mittels *echo*  in den Consolen Output geschrieben. In der Post Aktion, welche mit *always* immer ausgeführt wird, übergeben wir die Environment Variable als String Parameter.

## Job1 mit Parameter
```
pipeline {
    agent any
    environment {
      Passed_Param = "elastic2ls_apache:$BUILD_NUMBER"
    }
    stages {
        stage('Beispiel') {
            steps {
                echo "$Passed_Param"
            }
        }
    }
    post {
        always {
                 build job: 'test2',
                    parameters: [[$class: 'StringParameterValue', name: 'passed_param', value: String.valueOf(Passed_Param)]]
        }
    }
}
```

## Job2 mit Parameter

```
pipeline {
    agent any
    stages {
        stage('Example') {
            steps {
                echo params.passed_param
            }
        }
    }
}
```

### Ergebnis
Wie man sieht wurde der Parameter erfolgreich übergeben. ***elastic2ls_apache:43***

![Jenkins-job1__parameter_console](../../img/Jenkins-job1__parameter_console.png)
![Jenkins-job2__parameter_console](../../img/Jenkins-job2__parameter_console.png)
