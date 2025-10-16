# ===========================================
# EBL - FASTEST AWS DEPLOYMENT (PowerShell)
# Deploy to AWS in under 30 minutes
# ===========================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 EBL - FASTEST AWS DEPLOYMENT" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
try {
    $null = aws --version
    Write-Host "✅ AWS CLI installed" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS CLI not installed!" -ForegroundColor Red
    Write-Host "Install it: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# Check AWS credentials
try {
    $null = aws sts get-caller-identity 2>&1
    Write-Host "✅ AWS credentials configured" -ForegroundColor Green
} catch {
    Write-Host "❌ AWS credentials not configured!" -ForegroundColor Red
    Write-Host "Run: aws configure" -ForegroundColor Yellow
    exit 1
}

# Get AWS Account ID and Region
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }

Write-Host "📍 AWS Account: $AWS_ACCOUNT_ID" -ForegroundColor Blue
Write-Host "📍 Region: $AWS_REGION" -ForegroundColor Blue
Write-Host ""

# ===========================================
# STEP 1: Create ECR Repositories
# ===========================================
Write-Host "Step 1: Creating ECR repositories..." -ForegroundColor Yellow

# Backend ECR repo
try {
    aws ecr describe-repositories --repository-names ebl-backend --region $AWS_REGION 2>$null
    Write-Host "Backend ECR repository already exists" -ForegroundColor Green
} catch {
    aws ecr create-repository `
        --repository-name ebl-backend `
        --region $AWS_REGION `
        --image-scanning-configuration scanOnPush=true
    Write-Host "Created backend ECR repository" -ForegroundColor Green
}

# Frontend ECR repo
try {
    aws ecr describe-repositories --repository-names ebl-frontend --region $AWS_REGION 2>$null
    Write-Host "Frontend ECR repository already exists" -ForegroundColor Green
} catch {
    aws ecr create-repository `
        --repository-name ebl-frontend `
        --region $AWS_REGION `
        --image-scanning-configuration scanOnPush=true
    Write-Host "Created frontend ECR repository" -ForegroundColor Green
}

Write-Host ""

# ===========================================
# STEP 2: Build and Push Docker Images
# ===========================================
Write-Host "Step 2: Building and pushing Docker images..." -ForegroundColor Yellow

# Login to ECR
Write-Host "Logging in to ECR..." -ForegroundColor Cyan
$ECR_PASSWORD = aws ecr get-login-password --region $AWS_REGION
$ECR_PASSWORD | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Build and push backend
Write-Host "Building backend image..." -ForegroundColor Cyan
docker build -f Dockerfile.backend -t ebl-backend:latest .
docker tag ebl-backend:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-backend:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-backend:latest"
Write-Host "✅ Backend image pushed" -ForegroundColor Green

# Build and push frontend
Write-Host "Building frontend image..." -ForegroundColor Cyan
docker build -f Dockerfile.frontend -t ebl-frontend:latest .
docker tag ebl-frontend:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-frontend:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-frontend:latest"
Write-Host "✅ Frontend image pushed" -ForegroundColor Green

Write-Host ""

# ===========================================
# STEP 3: Create IAM Role for App Runner
# ===========================================
Write-Host "Step 3: Setting up IAM role..." -ForegroundColor Yellow

$ROLE_NAME = "ebl-app-runner-role"

try {
    aws iam get-role --role-name $ROLE_NAME 2>$null
    Write-Host "IAM role already exists" -ForegroundColor Green
} catch {
    $TRUST_POLICY = @'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Service": "build.apprunner.amazonaws.com"
    },
    "Action": "sts:AssumeRole"
  }]
}
'@
    
    $TRUST_POLICY | Out-File -FilePath trust-policy.json -Encoding UTF8
    
    aws iam create-role `
        --role-name $ROLE_NAME `
        --assume-role-policy-document file://trust-policy.json
    
    aws iam attach-role-policy `
        --role-name $ROLE_NAME `
        --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess
    
    Remove-Item trust-policy.json
    
    Write-Host "Waiting for IAM role propagation (10 seconds)..." -ForegroundColor Cyan
    Start-Sleep -Seconds 10
}

Write-Host ""

# ===========================================
# STEP 4: Deploy Backend with App Runner
# ===========================================
Write-Host "Step 4: Deploying backend..." -ForegroundColor Yellow

$BACKEND_SOURCE_CONFIG = @"
{
    "ImageRepository": {
        "ImageIdentifier": "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-backend:latest",
        "ImageRepositoryType": "ECR",
        "ImageConfiguration": {
            "Port": "8000",
            "RuntimeEnvironmentVariables": {
                "PYTHON_ENV": "production",
                "SAMPLE_RATE": "48000",
                "BUFFER_SIZE": "800",
                "MAX_FREQUENCY": "199"
            }
        }
    },
    "AutoDeploymentsEnabled": true,
    "AuthenticationConfiguration": {
        "AccessRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/$ROLE_NAME"
    }
}
"@

$BACKEND_SOURCE_CONFIG | Out-File -FilePath backend-source.json -Encoding UTF8

