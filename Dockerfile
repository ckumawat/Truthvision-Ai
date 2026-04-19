FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy application files
COPY backend/ ./backend/
COPY *.html ./
COPY *.css ./
COPY *.js ./
COPY AI_Deepfake_Detector_Logo1.png ./
COPY init.sql ./

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3002/ || exit 1

# Start application
CMD ["node", "backend/server.js"]
