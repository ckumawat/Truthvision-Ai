# TruthVision AI - Command Reference & Examples

## 🚀 Installation Commands

### One-Time Setup

```bash
# Navigate to project directory
cd f:\truthvision ai

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r backend/requirements.txt

# Create database (MySQL must be running)
mysql -u root -p < init.sql
# Enter password when prompted
```

---

## ▶️ Running the Application

### Start Python ML Backend (Terminal 1)

```bash
cd backend
python ml_api.py
```

📝 **Expected Output:**
```
Detection models loaded successfully
WARNING in app.factory ... 
 * Running on http://0.0.0.0:5000
```

✅ **Success Indicators:**
- Port 5000 listening
- No error messages
- "successful" in output

### Start Node.js Web Server (Terminal 2)

```bash
npm start
```

📝 **Expected Output:**
```
🚀 TruthVision Server running at http://localhost:3001
📊 Ensure Python ML backend is running at http://localhost:5000
```

✅ **Success Indicators:**
- Port 3001 listening
- No database connection errors
- Backend connectivity confirmed

### Access Application (Browser)

```
http://localhost:3001
```

---

## 📊 Database Commands

### Check Database Status

```sql
-- Login to MySQL
mysql -u root -p

-- Select database
USE truthvision;

-- Check tables
SHOW TABLES;

-- View table structure
DESC detection_reports;
DESC users;
DESC verification_stats;
```

### Query Detection Results

```sql
-- All detection reports
SELECT * FROM detection_reports;

-- Recent reports (last hour)
SELECT * FROM detection_reports 
WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY created_at DESC;

-- Get statistics
SELECT COUNT(*) as total_scans,
       AVG(authenticity_score) as avg_score
FROM detection_reports;

-- Find fake detections
SELECT * FROM detection_reports 
WHERE authenticity_score < 50
ORDER BY created_at DESC;

-- Find authentic confirmations
SELECT * FROM detection_reports 
WHERE authenticity_score >= 75
ORDER BY created_at DESC;

-- Get user's detection history
SELECT * FROM detection_reports 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC;
```

### Reset Database (Caution!)

```sql
-- Delete all reports
TRUNCATE TABLE detection_reports;

-- Delete all users
TRUNCATE TABLE users;

-- Reset statistics
UPDATE verification_stats SET total_scans = 0, fake_detected = 0, authentic_confirmed = 0;
```

---

## 🔧 Troubleshooting Commands

### Check Port Usage

```bash
# Windows: Check what's using port 3001
netstat -ano | findstr :3001

# Windows: Check what's using port 5000
netstat -ano | findstr :5000

# Kill process using port 3001 (if PID is 12345)
taskkill /PID 12345 /F

# Kill process using port 5000 (if PID is 67890)
taskkill /PID 67890 /F
```

### Restart Servers

```bash
# If port conflicts - kill and restart
# Terminal 1 (to restart Node)
# Ctrl+C to stop
npm start

# Terminal 2 (to restart Python)
# Ctrl+C to stop
python backend/ml_api.py
```

### Check Python Installation

```bash
# Check Python version
python --version

# Check if pip works
pip --version

# List installed packages
pip list

# Check specific package
pip show tensorflow
```

### Check Node Installation

```bash
# Check Node version
node --version

# Check npm version
npm --version

# List installed packages
npm list
```

### Check MySQL Status

```bash
# Windows: MySQL service start
net start mysql80

# Windows: MySQL service stop
net stop mysql80

# Connect to MySQL
mysql -u root -p

# Check MySQL version (in MySQL)
SELECT VERSION();
```

---

## 📝 Common Workflow

### Daily Workflow

```bash
# Terminal 1: Start Python backend
cd f:\truthvision ai\backend
python ml_api.py

# (Keep this running)

# Terminal 2: Start Node server
cd f:\truthvision ai
npm start

# (Keep this running)

# Browser: Access application
# Go to http://localhost:3001
# Login or create account
# Upload and analyze images
# Results saved to database

# When done: 
# Ctrl+C in both terminals to shut down
```

### Testing Workflow

```bash
# Prepare test images:
# 1. Real photo (from camera)
# 2. AI-generated (DALL-E, Midjourney, etc.)
# 3. Photoshopped (edited in Photoshop/Photopea)

# Upload each and note scores
# Verify results match expectations

# Check database:
mysql -u root -p
USE truthvision;
SELECT * FROM detection_reports ORDER BY created_at DESC LIMIT 5;
```

---

## 🧹 Maintenance Commands

### Clean Up Temporary Files

```bash
# Windows: Clear temp uploads
cd f:\truthvision ai\uploads
del *.*

# Or use Node.js:
rm -r uploads/*
```

