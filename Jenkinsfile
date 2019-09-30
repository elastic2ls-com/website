pipeline {
    agent { dockerfile true }
    options {
        skipDefaultCheckout(true)
    }
    stages {
      stage('Checkout') {
         steps {
           checkout([
           $class: 'GitSCM', branches: [[name: '*/master']],
           userRemoteConfigs: [[url: 'https://github.com/elastic2ls-awiechert/docker-jekyll.git']]
           ])
          }
       }
        stage('Test') {
            steps {
                sh 'curl localhost:4000'
            }
        }
    }
}