try {
    $BACKEND_SERVICE_ARN = (aws apprunner list-services --region $AWS_REGION --query "ServiceSummaryList[?ServiceName=='ebl-backend'].ServiceArn" --output text)
    if ($BACKEND_SERVICE_ARN) {
        Write-Host "Backend service already exists, updating..." -ForegroundColor Cyan
        aws apprunner update-service --service-arn $BACKEND_SERVICE_ARN --source-configuration file://backend-source.json --region $AWS_REGION
    } else {
        throw "Service not found"
    }
} catch {
    Write-Host "Creating new backend service..." -ForegroundColor Cyan
    aws apprunner create-service `
        --service-name ebl-backend `
        --source-configuration file://backend-source.json `
        --instance-configuration "Cpu=1024,Memory=2048" `
        --health-check-configuration "Protocol=HTTP,Path=/health,Interval=10,Timeout=5,HealthyThreshold=2,UnhealthyThreshold=3" `
        --region $AWS_REGION
}

Remove-Item backend-source.json

Write-Host "Waiting for backend deployment (30 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

$BACKEND_SERVICE_ARN = (aws apprunner list-services --region $AWS_REGION --query "ServiceSummaryList[?ServiceName=='ebl-backend'].ServiceArn" --output text)
$BACKEND_URL = (aws apprunner describe-service --service-arn $BACKEND_SERVICE_ARN --region $AWS_REGION --query "Service.ServiceUrl" --output text)

Write-Host "✅ Backend deployed!" -ForegroundColor Green
Write-Host "🔗 Backend URL: https://$BACKEND_URL" -ForegroundColor Blue
Write-Host ""

# ===========================================
# STEP 5: Deploy Frontend with App Runner
# ===========================================
Write-Host "Step 5: Deploying frontend..." -ForegroundColor Yellow

$FRONTEND_SOURCE_CONFIG = @"
{
    "ImageRepository": {
        "ImageIdentifier": "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-frontend:latest",
        "ImageRepositoryType": "ECR",
        "ImageConfiguration": {
            "Port": "80",
            "RuntimeEnvironmentVariables": {
                "VITE_API_URL": "https://$BACKEND_URL",
                "VITE_WS_URL": "wss://$BACKEND_URL"
            }
        }
    },
    "AutoDeploymentsEnabled": true,
    "AuthenticationConfiguration": {
        "AccessRoleArn": "arn:aws:iam::$AWS_ACCOUNT_ID:role/$ROLE_NAME"
    }
}
"@

$FRONTEND_SOURCE_CONFIG | Out-File -FilePath frontend-source.json -Encoding UTF8

try {
    $FRONTEND_SERVICE_ARN = (aws apprunner list-services --region $AWS_REGION --query "ServiceSummaryList[?ServiceName=='ebl-frontend'].ServiceArn" --output text)
    if ($FRONTEND_SERVICE_ARN) {
        Write-Host "Frontend service already exists, updating..." -ForegroundColor Cyan
        aws apprunner update-service --service-arn $FRONTEND_SERVICE_ARN --source-configuration file://frontend-source.json --region $AWS_REGION
    } else {
        throw "Service not found"
    }
} catch {
    Write-Host "Creating new frontend service..." -ForegroundColor Cyan
    aws apprunner create-service `
        --service-name ebl-frontend `
        --source-configuration file://frontend-source.json `
        --instance-configuration "Cpu=1024,Memory=2048" `
        --region $AWS_REGION
}

Remove-Item frontend-source.json

Write-Host "Waiting for frontend deployment (30 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

$FRONTEND_SERVICE_ARN = (aws apprunner list-services --region $AWS_REGION --query "ServiceSummaryList[?ServiceName=='ebl-frontend'].ServiceArn" --output text)
$FRONTEND_URL = (aws apprunner describe-service --service-arn $FRONTEND_SERVICE_ARN --region $AWS_REGION --query "Service.ServiceUrl" --output text)

Write-Host "✅ Frontend deployed!" -ForegroundColor Green
Write-Host ""

# ===========================================
# DEPLOYMENT COMPLETE
# ===========================================
Write-Host "==========================================" -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend URL: https://$FRONTEND_URL" -ForegroundColor Blue
Write-Host "🔧 Backend URL:  https://$BACKEND_URL" -ForegroundColor Blue
Write-Host "📊 Health Check: https://$BACKEND_URL/health" -ForegroundColor Blue
Write-Host "📚 API Docs:     https://$BACKEND_URL/docs" -ForegroundColor Blue
Write-Host ""
Write-Host "⚠️  Note: Services may take 5-10 minutes to fully initialize" -ForegroundColor Yellow
Write-Host "Check status: aws apprunner list-services --region $AWS_REGION" -ForegroundColor Cyan
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green

# Save URLs to file
$DEPLOYMENT_INFO = @"
EBL AWS Deployment Info
========================
Deployed: $(Get-Date)
Region: $AWS_REGION
Account: $AWS_ACCOUNT_ID

Frontend URL: https://$FRONTEND_URL
Backend URL:  https://$BACKEND_URL
Health Check: https://$BACKEND_URL/health
API Docs:     https://$BACKEND_URL/docs

To update:
- Backend:  docker build -f Dockerfile.backend -t ebl-backend . && docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-backend:latest
- Frontend: docker build -f Dockerfile.frontend -t ebl-frontend . && docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-frontend:latest

To delete:
aws apprunner delete-service --service-arn $FRONTEND_SERVICE_ARN --region $AWS_REGION
aws apprunner delete-service --service-arn $BACKEND_SERVICE_ARN --region $AWS_REGION
"@

$DEPLOYMENT_INFO | Out-File -FilePath aws-deployment-info.txt -Encoding UTF8
Write-Host "📝 Deployment info saved to aws-deployment-info.txt" -ForegroundColor Cyan
