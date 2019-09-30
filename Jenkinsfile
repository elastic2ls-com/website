pipeline {
    agent { dockerfile true }
    options {
        skipDefaultCheckout(true)
    }
    stages {
      stage('Checkout') {
            steps {
              script {
                cleanWs()
                checkout scm
                gitCommit = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
              }
            }
          }
        stage('Test') {
            steps {
                sh 'curl localhost:4000'
            }
        }
    }
}
