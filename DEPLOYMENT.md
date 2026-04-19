# TruthVision AI - Deployment Guide

## Production Deployment Checklist

### Pre-Deployment Steps

#### 1. Environment Setup
```bash
# Create environment file from template
cp .env.example .env

# Edit .env with production values
# - Set NODE_ENV=production
# - Update database credentials
# - Set secure PORT
# - Configure API endpoints
```

#### 2. Database Setup
```bash
# Initialize MySQL database
mysql -u root -p < init.sql

# Verify database connection
node -e "require('./backend/db.js')"
```

#### 3. Dependencies Installation
```bash
# Install production dependencies only
npm install --only=production

# Or use:
npm ci --only=production
```

#### 4. Build & Assets
```bash
# Verify all static assets are in place
# - images/
# - node_modules/
# - uploads/ (create if missing)

mkdir -p uploads
```

### Deployment on Different Platforms

#### Option A: Node.js Server (Linux/Ubuntu)

**Using PM2 (Recommended for Production)**
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start backend/server.js --name "truthvision-ai"

# Setup auto-restart on reboot
pm2 startup
pm2 save

# Monitor application
pm2 monit

# View logs
pm2 logs truthvision-ai
```

**Using Systemd Service (Alternative)**
```bash
# Create service file: /etc/systemd/system/truthvision-ai.service
[Unit]
Description=TruthVision AI Application
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/truthvision-ai
ExecStart=/usr/bin/node /var/www/truthvision-ai/backend/server.js
Restart=always
RestartSec=10
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl enable truthvision-ai
sudo systemctl start truthvision-ai
```

#### Option B: Docker Deployment

**Create Dockerfile**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3002

CMD ["node", "backend/server.js"]
```

**Build and Run**
```bash
docker build -t truthvision-ai:latest .
docker run -p 3002:3002 --env-file .env truthvision-ai:latest
```

#### Option C: Heroku Deployment

**Procfile** (Already configured in package.json)
```
web: node backend/server.js
```

**Deploy**
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your-db-host
heroku config:set DB_USER=your-db-user
heroku config:set DB_PASSWORD=your-db-password
heroku config:set DB_NAME=truthvision

# Push to Heroku
git push heroku main
```

#### Option D: AWS EC2

**Using Node.js**
```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-public-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install nodejs -y

# Clone repository
git clone your-repo-url
cd truthvision-ai

# Install dependencies
npm ci --only=production

# Install PM2
sudo npm install -g pm2

# Start with PM2
pm2 start backend/server.js --name "truthvision-ai"
pm2 startup
pm2 save
```

### Production Optimization

#### 1. Performance Tuning
```javascript
// In backend/server.js - Add compression
const compression = require('compression');
app.use(compression());

// Add security headers (helmet)
const helmet = require('helmet');
app.use(helmet());
```

#### 2. Database Optimization
```bash
# Create database indexes
mysql -u root -p truthvision < init.sql

# Monitor queries
# Enable slow query log in MySQL config
```

#### 3. Reverse Proxy Setup (Nginx)

**nginx.conf**
```nginx
upstream truthvision_app {
    server localhost:3002;
}

server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;

    location / {
        proxy_pass http://truthvision_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 4. SSL/TLS Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renew
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Monitoring & Maintenance

#### 1. Application Monitoring
```bash
# Using PM2 Plus
pm2 plus

# View real-time metrics
pm2 monit

# Check application status
pm2 status
```

#### 2. Error Logging
```bash
# View application logs
pm2 logs truthvision-ai

# Save logs to file
pm2 logs truthvision-ai > app.log
```

#### 3. Database Monitoring
```bash
# Check MySQL connection
mysql -u root -p -e "SELECT 1;"

# Monitor active connections
mysql -u root -p -e "SHOW PROCESSLIST;"
```

#### 4. Server Health Check
```bash
# Check server status
curl http://localhost:3002

# Check endpoint
curl http://localhost:3002/api/health
```

### Security Checklist

- [ ] Environment variables configured securely
- [ ] Database credentials protected (.env file in .gitignore)
- [ ] SSL/TLS certificates installed
- [ ] Firewall configured (only port 80, 443 open)
- [ ] Input validation enabled
- [ ] SQL injection prevention implemented
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] API authentication working
- [ ] Logs monitored regularly

### Troubleshooting

**Port Already in Use**
```bash
# Find process using port
lsof -i :3002
# or on Windows
netstat -ano | findstr :3002

# Kill process
kill -9 <PID>
```

**Database Connection Error**
```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT 1;"

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Test connection string in .env
```

**High Memory Usage**
```bash
# Monitor with PM2
pm2 monit

# Increase Node memory limit
node --max-old-space-size=4096 backend/server.js
```

### Rollback Plan

```bash
# Keep previous version backup
cp -r truthvision-ai truthvision-ai-backup

# If deployment fails
pm2 stop truthvision-ai
# Restore from backup
pm2 start truthvision-ai
```

### Performance Benchmarks

- **Target Response Time**: < 200ms
- **Max Concurrent Users**: 1000
- **Uptime Goal**: 99.9%
- **Maximum File Upload**: 50MB
- **Database Query Timeout**: 30 seconds

---

**Last Updated**: April 18, 2026
**Version**: 2.1
**Status**: Production Ready
