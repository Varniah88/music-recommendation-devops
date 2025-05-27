# Music-Recommendation
📦 Docker Instructions
🔨 Build the image

docker build -t jukebox-backend .
▶️ Run the container

docker run -p 3000:3000 jukebox-backend

🌐 Access the app
Open your browser and go to:
http://localhost:3000/

📚 API Check
To verify your identity endpoint is working, visit:
http://localhost:3000/api/student

Example response:
{
  "name": "Varniah Kangeswaran",
  "studentId": "225024153"
}
🐳 Pull from Docker Hub
Instead of building, you can also run:
docker pull varniah88/jukebox-backend:latest

docker run -p 3000:3000 varniah88/jukebox-backend:latest
