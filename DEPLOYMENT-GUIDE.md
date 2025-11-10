# 🚀 Electronic Beat Labs - Deployment Guide

## 📋 Table of Contents
1. [Deployment Options](#deployment-options)
2. [Hybrid AWS Deployment (Recommended)](#hybrid-aws-deployment-recommended)
3. [Traditional Deployment](#traditional-deployment)
4. [Cost Comparison](#cost-comparison)

---

## Deployment Options

Electronic Beat Labs supports multiple deployment strategies:

### 1. **Hybrid AWS Deployment** (Recommended) 🌟
- **Lambda** for REST API endpoints (pay per request)
- **ECS Fargate** for WebSocket audio streaming (long-running)
- **S3 + CloudFront** for frontend (global CDN)
- **Cost:** ~$10-20/month (70-80% savings)
- **Deploy time:** 30-40 minutes
- **Best for:** Production, cost optimization, scalability

📖 **[See detailed guide: AWS-DEPLOY-HYBRID.md](AWS-DEPLOY-HYBRID.md)**

### 2. **AWS App Runner** (Simplest)
- Both backend and frontend on App Runner
- **Cost:** ~$50-70/month
- **Deploy time:** 20-30 minutes
- **Best for:** Quick deployments, simplicity

📖 **[See detailed guide: AWS-DEPLOY-README.md](AWS-DEPLOY-README.md)**

### 3. **Docker Compose** (Local/Self-Hosted)
- Run on your own server or EC2
- **Cost:** Server costs only
- **Deploy time:** 10 minutes
- **Best for:** Development, self-hosting

📖 **[See docker-compose.yml](docker-compose.yml)**

---

## Hybrid AWS Deployment (Recommended)

### Why Hybrid?

Electronic Beat Labs has two distinct workload patterns:

**Quick REST API Calls:**
- User authentication
- Preset management
- Usage tracking
- Subscription management

**→ Perfect for Lambda** (pay only for requests, auto-scales, no idle costs)

**Long-Running WebSocket Connections:**
- Real-time audio streaming
- Binaural beat generation
- Live frequency updates

**→ Perfect for ECS Fargate** (handles long connections, consistent performance)

**Static Frontend:**
- React/Vite build output
- CSS, JS, images

**→ Perfect for S3 + CloudFront** ($1/month, global CDN, lightning fast)

### Architecture

```
┌──────────────┐
│   User's     │
│   Browser    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│   CloudFront CDN (Frontend)      │
│   S3 Static Hosting              │
└──────────────────────────────────┘
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│   Lambda    │  │   Lambda     │  │ ECS Fargate  │
│   (Auth)    │  │   (Presets)  │  │ (WebSocket)  │
└─────────────┘  └──────────────┘  └──────────────┘
       │                 │                  │
       └─────────────────┴──────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │   Database   │
                  │  (DynamoDB/  │
                  │    RDS)      │
                  └──────────────┘
```

### Quick Deploy

```powershell
# Install prerequisites
npm install -g serverless

# Configure AWS credentials
aws configure

# Deploy everything (Lambda + ECS + S3/CloudFront)
.\scripts\aws-deploy-hybrid.ps1 -Stage prod

# Or deploy individually:
.\scripts\aws-deploy-hybrid.ps1 -Stage prod -SkipECS -SkipFrontend  # Lambda only
.\scripts\aws-deploy-hybrid.ps1 -Stage prod -SkipLambda -SkipFrontend  # ECS only
.\scripts\aws-deploy-hybrid.ps1 -Stage prod -SkipLambda -SkipECS  # Frontend only
```

### What Gets Deployed

#### Lambda Functions (Serverless Framework)
- `auth` - OAuth authentication
- `usageCheck` - Usage limit checking
- `usageRecord` - Usage recording
- `subscriptionPlans` - Get subscription plans
- `subscriptionPayment` - Stripe payment intents
- `subscriptionStatus` - Subscription status
- `stripeWebhook` - Stripe webhook handler
- `timer` - Timer preset management
- `health` - Health check

**DynamoDB Tables:**
- `ebl-users-{stage}` - User accounts
- `ebl-usage-{stage}` - Usage tracking
- `ebl-webhooks-{stage}` - Webhook logs

#### ECS Fargate Service
- **Cluster:** `ebl-cluster-{stage}`
- **Service:** WebSocket audio streaming
- **Task:** 1 vCPU, 2GB RAM
- **Auto-scaling:** 1-5 tasks based on CPU
- **Image:** ECR `ebl-websocket:latest`

#### S3 + CloudFront
- **Bucket:** `ebl-frontend-{stage}-{account-id}`
- **Distribution:** Global CDN with HTTPS
- **Cache:** Optimized for static assets
- **Security:** HSTS, XSS protection, CSP headers

### Monitoring

```powershell
# View Lambda logs
serverless logs -f auth --tail --stage prod

# View ECS logs
aws logs tail /ecs/ebl-websocket --follow --region us-east-1

# CloudFront metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=YOUR_DISTRIBUTION_ID \
  --start-time 2025-01-01T00:00:00Z \
  --end-time 2025-01-10T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

---

## Traditional Deployment

### AWS App Runner

**Pros:**
- Simplest deployment
- Fully managed
- Auto-scaling included
- Health checks built-in

**Cons:**
- Higher cost (~$50-70/month)
- Less optimization
- Both services always running

**Deploy:**
```powershell
.\aws-deploy-quick.ps1
```

See [AWS-DEPLOY-README.md](AWS-DEPLOY-README.md) for details.

### Docker Compose (Local)

**Pros:**
- Fastest for development
- Run locally or on EC2
- Full control

**Cons:**
- Manual scaling
- Manual SSL/HTTPS setup
- Requires server management

**Deploy:**
```bash
docker-compose up -d
```

---

## Cost Comparison

### Monthly Costs (Estimated)

| Deployment Method | Cost | Notes |
|-------------------|------|-------|
| **Hybrid AWS** | **$10-20** | 70-80% cheaper, recommended |
| AWS App Runner | $50-70 | Simplest but expensive |
| EC2 (t3.medium) | $30-40 | + server management time |
| Docker Local | $0 | Localhost only |

### Hybrid AWS Breakdown:
- **Lambda:** $0-2 (1M requests free)
- **ECS Fargate:** $8-15 (only when users streaming)
- **S3 + CloudFront:** $1-3 (50GB transfer free)
- **DynamoDB:** $0-2 (25GB storage free)

### Free Tier Benefits:
- Lambda: 1M requests/month free
- API Gateway: 1M requests/month free
- CloudFront: 50GB transfer/month free
- DynamoDB: 25GB storage free
- S3: 5GB storage free

---

## Next Steps After Deployment

1. **Set up custom domain**
   - Route53 for DNS
   - ACM for SSL certificates
   - CloudFront custom domain

2. **Configure monitoring**
   - CloudWatch Alarms
   - SNS notifications
   - Cost alerts

3. **Set up CI/CD**
   - GitHub Actions
   - Auto-deploy on push
   - Testing pipeline

4. **Optimize performance**
   - Lambda provisioned concurrency
   - ECS auto-scaling tuning
   - CloudFront cache optimization

5. **Security hardening**
   - WAF rules
   - Rate limiting
   - API key management
   - Secrets rotation

---

## Support & Troubleshooting

### Common Issues

**Lambda timeout errors:**
```yaml
# In serverless.yml, increase timeout
functions:
  auth:
    timeout: 30  # seconds
```

**ECS task failing health checks:**
```json
// Increase startPeriod in task definition
"healthCheck": {
  "startPeriod": 120
}
```

**CloudFront 404 on SPA routes:**
```json
// Already configured in CloudFormation template
// Error 404 → redirect to /index.html
```

### Get Help

- Check CloudWatch Logs
- Review AWS Service Health Dashboard
- See detailed deployment guides:
  - [AWS-DEPLOY-HYBRID.md](AWS-DEPLOY-HYBRID.md)
  - [AWS-DEPLOY-README.md](AWS-DEPLOY-README.md)

---

## Quick Reference

| Component | URL/Endpoint |
|-----------|-------------|
| Lambda API | `https://{api-id}.execute-api.us-east-1.amazonaws.com/prod` |
| WebSocket | `wss://{nlb-dns}/ws/audio` |
| Frontend | `https://{cloudfront-id}.cloudfront.net` |
| Health Check | `GET /health` |

**Deployment Time:** 30-40 minutes
**Monthly Cost:** $10-20 (hybrid), $50-70 (app runner)
**Uptime:** 99.9% SLA
