#!/bin/bash

# Frontend Deployment Script - S3 + CloudFront
# Deploys the React build to S3 and invalidates CloudFront cache

set -e

# Configuration
ENVIRONMENT=${1:-production}
AWS_REGION=${AWS_REGION:-us-east-1}
STACK_NAME="ebl-frontend-${ENVIRONMENT}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Frontend to ${ENVIRONMENT}${NC}"

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    exit 1
fi

# Check if logged in to AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ Not logged in to AWS. Please run 'aws configure'${NC}"
    exit 1
fi

# Build the frontend
echo -e "${YELLOW}📦 Building frontend...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

# Deploy CloudFormation stack if it doesn't exist
echo -e "${YELLOW}☁️ Checking CloudFormation stack...${NC}"
if ! aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$AWS_REGION" &> /dev/null; then
    echo -e "${YELLOW}Creating CloudFormation stack...${NC}"
    aws cloudformation create-stack \
        --stack-name "$STACK_NAME" \
        --template-body file://infrastructure/frontend-deployment.yaml \
        --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
        --region "$AWS_REGION" \
        --capabilities CAPABILITY_IAM
    
    echo -e "${YELLOW}Waiting for stack creation...${NC}"
    aws cloudformation wait stack-create-complete \
        --stack-name "$STACK_NAME" \
        --region "$AWS_REGION"
fi

# Get S3 bucket name and CloudFront distribution ID from stack outputs
S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" \
    --output text \
    --region "$AWS_REGION")

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" \
    --output text \
    --region "$AWS_REGION")

WEBSITE_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" \
    --output text \
    --region "$AWS_REGION")

# Upload to S3
echo -e "${YELLOW}📤 Uploading to S3 bucket: ${S3_BUCKET}${NC}"

# Upload HTML files with no-cache headers
aws s3 sync dist/ "s3://${S3_BUCKET}/" \
    --delete \
    --exclude "*" \
    --include "*.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html; charset=utf-8"

# Upload JS files with cache headers
aws s3 sync dist/ "s3://${S3_BUCKET}/" \
    --exclude "*" \
    --include "*.js" \
    --cache-control "public, max-age=31536000, immutable" \
    --content-type "application/javascript"

# Upload CSS files with cache headers
aws s3 sync dist/ "s3://${S3_BUCKET}/" \
    --exclude "*" \
    --include "*.css" \
    --cache-control "public, max-age=31536000, immutable" \
    --content-type "text/css"

# Upload other static assets
aws s3 sync dist/ "s3://${S3_BUCKET}/" \
    --exclude "*.html" \
    --exclude "*.js" \
    --exclude "*.css" \
    --cache-control "public, max-age=604800"

# Create CloudFront invalidation
echo -e "${YELLOW}🔄 Creating CloudFront invalidation...${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --query "Invalidation.Id" \
    --output text)

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${GREEN}📱 Website URL: ${WEBSITE_URL}${NC}"
echo -e "${YELLOW}⏳ CloudFront invalidation ID: ${INVALIDATION_ID}${NC}"
echo -e "${YELLOW}   (Takes 5-10 minutes to propagate globally)${NC}"

# Save deployment info
cat > ".last-deployment-frontend.json" <<EOF
{
  "environment": "${ENVIRONMENT}",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "bucket": "${S3_BUCKET}",
  "distributionId": "${DISTRIBUTION_ID}",
  "websiteUrl": "${WEBSITE_URL}",
  "invalidationId": "${INVALIDATION_ID}"
}
EOF

echo -e "${GREEN}📝 Deployment info saved to .last-deployment-frontend.json${NC}"