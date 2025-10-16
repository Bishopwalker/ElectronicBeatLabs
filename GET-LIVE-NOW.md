# 🚨 GET EBL LIVE ON AWS RIGHT NOW - 30 MINUTE GUIDE

## ⚡ WHAT TO DO RIGHT NOW

### Step 1: Prerequisites (5 minutes)

1. **Make sure Docker Desktop is RUNNING**
   - Open Docker Desktop app
   - Wait for it to say "Docker Desktop is running"

2. **Check if AWS CLI is installed**
   ```powershell
   aws --version
   ```
   
   If it says "command not found":
   - Download AWS CLI: https://awscli.amazonaws.com/AWSCLIV2.msi
   - Run installer
   - Restart PowerShell

3. **Configure AWS Credentials**
   ```powershell
   aws configure
   ```
   
   You'll need:
   - **AWS Access Key ID**: Get from AWS Console → Your Name → Security Credentials → Create Access Key
   - **Secret Access Key**: Shows once when you create key (save it!)
   - **Region**: Type `us-east-1` (or your preferred region)
   - **Output format**: Type `json`

### Step 2: Deploy (ONE COMMAND - 25 minutes)

#### Option A: Double-Click Deployment (EASIEST)
1. Navigate to your project folder: `C:\Users\bisho\IdeaProjects\ebl`
2. **Double-click** `deploy-to-aws.bat`
3. Press Enter when prompted
4. Wait 20-30 minutes
5. DONE! Your URLs will be in `aws-deployment-info.txt`

#### Option B: PowerShell Deployment
```powershell
cd C:\Users\bisho\IdeaProjects\ebl
.\aws-deploy-quick.ps1
```

### Step 3: Access Your Live App (Immediate)

The script will output:
```
📱 Frontend URL: https://xxx.us-east-1.awsapprunner.com
🔧 Backend URL:  https://yyy.us-east-1.awsapprunner.com
```

**Open the Frontend URL in your browser - your app is LIVE!**

---

## 🎯 WHAT THE SCRIPT DOES

1. ✅ Creates AWS ECR repositories (Docker image storage)
2. ✅ Builds backend Docker image
3. ✅ Builds frontend Docker image
4. ✅ Pushes images to AWS ECR
5. ✅ Creates AWS App Runner service for backend
6. ✅ Creates AWS App Runner service for frontend
7. ✅ Configures all environment variables automatically
8. ✅ Sets up health checks
9. ✅ Enables auto-scaling

---

## 📊 WHAT YOU GET

### Backend
- **URL**: `https://xxx.us-east-1.awsapprunner.com`
- **Health Check**: `/health` endpoint
- **API Docs**: `/docs` endpoint (FastAPI Swagger UI)
- **Resources**: 1 vCPU, 2GB RAM
- **Auto-scaling**: 1-10 instances based on traffic

### Frontend
- **URL**: `https://yyy.us-east-1.awsapprunner.com`
- **Connects to**: Backend automatically
- **WebSocket**: Fully supported
- **Resources**: 1 vCPU, 2GB RAM
- **Auto-scaling**: 1-10 instances based on traffic

---

## 💰 COST

### Free Tier (First Month)
- First 2,000 vCPU-hours FREE
- Likely covers your entire first month

### After Free Tier
- **Backend**: ~$15-25/month
- **Frontend**: ~$10-15/month
- **Total**: ~$25-40/month
- **Inactive cost**: 1/10th (when not being used)

---

## 🔧 TROUBLESHOOTING

### Issue: "Docker is not running"
**Fix**: Open Docker Desktop application and wait for it to start

### Issue: "AWS credentials not configured"
**Fix**: Run `aws configure` and enter your credentials

### Issue: "Access Denied" errors
**Fix**: Make sure your AWS account has permissions for:
- ECR (Elastic Container Registry)
- App Runner
- IAM (to create roles)

