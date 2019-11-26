// used for Job elastic2ls_website
properties([parameters([choice(choices: ['approval', 'production'], description: 'Choose stage to prepare build for.', name: 'STAGE')])])
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
      stage('Config adjustment') {
        steps {
          script {
            if ("${STAGE}" == "approval" ){
              sh 'sed -i "s/www.elastic2ls.com/www-appr.elastic2ls.com/g" _config.yml'
              sh 'sed -i "/gtag/d" _config.yml'
              sh 'sed -i "/gtm/d" _config.yml'
            } else if ("${STAGE}" == "production"){
              sh 'sed -i "s/www.elastic2ls.com/www.elastic2ls.com/g" _config.yml'
            }
          }
        }
      }
      stage('Docker build & run') {
        steps {
          sh '''
            mkdir _site
            docker build -t elastic2ls-jekyll:website_$BUILD_NUMBER "$PWD"
            docker run -d -p 4000:4000 --name elastic2ls-jekyll -v "$PWD":/srv/jekyll elastic2ls-jekyll:website_$BUILD_NUMBER
            docker logs elastic2ls-jekyll
          '''
        }
      }


        stage('Smoke Tests') {
          steps {
            sh 'nc -zv 127.0.0.1 4000'
            //sh 'curl -L -s localhost:4000 |grep -iF "Copyright 2019 elastic2ls"'
          }
        }
        stage('Rewrite Tests') {
          steps {
            catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
              script {
                REDIRECTS = sh (script: 'cd test/ && chmod +x get.sh && ./get.sh |grep 404 -B1|grep -v 404', returnStdout: true).trim()
                FOUROFOUR = sh (script: 'cd test/ && chmod +x get.sh && ./get.sh |grep 404', returnStdout: true).trim()
                if ("${FOUROFOUR}" == "HTTP/1.1 404 Not Found" ){
                  echo "${REDIRECTS}"
                  error('Found 404 redirect.')
                }
              }
            }
          }
        }



      stage('Docker destroy') {
        steps {
          sh 'docker stop elastic2ls-jekyll && docker rm elastic2ls-jekyll'
          sh 'docker images |grep elastic2ls-jekyll'
          sh 'docker rmi elastic2ls-jekyll'
        }
      }
    }
}
