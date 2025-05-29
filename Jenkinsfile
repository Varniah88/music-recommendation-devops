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

        stage('Prepare .env file') {
            steps {
                bat '''
                    PORT=3000
                    MONGO_URL=mongodb+srv://jukeboxuser:jukeboxuser@jukeboxdb.v158hmf.mongodb.net/JUKEBOXDB?retryWrites=true&w=majority&appName=JukeBoxDB
                    MONGO_SECRET_KEY=12345678901234567890123456789012
                    JWT_SECRET=MyS3cr3tJwT_K3y!
                    SPOTIFY_CLIENT_ID=715291451b004afdae8c8fd356e3c22e
                    SPOTIFY_CLIENT_SECRET=6c0a6a201bdc4d6e9c05ec93238b6eab
                    SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/api/auth/spotify/callback
                    FRONTEND_URL=http://localhost:3000
                    AWS_REGION=us-east-1
                '''
            }
        }


            stage('Deploy to Test') {
    steps {
        script {
            echo "Stopping existing test container (if any)..."
            bat 'docker-compose -f docker-compose.test.yml down || echo "No existing container to stop"'

            echo "Starting test environment container(s)..."
            bat 'docker-compose -f docker-compose.test.yml up -d'

            echo "Waiting for container health check to pass..."
            def maxRetries = 10
            def counter = 0
            def health = "starting"

            while (health != "healthy" && counter < maxRetries) {
                sleep 10
                def output = bat(
                    script: 'docker inspect --format="{{.State.Health.Status}}" music-pipeline-music-backend-1',
                    returnStdout: true
                ).trim()
                echo "Health status: ${output}"
                health = output
                counter++
            }

            if (health != "healthy") {
                error "Container did not become healthy in time."
            }

            echo "Container is healthy. Proceeding to next stage..."
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