### Issue: Script fails at "Creating IAM role"
**Fix**: Wait 30 seconds and run script again (IAM propagation delay)

### Issue: "Service already exists"
**Fix**: This is OK - script will update existing service

### Issue: App not loading after 30 minutes
**Fix**: 
1. Check service status:
   ```powershell
   aws apprunner list-services --region us-east-1
   ```
2. View logs in AWS Console → App Runner → Your Service → Logs
3. Check health endpoint: `curl https://YOUR_BACKEND_URL/health`

---

## 🎉 AFTER DEPLOYMENT

### Test Your App
1. **Frontend**: Open frontend URL in browser
2. **Backend Health**: Visit `https://YOUR_BACKEND_URL/health`
3. **API Docs**: Visit `https://YOUR_BACKEND_URL/docs`
4. **Play Audio**: Test binaural beat generation
5. **Check WebSocket**: Open browser console, verify no errors

### Save Your URLs
The script creates `aws-deployment-info.txt` with all your deployment info. SAVE THIS FILE!

### Optional: Set Up Custom Domain
1. Go to AWS App Runner console
2. Select your frontend service
3. Click "Custom domains"
4. Follow instructions to point your domain

---

## 🚀 UPDATE YOUR APP LATER

To deploy updates:

```powershell
# 1. Make your code changes
# 2. Re-run deployment script
.\aws-deploy-quick.ps1

# That's it! Script will update existing services
```

---

## 🛑 DELETE EVERYTHING (To Save Money)

If you want to tear everything down:

```powershell
# Get service ARNs
aws apprunner list-services --region us-east-1

# Delete frontend
aws apprunner delete-service --service-arn YOUR_FRONTEND_ARN --region us-east-1

# Delete backend
aws apprunner delete-service --service-arn YOUR_BACKEND_ARN --region us-east-1

# Delete ECR repositories (optional)
aws ecr delete-repository --repository-name ebl-frontend --force --region us-east-1
aws ecr delete-repository --repository-name ebl-backend --force --region us-east-1
```

---

## ⏱️ TIMELINE

| Step | Time | What Happens |
|------|------|--------------|
| Prerequisites | 5 min | Install/configure AWS CLI |
| Build Images | 10-15 min | Docker builds backend + frontend |
| Push to ECR | 3-5 min | Upload images to AWS |
| Deploy Backend | 3-5 min | Create App Runner service |
| Deploy Frontend | 3-5 min | Create App Runner service |
| **TOTAL** | **25-35 min** | **App is LIVE** |

---

## 📞 NEED HELP?

### Check Logs
```powershell
# AWS Console → App Runner → Your Service → Logs
# Or use CLI:
aws apprunner describe-service --service-arn YOUR_SERVICE_ARN --region us-east-1
```

### Check Service Status
```powershell
aws apprunner list-services --region us-east-1
```

### Common Issues
- **Port conflicts**: Make sure no other services using ports 8000 or 5173
- **Docker issues**: Restart Docker Desktop
- **AWS issues**: Check AWS Service Health Dashboard
- **Build failures**: Check you have enough disk space (need ~5GB)

---

## ✅ SUCCESS CHECKLIST

After running deployment script, verify:
- [ ] Script completed without errors
- [ ] `aws-deployment-info.txt` file created
- [ ] Frontend URL opens in browser
- [ ] Backend health check returns 200 OK
- [ ] API docs load at `/docs`
- [ ] Audio playback works on frontend
- [ ] No console errors in browser

---

## 🎯 YOU'RE DONE!

Your app is now live on AWS and accessible to anyone with the URL!

**Next Steps:**
1. Share the frontend URL with users
2. Set up custom domain (optional)
3. Configure monitoring/alerts
4. Set up CI/CD for automatic deployments

---

**Deployment Status**: ✅ READY TO DEPLOY
**Estimated Time**: 25-35 minutes
**Difficulty**: Easy (one command)
**Cost**: Free tier for first month, then ~$30/month
