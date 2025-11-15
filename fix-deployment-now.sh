#!/bin/bash
# ===========================================
# EBL - FIXED AWS DEPLOYMENT 
# Properly separates frontend and backend
# ===========================================

set -e

echo "🚀 EBL - FIXED AWS DEPLOYMENT"
echo "================================"
echo ""

# Get AWS Account ID and Region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo "📍 AWS Account: $AWS_ACCOUNT_ID"
echo "📍 Region: $AWS_REGION"
echo ""

# ===========================================
# STEP 1: Build and Push Backend
# ===========================================
echo "Step 1: Building and pushing backend..."

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build and push backend
docker build -f Dockerfile.backend -t ebl-backend:latest .
docker tag ebl-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-backend:latest

echo "✅ Backend image pushed"

# ===========================================
# STEP 2: Deploy Backend First
# ===========================================
echo "Step 2: Deploying backend..."

# Check if backend service exists
BACKEND_SERVICE_ARN=$(aws apprunner list-services --region $AWS_REGION --query "ServiceSummaryList[?ServiceName=='ebl-backend'].ServiceArn" --output text || true)

if [ -z "$BACKEND_SERVICE_ARN" ]; then
    echo "Creating new backend service..."
    
    # Create backend service
    aws apprunner create-service \
        --service-name ebl-backend \
        --source-configuration '{
            "ImageRepository": {
                "ImageIdentifier": "'$AWS_ACCOUNT_ID'.dkr.ecr.'$AWS_REGION'.amazonaws.com/ebl-backend:latest",
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
                "AccessRoleArn": "arn:aws:iam::'$AWS_ACCOUNT_ID':role/ebl-app-runner-role"
            }
        }' \
        --instance-configuration '{"Cpu":"1024","Memory":"2048"}' \
        --health-check-configuration '{"Protocol":"HTTP","Path":"/health","Interval":10,"Timeout":5,"HealthyThreshold":2,"UnhealthyThreshold":3}' \
        --region $AWS_REGION
fi

# Wait for backend to be running
echo "Waiting for backend deployment (60 seconds)..."
sleep 60

# Get backend URL
BACKEND_SERVICE_ARN=$(aws apprunner list-services --region $AWS_REGION --query "ServiceSummaryList[?ServiceName=='ebl-backend'].ServiceArn" --output text)
BACKEND_URL=$(aws apprunner describe-service --service-arn $BACKEND_SERVICE_ARN --region $AWS_REGION --query "Service.ServiceUrl" --output text)

echo "✅ Backend deployed at: https://$BACKEND_URL"

# ===========================================
# STEP 3: Build Frontend with Backend URL
# ===========================================
echo "Step 3: Building frontend with backend URL..."

# Build frontend with the actual backend URL
docker build -f Dockerfile.frontend.fixed \
    --build-arg VITE_API_URL=https://$BACKEND_URL \
    --build-arg VITE_WS_URL=wss://$BACKEND_URL \
    -t ebl-frontend:latest .

docker tag ebl-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-frontend:latest

echo "✅ Frontend image pushed"

# ===========================================
# STEP 4: Deploy Frontend
# ===========================================
echo "Step 4: Deploying frontend..."

# Check if frontend service exists
FRONTEND_SERVICE_ARN=$(aws apprunner list-services --region $AWS_REGION --query "ServiceSummaryList[?ServiceName=='ebl-frontend'].ServiceArn" --output text || true)

if [ -z "$FRONTEND_SERVICE_ARN" ]; then
    echo "Creating new frontend service..."
    
    aws apprunner create-service \
        --service-name ebl-frontend \
        --source-configuration '{
            "ImageRepository": {
                "ImageIdentifier": "'$AWS_ACCOUNT_ID'.dkr.ecr.'$AWS_REGION'.amazonaws.com/ebl-frontend:latest",
                "ImageRepositoryType": "ECR",
                "ImageConfiguration": {
                    "Port": "80"
                }
            },
            "AutoDeploymentsEnabled": true,
            "AuthenticationConfiguration": {
                "AccessRoleArn": "arn:aws:iam::'$AWS_ACCOUNT_ID':role/ebl-app-runner-role"
            }
        }' \
        --instance-configuration '{"Cpu":"512","Memory":"1024"}' \
        --region $AWS_REGION
else
    echo "Updating existing frontend service..."
    
    # Force update by updating the service
    aws apprunner update-service \
        --service-arn $FRONTEND_SERVICE_ARN \
        --source-configuration '{
            "ImageRepository": {
                "ImageIdentifier": "'$AWS_ACCOUNT_ID'.dkr.ecr.'$AWS_REGION'.amazonaws.com/ebl-frontend:latest",
                "ImageRepositoryType": "ECR",
                "ImageConfiguration": {
                    "Port": "80"
                }
            },
            "AutoDeploymentsEnabled": true,
            "AuthenticationConfiguration": {
                "AccessRoleArn": "arn:aws:iam::'$AWS_ACCOUNT_ID':role/ebl-app-runner-role"
            }
        }' \
        --region $AWS_REGION
fi

# Wait for frontend
echo "Waiting for frontend deployment (60 seconds)..."
sleep 60

# Get frontend URL
FRONTEND_SERVICE_ARN=$(aws apprunner list-services --region $AWS_REGION --query "ServiceSummaryList[?ServiceName=='ebl-frontend'].ServiceArn" --output text)
FRONTEND_URL=$(aws apprunner describe-service --service-arn $FRONTEND_SERVICE_ARN --region $AWS_REGION --query "Service.ServiceUrl" --output text)

# ===========================================
# DEPLOYMENT COMPLETE
# ===========================================
echo ""
echo "=========================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "📱 Frontend URL: https://$FRONTEND_URL"
echo "🔧 Backend URL:  https://$BACKEND_URL"
echo "📊 Health Check: https://$BACKEND_URL/health"
echo "📚 API Docs:     https://$BACKEND_URL/docs"
echo ""
echo "⚠️  Frontend should now display the React app!"
echo "⚠️  API calls will be made directly to the backend URL"
echo ""
echo "To update your domain:"
echo "1. Go to your domain provider (e.g., Route 53)"
echo "2. Point your domain to: $FRONTEND_URL"
echo ""
