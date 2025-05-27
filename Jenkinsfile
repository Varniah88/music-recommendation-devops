pipeline {
    agent any

    environment {
        IMAGE_NAME = "music-backend"
        DOCKER_TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/Varniah88/music-recommendation-devops.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build Docker image from root Dockerfile
                    sh "docker build -t ${IMAGE_NAME}:${DOCKER_TAG} ."
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('jukebox-backend') {
                    sh 'npm install'
                    sh 'npm test' 
                }
            }
        }

        // Uncomment and customize when ready
        /*
        stage('Code Quality') {
            steps {
                echo "Run SonarQube or CodeClimate scan here"
                // sh 'sonar-scanner' or other command
            }
        }

        stage('Security Scan') {
            steps {
                echo "Run security tools like Trivy or Snyk here"
                // sh 'trivy image ${IMAGE_NAME}:${DOCKER_TAG}'
            }
        }

        stage('Deploy to Test') {
            steps {
                echo "Deploy your container to test environment here"
                // Example: sh 'docker run -d -p 3000:3000 ${IMAGE_NAME}:${DOCKER_TAG}'
            }
        }

        stage('Release to Prod') {
            steps {
                echo "Deploy to production here"
            }
        }

        stage('Monitoring Setup') {
            steps {
                echo "Set up monitoring and alerting here"
            }
        }
        */
    }

    post {
        always {
            echo 'Cleaning up...'
            sh "docker image prune -f"
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
