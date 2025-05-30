pipeline {
    agent any

    environment {
        IMAGE_NAME = "music-backend"
        DOCKER_TAG = "latest"
        SONARQUBE_SERVER = 'SonarQube'
        CONTAINER_NAME = "music-backend-test"
        AWS_DEFAULT_REGION = 'us-east-1'
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
            def CONTAINER_NAME = "music-backend-test"
            echo 'Stopping existing container and cleaning up...'

            bat "docker-compose -f docker-compose.test.yml down || echo \"No container to stop\""
            bat "docker rm -f ${CONTAINER_NAME} || echo Container not found"

            echo 'Starting test container...'
            bat "docker-compose -f docker-compose.test.yml up -d"
            bat "docker ps -a"
            bat "docker logs ${CONTAINER_NAME} || echo No logs"

            echo "Waiting for Docker container health status to become 'healthy'..."
            def maxRetries = 20
            def isHealthy = false

            for (int i = 0; i < maxRetries; i++) {
                def rawOutput = bat(script: "docker inspect --format=\"{{.State.Health.Status}}\" ${CONTAINER_NAME}", returnStdout: true).trim()
                def healthStatus = rawOutput.readLines().last().trim()

                echo "Health check status: '${healthStatus}'"

                if (healthStatus == 'healthy') {
                    echo "Container is healthy!"
                    isHealthy = true
                    break
                }

                echo "Container not healthy yet, waiting 15 seconds..."
                sleep(time: 15, unit: 'SECONDS')
            }

            if (!isHealthy) {
                echo "Container failed to become healthy in time. Showing container logs:"
                bat "docker logs ${CONTAINER_NAME} || echo No logs"
                error("Container did not become healthy.")
            }
        }
    }
}

        stage('Deploy to ECS') {
    steps {
        withCredentials([usernamePassword(credentialsId: 'aws-creds', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
            bat """
            aws configure set aws_access_key_id %AWS_ACCESS_KEY_ID%
            aws configure set aws_secret_access_key %AWS_SECRET_ACCESS_KEY%
            aws configure set default.region %AWS_DEFAULT_REGION%

            REM Update ECS service to force new deployment
            aws ecs update-service --cluster jukebox-music-backend-cluster --service jukebox-music-backend-service-6zl0jlhv --force-new-deployment
            """
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
