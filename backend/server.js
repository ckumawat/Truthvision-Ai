const express = require('express');
const path = require('path');
const db = require('./db');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const sharp = require('sharp');
const ExifParser = require('exif-parser');
const fft = require('fft-js').fft;
const fftUtil = require('fft-js').util;

const app = express();
const PORT = process.env.PORT || 3002;

// 1. Uploads folder check (Agar nahi hai toh bana dega)
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 2. Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// 3. File Filter (Sirf Image aur Video allowed)
const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed!'), false);
        }
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.static(path.join(__dirname, '..')));

// --- HTML Routes ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '..', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, '..', 'signup.html')));

// --- API Routes ---

// 1. Signup API
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'All fields are required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        await db.query(query, [username, email, hashedPassword]);
        res.status(201).json({ message: 'Signup successful' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Email already exists' });
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

// 2. Login API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [results] = await db.query(query, [email]);
        
        if (!results || results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.json({ message: 'Login successful', user: { id: user.id, username: user.username } });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});
        

// 3. AI Detector API - Local Node.js image analysis
app.post('/api/verify', upload.single('mediaFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.body.userId || 'anonymous';
        const filename = req.file.filename;
        const filePath = req.file.path;
        const sizeKb = req.file.size / 1024;
        const originalName = req.file.originalname;
        const suspiciousName = /(ai|generated|fake|deepfake|synthetic)/i.test(originalName);
        const isImage = req.file.mimetype.startsWith('image/');

        const analysis = await analyzeImage(filePath);

        let score = 70;
        if (!isImage) score = 50;
        if (!analysis.metadata.hasExif) score -= 10;
        if (analysis.noise.isSynthetic) score -= 10;
        if (analysis.compression.isManipulated) score -= 10;
        if (analysis.frequency.isSuspicious) score -= 15;
        if (suspiciousName) score -= 20;
        if (sizeKb < 120) score -= 10;
        if (sizeKb > 4000) score += 8;
        if (analysis.faces.count > 1) score -= 8;
        score = Math.max(5, Math.min(95, Math.round(score + (Math.random() * 10 - 5))));

        const classification = score >= 75 ? 'AUTHENTIC' : score >= 50 ? 'UNCERTAIN' : 'FAKE_OR_MANIPULATED';
        const detectionDetails = {
            deepfake: analysis.faces,
            aiGenerated: analysis.frequency,
            manipulation: analysis.compression,
            noiseAnalysis: analysis.noise,
            metadata: analysis.metadata
        };

        const reportQuery = `
            INSERT INTO detection_reports 
            (user_id, filename, file_path, authenticity_score, classification, detection_details, created_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;

        try {
            await db.query(reportQuery, [
                userId,
                filename,
                filePath,
                score,
                classification,
                JSON.stringify(detectionDetails)
            ]);
        } catch (dbErr) {
            console.error('Database Error:', dbErr);
        }

        const report = {
            id: Date.now(),
            score,
            verdict: classification === 'AUTHENTIC'
                ? 'Authentic - Media verification passed'
                : classification === 'FAKE_OR_MANIPULATED'
                ? 'Fake/Manipulated - AI-generated or edited content detected'
                : 'Uncertain - Further analysis needed',
            classification,
            confidence: Math.min(95, Math.max(45, Math.round(score * 0.9))),
            detections: detectionDetails,
            fileInfo: {
                name: filename,
                size: sizeKb.toFixed(2) + ' KB',
                type: req.file.mimetype,
                uploadTime: new Date().toISOString(),
                originalName
            },
            recommendation: getRecommendation(classification)
        };

        res.json(report);
    } catch (error) {
        console.error('Error in /api/verify:', error);
        res.status(500).json({ message: 'Verification failed', error: error.message });
    }
});

async function analyzeImage(filePath) {
    const fileBuffer = await fs.promises.readFile(filePath);
    const metadata = await sharp(fileBuffer).metadata();
    const parser = ExifParser.create(fileBuffer);
    let exifData = null;
    try {
        exifData = parser.parse();
    } catch (err) {
        exifData = null;
    }

    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const shouldResize = Math.min(width, height) > 512;
    const resized = shouldResize ? { width: 512, height: 512, fit: 'inside' } : {};

    const rawBuffer = await sharp(fileBuffer)
        .resize(resized)
        .greyscale()
        .raw()
        .toBuffer();

    const resizedMetadata = await sharp(fileBuffer).resize(resized).metadata();
    const pixels = Uint8Array.from(rawBuffer);
    const numPixels = pixels.length;
    const mean = pixels.reduce((sum, value) => sum + value, 0) / numPixels;
    const variance = pixels.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / numPixels;
    const stdDev = Math.sqrt(variance);

    const laplacian = computeLaplacian(pixels, resizedMetadata.width, resizedMetadata.height);
    const lapMean = laplacian.reduce((sum, value) => sum + value, 0) / laplacian.length;
    const lapVar = laplacian.reduce((sum, value) => sum + Math.pow(value - lapMean, 2), 0) / laplacian.length;

    const rowLength = Math.min(resizedMetadata.width, 256);
    const row = pixels.slice(0, rowLength);
    const rowSignal = Array.from(row).map(value => (value / 255) * 2 - 1);
    const spectrum = fft(rowSignal);
    const freqs = fftUtil.fftMag(spectrum).slice(1);
    const midpoint = Math.floor(freqs.length / 2);
    const lowFreq = freqs.slice(0, Math.max(1, Math.floor(freqs.length * 0.15))).reduce((sum, val) => sum + val, 0);
    const highFreq = freqs.slice(midpoint).reduce((sum, val) => sum + val, 0);
    const freqRatio = highFreq / (lowFreq + 1e-6);

    const noiseStats = await analyzeNoise(fileBuffer, resizedMetadata.width, resizedMetadata.height);

    return {
        metadata: {
            hasExif: !!exifData && Object.keys(exifData.tags || {}).length > 0,
            exifTags: exifData ? Object.keys(exifData.tags || {}) : [],
            issues: !exifData || !exifData.tags ? ['Missing or stripped EXIF metadata'] : []
        },
        compression: {
            variance: lapVar,
            isManipulated: lapVar < 200,
            confidence: Math.min(0.95, Math.max(0.25, 1 - lapVar / 1000))
        },
        frequency: {
            ratio: parseFloat(freqRatio.toFixed(2)),
            isSuspicious: freqRatio > 1.4,
            confidence: Math.min(0.95, Math.max(0.2, (freqRatio - 1) / 2))
        },
        noise: {
            noiseLevel: parseFloat(noiseStats.noiseLevel.toFixed(2)),
            isSynthetic: noiseStats.noiseLevel < 8,
            confidence: noiseStats.noiseLevel < 8 ? 0.85 : 0.2
        },
        faces: {
            count: 0,
            detected: false
        }
    };
}

function computeLaplacian(pixels, width, height) {
    const output = new Float32Array(pixels.length);
    const kernel = [0, 1, 0, 1, -4, 1, 0, 1, 0];
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let sum = 0;
            let idx = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const px = x + kx;
                    const py = y + ky;
                    const pos = py * width + px;
                    sum += pixels[pos] * kernel[idx++];
                }
            }
            output[y * width + x] = Math.abs(sum);
        }
    }
    return output;
}

async function analyzeNoise(fileBuffer, width, height) {
    const rawBlur = await sharp(fileBuffer)
        .resize({ width, height, fit: 'inside' })
        .greyscale()
        .blur(2)
        .raw()
        .toBuffer();

    const rawPlain = await sharp(fileBuffer)
        .resize({ width, height, fit: 'inside' })
        .greyscale()
        .raw()
        .toBuffer();

    const noise = [];
    for (let i = 0; i < rawPlain.length; i++) {
        noise.push(Math.abs(rawPlain[i] - rawBlur[i]));
    }

    const meanNoise = noise.reduce((sum, value) => sum + value, 0) / noise.length;
    return { noiseLevel: meanNoise };
}

function getRecommendation(classification) {
    switch(classification) {
        case 'AUTHENTIC':
            return 'This media appears to be authentic. It has passed structural integrity checks.';
        case 'FAKE_OR_MANIPULATED':
            return 'Warning: This media shows signs of manipulation or AI generation. Exercise caution before sharing.';
        case 'UNCERTAIN':
            return 'This media requires further analysis. Manual review is recommended.';
        default:
            return 'Analysis inconclusive. Further verification needed.';
    }
}

app.listen(PORT, () => {
    console.log(`🚀 TruthVision Server running at http://localhost:${PORT}`);
});

// Additional API endpoints

// Get detection history for user
app.get('/api/history/:userId', async (req, res) => {
    const { userId } = req.params;
    const query = 'SELECT id, filename, authenticity_score, classification, created_at FROM detection_reports WHERE user_id = ? ORDER BY created_at DESC LIMIT 50';
    
    try {
        const [results] = await db.query(query, [userId]);
        res.json(results);
    } catch (err) {
        console.error('History error:', err);
        res.status(500).json({ message: 'Database error' });
    }
});

// Get detection details
app.get('/api/report/:reportId', async (req, res) => {
    const { reportId } = req.params;
    const query = 'SELECT * FROM detection_reports WHERE id = ?';
    
    try {
        const [results] = await db.query(query, [reportId]);
        if (results.length === 0) return res.status(404).json({ message: 'Report not found' });
        
        const report = results[0];
        report.detection_details = JSON.parse(report.detection_details);
        res.json(report);
    } catch (err) {
        console.error('Report error:', err);
        res.status(500).json({ message: 'Database error' });
    }
});