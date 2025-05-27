pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git 'https://github.com/Varniah88/music-recommendation-devops.git'
            }
        }
        stage('Build') {
            steps {
                dir('jukebox-backen') {
                    sh 'docker build -t music-backend .'
                }
            }
        }
        stage('Test') {
            steps {
                dir('jukebox-backen') {
                    sh 'npm install'
                    sh 'npm test'
                }
            }
        }
        // Add more stages below as you expand your pipeline
    }
}
