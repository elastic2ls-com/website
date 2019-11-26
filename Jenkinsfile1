// used for Job elastic2ls_static_file
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
      stage('Docker build & run') {
        steps {
          sh '''
            mkdir _site
            docker build -t elastic2ls-jekyll:static_$BUILD_NUMBER "$PWD"
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
