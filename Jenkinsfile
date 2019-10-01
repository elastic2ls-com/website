pipeline {
    agent any
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
      stage('Docker build & run') {
        steps {
          sh '''
            DOCKERRUNNING=$(docker ps |grep elastic2ls-jekyll)
            if [ -z $DOCKERRUNNING ]; then
              echo "Container previusly stopped as expected during build."
            else
              docker stop elastic2ls-jekyll && docker rm elastic2ls-jekyll
              echo "Container was running before. We stopped it."
            fi

          '''
          sh '''
            docker build -t elastic2ls-jekyll "$PWD"
            docker run -d -p 4000:4000 --name elastic2ls-jekyll elastic2ls-jekyll
            docker logs elastic2ls-jekyll
          '''
        }
      }
      stage('Test') {
        steps {
          sh 'sleep 15 && curl -s http://localhost:4000 |grep -iF "Copyright 2019 elastic2ls" '
        }
      }
      stage('Docker destroy') {
        steps {
          sh 'docker stop elastic2ls-jekyll && docker rm elastic2ls-jekyll'
        }
      }
    }
}
