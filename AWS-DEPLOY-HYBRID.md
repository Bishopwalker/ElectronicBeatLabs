# 🚀 AWS HYBRID DEPLOYMENT - Lambda + Containers

## 🎯 Architecture Overview

### Why Hybrid Model?

**Electronic Beat Labs has two distinct workload types:**

1. **Quick REST API calls** (user auth, settings, presets)
   - ✅ **Solution: AWS Lambda + API Gateway**
   - ✅ Pay only for requests (no idle costs)
   - ✅ Auto-scales instantly
   - ✅ ~95% cost savings vs always-on containers

2. **Long-running WebSocket audio streaming** (real-time binaural beats)
   - ✅ **Solution: ECS Fargate**
   - ✅ Handles WebSocket connections (Lambda max 15min timeout)
   - ✅ Consistent performance for audio processing
   - ✅ Auto-scales based on active connections

3. **Static Frontend** (React/Vite build)
   - ✅ **Solution: S3 + CloudFront CDN**
   - ✅ ~$1/month for hosting
   - ✅ Global edge caching
   - ✅ Lightning-fast load times

---

## 📊 Hybrid Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CloudFront CDN                       │
│                    (Global Edge Caching)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       │                               │
       ▼                               ▼
┌─────────────┐              ┌──────────────────┐
│   S3 Bucket │              │   API Gateway     │
│  (Frontend) │              │  (REST + WS)     │
└─────────────┘              └────────┬─────────┘
                                      │
                      ┌───────────────┴────────────────┐
                      │                                │
                      ▼                                ▼
              ┌──────────────┐              ┌──────────────────┐
              │ Lambda REST  │              │  ECS Fargate     │
              │   (FastAPI)  │              │  (WebSocket +    │
              │              │              │   Audio Stream)  │
              │ • /auth      │              │                  │
              │ • /presets   │              │ • /ws/audio      │
              │ • /settings  │              │ • Real-time PCM  │
              └──────────────┘              └──────────────────┘
```

---

## 💰 Cost Comparison

### Current (App Runner Both Services): ~$50-70/month
- Backend: $25-35/month (always running)
- Frontend: $25-35/month (always running)

### Hybrid Model: ~$10-20/month
- **Lambda REST API**: $0-2/month (1M requests free tier)
- **ECS Fargate WebSocket**: $8-15/month (only when users streaming)
- **S3 + CloudFront**: $1-3/month (50GB transfer free tier)

**Savings: ~70-80% reduction** 💰

---

## 🏗️ Deployment Components

### 1. Lambda Functions (Serverless Framework)
**File:** `serverless.yml`
- REST API endpoints
- Auto-scales to zero when idle
- 1GB memory, 10s timeout (fast responses)

### 2. ECS Fargate Service
**File:** `aws-ecs-task-definition.json`
- WebSocket audio streaming
- Auto-scales: 1-5 tasks based on CPU/connections
- 2GB RAM, 1 vCPU per task

### 3. S3 + CloudFront
**Files:** `aws-s3-cloudfront.json`
- Static frontend hosting
- Global CDN with edge caching
- HTTPS by default

---

## 🚀 Quick Deploy (30 minutes)

### Prerequisites
```powershell
# Install AWS CLI
# Download from: https://aws.amazon.com/cli/

# Install Serverless Framework
npm install -g serverless

# Install Docker
# Download from: https://docker.com

# Configure AWS credentials
aws configure
# Enter: Access Key, Secret Key, Region (us-east-1), Format (json)
```

### Step 1: Deploy Lambda REST API (5 minutes)
```powershell
cd backend
serverless deploy --stage prod

# Output:
# ✅ REST API URL: https://abc123.execute-api.us-east-1.amazonaws.com/prod
```

### Step 2: Deploy ECS Fargate WebSocket Service (15 minutes)
```powershell
# Run deployment script
.\aws-deploy-ecs.ps1

