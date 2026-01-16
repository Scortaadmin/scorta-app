# 🚀 SCORTA MVP - Deployment Guide

This guide will walk you through deploying SCORTA to production in under 2 hours.

## 📋 Prerequisites

- GitHub account (for code hosting)
- Railway account (for backend) - https://railway.app
- Vercel OR Netlify account (for frontend) - https://vercel.com or https://netlify.com
- MongoDB Atlas already configured ✅ (from CREDENTIALS.md)

---

## 🔧 Part 1: Prepare Code for Deployment

### 1.1 Update Production API URL in config.js

After you deploy the backend to Railway (Part 2), you'll get a URL like:
```
https://scorta-production.up.railway.app
```

**Open** `config.js` and update line 14:
```javascript
// Change this line:
return 'https://YOUR_RAILWAY_APP.up.railway.app/api';

// To your actual Railway URL:
return 'https://scorta-production.up.railway.app/api';
```

### 1.2 Generate Secure JWT Secrets

Run these commands to generate random secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the two generated strings. You'll use them in Railway environment variables.

---

## 🚂 Part 2: Deploy Backend to Railway

### 2.1 Create Railway Project

1. Go to https://railway.app and sign up/login
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Connect your GitHub account if not already connected
5. **IMPORTANT**: You need to push your code to GitHub first

### 2.2 Push Code to GitHub (if not already done)

```bash
cd /Users/dircreativobda/.gemini/antigravity/scratch/scorta-app
git init
git add .
git commit -m "Initial SCORTA MVP commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/scorta-app.git
git branch -M main
git push -u origin main
```

### 2.3 Deploy Backend on Railway

1. In Railway, select your `scorta-app` repository
2. Click on **"backend"** folder or configure root directory to `/backend`
3. Railway will auto-detect it's a Node.js project

### 2.4 Configure Environment Variables

Click on your Railway project → **Variables** tab → Add the following:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://scortauser:Adminscorta2026@cluster0.ae6cmdg.mongodb.net/scorta?retryWrites=true&w=majority
JWT_SECRET=<paste first generated secret here>
JWT_REFRESH_SECRET=<paste second generated secret here>
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=*
ADMIN_EMAIL=admin@scorta.com
ADMIN_PASSWORD=Admin123!Secure
```

**Note**: We'll update `CORS_ORIGIN` after frontend deployment.

### 2.5 Deploy

1. Click **"Deploy"** - Railway will build and deploy automatically
2. Wait 2-3 minutes for deployment to complete
3. Once deployed, copy your production URL (looks like: `https://scorta-production.up.railway.app`)

### 2.6 Test Backend

Open your browser and visit:
```
https://YOUR-RAILWAY-URL.up.railway.app/health
```

You should see:
```json
{
  "success": true,
  "message": "SCORTA API is running",
  "timestamp": "2026-01-16T...",
  "environment": "production"
}
```

✅ **Backend deployed!**

---

## 🎨 Part 3: Deploy Frontend to Vercel

### 3.1 Update config.js with Railway URL

**IMPORTANT**: Before deploying frontend, update `config.js` line 14 with your actual Railway URL from Part 2.5:

```javascript
// In config.js, line 14:
return 'https://scorta-production.up.railway.app/api';
```

Commit this change:
```bash
git add config.js
git commit -m "Update production API URL"
git push
```

### 3.2 Deploy to Vercel

1. Go to https://vercel.com and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository (`scorta-app`)
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root, not backend folder)
   - **Build Command**: Leave empty
   - **Output Directory**: `./`
5. Click **"Deploy"**

### 3.3 Get Frontend URL

After deployment, Vercel will give you a URL like:
```
https://scorta-app-xyz123.vercel.app
```

### 3.4 Update CORS_ORIGIN in Railway

Go back to Railway → Your backend project → Variables:

Update `CORS_ORIGIN`:
```
CORS_ORIGIN=https://scorta-app-xyz123.vercel.app
```

Click **"Save"** - Railway will automatically redeploy with new CORS settings.

