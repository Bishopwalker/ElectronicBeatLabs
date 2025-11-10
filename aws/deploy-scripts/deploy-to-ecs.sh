#!/bin/bash
# AWS ECS Deployment Script for Electromagnetic Beat Lab
# This script deploys Docker containers to AWS ECS

set -e

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="498251986918"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
BACKEND_ECR_REPO="ebl-backend"
FRONTEND_ECR_REPO="ebl-frontend"
ECS_CLUSTER="ebl-cluster"
ECS_SERVICE_BACKEND="ebl-backend-service"
ECS_SERVICE_FRONTEND="ebl-frontend-service"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  EBL AWS ECS Deployment Script        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Login to AWS ECR
echo -e "${YELLOW}[1/6] Logging into AWS ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REGISTRY}
echo -e "${GREEN}✓ Logged into AWS ECR successfully${NC}"
echo ""

# Step 2: Build Docker Images
echo -e "${YELLOW}[2/6] Building Docker images...${NC}"

echo "Building backend image..."
docker build \
  --file backend/Dockerfile \
  --tag ${ECR_REGISTRY}/${BACKEND_ECR_REPO}:latest \
  --tag ${ECR_REGISTRY}/${BACKEND_ECR_REPO}:$(git rev-parse --short HEAD) \
  .
echo -e "${GREEN}✓ Backend image built${NC}"

echo "Building frontend image..."
docker build \
  --file Dockerfile.frontend \
  --tag ${ECR_REGISTRY}/${FRONTEND_ECR_REPO}:latest \
  --tag ${ECR_REGISTRY}/${FRONTEND_ECR_REPO}:$(git rev-parse --short HEAD) \
  --build-arg VITE_API_URL=http://ebl-backend.local:8000 \
  --build-arg VITE_WS_URL=ws://ebl-backend.local:8000 \
  .
echo -e "${GREEN}✓ Frontend image built${NC}"
echo ""

# Step 3: Push Images to ECR
echo -e "${YELLOW}[3/6] Pushing images to AWS ECR...${NC}"

echo "Pushing backend image..."
docker push ${ECR_REGISTRY}/${BACKEND_ECR_REPO}:latest
docker push ${ECR_REGISTRY}/${BACKEND_ECR_REPO}:$(git rev-parse --short HEAD)
echo -e "${GREEN}✓ Backend image pushed${NC}"

echo "Pushing frontend image..."
docker push ${ECR_REGISTRY}/${FRONTEND_ECR_REPO}:latest
docker push ${ECR_REGISTRY}/${FRONTEND_ECR_REPO}:$(git rev-parse --short HEAD)
echo -e "${GREEN}✓ Frontend image pushed${NC}"
echo ""

# Step 4: Create ECS Cluster (if not exists)
echo -e "${YELLOW}[4/6] Checking ECS cluster...${NC}"
CLUSTER_EXISTS=$(aws ecs describe-clusters --clusters ${ECS_CLUSTER} --region ${AWS_REGION} | jq -r '.clusters[0].status')

if [ "$CLUSTER_EXISTS" != "ACTIVE" ]; then
  echo "Creating ECS cluster..."
  aws ecs create-cluster --cluster-name ${ECS_CLUSTER} --region ${AWS_REGION}
  echo -e "${GREEN}✓ ECS cluster created${NC}"
else
  echo -e "${GREEN}✓ ECS cluster already exists${NC}"
fi
echo ""

# Step 5: Register Task Definitions
echo -e "${YELLOW}[5/6] Registering ECS task definitions...${NC}"

echo "Registering backend task definition..."
aws ecs register-task-definition --cli-input-json file://aws/ecs-task-definition-backend.json --region ${AWS_REGION} > /dev/null
echo -e "${GREEN}✓ Backend task definition registered${NC}"

echo "Registering frontend task definition..."
aws ecs register-task-definition --cli-input-json file://aws/ecs-task-definition-frontend.json --region ${AWS_REGION} > /dev/null
echo -e "${GREEN}✓ Frontend task definition registered${NC}"
echo ""

# Step 6: Create or Update ECS Services
echo -e "${YELLOW}[6/6] Deploying services to ECS...${NC}"

# Check if backend service exists
BACKEND_SERVICE_EXISTS=$(aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE_BACKEND} --region ${AWS_REGION} | jq -r '.services[0].status')

if [ "$BACKEND_SERVICE_EXISTS" == "ACTIVE" ]; then
  echo "Updating backend service..."
  aws ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE_BACKEND} \
    --force-new-deployment \
    --region ${AWS_REGION} > /dev/null
  echo -e "${GREEN}✓ Backend service updated${NC}"
else
  echo "Creating backend service..."
  # Note: You'll need to create the service with proper VPC, subnet, and security group configs
  echo -e "${YELLOW}⚠ Backend service needs to be created manually via AWS Console or with full configuration${NC}"
fi

# Check if frontend service exists
FRONTEND_SERVICE_EXISTS=$(aws ecs describe-services --cluster ${ECS_CLUSTER} --services ${ECS_SERVICE_FRONTEND} --region ${AWS_REGION} | jq -r '.services[0].status')

if [ "$FRONTEND_SERVICE_EXISTS" == "ACTIVE" ]; then
  echo "Updating frontend service..."
  aws ecs update-service \
    --cluster ${ECS_CLUSTER} \
    --service ${ECS_SERVICE_FRONTEND} \
    --force-new-deployment \
    --region ${AWS_REGION} > /dev/null
  echo -e "${GREEN}✓ Frontend service updated${NC}"
else
  echo "Creating frontend service..."
  echo -e "${YELLOW}⚠ Frontend service needs to be created manually via AWS Console or with full configuration${NC}"
fi
echo ""

# Summary
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Deployment Complete!                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo "Next steps:"
echo "1. Verify services are running: aws ecs list-services --cluster ${ECS_CLUSTER}"
echo "2. Check task status: aws ecs list-tasks --cluster ${ECS_CLUSTER}"
echo "3. View logs in CloudWatch: /ecs/ebl-backend and /ecs/ebl-frontend"
echo ""
