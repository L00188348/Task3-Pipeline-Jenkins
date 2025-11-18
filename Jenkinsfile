pipeline {
    agent any
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                url: 'https://github.com/L00188348/Task3-Pipeline-Jenkins.git'
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
            }
        }
        
        stage('Test Backend') {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        
        stage('Deploy to Staging') {
            steps {
                script {
                    // Iniciar backend
                    sh 'cd backend && npm start &'
                    
                    // Aguardar e testar
                    sleep 30
                    sh 'curl -f http://localhost:3000/health || exit 1'
                    
                    echo '🚀 Application deployed successfully!'
                    echo '📊 Backend: http://localhost:3000'
                    echo '🎨 Frontend: http://localhost:3000'
                }
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline execution completed'
        }
        success {
            echo '✅ CI/CD Pipeline SUCCESS - Application deployed!'
        }
        failure {
            echo '❌ Pipeline FAILED - Check logs above'
        }
    }
}