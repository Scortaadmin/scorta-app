# 🚂 Railway Deployment - Manual Guide

## ✅ Progress So Far
- ✅ GitHub repository created: https://github.com/Scortaadmin/scorta-app
- ✅ Code pushed to GitHub (64 files)
- ✅ GitHub CLI authenticated

---

## 📋 Next Step: Deploy Backend to Railway

### Step 1: Login to Railway
1. Open Railway tab in your browser: https://railway.app
2. Click "Login" (top right)
3. Choose "Login with GitHub"
4. Authorize Railway to access your GitHub

### Step 2: Create New Project
1. Click "New Project" button
2. Select "Deploy from GitHub repo"
3. If asked, connect your GitHub account
4. Find and select: **Scortaadmin/scorta-app**
5. Click to confirm

### Step 3: Configure Backend Service
Railway will detect your repository. Configure it:

1. **Root Directory/Service Path**: Set to `backend`
   - Look for "Settings" or "Root Directory" option
   - Enter: `backend` or `/backend`

2. Click "Deploy" or "Add Service"

### Step 4: Add Environment Variables
While it's deploying, add environment variables:

1. Go to: Variables tab (or Settings → Variables)
2. Click "Add Variable" or "Raw Editor"
3. **Copy ALL these variables from DEPLOYMENT_SECRETS.md**:

```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://scortauser:Adminscorta2026@cluster0.ae6cmdg.mongodb.net/scorta?retryWrites=true&w=majority
JWT_SECRET=453780381d619e9b9d6ae69d7c87f942f04185af124e15e3528da2c442eef7bd
JWT_REFRESH_SECRET=4ba90ce4c91b6b893cc54bf7e1bc0f3dc5f4e988b9697960aac52ce1cac2be93
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

4. Click "Save" - Railway will redeploy automatically

### Step 5: Wait for Deployment
- Wait 2-5 minutes for deployment to complete
- Watch the "Deployments" tab for progress
- Status should change to "Success" or "Active"

### Step 6: Get Your Railway URL
1. Go to "Deployments" or "Settings" tab
2. Find your public URL
3. It will look like: `https://scorta-production-xxxxx.up.railway.app`
4. **COPY THIS URL** - you'll need it for the next step

### Step 7: Test Backend
Open in browser:
```
https://YOUR-RAILWAY-URL.up.railway.app/health
```

You should see:
```json
{
  "success": true,
  "message": "SCORTA API is running",
  "timestamp": "...",
  "environment": "production"
}
```

---

## 🐛 Troubleshooting

**If deployment fails**:
1. Check Railway logs (Deployments → Click deployment → View logs)
2. Common issues:
   - MongoDB connection: Verify MONGODB_URI is correct
   - Port: Ensure PORT=5000 or let Railway set it
   - Dependencies: Check backend/package.json

**If health check fails**:
1. Verify all environment variables are set
2. Check that MongoDB Atlas allows connections from 0.0.0.0/0
3. View Railway logs for errors

---

## ✅ Once Railway is Deployed

**Copy your Railway URL and come back** - I'll help you:
1. Update config.js with the Railway URL
2. Deploy frontend to Vercel
3. Update CORS settings

**Your Railway URL will look like**:
`https://scorta-production-xxxxx.up.railway.app`

---

**Ready?** Open Railway and follow these steps. Let me know your Railway URL when it's deployed! 🚀
