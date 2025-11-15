# ===========================================
# EBL - FIXED AWS DEPLOYMENT (PowerShell)
# Properly separates frontend and backend
# ===========================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 EBL - FIXED AWS DEPLOYMENT" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Get AWS Account ID and Region
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
$AWS_REGION = if ($env:AWS_REGION) { $env:AWS_REGION } else { "us-east-1" }

Write-Host "📍 AWS Account: $AWS_ACCOUNT_ID" -ForegroundColor Blue
Write-Host "📍 Region: $AWS_REGION" -ForegroundColor Blue
Write-Host ""

# ===========================================
# STEP 1: Build and Push Backend
# ===========================================
Write-Host "Step 1: Building and pushing backend..." -ForegroundColor Yellow

# Login to ECR
$ECR_PASSWORD = aws ecr get-login-password --region $AWS_REGION
$ECR_PASSWORD | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Build and push backend
Write-Host "Building backend image..." -ForegroundColor Cyan
docker build -f Dockerfile.backend -t ebl-backend:latest .
docker tag ebl-backend:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-backend:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-backend:latest"

Write-Host "✅ Backend image pushed" -ForegroundColor Green

# ===========================================
# STEP 2: Deploy Backend First
# ===========================================
Write-Host "Step 2: Deploying backend..." -ForegroundColor Yellow

# Check if backend service exists
$BACKEND_SERVICE_ARN = (aws apprunner list-services --region $AWS_REGION --query "ServiceSummaryList[?ServiceName=='ebl-backend'].ServiceArn" --output text 2>$null)

if (-not $BACKEND_SERVICE_ARN) {
    Write-Host "Creating new backend service..." -ForegroundColor Cyan
    
    $BACKEND_CONFIG = @"
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
                "MAX_FREQUENCY": "199",
                "AUDIO_FRAME_RATE": "60",
                "WS_HEARTBEAT_INTERVAL": "30",
                "WS_CONNECTION_TIMEOUT": "60",
                "ALLOWED_ORIGINS": "*"
            }
        }
    },
    "AutoDeploymentsEnabled": true,
    "AuthenticationConfiguration": {
        "AccessRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ebl-app-runner-role"
    }
}
"@
    
    $BACKEND_CONFIG | Out-File -FilePath backend-config.json -Encoding UTF8
    
    aws apprunner create-service `
        --service-name ebl-backend `
        --source-configuration file://backend-config.json `
        --instance-configuration "Cpu=1024,Memory=2048" `
        --health-check-configuration "Protocol=HTTP,Path=/health,Interval=10,Timeout=5,HealthyThreshold=2,UnhealthyThreshold=3" `
        --region $AWS_REGION
    
    Remove-Item backend-config.json
}

# Wait for backend
Write-Host "Waiting for backend deployment (60 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 60

# Get backend URL
$BACKEND_SERVICE_ARN = (aws apprunner list-services --region $AWS_REGION --query "ServiceSummaryList[?ServiceName=='ebl-backend'].ServiceArn" --output text)
$BACKEND_URL = (aws apprunner describe-service --service-arn $BACKEND_SERVICE_ARN --region $AWS_REGION --query "Service.ServiceUrl" --output text)

Write-Host "✅ Backend deployed at: https://$BACKEND_URL" -ForegroundColor Green

# ===========================================
# STEP 3: Build Frontend with Backend URL
# ===========================================
Write-Host "Step 3: Building frontend with backend URL..." -ForegroundColor Yellow

