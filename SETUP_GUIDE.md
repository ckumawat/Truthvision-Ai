# TruthVision AI - Real Image Detection Setup Guide

Your application now has **real, working image detection** capabilities using machine learning!

## 🎯 What's New

### ML Detection Capabilities:
1. **Frequency Analysis** - Detects AI-generated content patterns
2. **Metadata Analysis** - Checks for suspicious EXIF data removal
3. **Compression Analysis** - Detects image manipulation/JPEG artifacts
4. **Face Detection** - Identifies potential deepfake faces
5. **Noise Pattern Analysis** - Distinguishes synthetic vs. real content
6. **Overall Authenticity Score** (0-100)

### Detections:
- ✅ Deepfakes (AI-generated faces)
- ✅ AI-generated images
- ✅ Photoshopped/manipulated images
- ✅ Metadata tampering

---

## 🚀 How to Run

### Step 1: Install Dependencies

**Node.js dependencies:**
```bash
cd f:\truthvision ai
npm install
```

### Step 2: Set Up Database

1. Open your MySQL client
2. Run the updated schema:
```bash
mysql -u your_user -p < init.sql
```

This creates:
- `users` table
- `detection_reports` table (stores analysis results)
- `verification_stats` table (tracks overall stats)

### Step 3: Start the Server

**Terminal:**
```bash
npm start
```
Expected output:
```
🚀 TruthVision Server running at http://localhost:3001
```

### Step 4: Access the Application

Open: **http://localhost:3001**

---

## 📊 How Detection Works

### Frontend Flow:
1. User uploads an image via drag-drop or file selector
2. File sent to `/api/verify` endpoint
3. Server receives file and forwards to Python ML backend
4. ML backend runs 5 parallel analyses:
   - Frequency domain analysis
   - Metadata inspection
   - Compression artifact detection
   - Face detection
   - Noise pattern analysis
5. Results combined using Bayesian fusion into authenticity score
6. Results stored in database
7. Formatted report displayed to user

### Score Interpretation:
- **75-100**: 🟢 **AUTHENTIC** - Appears genuine
- **50-74**: 🟡 **UNCERTAIN** - Needs manual review
- **0-49**: 🔴 **FAKE/MANIPULATED** - Likely AI-generated or edited

---

## 📁 Architecture

```
truthvision ai/
├── backend/
│   ├── server.js           # Node.js Express server
│   ├── db.js               # MySQL connection
│   ├── ml_api.py           # Python Flask ML API
│   ├── detection_service.py # ML detection algorithms
│   └── requirements.txt     # Python dependencies
├── uploads/                # Uploaded files storage
├── index.html              # Main detection interface
├── login.html              # Login page
├── signup.html             # Registration page
├── script.js               # Frontend detection logic
├── style.css               # Styling
└── init.sql                # Database schema
```

---

## 🔗 API Endpoints

### Upload and Analyze Image
**POST** `/api/verify`
- Parameter: `mediaFile` (FormData file)
- Returns: Detection report with score, classification, and details

### Get Detection History
**GET** `/api/history/:userId`
- Returns: List of past detections

### Get Report Details
**GET** `/api/report/:reportId`
- Returns: Full detection report with technical details

---

## 🛠️ Troubleshooting

### Error: "Detection service unavailable"
- ❌ Python ML backend not running
- ✅ Solution: Start Python backend first with `python backend/ml_api.py`

### Error: "Database error"
- ❌ MySQL not running or schema not created
- ✅ Solution: Check MySQL is running and run `init.sql`

### Image takes too long to analyze
- This is normal! ML processing takes 3-5 seconds depending on image size

### Port Already in Use
- Node.js (3001): `netstat -ano | findstr :3001` to find process
- Python (5000): `netstat -ano | findstr :5000` to find process

---

## 📈 Future Enhancements

1. **Advanced Models**: Integration with TensorFlow/PyTorch pre-trained models
2. **Video Analysis**: Frame-by-frame deepfake detection
3. **Batch Processing**: Analyze multiple images simultaneously
4. **API Keys**: Offer as a service to third-party apps
5. **Export Reports**: PDF/JSON report generation
6. **Advanced Analytics**: Dashboard showing detection trends

---

## 🎓 Technical Details

### Detection Algorithms:

**1. Frequency Analysis**
- Uses FFT to analyze frequency domain
- AI-generated images have unusual high-frequency patterns
- Detection: Frequency ratio > 2.5 = suspicious

**2. Metadata Analysis**
- Checks for EXIF data presence
- Missing EXIF = suspicious (indicates possible editing)

**3. Compression Analysis**
- Analyzes Laplacian variance
- Low variance = high compression/manipulation
- Green threshold = reencoded images

**4. Face Detection**
- Cascade classifier for face regions
- Faces with artifacts = potential deepfake

**5. Noise Analysis**
- Bilateral filter to separate noise
- Synthetic images have lower noise levels
- Threshold: noise < 5 = synthetic

---

## 📝 Notes

- All uploaded images are stored in `/uploads/` directory
- Reports are permanently stored in MySQL database
- Confidence scores are 0-1 internally, displayed as percentages
- Detection is probabilistic - not 100% accurate

---

For issues or questions, check the console for detailed error logs!
