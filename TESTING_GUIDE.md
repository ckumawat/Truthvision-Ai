# TruthVision AI - Testing & Verification Guide

## ✅ Pre-Launch Checklist

### 1. Environment Setup
- [ ] Python 3.8+ installed
- [ ] Node.js 14+ installed
- [ ] MySQL running
- [ ] Port 3001 available
- [ ] Port 5000 available
- [ ] Ports 3306 (MySQL) available

### 2. Dependencies
- [ ] `npm install` completed (all packages from package.json)
- [ ] `pip install -r backend/requirements.txt` completed
- [ ] No error messages during installation

### 3. Database
- [ ] MySQL running
- [ ] `init.sql` successfully executed
- [ ] Can see `truthvision` database
- [ ] Can see tables: `users`, `detection_reports`, `verification_stats`

```sql
-- Verify in MySQL:
USE truthvision;
SHOW TABLES;
DESC detection_reports;
```

---

## 🚀 Launch Tests

### Test 1: Start Python ML Backend

**Command:**
```bash
cd backend
python ml_api.py
```

**Expected Output:**
```
WARNING in app.factory ...
 * Running on http://0.0.0.0:5000
 * Debug mode: off
```

**What to Check:**
- ✅ No errors
- ✅ Running on port 5000
- ✅ Can access http://localhost:5000/api/health

**If it fails:**
- Check Python version: `python --version` (should be 3.8+)
- Check if port 5000 is free: `netstat -ano | findstr :5000`
- Check requirements installed: `pip list`

---

### Test 2: Start Node.js Server

**Command (in new terminal):**
```bash
npm start
```

**Expected Output:**
```
🚀 TruthVision Server running at http://localhost:3001
📊 Ensure Python ML backend is running at http://localhost:5000
```

**What to Check:**
- ✅ Server started successfully
- ✅ No connection errors to Python backend (check above line)
- ✅ Can access http://localhost:3001

**If it fails:**
- Check port 3001: `netstat -ano | findstr :3001`
- Check MySQL connection in `backend/db.js`
- Check Python backend is actually running

---

### Test 3: Open Web Interface

**URL:** http://localhost:3001

**What to See:**
- ✅ TruthVision AI header
- ✅ Login form (if not authenticated)
- ✅ Can create account or login

**Register a test account:**
- Email: `test@example.com`
- Password: `test123456`

---

## 🧪 Functional Tests

### Test 4: Upload a Real Photo

**Steps:**
1. Login with test account
2. Go to "Image/Video" tab
3. Upload a **real photograph from your phone/camera**
4. Click "Analyze Media"

**Expected:**
- ✅ "Scanning..." shows
- ✅ After 3-5 seconds, results appear
- ✅ Score should be **75-100% (AUTHENTIC)**
- ✅ Green color indicator
- ✅ "AUTHENTIC" classification

**Example result:**
```
Score: 87%
Classification: AUTHENTIC
Confidence: 75%
Faces Detected: 1
AI Generation Risk: Low
Metadata Status: low
```

---

### Test 5: Upload an AI-Generated Image

**How to get AI-generated images:**
1. Use free tools:
   - Bing Image Creator (free)
   - Hugging Face Spaces
   - Craiyon
   - Any online AI image generator

2. Generate something distinctive (e.g., "a robot playing chess")

3. Upload the result

**Expected:**
- ✅ Score should be **0-49% (FAKE_OR_MANIPULATED)**
- ✅ Red color indicator
- ✅ "FAKE_OR_MANIPULATED" classification
- ✅ "AI Generation Risk: High"

**Example result:**
```
Score: 32%
Classification: FAKE_OR_MANIPULATED
Confidence: 75%
AI Generation Risk: High
Noise Pattern: Synthetic
Recommendation: Warning - shows signs of manipulation
```

---

### Test 6: Upload a Photoshopped Image

**Steps:**
1. Take a real photo
2. Edit in Photoshop or Photopea.com:
   - Add/remove objects
   - Clone parts
   - Blend awkwardly
3. Save and upload

**Expected:**
- ✅ Score usually **50-74% (UNCERTAIN)**
- ✅ Yellow color indicator
- ✅ "UNCERTAIN" classification
- ✅ "Manipulation Detected: YES"

**Example result:**
```
Score: 58%
Classification: UNCERTAIN
Confidence: 65%
Manipulation Detected: YES
Recommendation: requires manual review
```

---

### Test 7: Screenshot Upload

**Steps:**
1. Take a screenshot of anything
2. Upload it

**Expected:**
- ✅ Often scores **50-70%** (altered/compressed)
- ✅ Yellow indicator
- ✅ "UNCERTAIN" classification
- ✅ Metadata showing "high suspicion"

---

### Test 8: Check Database Storage

**In MySQL:**
```sql
USE truthvision;
SELECT * FROM detection_reports;
```

**What to verify:**
- ✅ All your uploads are recorded
- ✅ Correct scores stored
- ✅ Classifications match
- ✅ JSON details preserved

---

### Test 9: Check Detection History

**In web app:**
1. Go to any detection results
2. Note the Report ID (shown at bottom)
3. Check if you can see history (implementation optional)