# Output:
# ✅ WebSocket URL: wss://ebl-websocket.us-east-1.elb.amazonaws.com
```

### Step 3: Deploy Frontend to S3 + CloudFront (10 minutes)
```powershell
# Build frontend
npm run build

# Deploy to S3
.\aws-deploy-frontend.ps1

# Output:
# ✅ Frontend URL: https://d1234abcd.cloudfront.net
```

---

## 📁 File Structure

```
/backend
  ├── serverless.yml              # Lambda configuration
  ├── lambda/                     # Lambda function handlers
  │   ├── auth.py                 # Auth endpoints
  │   ├── presets.py              # Preset management
  │   └── settings.py             # User settings
  ├── websocket/                  # ECS Fargate service
  │   ├── Dockerfile              # Container image
  │   ├── main.py                 # WebSocket server
  │   └── audio_engine.py         # Audio processing
  └── aws-ecs-task-definition.json

/frontend
  └── aws-s3-cloudfront.json

/scripts
  ├── aws-deploy-lambda.ps1       # Deploy Lambda
  ├── aws-deploy-ecs.ps1          # Deploy ECS Fargate
  └── aws-deploy-frontend.ps1     # Deploy S3/CloudFront
```

---

## 🔧 Detailed Configuration

### Lambda Function Split

**Cold Start Optimization:**
- Separate Lambda per route group
- Shared layer for common dependencies
- Provisioned concurrency for critical endpoints

**Lambda Functions:**
```yaml
functions:
  auth:
    handler: lambda/auth.handler
    events:
      - http: POST /auth/login
      - http: POST /auth/register
      - http: POST /auth/logout

  presets:
    handler: lambda/presets.handler
    events:
      - http: GET /presets
      - http: POST /presets
      - http: PUT /presets/{id}
      - http: DELETE /presets/{id}

  settings:
    handler: lambda/settings.handler
    events:
      - http: GET /settings
      - http: PUT /settings
```

### ECS Fargate Configuration

**Task Definition:**
- **CPU:** 1024 (1 vCPU)
- **Memory:** 2048 MB
- **Networking:** awsvpc mode with public IP
- **Load Balancer:** Network Load Balancer (WebSocket support)

**Auto-Scaling:**
- **Min:** 1 task
- **Max:** 5 tasks
- **Target:** 70% CPU utilization
- **Scale-up:** +1 task when CPU > 70% for 2 minutes
- **Scale-down:** -1 task when CPU < 30% for 5 minutes

### S3 + CloudFront Setup

**S3 Bucket:**
- Static website hosting enabled
- Public read access via CloudFront OAI
- Versioning enabled for rollbacks

**CloudFront Distribution:**
- **Origin:** S3 bucket
- **Price Class:** Use all edge locations
- **SSL Certificate:** ACM certificate (free)
- **Default Root:** index.html
- **Error Pages:** Redirect 404 → /index.html (SPA routing)

---

## 🔐 Security Configuration

### Lambda Security
```yaml
provider:
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:Query
            - dynamodb:GetItem
            - dynamodb:PutItem
          Resource: "arn:aws:dynamodb:*:*:table/ebl-*"
```

### ECS Security Groups
```json
{
  "SecurityGroupIngress": [
    {
      "IpProtocol": "tcp",
      "FromPort": 8000,
      "ToPort": 8000,
      "CidrIp": "0.0.0.0/0",
      "Description": "WebSocket connections"
    }
  ]
}
```

### CloudFront Security Headers
```json
{
  "CustomHeaders": {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block"
  }
}
```

---

## 🧪 Testing Deployment

### Test Lambda REST API
```powershell
# Test auth endpoint
curl -X POST https://YOUR_API_URL/prod/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"test","password":"test"}'

# Test presets endpoint
curl https://YOUR_API_URL/prod/presets
```

### Test ECS WebSocket
```powershell
# Use wscat for WebSocket testing
npm install -g wscat
wscat -c wss://YOUR_WEBSOCKET_URL/ws/audio
```

### Test Frontend
```powershell
# Open in browser
start https://YOUR_CLOUDFRONT_URL

