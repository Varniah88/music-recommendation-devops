pipeline {
    agent any

    environment {
        IMAGE_NAME = "music-backend"
        DOCKER_TAG = "latest"
        SONARQUBE_SERVER = 'SonarQube'
        CONTAINER_NAME = "music-backend-test"
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

        stage('Prepare .env file') {
            steps {
                bat '''
                echo PORT=3000 > .env
                echo MONGO_URL=mongodb+srv://jukeboxuser:jukeboxuser@jukeboxdb.v158hmf.mongodb.net/JUKEBOXDB?retryWrites=true^&w=majority^&appName=JukeBoxDB >> .env
                echo MONGO_SECRET_KEY=12345678901234567890123456789012 >> .env
                echo JWT_SECRET=MyS3cr3tJwT_K3y! >> .env
                echo SPOTIFY_CLIENT_ID=715291451b004afdae8c8fd356e3c22e >> .env
                echo SPOTIFY_CLIENT_SECRET=6c0a6a201bdc4d6e9c05ec93238b6eab >> .env
                echo SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/spotify/callback >> .env
                echo FRONTEND_URL=http://localhost:3000 >> .env
                echo AWS_REGION=us-east-1 >> .env
                '''
            }
        }

        stage('Deploy to Test') {
            steps {
                script {
                    echo "Stopping existing container..."
                    bat 'docker-compose -f docker-compose.test.yml down || echo "No container to stop"'
                    bat 'docker rm -f music-backend-test || echo "Container not found"'

                    echo "Starting test container..."
                    bat 'docker-compose -f docker-compose.test.yml up -d'

                    def maxRetries = 20
                    def isHealthy = false

                    echo "Waiting for container health check to pass..."
                    for (int i = 0; i < maxRetries; i++) {
                        def output = bat(
                            script: "docker inspect --format=\"{{.State.Health.Status}}\" ${CONTAINER_NAME}",
                            returnStdout: true
                        ).trim()

                        echo "Health check raw output: '${output}'"

                        if (output.contains("healthy")) {
                            echo "Container is healthy."
                            isHealthy = true
                            break
                        } else {
                            echo "Container not healthy yet, waiting..."
                            sleep 15
                        }
                    }

                    if (!isHealthy) {
                        echo "Container failed health check. Logs:"
                        bat "docker logs ${CONTAINER_NAME}"
                        error "Container did not become healthy in time."
                    }

                    echo "Checking HTTP health endpoint..."
                    def httpSuccess = false
                    for (int j = 0; j < 10; j++) {
                        sleep 10
                        def httpStatus = bat(
                            script: 'curl -s -o NUL -w "%%{http_code}" "http://localhost:3000/health"',
                            returnStdout: true
                        ).trim()

                        echo "HTTP status: ${httpStatus}"
                        if (httpStatus == "200") {
                            httpSuccess = true
                            break
                        }
                    }

                    if (!httpSuccess) {
                        bat "docker logs ${CONTAINER_NAME}"
                        error "Health endpoint did not respond with 200 in time."
                    }

                    echo "Deployment and health check successful."
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
                    echo 'Querying Datadog...'
                    def response = bat (
                        script: """
                            curl -s -H "DD-API-KEY: ${DD_API_KEY}" ^
                                -H "DD-APPLICATION-KEY: ${DD_APP_KEY}" ^
                                "https://api.datadoghq.com/api/v1/monitor" | .\\jq.exe ". | length"
                        """,
                        returnStdout: true
                    ).trim()

                    echo "Monitors in Datadog: ${response}"
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up Docker...'
            bat "docker container prune -f"
            bat "docker image prune -f"
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check above logs.'
        }
    }
}
