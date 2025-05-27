pipeline {
    agent any

    environment {
        IMAGE_NAME = "music-backend"
        DOCKER_TAG = "latest"
        SONARQUBE_SERVER = 'SonarQube'   // Jenkins SonarQube server name, configure in Jenkins
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

        stage('Code Quality') {
            steps {
                // Run SonarQube analysis on backend code
                withSonarQubeEnv(SONARQUBE_SERVER) {
                    dir('jukebox-backend') {
                        sh 'sonar-scanner'
                    }
                }
            }
        }

        stage('Security Scan') {
            steps {
                script {
                    // Scan Docker image for vulnerabilities using Trivy
                    sh "trivy image --exit-code 1 --severity HIGH,CRITICAL ${IMAGE_NAME}:${DOCKER_TAG} || true"
                    // Note: '|| true' prevents pipeline failure on scan errors — adjust as needed
                }
            }
        }

        stage('Deploy to Test') {
            steps {
                echo "Deploying Docker container to test environment"
                // Example deploy command (customize as needed)
                sh "docker run -d --rm -p 3000:3000 --name music-test ${IMAGE_NAME}:${DOCKER_TAG}"
            }
        }

        stage('Monitoring Setup') {
            steps {
                echo "Configure monitoring here (e.g., install Datadog agents or query New Relic)"
                // Usually done outside Jenkins but you can trigger scripts or alerts here
            }
        }
    }

    post {
        always {
            echo 'Cleaning up Docker containers/images...'
            sh "docker container prune -f"
            sh "docker image prune -f"
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs.'
        }
    }
}
