pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/ChaudharyVishal007/cypress-demowebshop.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t cypress-tests .'
            }
        }

        stage('Run Tests + Allure') {
            steps {
                sh '''
                docker run --rm \
                -v $PWD/allure-results:/app/allure-results \
                -v $PWD/allure-history:/app/allure-history \
                -v $PWD/allure-report:/app/allure-report \
                cypress-tests npm run allure:run:login
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'allure-report/**', allowEmptyArchive: true
        }
    }
}