# 🚀 SCORTA - Quick Start Guide

## Your App is Ready to Deploy! ✅

All code has been prepared for production deployment. Follow these simple steps:

---

## Option 1: Automated Deployment (Recommended)

Run the interactive deployment script:

```bash
cd /Users/dircreativobda/.gemini/antigravity/scratch/scorta-app
./deploy.sh
```

This script will guide you through:
1. ✅ Pushing code to GitHub
2. ✅ Deploying backend to Railway
3. ✅ Configuring environment variables
4. ✅ Deploying frontend to Vercel
5. ✅ Updating CORS settings

---

## Option 2: Manual Deployment

Follow the detailed guide:

📖 **[DEPLOYMENT_GUIDE.md](file:///Users/dircreativobda/.gemini/antigravity/scratch/scorta-app/DEPLOYMENT_GUIDE.md)**

---

## Important Files

| File | Purpose |
|------|---------|
| `DEPLOYMENT_GUIDE.md` | Complete step-by-step manual |
| `DEPLOYMENT_SECRETS.md` | 🔐 JWT secrets & env variables (DO NOT commit!) |
| `deploy.sh` | Interactive deployment script |

---

## Quick Deploy Checklist

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Deploy backend to Railway
- [ ] Copy environment variables from `DEPLOYMENT_SECRETS.md`
- [ ] Update `config.js` with Railway URL
- [ ] Deploy frontend to Vercel
- [ ] Update Railway `CORS_ORIGIN` with Vercel URL
- [ ] Test: Visit Vercel URL
- [ ] Test: Register new account
- [ ] Test: Browse profiles

---

## Need Help?

- 📖 Read [DEPLOYMENT_GUIDE.md](file:///Users/dircreativobda/.gemini/antigravity/scratch/scorta-app/DEPLOYMENT_GUIDE.md) for troubleshooting
- 🔍 Check browser console (F12) for errors
- 📊 View Railway logs for backend issues

---

## Estimated Time

⏱️ **Total: 1-2 hours** (first time)

- GitHub setup: 10 minutes
- Railway deploy: 15 minutes
- Vercel deploy: 10 minutes
- Configuration: 15 minutes
- Testing: 15 minutes

---

## After Deployment

Your SCORTA MVP will be live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.up.railway.app`

Start getting feedback and iterate! 🎉
