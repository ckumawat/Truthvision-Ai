# TruthVision AI - Quick Start

## One-Time Setup

```bash
# Install dependencies
npm install

# Setup database (using MySQL client)
mysql -u root -p < init.sql
```

## Run Application (Every Time)

```bash
npm start
```

Then visit: http://localhost:3001

## What It Does

Uploads image → Node.js receives → Local Node.js analysis → Results combined → Score displayed → Stored in database

## Scores Mean:
- 🟢 75-100: Authentic
- 🟡 50-74: Uncertain  
- 🔴 0-49: Fake/Manipulated

## Tests With:
- Real photos ✅
- AI-generated images (DALL-E, Midjourney, Stable Diffusion)
- Photoshopped images
- Screenshots
- Any image format

## File Structure:
- `backend/server.js` - Web server and detection logic
- `backend/db.js` - MySQL connection
- `script.js` - Upload handling
- `init.sql` - Database tables

## Common Issues:
| Error | Solution |
|-------|----------|
| "Detection service unavailable" | Ensure Node.js server is running |
| "Database error" | Run init.sql and ensure MySQL is running |
| Port 3001 already in use | Kill existing Node process |

## Next Steps:
1. Test with sample images
2. Check database for stored reports
3. Improve detection thresholds
4. Add video analysis
5. Deploy to production

---
**Ready to detect fakes!** 🚀
