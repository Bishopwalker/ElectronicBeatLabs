# Vercel + GitLab Deployment Setup Guide

## Overview
This guide sets up automatic deployments from GitLab to Vercel, bypassing GitHub's secret scanning issues.

## Setup Steps

### 1. Get Your Vercel Token
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name it: "GitLab CI Deployment"
4. Copy the token (you won't see it again!)

### 2. Add Token to GitLab CI/CD Variables
1. Go to your GitLab project: https://gitlab.com/bishop8-group/bbl
2. Navigate to: Settings → CI/CD → Variables
3. Click "Add Variable"
4. Add the following:
   - **Key**: `VERCEL_TOKEN`
   - **Value**: [Paste your Vercel token]
   - **Type**: Variable
   - **Environment scope**: All (or specific branches)
   - **Protected**: ✅ (if gang-gang is protected)
   - **Masked**: ✅ (hides in logs)

### 3. Link Your Vercel Project
Run this command locally once to link your project:

```bash
npx vercel link
```

Follow the prompts:
- Set up and deploy: Y
- Which scope: [Your Vercel team/account]
- Link to existing project? N (if new) or Y (if exists)
- What's your project name? electromagnetic-beat-lab
- Which directory is your code? ./
- Override settings? N

### 4. Configure Environment Variables in Vercel
Go to your Vercel project dashboard:
1. Settings → Environment Variables
2. Add these variables:
   ```
   VITE_API_URL = https://your-backend-url.com/api
   VITE_WS_URL = wss://your-backend-url.com/ws
   ```

### 5. How It Works

#### Automatic Preview Deployments
- Every push to any branch (except main/gang-gang) triggers a preview deployment
- URL format: `https://ebl-[branch-name].vercel.app`

#### Production Deployment
- Pushes to `gang-gang` branch trigger production deployment
- URL: `https://electromagnetic-beat-lab.vercel.app`

### 6. Test the Setup

```bash
# Make a small change
echo "# Test deployment" >> README.md

# Commit and push
git add README.md
git commit -m "Test Vercel deployment from GitLab"
git push origin gang-gang
```

Then check your GitLab pipeline:
- Go to CI/CD → Pipelines
- Click on the latest pipeline
- Check the `deploy-vercel-production` job

### 7. Deployment Commands (Manual)

If you need to deploy manually from local:

```bash
# Preview deployment
npx vercel

# Production deployment
npx vercel --prod
```

## Troubleshooting

### "Project not linked"
Run `npx vercel link` first

### "Invalid token"
Check your VERCEL_TOKEN in GitLab CI/CD variables

### "Build failed"
Check that all dependencies are in package.json (not devDependencies if needed for build)

### GitLab Pipeline Failing
Check the job logs in GitLab CI/CD → Pipelines → [Failed Job]

## Alternative: Direct CLI Deployment

If GitLab CI isn't working, you can deploy directly:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy to production
vercel --prod
```

This deploys from your local machine without needing GitHub.

## Benefits of This Setup
✅ No GitHub secret scanning issues
✅ Automatic deployments on push
✅ Preview deployments for all branches
✅ No manual deployment needed
✅ GitLab's security scanning still runs

## Current Configuration
- **Production Branch**: gang-gang
- **Preview Branches**: All others
- **Build Command**: npm run build
- **Output Directory**: dist
- **Framework**: Vite

---
*Last Updated: 2025-10-05*