# Check all static assets load
curl -I https://YOUR_CLOUDFRONT_URL
```

---

## 📈 Monitoring & Logging

### Lambda Monitoring
- **CloudWatch Logs:** Automatic logging for each invocation
- **X-Ray Tracing:** Enable for request tracing
- **Metrics:** Duration, error rate, throttles

### ECS Monitoring
- **Container Insights:** CPU, memory, network metrics
- **CloudWatch Logs:** stdout/stderr from containers
- **Target Tracking:** Auto-scaling metrics

### CloudFront Monitoring
- **CloudWatch Metrics:** Requests, bytes downloaded, error rate
- **Access Logs:** S3 bucket for detailed request logs

---

## 🚨 Troubleshooting

### Lambda Issues

**Issue: Cold start latency**
```yaml
# Solution: Add provisioned concurrency
functions:
  auth:
    provisionedConcurrency: 1
```

**Issue: Timeout errors**
```yaml
# Solution: Increase timeout
functions:
  auth:
    timeout: 30  # seconds
```

### ECS Issues

**Issue: Tasks failing health checks**
```json
// Solution: Update health check settings
{
  "healthCheck": {
    "command": ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
    "interval": 30,
    "timeout": 5,
    "retries": 3,
    "startPeriod": 60
  }
}
```

**Issue: WebSocket disconnections**
```json
// Solution: Increase idle timeout on NLB
{
  "LoadBalancerAttributes": [
    {
      "Key": "idle_timeout.timeout_seconds",
      "Value": "300"
    }
  ]
}
```

### CloudFront Issues

**Issue: SPA routing breaks (404 on refresh)**
```json
// Solution: Add error page redirect
{
  "CustomErrorResponses": [
    {
      "ErrorCode": 404,
      "ResponsePagePath": "/index.html",
      "ResponseCode": 200
    }
  ]
}
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to AWS Hybrid

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy Lambda
        run: |
          cd backend
          serverless deploy --stage prod

      - name: Deploy ECS
        run: |
          aws ecs update-service --cluster ebl-cluster --service websocket --force-new-deployment

      - name: Deploy Frontend
        run: |
          npm run build
          aws s3 sync dist/ s3://ebl-frontend/
          aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*"
```

---

## 💡 Optimization Tips

### Lambda Optimization
1. **Use Lambda Layers** for shared dependencies
2. **Enable VPC endpoint** for private RDS/DynamoDB access
3. **Compress responses** with gzip
4. **Cache API responses** with API Gateway caching

### ECS Optimization
1. **Use Fargate Spot** for 70% cost savings (non-critical workloads)
2. **Right-size containers** based on CloudWatch metrics
3. **Use ECR image scanning** for security vulnerabilities
4. **Enable container insights** for detailed metrics

### CloudFront Optimization
1. **Enable compression** for text files
2. **Set appropriate cache TTLs** (1 year for versioned assets)
3. **Use Route53** for custom domain
4. **Enable WAF** for DDoS protection

---

## 📞 Next Steps

After deployment:
1. ✅ Set up custom domain with Route53
2. ✅ Configure ACM SSL certificates
3. ✅ Set up CloudWatch alarms
4. ✅ Enable backup strategy (RDS snapshots, S3 versioning)
5. ✅ Create staging environment
6. ✅ Set up CI/CD pipeline
7. ✅ Configure WAF rules
8. ✅ Set up cost alerts

---

## 🎯 Quick Reference

**Lambda REST API:**
```
https://abc123.execute-api.us-east-1.amazonaws.com/prod
```

**ECS WebSocket:**
```
wss://ebl-websocket.us-east-1.elb.amazonaws.com
```

**CloudFront Frontend:**
```
https://d1234abcd.cloudfront.net
```

**Total Deploy Time:** 30-40 minutes
**Monthly Cost:** $10-20 (70-80% savings)
**Scalability:** Auto-scales from 0 to thousands of users
