# 🚀 AWS DEPLOYMENT GUIDE - GET LIVE IN 30 MINUTES

## 🎯 FASTEST DEPLOYMENT METHOD (RECOMMENDED)

### Prerequisites
- AWS Account (create at aws.amazon.com if needed)
- AWS CLI installed and configured
- Docker Desktop installed and running

### Quick Deploy Steps

#### 1️⃣ Configure AWS Credentials (5 minutes)

```powershell
# Install AWS CLI if not installed
# Download from: https://aws.amazon.com/cli/

# Configure AWS credentials
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region (us-east-1 recommended)
# - Default output format (json)
```

#### 2️⃣ Run Deployment Script (20-25 minutes)

```powershell
# Make sure Docker Desktop is running!

# Run the automated deployment
.\aws-deploy-quick.ps1
```

That's it! The script will:
- ✅ Create ECR repositories
- ✅ Build Docker images
- ✅ Push to ECR
- ✅ Deploy backend with AWS App Runner
- ✅ Deploy frontend with AWS App Runner
- ✅ Configure all environment variables
- ✅ Set up health checks

#### 3️⃣ Access Your Live App

The script will output URLs like:
```
📱 Frontend URL: https://xxx.us-east-1.awsapprunner.com
🔧 Backend URL:  https://yyy.us-east-1.awsapprunner.com
```

Visit the frontend URL in your browser - your app is live!

---

## 📊 What Gets Deployed

### Backend (AWS App Runner)
- FastAPI application
- WebSocket support
- Auto-scaling (1-10 instances)
- Health checks every 10 seconds
- 1 vCPU, 2GB RAM per instance

### Frontend (AWS App Runner)  
- React + Vite application
- Nginx serving static files
- Auto-scaling (1-10 instances)
- Connected to backend via environment variables
- 1 vCPU, 2GB RAM per instance

### Estimated Costs
- **Free Tier**: First 2,000 vCPU-hours/month free
- **After free tier**: ~$25-50/month for both services
- **Inactive services**: Charged at 1/10th the rate

---

## 🔧 Alternative Deployment Methods

### Option 1: Manual AWS Console Deployment (30 minutes)

1. **Create ECR Repositories**
   - Go to AWS Console → ECR
   - Create two repositories: `ebl-backend` and `ebl-frontend`

2. **Build and Push Images**
   ```powershell
   # Login to ECR
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

   # Build and push backend
   docker build -f Dockerfile.backend -t ebl-backend .
   docker tag ebl-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ebl-backend:latest
   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ebl-backend:latest

   # Build and push frontend
   docker build -f Dockerfile.frontend -t ebl-frontend .
   docker tag ebl-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ebl-frontend:latest
   docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ebl-frontend:latest
   ```

