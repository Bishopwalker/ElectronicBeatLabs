# AWS Serverless Deployment Guide

## Quick Setup (5 minutes)

### 1. Install Prerequisites
```bash
# Install Serverless Framework
npm install -g serverless

# Install plugins
serverless plugin install -n serverless-python-requirements
serverless plugin install -n serverless-wsgi
```

### 2. Configure AWS Credentials
```bash
# Configure AWS CLI (you already have this)
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

### 3. Deploy Backend
```bash
# Deploy to staging
serverless deploy --stage staging

# Deploy to production
serverless deploy --stage prod
```

### 4. Deploy Frontend
```bash
# Build frontend
npm run build

# Get S3 bucket name from serverless output
BUCKET=$(serverless info --stage prod | grep "FrontendBucket:" | awk '{print $2}')

# Upload to S3
aws s3 sync dist/ s3://$BUCKET/ --delete
```

## GitHub Actions Setup

### Required Secrets
Add these to your GitHub repository secrets:

1. `AWS_ACCESS_KEY_ID` - Your AWS access key
2. `AWS_SECRET_ACCESS_KEY` - Your AWS secret key

### Automatic Deployment
- **Push to `main`** → Deploy to production
- **Push to `develop`** → Deploy to staging
- **Pull requests** → Run tests only

## Cost Estimation

### AWS Services Used:
- **Lambda**: $0.20 per 1M requests + compute time
- **API Gateway**: $1.00 per million API calls
- **DynamoDB**: $0.25 per GB stored
- **S3**: $0.023 per GB stored
- **CloudFront**: $0.085 per GB transfer

### Monthly Cost for Testing:
- **Low usage** (1000 requests/month): ~$2-5
- **Medium usage** (10k requests/month): ~$5-15
- **High usage** (100k requests/month): ~$15-50

## Frontend Configuration

The deployment automatically creates a `config.js` file with:
```javascript
window.EBL_CONFIG = {
  API_URL: 'https://your-api.execute-api.us-east-1.amazonaws.com/prod',
  WEBSOCKET_URL: 'wss://your-ws.execute-api.us-east-1.amazonaws.com/prod',
  ENVIRONMENT: 'production'
};
```

## Architecture

```
Frontend (React)
    ↓
CloudFront CDN
    ↓
S3 Static Hosting

Backend API
    ↓
API Gateway REST
    ↓
Lambda Functions
    ↓
DynamoDB

WebSocket Audio
    ↓
API Gateway WebSocket
    ↓
Lambda Functions
    ↓
DynamoDB
```

## Monitoring

### CloudWatch Logs
```bash
# View Lambda logs
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/electromagnetic-beat-lab"

# Tail logs in real-time
serverless logs -f audioEngine --tail
```

### Metrics
- Lambda invocations
- API Gateway requests
- WebSocket connections
- DynamoDB read/write units

## Troubleshooting

### Common Issues:
1. **Lambda timeout** → Increase timeout in `serverless.yml`
2. **Package too large** → Use Lambda layers for heavy dependencies
3. **WebSocket disconnections** → Implement connection keepalive
4. **CORS errors** → Check API Gateway CORS settings

### Debug Commands:
```bash
# Check deployment status
serverless info --stage prod

# Remove deployment
serverless remove --stage staging

# Test local
serverless offline start
```

## Next Steps

1. **Custom Domain**: Add Route53 + Certificate Manager
2. **Database**: Upgrade to RDS for complex queries
3. **Caching**: Add Redis/ElastiCache for session data
4. **Monitoring**: CloudWatch dashboards + alarms
5. **Security**: WAF rules + API throttling