✅ **Frontend deployed!**

---

## 🔒 Part 4: Security & Final Steps

### 4.1 Update Frontend Meta Tags (Optional)

Edit `index.html` to add your production URL:
```html
<meta property="og:url" content="https://scorta-app-xyz123.vercel.app">
<link rel="canonical" href="https://scorta-app-xyz123.vercel.app">
```

### 4.2 Test Production App

1. Visit your Vercel URL: `https://scorta-app-xyz123.vercel.app`
2. You should see the age verification screen
3. Click "Soy mayor de edad"
4. Register a new account
5. Browse profiles
6. Test favorites, WhatsApp contact buttons

### 4.3 Seed Database (if empty)

If you don't have any profiles in MongoDB yet:

```bash
cd backend
node seed.js
```

This will create sample provider profiles in your database.

---

## 🌐 Part 5: Custom Domain (Optional)

### 5.1 Add Custom Domain to Vercel

1. In Vercel project → Settings → Domains
2. Add your domain (e.g., `scorta.com`)
3. Follow Vercel's instructions to configure DNS

### 5.2 Update CORS Again

Once custom domain is active, update Railway `CORS_ORIGIN`:
```
CORS_ORIGIN=https://scorta.com
```

---

## ✅ Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Backend /health endpoint returns success
- [ ] Frontend deployed to Vercel
- [ ] Frontend loads without errors
- [ ] CORS configured correctly
- [ ] config.js has correct production API URL
- [ ] Can register new account
- [ ] Can browse profiles
- [ ] WhatsApp links work
- [ ] Legal pages (Terms, Privacy) are accessible
- [ ] PWA installs on mobile

---

## 🐛 Troubleshooting

### "Failed to fetch" errors

**Problem**: Frontend can't connect to backend.

**Solutions**:
1. Check `config.js` has correct Railway URL
2. Verify `CORS_ORIGIN` in Railway matches your Vercel URL exactly
3. Check Railway logs for errors: Railway project → Deployments → Logs

### "Network error" on registration/login

**Problem**: Backend not receiving requests.

**Solutions**:
1. Open browser DevTools (F12) → Console
2. Check the error message
3. Verify API URL in Network tab
4. Make sure Railway backend is running (check Railway dashboard)

### MongoDB connection errors

**Problem**: Backend can't connect to MongoDB Atlas.

**Solutions**:
1. Verify `MONGODB_URI` in Railway variables is correct
2. Check MongoDB Atlas network access allows connections from anywhere (0.0.0.0/0)
3. Check database user credentials

### Pages show 404

**Problem**: SPA routing not configured.

**Solutions**:
- Vercel/Netlify should have `vercel.json` or `netlify.toml` with redirects
- Make sure these files are committed to Git

---

## 📊 Monitoring

### Railway Logs

View real-time backend logs:
1. Railway project → Deployments
2. Click on latest deployment
3. View logs

### Vercel Analytics

View frontend analytics:
1. Vercel project → Analytics
2. See page views, visitors, performance

---

## 🔄 Redeploying Updates

### Backend Changes

```bash
cd backend
# Make your changes
git add .
git commit -m "Update backend"
git push
# Railway auto-deploys
```

### Frontend Changes

```bash
# Make your changes to frontend files
git add .
git commit -m "Update frontend"
git push
# Vercel auto-deploys
```

---

## 🎉 Success!

Your SCORTA MVP is now live! Share your production URL with testers and start gathering feedback.

**Next steps** (post-MVP):
- Implement real-time chat with Socket.io
- Add payment processing with Stripe
- Enhance verification system
- Add analytics dashboard

---

## 📞 Need Help?

If you encounter issues:
1. Check Railway/Vercel logs
2. Review browser console errors (F12)
3. Verify all environment variables are set correctly
4. Make sure MongoDB Atlas is accessible

**File generated**: `/Users/dircreativobda/.gemini/antigravity/scratch/scorta-app/DEPLOYMENT_GUIDE.md`