3. **Create App Runner Services**
   - Go to AWS Console → App Runner
   - Create service for backend:
     - Source: Container registry → Amazon ECR
     - Select `ebl-backend` repository
     - Port: 8000
     - CPU: 1 vCPU, Memory: 2GB
     - Health check: /health
   - Create service for frontend:
     - Source: Container registry → Amazon ECR
     - Select `ebl-frontend` repository
     - Port: 80
     - CPU: 1 vCPU, Memory: 2GB
     - Environment variables:
       - VITE_API_URL: (backend URL from above)
       - VITE_WS_URL: (backend URL with wss://)

### Option 2: AWS Amplify (Frontend Only) - Fastest Frontend Deploy

```powershell
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
amplify init

# Add hosting
amplify add hosting

# Publish
amplify publish
```

Then deploy backend separately using App Runner or EC2.

### Option 3: AWS EC2 with Docker (Full Control)

1. Launch EC2 instance (t2.medium or larger)
2. SSH into instance
3. Install Docker:
   ```bash
   sudo yum update -y
   sudo yum install -y docker
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   ```
4. Clone repo and run docker-compose:
   ```bash
   git clone YOUR_REPO_URL
   cd ebl
   docker-compose up -d
   ```

---

## 🔍 Troubleshooting

### Issue: Docker images fail to build
**Solution**: Make sure Docker Desktop is running
```powershell
# Check Docker status
docker ps

# If error, start Docker Desktop application
```

### Issue: AWS credentials not configured
**Solution**: 
```powershell
aws configure
# Enter your AWS Access Key ID and Secret
```

To create access keys:
1. Go to AWS Console
2. Click your name → Security credentials
3. Access keys → Create New Access Key

### Issue: "Service already exists" error
**Solution**: Update the existing service
```powershell
# Get service ARN
aws apprunner list-services --region us-east-1

# Update service
aws apprunner update-service --service-arn YOUR_SERVICE_ARN --region us-east-1
```

### Issue: App not loading after deployment
**Solutions**:
1. Wait 5-10 minutes for full initialization
2. Check service status:
   ```powershell
   aws apprunner list-services --region us-east-1
   ```
3. Check logs in AWS Console → App Runner → Your Service → Logs
4. Verify health check passes:
   ```powershell
   curl https://YOUR_BACKEND_URL/health
   ```

### Issue: WebSocket connection fails
**Solutions**:
1. Verify VITE_WS_URL uses `wss://` (not `ws://`)
2. Check CORS configuration in backend
3. Ensure App Runner allows WebSocket connections (it does by default)

### Issue: Frontend can't connect to backend
**Solutions**:
1. Check environment variables in App Runner console
2. Verify VITE_API_URL matches backend URL exactly
3. Check backend health endpoint
4. Look at browser console for CORS errors

---

## 📱 Post-Deployment Steps

### 1. Test the Application
```powershell
# Test backend health
curl https://YOUR_BACKEND_URL/health

# Test API docs
# Open in browser: https://YOUR_BACKEND_URL/docs

# Test frontend
# Open in browser: https://YOUR_FRONTEND_URL
```

### 2. Set Up Custom Domain (Optional)
1. Go to App Runner console
2. Select your service
3. Custom domains → Link domain
4. Follow DNS configuration steps

### 3. Monitor Your Application
- AWS Console → App Runner → Metrics
- CloudWatch Logs for debugging
- Set up CloudWatch Alarms for alerts

### 4. Enable Auto-Deploy (Recommended)
App Runner can auto-deploy when you push to ECR:
1. Enable in App Runner console
2. Every time you push new image, it auto-deploys

---

## 💰 Cost Management

### Monitor Costs
```powershell
# Check current costs
aws ce get-cost-and-usage --time-period Start=2025-01-01,End=2025-01-31 --granularity MONTHLY --metrics BlendedCost
```

### Reduce Costs
1. **Use free tier**: First 2,000 vCPU-hours free
2. **Pause services**: Delete services when not testing
3. **Use smaller instances**: Reduce CPU/RAM if not needed
4. **Set up budgets**: AWS Budgets → Create alert

### Delete Services
```powershell
# Delete frontend
aws apprunner delete-service --service-arn YOUR_FRONTEND_SERVICE_ARN --region us-east-1

# Delete backend  
aws apprunner delete-service --service-arn YOUR_BACKEND_SERVICE_ARN --region us-east-1

# Delete ECR images (optional)
aws ecr delete-repository --repository-name ebl-frontend --force --region us-east-1
aws ecr delete-repository --repository-name ebl-backend --force --region us-east-1
```

---

## 🚦 Deployment Checklist

Before deploying:
- [ ] Docker Desktop is running
- [ ] AWS credentials configured (`aws sts get-caller-identity` works)
- [ ] Code is committed and pushed to Git
- [ ] Environment variables are set correctly
- [ ] All tests pass locally

After deploying:
- [ ] Health check endpoint responds
- [ ] Frontend loads in browser
- [ ] Audio playback works
- [ ] WebSocket connections work
- [ ] API documentation accessible
- [ ] Custom domain configured (if applicable)
- [ ] CloudWatch logs are being generated
- [ ] Cost alerts configured

---

## 📞 Support

If you encounter issues:
1. Check AWS Service Health Dashboard
2. Review CloudWatch Logs
3. Check AWS App Runner documentation
4. Contact AWS Support (if you have a support plan)

---

## 🎯 Next Steps

After deployment:
1. Set up CI/CD with GitHub Actions or GitLab CI
2. Configure custom domain
3. Set up monitoring and alerts
4. Enable auto-scaling rules
5. Configure backup strategy
6. Set up staging environment

---

**Deployment Time**: 20-30 minutes
**Estimated Cost**: $25-50/month (after free tier)
**Uptime**: 99.9% SLA with App Runner