**In database:**
```sql
SELECT * FROM detection_reports WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

---

### Test 10: Batch Multiple Images

**Steps:**
1. Prepare 5 different images (real, AI, edited, screenshot, video frame)
2. Upload each one
3. Note scores and classifications
4. Check they're all in database

**Expected Pattern:**
- Real photos: 75-100%
- AI-generated: 0-49%
- Photoshopped: 50-74%
- Screenshots: 50-70%
- Varied results: 40-90%

---

## 🔍 Technical Verification Tests

### Test 11: ML Backend API Response

**In terminal (with Python running):**
```bash
curl http://localhost:5000/api/health
```

**Expected:**
```json
{
  "status": "ok",
  "models_loaded": true
}
```

---

### Test 12: Check Python Logs

**What to look for in Python terminal:**
- ✅ "Analyzing image..." messages
- ✅ Frequency analysis results
- ✅ Face detection results
- ✅ No error traces
- ✅ Processing time logged

---

### Test 13: Check Node Logs

**What to look for in Node terminal:**
- ✅ "POST /api/verify 200" or similar
- ✅ No database errors
- ✅ Proper integration with Python backend
- ✅ Request/response times

---

### Test 14: Database Performance

**Check query response time:**
```sql
SELECT * FROM detection_reports LIMIT 10;  -- Should be instant
```

**Expected:**
- ✅ Results in < 100ms
- ✅ All fields populated
- ✅ JSON details readable

---

## ⚠️ Common Issues & Fixes

### Issue: "Detection service unavailable"

**Cause:** Python backend not running or not responding

**Fix:**
1. Verify Python is running: Check terminal for port 5000 message
2. Restart: Kill Python process, run `python backend/ml_api.py` again
3. Check firewall: Ensure port 5000 is not blocked

**Verify fix:**
```bash
curl http://localhost:5000/api/health
```

---

### Issue: "Database error"

**Cause:** MySQL not running or schema not created

**Fix:**
1. Verify MySQL is running
2. Run init.sql again: `mysql -u root -p < init.sql`
3. Check connection in `backend/db.js`

**Verify fix:**
```bash
mysql -u root -p -e "USE truthvision; SHOW TABLES;"
```

---

### Issue: "Port 3001 already in use"

**Cause:** Node process already running

**Fix:**
```bash
# Find process on port 3001
netstat -ano | findstr :3001

# Kill it (Windows)
taskkill /PID <PID> /F

# Try again
npm start
```

---

### Issue: Scores not changing between uploads

**Cause:** Python backend may not be running or restarting

**Fix:**
1. Check Python terminal - should show analysis messages
2. Check `/tmp` folder - temp files should be created/deleted
3. Restart both backends

---

### Issue: Image processing takes > 15 seconds

**Cause:** 
- Large image file (> 5MB)
- Slow machine
- Python bottleneck

**Fix:**
- Try smaller image
- Restart Python backend
- Check system resources

---

## ✅ Final Verification Checklist

After all tests pass:

- [ ] Real photos score 75-100% consistently
- [ ] AI-generated images score 0-49% consistently  
- [ ] Photoshopped images score 50-74% consistently
- [ ] Database records all uploads
- [ ] No errors in console logs
- [ ] Response times < 10 seconds
- [ ] User authentication works
- [ ] All 4 tabs work (image detection tested at least)

---

## 📊 Test Results Template

Save this for your records:

```
Test Date: ___________
Tester: _______________

Backend Tests:
- Python ML Backend: [ ] PASS [ ] FAIL
- Node.js Server: [ ] PASS [ ] FAIL
- MySQL Database: [ ] PASS [ ] FAIL
- API Endpoints: [ ] PASS [ ] FAIL

Functional Tests:
- Real Photo Upload: [ ] PASS [ ] FAIL
  - Score Range: _____% (Expected: 75-100%)
  - Classification: _________ (Expected: AUTHENTIC)

- AI-Generated Upload: [ ] PASS [ ] FAIL
  - Score Range: _____% (Expected: 0-49%)
  - Classification: _________ (Expected: FAKE)

- Photoshopped Upload: [ ] PASS [ ] FAIL
  - Score Range: _____% (Expected: 50-74%)
  - Classification: _________ (Expected: UNCERTAIN)

Performance:
- Average Processing Time: _____ seconds
- Average DB Query Time: _____ ms
- Memory Usage: _____ MB

Issues Found:
1. ___________________
2. ___________________
3. ___________________

Overall Status: [ ] READY FOR USE [ ] NEEDS FIXES
```

---

## 🎯 Next Steps After Verification

1. ✅ **If All Tests Pass:**
   - Ready for production
   - Can deploy to server
   - Ready for user testing

2. ⚠️ **If Some Tests Fail:**
   - Check specific issue section above
   - Restart components
   - Check logs for errors
   - Read SETUP_GUIDE.md troubleshooting

3. 🔄 **If Scores Not Making Sense:**
   - Check ML_ALGORITHMS.md for thresholds
   - Adjust thresholds in detection_service.py
   - Test with known samples
   - Retrain understanding of algorithms

---

**You're ready to detect fakes!** 🚀

For detailed help: See SETUP_GUIDE.md