### Backup Database

```bash
# Backup detection reports
mysqldump -u root -p truthvision detection_reports > backup_reports.sql

# Backup entire database
mysqldump -u root -p truthvision > backup_truthvision.sql

# Restore from backup
mysql -u root -p truthvision < backup_truthvision.sql
```

### View Application Logs

```bash
# Node.js logs (shown in terminal)
# Look for: POST /api/verify responses

# Python logs (shown in terminal)
# Look for: detection analysis progress

# Database logs (if needed)
# Check MySQL error log
```

---

## 🚀 Development Commands

### Run in Development Mode (with auto-restart)

```bash
# Requires nodemon (already in dev dependencies)
npm run dev
```

### Run ML Backend with Debug Logs

```bash
# In detection_service.py, set DEBUG=True
python backend/ml_api.py
```

### Run Tests

```bash
# If tests are added to package.json
npm test

# Python unit tests (if added)
pytest backend/
```

---

## 📦 Package Management

### Update Dependencies

```bash
# Check for outdated Node packages
npm outdated

# Update Node packages
npm update

# Update specific package
npm install package-name@latest

# Check for outdated Python packages
pip list --outdated

# Update Python package
pip install --upgrade package-name
```

### Add New Dependencies

```bash
# Add Node package
npm install new-package

# Add Node dev package
npm install --save-dev new-dev-package

# Add Python package
pip install new-package

# Save to requirements.txt
pip freeze > backend/requirements.txt
```

---

## 🐛 Debug Tips

### Enable More Verbose Output

**Python Backend:**
```python
# In ml_api.py, change debug mode
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  # Enables debug mode
```

**Node.js Server:**
```bash
# Set debug environment variable before running
set DEBUG=*
npm start
```

### Monitor Network Requests

```bash
# Open Browser Dev Tools (F12)
# Go to Network tab
# Upload an image
# See request to /api/verify
# View Response for actual detection results
```

### Check Console Output

**Python Console (should show):**
```
Analyzing image: filename.jpg
Frequency analysis: ratio=2.1
Metadata analysis: has_exif=True
Compression analysis: variance=45.3
Face detection: count=1
Noise analysis: level=8.2
Overall score: 78.5
```

**Node Console (should show):**
```
POST /api/verify 200
Database: Inserted report ID 123
ML Result: classification=AUTHENTIC
Response sent to client
```

---

## 📞 Support References

### File Locations
- Python ML: `f:\truthvision ai\backend\ml_api.py`
- Node Server: `f:\truthvision ai\backend\server.js`
- Frontend: `f:\truthvision ai\script.js`
- Database: See `init.sql`
- Config: Check `backend/db.js`

### Documentation Files
- Setup: `SETUP_GUIDE.md`
- Quick Start: `QUICK_START.md`
- ML Algorithms: `ML_ALGORITHMS.md`
- Testing: `TESTING_GUIDE.md`
- This File: `COMMAND_REFERENCE.md`

### URLs
- Web App: `http://localhost:3001`
- Python API: `http://localhost:5000`
- MySQL: `localhost:3306`

---

## 🎯 Common Scenarios

### I want to clear all data and start fresh

```bash
# Stop both servers (Ctrl+C)

# Reset database
mysql -u root -p
USE truthvision;
TRUNCATE TABLE detection_reports;
TRUNCATE TABLE users;
TRUNCATE TABLE verification_stats;
exit;

# Clear uploads folder
cd f:\truthvision ai\uploads
del *.*

# Restart servers
npm start   # Terminal 1
python backend/ml_api.py  # Terminal 2
```

### I'm getting weird scores

1. Stop Python backend
2. Stop Node server
3. Restart Python backend first
4. Restart Node server
5. Try again

### Port is already in use

```bash
# Find what's using it
netstat -ano | findstr :3001

# Kill the process
taskkill /PID <number> /F

# Try running again
npm start
```

### Database won't connect

```bash
# Check if MySQL is running
net start mysql80

# Re-run init.sql
mysql -u root -p < init.sql

# Restart Node server
npm start
```

---

## 💡 Pro Tips

1. **Keep Both Terminals Open** - You need both Python and Node running
2. **Check Logs First** - When something breaks, check console output
3. **Test with Real Images** - Start with actual photos before AI-generated
4. **Monitor Database** - Check what's being stored
5. **Use Hot Reload** - Run `npm run dev` instead of `npm start` for auto-restart
6. **Backup Regularly** - Use mysqldump to backup detection results
7. **Clear Uploads** - Periodically clean up `/uploads/` folder for space

---

**Ready to detect fakes!** 🚀

For detailed help, see the other documentation files.
