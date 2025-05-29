pipeline {
    agent any

    environment {
        IMAGE_NAME = "music-backend"
        DOCKER_TAG = "latest"
        SONARQUBE_SERVER = 'SonarQube'
    }

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/Varniah88/music-recommendation-devops.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat "docker build -t ${IMAGE_NAME}:${DOCKER_TAG} ."
            }
        }

        stage('Run Tests') {
            steps {
                dir('jukebox-backend') {
                    bat 'npm install'
                    bat 'npm test'
                }
            }
        }

        stage('Code Quality') {
            steps {
                withSonarQubeEnv(SONARQUBE_SERVER) {
                    script {
                        def scannerHome = tool 'SonarQube'
                        dir('jukebox-backend') {
                            bat "${scannerHome}\\bin\\sonar-scanner.bat"
                        }
                    }
                }
            }
        }

        stage('Security Scan') {
            steps {
                bat """
                docker run --rm ^
                    -v //var/run/docker.sock:/var/run/docker.sock ^
                    aquasec/trivy:latest image --exit-code 1 --severity HIGH,CRITICAL ${IMAGE_NAME}:${DOCKER_TAG} || exit 0
                """
            }
        }

            stage('Deploy to Test') {
                steps {
                    script {
                        echo "Stopping existing test container (if any)..."
                        bat '''
                        docker-compose -f docker-compose.test.yml down || echo "No existing container to stop"
                        '''
                        
                        echo "Starting test environment container(s)..."
                        bat "docker-compose -f docker-compose.test.yml up -d"
                        
                        echo "Checking health status..."
                        def retries = 5
                        def success = false
                        for (int i = 0; i < retries; i++) {
                            def status = bat(
                                script: 'docker inspect --format="{{json .State.Health.Status}}" music-backend',
                                returnStdout: true
                            ).trim()
                            
                            if (status == '"healthy"') {
                                success = true
                                break
                            }
                            
                            echo "Waiting for container to become healthy... retry ${i + 1}/${retries}"
                            sleep(time: 15, unit: 'SECONDS')
                        }
                        
                        if (!success) {
                            error("Deployment failed: container did not become healthy within timeout.")
                        } else {
                            echo "Deployment successful and container is healthy."
                        }
                    }
                }
            }

        
        stage('Install jq') {
            steps {
                bat '''
                if not exist jq.exe (
                    powershell -Command "Invoke-WebRequest -Uri https://github.com/stedolan/jq/releases/download/jq-1.7/jq-win64.exe -OutFile jq.exe"
                )
                '''
            }
        }

        stage('Monitoring & Alerting') {
            environment {
                DD_API_KEY = credentials('DD_API_KEY')
                DD_APP_KEY = credentials('DD_APP_KEY')
            }
            steps {
               script {
                    echo 'Querying Datadog for monitor status...'
                    def response = bat (
                        script: """
                            curl -s -H "DD-API-KEY: ${DD_API_KEY}" ^
                                -H "DD-APPLICATION-KEY: ${DD_APP_KEY}" ^
                                "https://api.datadoghq.com/api/v1/monitor" | .\\jq.exe ". | length"
                        """,
                        returnStdout: true
                    ).trim()

                    echo "Number of monitors configured in Datadog: ${response}"
                }

            }
        }

    }

    post {
        always {
            echo 'Cleaning up Docker containers/images...'
            bat "docker container prune -f"
            bat "docker image prune -f"
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs.'
        }
    }
}
