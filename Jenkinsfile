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
            mkdir _site
            docker build -t elastic2ls-jekyll "$PWD"
            docker run -d -p 4000:4000 --name elastic2ls-jekyll -v "$PWD":/srv/jekyll elastic2ls-jekyll
            docker logs elastic2ls-jekyll
          '''
        }
      }
      // stage('Push static files') {
      //   steps {
      //     withCredentials([usernamePassword(credentialsId: 'GITHUB', passwordVariable: 'PASSWORD', usernameVariable: 'USERNAME')]) {
      //               sh '''
      //               current_time=$(date "+%Y.%m.%d-%H.%M.%S")
      //               sudo chmod -R 777 ${WORKSPACE}/_site/
      //               cd ${WORKSPACE}/_site/
      //               git init
      //               git add ${WORKSPACE}/_site/*
      //               git commit -m "push_static_files_$current_time"
      //               git remote add origin https://github.com/elastic2ls-awiechert/elastic2ls_static_file.git
      //               '''
      //               sh "git push https://${USERNAME}:${PASSWORD}@github.com/elastic2ls-awiechert/elastic2ls_static_file HEAD:refs/heads/master --force"
      //     }
      //   }
      // }

      stage('Push static files') {
         steps {
           withCredentials([usernamePassword(credentialsId: 'GITHUB', passwordVariable: 'PASSWORD', usernameVariable: 'USERNAME')]) {
             sh 'sleep 20'
             sh 'mkdir ${WORKSPACE}/staticfiles'
             sh 'rsync -avrzulP ${WORKSPACE}/_site/ staticfiles/'
             sh 'cd ${WORKSPACE}/staticfiles/'
             sh 'git init'
             sh 'git add .'
             sh 'git commit -m "push_static_files_"'
             // sh 'git remote add origin https://github.com/elastic2ls-awiechert/elastic2ls_static_file.git'
             sh "git push https://${USERNAME}:${PASSWORD}@github.com/elastic2ls-awiechert/elastic2ls_static_file HEAD:refs/heads/master --force"
           }
         }
       }

      // stage('Docker destroy') {
      //   steps {
      //     sh 'docker stop elastic2ls-jekyll && docker rm elastic2ls-jekyll'
      //     sh 'docker images |grep elastic2ls-jekyll'
      //     sh 'docker rmi elastic2ls-jekyll'
      //   }
      // }

    }
}
