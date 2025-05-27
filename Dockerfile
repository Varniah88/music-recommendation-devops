# Use official Node.js image
FROM node:18

# Set working directory inside container for backend
WORKDIR /app/jukebox-backend

# Copy backend package files and install dependencies
COPY jukebox-backend/package*.json ./
RUN npm install

# Copy backend and frontend folders
COPY jukebox-backend ./
COPY jukebox-frontend ../jukebox-frontend

# Expose port 3000
EXPOSE 3000

# Start the backend server using pm2 (from backend folder)
CMD ["node", "server.js"]
