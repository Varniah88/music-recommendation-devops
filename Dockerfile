# Use official Node.js image
FROM node:18

# Install curl for health check
RUN apt-get update && apt-get install -y curl

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

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1


# Start the backend server using node
CMD ["node", "server.js"]
