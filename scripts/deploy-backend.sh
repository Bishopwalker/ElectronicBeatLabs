#!/bin/bash

# Backend Deployment Script - ECS Fargate
# Deploys the FastAPI backend to ECS Fargate

set -e

# Configuration
ENVIRONMENT=${1:-production}
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY="ebl-backend-${ENVIRONMENT}"
STACK_NAME="ebl-backend-${ENVIRONMENT}"
IMAGE_TAG="${2:-latest}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Backend to ${ENVIRONMENT}${NC}"

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    exit 1
fi

# Check Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Check if logged in to AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ Not logged in to AWS. Please run 'aws configure'${NC}"
    exit 1
fi

# Create ECR repository if it doesn't exist
echo -e "${YELLOW}📦 Checking ECR repository...${NC}"
if ! aws ecr describe-repositories --repository-names "$ECR_REPOSITORY" --region "$AWS_REGION" &> /dev/null; then
    echo -e "${YELLOW}Creating ECR repository...${NC}"
    aws ecr create-repository \
        --repository-name "$ECR_REPOSITORY" \
        --region "$AWS_REGION" \
        --image-scanning-configuration scanOnPush=true
fi

# Get ECR login token
echo -e "${YELLOW}🔐 Logging in to ECR...${NC}"
aws ecr get-login-password --region "$AWS_REGION" | \
    docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Build Docker image
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
docker build -t "$ECR_REPOSITORY:$IMAGE_TAG" -f backend/Dockerfile .

# Tag for ECR
ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}:${IMAGE_TAG}"
docker tag "$ECR_REPOSITORY:$IMAGE_TAG" "$ECR_URI"

# Push to ECR
echo -e "${YELLOW}📤 Pushing image to ECR...${NC}"
docker push "$ECR_URI"

# Create required secrets if they don't exist
echo -e "${YELLOW}🔑 Checking secrets...${NC}"
SECRETS=("ebl-db-${ENVIRONMENT}" "ebl-stripe-${ENVIRONMENT}" "ebl-jwt-${ENVIRONMENT}")
for secret in "${SECRETS[@]}"; do
    if ! aws secretsmanager describe-secret --secret-id "$secret" --region "$AWS_REGION" &> /dev/null; then
        echo -e "${YELLOW}Creating secret: ${secret}${NC}"
        echo -e "${RED}⚠️  Please update this secret with actual values in AWS Console${NC}"
        aws secretsmanager create-secret \
            --name "$secret" \
            --description "Secret for EBL ${ENVIRONMENT}" \
            --secret-string '{"placeholder":"update-me"}' \
            --region "$AWS_REGION"
    fi
done

# Deploy CloudFormation stack
echo -e "${YELLOW}☁️ Deploying CloudFormation stack...${NC}"
if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$AWS_REGION" &> /dev/null; then
    # Update existing stack
    aws cloudformation update-stack \
        --stack-name "$STACK_NAME" \
        --template-body file://infrastructure/backend-deployment.yaml \
        --parameters \
            ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
            ParameterKey=DockerImageUri,ParameterValue="$ECR_URI" \
            ParameterKey=DesiredCount,ParameterValue=2 \
        --capabilities CAPABILITY_IAM \
        --region "$AWS_REGION" || true
    
    echo -e "${YELLOW}Waiting for stack update...${NC}"
    aws cloudformation wait stack-update-complete \
        --stack-name "$STACK_NAME" \
        --region "$AWS_REGION" || true
else
    # Create new stack
    aws cloudformation create-stack \
        --stack-name "$STACK_NAME" \
        --template-body file://infrastructure/backend-deployment.yaml \
        --parameters \
            ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
            ParameterKey=DockerImageUri,ParameterValue="$ECR_URI" \
            ParameterKey=DesiredCount,ParameterValue=2 \
        --capabilities CAPABILITY_IAM \
        --region "$AWS_REGION"
    
    echo -e "${YELLOW}Waiting for stack creation...${NC}"
    aws cloudformation wait stack-create-complete \
        --stack-name "$STACK_NAME" \
        --region "$AWS_REGION"
fi

# Get outputs
BACKEND_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='BackendURL'].OutputValue" \
    --output text \
    --region "$AWS_REGION")

WEBSOCKET_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='WebSocketURL'].OutputValue" \
    --output text \
    --region "$AWS_REGION")

CLUSTER_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='ClusterName'].OutputValue" \
    --output text \
    --region "$AWS_REGION")

SERVICE_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='ServiceName'].OutputValue" \
    --output text \
    --region "$AWS_REGION")

# Force new deployment with latest image
echo -e "${YELLOW}🔄 Forcing new deployment...${NC}"
aws ecs update-service \
    --cluster "$CLUSTER_NAME" \
    --service "$SERVICE_NAME" \
    --force-new-deployment \
    --region "$AWS_REGION"

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}🌐 Backend URL: ${BACKEND_URL}${NC}"
echo -e "${GREEN}🔌 WebSocket URL: ${WEBSOCKET_URL}${NC}"

# Health check
echo -e "${YELLOW}🏥 Running health check...${NC}"
sleep 30  # Wait for deployment to start
if curl -f "${BACKEND_URL}/health" &> /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed - service may still be starting${NC}"
fi

# Save deployment info
cat > ".last-deployment-backend.json" <<EOF
{
  "environment": "${ENVIRONMENT}",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "imageUri": "${ECR_URI}",
  "backendUrl": "${BACKEND_URL}",
  "websocketUrl": "${WEBSOCKET_URL}",
  "clusterName": "${CLUSTER_NAME}",
  "serviceName": "${SERVICE_NAME}"
}
EOF

echo -e "${GREEN}📝 Deployment info saved to .last-deployment-backend.json${NC}"