# Build frontend with the actual backend URL
Write-Host "Building frontend image with backend URL embedded..." -ForegroundColor Cyan
docker build -f Dockerfile.frontend.fixed `
    --build-arg VITE_API_URL="https://$BACKEND_URL" `
    --build-arg VITE_WS_URL="wss://$BACKEND_URL" `
    -t ebl-frontend:latest .

docker tag ebl-frontend:latest "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-frontend:latest"
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-frontend:latest"

Write-Host "✅ Frontend image pushed" -ForegroundColor Green

# ===========================================
# STEP 4: Deploy Frontend
# ===========================================
Write-Host "Step 4: Deploying frontend..." -ForegroundColor Yellow

# Check if frontend service exists
$FRONTEND_SERVICE_ARN = (aws apprunner list-services --region $AWS_REGION --query "ServiceSummaryList[?ServiceName=='ebl-frontend'].ServiceArn" --output text 2>$null)

if (-not $FRONTEND_SERVICE_ARN) {
    Write-Host "Creating new frontend service..." -ForegroundColor Cyan
    
    $FRONTEND_CONFIG = @"
{
    "ImageRepository": {
        "ImageIdentifier": "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-frontend:latest",
        "ImageRepositoryType": "ECR",
        "ImageConfiguration": {
            "Port": "80"
        }
    },
    "AutoDeploymentsEnabled": true,
    "AuthenticationConfiguration": {
        "AccessRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ebl-app-runner-role"
    }
}
"@
    
    $FRONTEND_CONFIG | Out-File -FilePath frontend-config.json -Encoding UTF8
    
    aws apprunner create-service `
        --service-name ebl-frontend `
        --source-configuration file://frontend-config.json `
        --instance-configuration "Cpu=512,Memory=1024" `
        --region $AWS_REGION
    
    Remove-Item frontend-config.json
} else {
    Write-Host "Updating existing frontend service..." -ForegroundColor Cyan
    
    # Force update
    $UPDATE_CONFIG = @"
{
    "ImageRepository": {
        "ImageIdentifier": "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-frontend:latest",
        "ImageRepositoryType": "ECR",
        "ImageConfiguration": {
            "Port": "80"
        }
    },
    "AutoDeploymentsEnabled": true,
    "AuthenticationConfiguration": {
        "AccessRoleArn": "arn:aws:iam::${AWS_ACCOUNT_ID}:role/ebl-app-runner-role"
    }
}
"@
    
    $UPDATE_CONFIG | Out-File -FilePath update-config.json -Encoding UTF8
    
    aws apprunner update-service `
        --service-arn $FRONTEND_SERVICE_ARN `
        --source-configuration file://update-config.json `
        --region $AWS_REGION
    
    Remove-Item update-config.json
}

# Wait for frontend
Write-Host "Waiting for frontend deployment (60 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 60

# Get frontend URL
$FRONTEND_SERVICE_ARN = (aws apprunner list-services --region $AWS_REGION --query "ServiceSummaryList[?ServiceName=='ebl-frontend'].ServiceArn" --output text)
$FRONTEND_URL = (aws apprunner describe-service --service-arn $FRONTEND_SERVICE_ARN --region $AWS_REGION --query "Service.ServiceUrl" --output text)

# ===========================================
# DEPLOYMENT COMPLETE
# ===========================================
Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "🎉 DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend URL: https://$FRONTEND_URL" -ForegroundColor Blue
Write-Host "🔧 Backend URL:  https://$BACKEND_URL" -ForegroundColor Blue
Write-Host "📊 Health Check: https://$BACKEND_URL/health" -ForegroundColor Blue
Write-Host "📚 API Docs:     https://$BACKEND_URL/docs" -ForegroundColor Blue
Write-Host ""
Write-Host "⚠️  Frontend should now display the React app!" -ForegroundColor Yellow
Write-Host "⚠️  API calls will be made directly to the backend URL" -ForegroundColor Yellow
Write-Host ""
Write-Host "To update your domain:" -ForegroundColor Cyan
Write-Host "1. Go to your domain provider (e.g., Route 53)" -ForegroundColor White
Write-Host "2. Point your domain to: $FRONTEND_URL" -ForegroundColor Yellow
Write-Host ""

# Save deployment info
$DEPLOYMENT_INFO = @"
EBL AWS Deployment Info - FIXED
================================
Deployed: $(Get-Date)
Region: $AWS_REGION
Account: $AWS_ACCOUNT_ID

Frontend URL: https://$FRONTEND_URL
Backend URL:  https://$BACKEND_URL
Health Check: https://$BACKEND_URL/health
API Docs:     https://$BACKEND_URL/docs

Frontend Service ARN: $FRONTEND_SERVICE_ARN
Backend Service ARN: $BACKEND_SERVICE_ARN

To check status:
aws apprunner describe-service --service-arn $FRONTEND_SERVICE_ARN --region $AWS_REGION
aws apprunner describe-service --service-arn $BACKEND_SERVICE_ARN --region $AWS_REGION

To view logs:
aws logs tail /aws/apprunner/ebl-frontend --follow --region $AWS_REGION
aws logs tail /aws/apprunner/ebl-backend --follow --region $AWS_REGION

To update:
- Rebuild and push Docker images
- Services will auto-deploy with new images

To delete:
aws apprunner delete-service --service-arn $FRONTEND_SERVICE_ARN --region $AWS_REGION
aws apprunner delete-service --service-arn $BACKEND_SERVICE_ARN --region $AWS_REGION
"@

$DEPLOYMENT_INFO | Out-File -FilePath aws-deployment-fixed.txt -Encoding UTF8
Write-Host "📝 Deployment info saved to aws-deployment-fixed.txt" -ForegroundColor Cyan
