#!/bin/bash
# SCORTA Deployment Helper Script
# This script guides you through the deployment process

set -e  # Exit on error

echo "╔════════════════════════════════════════╗"
echo "║   🚀 SCORTA MVP Deployment Helper    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check Git status
echo -e "${BLUE}Step 1: Checking Git repository...${NC}"
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Git not initialized. Initializing now...${NC}"
    git init
    git add .
    git commit -m "Initial commit - SCORTA MVP"
fi
echo -e "${GREEN}✓ Git repository ready${NC}"
echo ""

# Step 2: Remind about GitHub
echo -e "${YELLOW}Step 2: Push to GitHub${NC}"
echo "Before deploying, you need to push this code to GitHub:"
echo ""
echo "1. Create a new repository on GitHub: https://github.com/new"
echo "2. Name it: scorta-app (or your preferred name)"
echo "3. DO NOT initialize with README or .gitignore"
echo "4. Run these commands:"
echo ""
echo -e "${BLUE}git remote add origin https://github.com/YOUR_USERNAME/scorta-app.git${NC}"
echo -e "${BLUE}git branch -M main${NC}"
echo -e "${BLUE}git push -u origin main${NC}"
echo ""
read -p "Press Enter after you've pushed to GitHub..."
echo ""

# Step 3: Railway Backend
echo -e "${YELLOW}Step 3: Deploy Backend to Railway${NC}"
echo "1. Go to: https://railway.app"
echo "2. Sign up or login"
echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
echo "4. Select your 'scorta-app' repository"
echo "5. Railway will auto-detect the Node.js backend"
echo ""
echo "📋 Environment Variables to add in Railway:"
echo "   (Copy from DEPLOYMENT_SECRETS.md)"
echo ""
read -p "Press Enter after backend is deployed..."
echo ""

# Step 4: Get Railway URL
echo -e "${YELLOW}Step 4: Get Your Railway URL${NC}"
echo -n "Enter your Railway backend URL (e.g., https://scorta-production.up.railway.app): "
read RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo -e "${YELLOW}Warning: No Railway URL provided. You'll need to update config.js manually.${NC}"
else
    echo -e "${GREEN}✓ Railway URL: $RAILWAY_URL${NC}"
    
    # Update config.js
    echo -e "${BLUE}Updating config.js with your Railway URL...${NC}"
    sed -i.bak "s|https://YOUR_RAILWAY_APP.up.railway.app|$RAILWAY_URL|g" config.js
    echo -e "${GREEN}✓ config.js updated${NC}"
    
    # Commit the change
    git add config.js
    git commit -m "Update production API URL to Railway"
    git push
    echo -e "${GREEN}✓ Changes pushed to GitHub${NC}"
fi
echo ""

# Step 5: Vercel Frontend
echo -e "${YELLOW}Step 5: Deploy Frontend to Vercel${NC}"
echo "1. Go to: https://vercel.com"
echo "2. Sign up or login"
echo "3. Click 'Add New Project'"
echo "4. Import your 'scorta-app' repository"
echo "5. Configure:"
echo "   - Framework Preset: Other"
echo "   - Root Directory: ./"
echo "   - Build Command: (leave empty)"
echo "   - Output Directory: ./"
echo "6. Click 'Deploy'"
echo ""
read -p "Press Enter after frontend is deployed..."
echo ""

# Step 6: Get Vercel URL
echo -e "${YELLOW}Step 6: Update CORS Origin${NC}"
echo -n "Enter your Vercel URL (e.g., https://scorta-app.vercel.app): "
read VERCEL_URL

if [ -z "$VERCEL_URL" ]; then
    echo -e "${YELLOW}Warning: No Vercel URL provided.${NC}"
else
    echo -e "${GREEN}✓ Vercel URL: $VERCEL_URL${NC}"
    echo ""
    echo "🔧 Final step:"
    echo "Go to Railway → Your Project → Variables"
    echo "Update: CORS_ORIGIN=$VERCEL_URL"
    echo "Railway will auto-redeploy"
fi
echo ""

# Step 7: Testing
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo "✅ Test your deployment:"
echo ""
if [ -n "$RAILWAY_URL" ]; then
    echo "Backend Health: $RAILWAY_URL/health"
fi
if [ -n "$VERCEL_URL" ]; then
    echo "Frontend App: $VERCEL_URL"
fi
echo ""
echo "📚 Full manual: DEPLOYMENT_GUIDE.md"
echo "🔐 Secrets file: DEPLOYMENT_SECRETS.md"
echo ""
echo "🚀 Your SCORTA MVP is now LIVE!"
