#!/bin/bash
# ===========================================
# EBL - FASTEST AWS DEPLOYMENT SCRIPT
# Deploy to AWS in under 30 minutes
# ===========================================

set -e  # Exit on error

echo "🚀 EBL - FASTEST AWS DEPLOYMENT"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not installed!${NC}"
    echo "Install it: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured!${NC}"
    echo "Run: aws configure"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configured${NC}"

# Get AWS Account ID and Region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=${AWS_REGION:-us-east-1}

echo -e "${BLUE}📍 AWS Account: ${AWS_ACCOUNT_ID}${NC}"
echo -e "${BLUE}📍 Region: ${AWS_REGION}${NC}"
echo ""

# ===========================================
# STEP 1: Create ECR Repositories
# ===========================================
echo -e "${YELLOW}Step 1: Creating ECR repositories...${NC}"

# Create backend ECR repo
aws ecr describe-repositories --repository-names ebl-backend --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository \
    --repository-name ebl-backend \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true

# Create frontend ECR repo
aws ecr describe-repositories --repository-names ebl-frontend --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository \
    --repository-name ebl-frontend \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true

echo -e "${GREEN}✅ ECR repositories created${NC}"
echo ""

# ===========================================
# STEP 2: Build and Push Docker Images
# ===========================================
echo -e "${YELLOW}Step 2: Building Docker images...${NC}"

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build backend
echo "Building backend..."
docker build -f Dockerfile.backend -t ebl-backend:latest .
docker tag ebl-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-backend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-backend:latest

# Build frontend
echo "Building frontend..."
docker build -f Dockerfile.frontend -t ebl-frontend:latest .
docker tag ebl-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-frontend:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-frontend:latest

echo -e "${GREEN}✅ Docker images pushed to ECR${NC}"
echo ""

# ===========================================
# STEP 3: Deploy Backend with AWS App Runner
# ===========================================
echo -e "${YELLOW}Step 3: Deploying backend with App Runner...${NC}"

# Create IAM role for App Runner (if doesn't exist)
ROLE_NAME="ebl-app-runner-role"
aws iam get-role --role-name $ROLE_NAME 2>/dev/null || \
aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document '{
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Principal": {
          "Service": "build.apprunner.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }]
    }'

# Attach ECR access policy
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess 2>/dev/null || true

# Wait for role propagation
echo "Waiting for IAM role propagation..."
sleep 10

# Create App Runner service for backend
BACKEND_SERVICE=$(aws apprunner create-service \
    --service-name ebl-backend \
    --source-configuration "{
        \"ImageRepository\": {
            \"ImageIdentifier\": \"$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-backend:latest\",
            \"ImageRepositoryType\": \"ECR\",
            \"ImageConfiguration\": {
                \"Port\": \"8000\",
                \"RuntimeEnvironmentVariables\": {
                    \"PYTHON_ENV\": \"production\",
                    \"SAMPLE_RATE\": \"48000\",
                    \"BUFFER_SIZE\": \"800\",
                    \"MAX_FREQUENCY\": \"199\"
                }
            }
        },
        \"AutoDeploymentsEnabled\": true,
        \"AuthenticationConfiguration\": {
            \"AccessRoleArn\": \"arn:aws:iam::$AWS_ACCOUNT_ID:role/$ROLE_NAME\"
        }
    }" \
    --instance-configuration "{
        \"Cpu\": \"1024\",
        \"Memory\": \"2048\"
    }" \
    --health-check-configuration "{
        \"Protocol\": \"HTTP\",
        \"Path\": \"/health\",
        \"Interval\": 10,
        \"Timeout\": 5,
        \"HealthyThreshold\": 2,
        \"UnhealthyThreshold\": 3
    }" \
    --region $AWS_REGION 2>/dev/null || \
aws apprunner describe-service --service-arn $(aws apprunner list-services --region $AWS_REGION --query "ServiceSummaryList[?ServiceName=='ebl-backend'].ServiceArn" --output text) --region $AWS_REGION)

# Get backend URL
BACKEND_URL=$(echo $BACKEND_SERVICE | jq -r '.Service.ServiceUrl')

echo -e "${GREEN}✅ Backend deployed to App Runner${NC}"
echo -e "${BLUE}🔗 Backend URL: https://${BACKEND_URL}${NC}"
echo ""

# ===========================================
# STEP 4: Deploy Frontend with AWS App Runner
# ===========================================
echo -e "${YELLOW}Step 4: Deploying frontend with App Runner...${NC}"

# Create App Runner service for frontend
FRONTEND_SERVICE=$(aws apprunner create-service \
    --service-name ebl-frontend \
    --source-configuration "{
        \"ImageRepository\": {
            \"ImageIdentifier\": \"$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-frontend:latest\",
            \"ImageRepositoryType\": \"ECR\",
            \"ImageConfiguration\": {
                \"Port\": \"80\",
                \"RuntimeEnvironmentVariables\": {
                    \"VITE_API_URL\": \"https://${BACKEND_URL}\",
                    \"VITE_WS_URL\": \"wss://${BACKEND_URL}\"
                }
            }
        },
        \"AutoDeploymentsEnabled\": true,
        \"AuthenticationConfiguration\": {
            \"AccessRoleArn\": \"arn:aws:iam::$AWS_ACCOUNT_ID:role/$ROLE_NAME\"
        }
    }" \
    --instance-configuration "{
        \"Cpu\": \"1024\",
        \"Memory\": \"2048\"
    }" \
    --region $AWS_REGION 2>/dev/null || \
aws apprunner describe-service --service-arn $(aws apprunner list-services --region $AWS_REGION --query "ServiceSummaryList[?ServiceName=='ebl-frontend'].ServiceArn" --output text) --region $AWS_REGION)

# Get frontend URL
FRONTEND_URL=$(echo $FRONTEND_SERVICE | jq -r '.Service.ServiceUrl')

echo -e "${GREEN}✅ Frontend deployed to App Runner${NC}"
echo -e "${BLUE}🔗 Frontend URL: https://${FRONTEND_URL}${NC}"
echo ""

# ===========================================
# DEPLOYMENT COMPLETE
# ===========================================
echo "=========================================="
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}📱 Frontend URL: https://${FRONTEND_URL}${NC}"
echo -e "${BLUE}🔧 Backend URL:  https://${BACKEND_URL}${NC}"
echo -e "${BLUE}📊 Health Check: https://${BACKEND_URL}/health${NC}"
echo -e "${BLUE}📚 API Docs:     https://${BACKEND_URL}/docs${NC}"
echo ""
echo "⚠️  Note: Services may take 5-10 minutes to fully initialize"
echo "Check status: aws apprunner list-services --region $AWS_REGION"
echo ""
echo "=========================================="