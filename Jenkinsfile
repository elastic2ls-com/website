properties([parameters([choice(choices: ['approval', 'production'], description: 'Choose stage to prepare build for.', name: 'STAGE')])])
pipeline {
    agent any
    environment {
        def current_time = sh(script: "echo `date +%Y.%m.%d-%H.%M.%S)`", returnStdout: true).trim()
        param = "push_static_files_$current_time"
    }
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
              sh 'sed -i `s/url: "https://www.elastic2ls.com"/url: "https://www-appr.elastic2ls.com"/g` _config.yml'
              sh 'sed -i `s/title: www.elastic2ls.com/title: www-appr.elastic2ls.com/g` _config.yml'
              sh 'sed -i `/gtag/d` _config.yml'
              sh 'sed -i `/gtm/d` _config.yml'
            } else if ("${STAGE}" == "production"){
              sh 'sed -i `s/url: "https://www.elastic2ls.com"/url: "https://www.elastic2ls.com"/g` _config.yml'
              sh 'sed -i `s/title: www.elastic2ls.com/title: www.elastic2ls.com/g` _config.yml'
            }
          }
        }
      }
      stage('Docker build & run') {
        steps {
          sh '''
            mkdir _site
            docker build -t elastic2ls-jekyll "$PWD"
            docker run -d -p 4000:4000 --name elastic2ls-jekyll -v "$PWD":/srv/jekyll elastic2ls-jekyll
            docker logs elastic2ls-jekyll
          '''
        }
      }
      stage('Push static files') {
         steps {
           withCredentials([usernamePassword(credentialsId: 'GITHUB', passwordVariable: 'PASSWORD', usernameVariable: 'USERNAME')]) {
             sh '''
               rm -rf ${WORKSPACE}/.git/
               sleep 15
               sudo chmod -R 777 ${WORKSPACE}/_site/
               cd ${WORKSPACE}/_site/
               git init
               git add .
               git commit -m "push_static_files_$param"
               git remote add origin https://github.com/elastic2ls-awiechert/elastic2ls_static_file.git
            '''
            sh "cd ${WORKSPACE}/_site/ && git push https://${USERNAME}:${PASSWORD}@github.com/elastic2ls-awiechert/elastic2ls_static_file HEAD:refs/heads/master --force"
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
    post {
           always {
             echo "${param}"
           }
         }
}
