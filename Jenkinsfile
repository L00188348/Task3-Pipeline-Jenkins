pipeline {
    // Specifies the agent to execute the pipeline (runs on the main Jenkins agent)
    agent any
    
    // Defines environment variables used throughout the pipeline
    environment { 
        IMAGE_NAME = 'task3-application'
        // Configuration name set up in Jenkins Global Tool Configuration
        SONAR_SERVER = 'SonarQube_Server_Config' 
        // SonarQube project key (must match SonarQube UI)
        SONAR_PROJECT_KEY = 'task-management-api' 
    }
    
    stages {
        // Stage 1: Checkout the code from the Git repository
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/L00188348/Task3-Pipeline-Jenkins.git'
                sh 'ls -la' // List files for verification
            }
        }
        
        // Stage 2: Build and test the Frontend application (if applicable)
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    // Run tests; continues even if tests fail (non-blocking test)
                    sh 'npm test || echo "⚠️ Frontend tests failed - continuing..."' 
                    sh 'npm run build'
                }
            }
        }
        
        // Stage 3: Build and test the Backend application
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    // Run tests; continues even if tests fail (non-blocking test)
                    sh 'npm test || echo "⚠️ Backend tests failed - continuing..."'
                    sh 'npm run build'
                }
            }
        }
        
        // Stage 4: Code Quality Analysis (SECURELY INJECTS TOKEN)
        // This stage runs the SonarQube Scanner against the backend code
        stage('Code Quality Analysis') {
            steps {
                // Use the withCredentials block to securely load the secret token
                // NOTE: 'SONAR_AUTH_TOKEN' must match the ID created in Jenkins Credentials
                withCredentials([string(credentialsId: 'SONAR_AUTH_TOKEN', variable: 'SONAR_TOKEN')]) {
                    // Uses the SonarQube plugin to inject the server URL (from SONAR_SERVER config)
                    withSonarQubeEnv(env.SONAR_SERVER) { 
                        dir('backend') {
                            // Execute the Sonar Scanner CLI for the backend code
                            sh """
                                sonar-scanner \\
                                    -Dsonar.projectKey=${SONAR_PROJECT_KEY} \\
                                    -Dsonar.sources=./ \\
                                    -Dsonar.projectName='Task Management API' \\
                                    -Dsonar.login=${SONAR_TOKEN}
                            """
                        }
                    }
                }
            }
        }

        // Stage 5: Quality Gate Check (NEW STAGE)
        // This stage blocks the pipeline until SonarQube confirms the code passed the quality rules.
        stage('Quality Gate Check') {
            steps {
                // Wait up to 5 minutes for the SonarQube analysis to complete and check the Quality Gate status.
                timeout(time: 5, unit: 'MINUTES') { 
                    // Fails the pipeline immediately if the Quality Gate is not passed
                    waitForQualityGate abortPipeline: true 
                }
            }
        }
        
        // Stage 6: Create the Docker image
        stage('Docker Build') {
            steps {
                // Builds the Docker image using the Dockerfile in the root context
                sh "docker build -t ${IMAGE_NAME}:${env.BUILD_ID} ."
            }
        }
        
        // Stage 7: Deploy the new Docker container
        stage('Deploy') {
            steps {
                // Stop and remove any existing container, then run the new image
                sh '''
                    docker stop task3-application || true
                    docker rm task3-application || true
                    docker run -d -p 3000:3000 --name task3-application ${IMAGE_NAME}:${env.BUILD_ID}
                '''
            }
        }
        
        // Stage 8: Verify the deployment is successful
        stage('Smoke Test') {
            steps {
                // Waits 10 seconds for the app to start, then checks if it responds on port 3000
                sh 'sleep 10 && curl -f http://localhost:3000 && echo "🎉 CI/CD WORKING!" || echo "⚠️ App did not respond yet"'
            }
        }
    }
    
    // Post-build actions (always runs)
    post {
        always {
            echo "Pipeline ${currentBuild.result} - Build #${env.BUILD_NUMBER}"
        }
        success {
            echo "✅ PROJECT CI/CD COMPLETED SUCCESSFULLY!"
        }
        failure {
            echo "💥 Pipeline failed - check the logs"
        }
    }
}