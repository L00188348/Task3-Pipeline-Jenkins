pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                url: 'https://github.com/L00188348/Task3-Pipeline-Jenkins.git'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        
        stage('Tests') {
            steps {
                sh 'npm test'
            }
        }
        
        stage('Build') {
            steps {
                echo 'Building application...'
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed'
        }
    }
}