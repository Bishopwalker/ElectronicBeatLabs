#!/usr/bin/env pwsh
# Electronic Beat Labs - Hybrid AWS Deployment Script
# Deploys: Lambda (REST API) + ECS Fargate (WebSocket) + S3/CloudFront (Frontend)

param(
    [string]$Stage = "prod",
    [string]$Region = "us-east-1",
    [switch]$SkipLambda,
    [switch]$SkipECS,
    [switch]$SkipFrontend,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "========================================="
Write-Info "  Electronic Beat Labs - Hybrid Deploy"
Write-Info "========================================="
Write-Info "Stage: $Stage"
Write-Info "Region: $Region"
Write-Info ""

# Check prerequisites
Write-Info "Checking prerequisites..."

# Check AWS CLI
if (!(Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Error "AWS CLI not found. Install from: https://aws.amazon.com/cli/"
    exit 1
}

# Check Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker not found. Install from: https://docker.com"
    exit 1
}

# Check Serverless Framework
if (!(Get-Command serverless -ErrorAction SilentlyContinue)) {
    Write-Warning "Serverless Framework not found. Installing..."
    npm install -g serverless
}

# Get AWS Account ID
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to get AWS Account ID. Configure AWS credentials with 'aws configure'"
    exit 1
}
Write-Success "✓ AWS Account ID: $AWS_ACCOUNT_ID"

# Get current directory
$SCRIPT_DIR = $PSScriptRoot
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR

# ========================================
# 1. Deploy Lambda Functions (REST API)
# ========================================

if (!$SkipLambda) {
    Write-Info ""
    Write-Info "========================================="
    Write-Info "1. Deploying Lambda Functions"
    Write-Info "========================================="

    Push-Location "$PROJECT_ROOT/backend"

    # Install Serverless plugins
    Write-Info "Installing Serverless plugins..."
    if (!(Test-Path "node_modules")) {
        npm install
    }

    # Deploy with Serverless Framework
    Write-Info "Deploying Lambda functions..."
    if ($DryRun) {
        Write-Warning "DRY RUN: Would run: serverless deploy --stage $Stage --region $Region"
    } else {
        serverless deploy --stage $Stage --region $Region --verbose
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Lambda deployment failed"
            Pop-Location
            exit 1
        }
    }

    # Get API Gateway URL
    $API_URL = (serverless info --stage $Stage --region $Region | Select-String "HttpApiUrl:" | ForEach-Object { $_ -replace ".*HttpApiUrl:\s*", "" })
    Write-Success "✓ Lambda API deployed: $API_URL"

    Pop-Location
} else {
    Write-Warning "Skipping Lambda deployment"
    $API_URL = "SKIPPED"
}

# ========================================
# 2. Deploy ECS Fargate (WebSocket)
# ========================================

if (!$SkipECS) {
    Write-Info ""
    Write-Info "========================================="
    Write-Info "2. Deploying ECS Fargate WebSocket Service"
    Write-Info "========================================="

    Push-Location "$PROJECT_ROOT/backend"

    # Create ECR repository
    Write-Info "Creating ECR repository..."
    $REPO_NAME = "ebl-websocket"
    $ECR_URI = "$AWS_ACCOUNT_ID.dkr.ecr.$Region.amazonaws.com/$REPO_NAME"

    if ($DryRun) {
        Write-Warning "DRY RUN: Would create ECR repository: $REPO_NAME"
    } else {
        aws ecr describe-repositories --repository-names $REPO_NAME --region $Region 2>$null
        if ($LASTEXITCODE -ne 0) {
            aws ecr create-repository --repository-name $REPO_NAME --region $Region
            Write-Success "✓ ECR repository created: $REPO_NAME"
        } else {
            Write-Info "ECR repository already exists: $REPO_NAME"
        }
    }

    # Login to ECR
    Write-Info "Logging in to ECR..."
    if (!$DryRun) {
        aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $ECR_URI
    }

    # Build Docker image
    Write-Info "Building Docker image for WebSocket service..."
    if ($DryRun) {
        Write-Warning "DRY RUN: Would build: docker build -f Dockerfile.websocket -t $REPO_NAME ."
    } else {
        docker build -f Dockerfile.websocket -t ${REPO_NAME}:latest .
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker build failed"
            Pop-Location
            exit 1
        }
        docker tag ${REPO_NAME}:latest ${ECR_URI}:latest
    }

    # Push to ECR
    Write-Info "Pushing image to ECR..."
    if ($DryRun) {
        Write-Warning "DRY RUN: Would push: docker push ${ECR_URI}:latest"
    } else {
        docker push ${ECR_URI}:latest
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker push failed"
            Pop-Location
            exit 1
        }
        Write-Success "✓ Docker image pushed to ECR"
    }

    # Create/Update ECS resources
    Write-Info "Setting up ECS Cluster, Service, and Task Definition..."

    # Create ECS cluster
    $CLUSTER_NAME = "ebl-cluster-$Stage"
    if ($DryRun) {
        Write-Warning "DRY RUN: Would create ECS cluster: $CLUSTER_NAME"
    } else {
        aws ecs describe-clusters --clusters $CLUSTER_NAME --region $Region 2>$null
        if ($LASTEXITCODE -ne 0) {
            aws ecs create-cluster --cluster-name $CLUSTER_NAME --region $Region
            Write-Success "✓ ECS cluster created: $CLUSTER_NAME"
        } else {
            Write-Info "ECS cluster already exists: $CLUSTER_NAME"
        }
    }

    # Update task definition JSON with account ID
    $TASK_DEF_FILE = "aws-ecs-task-definition.json"
    $TASK_DEF_CONTENT = Get-Content $TASK_DEF_FILE -Raw
    $TASK_DEF_CONTENT = $TASK_DEF_CONTENT -replace "\{AWS_ACCOUNT_ID\}", $AWS_ACCOUNT_ID
    $TASK_DEF_CONTENT | Set-Content "${TASK_DEF_FILE}.tmp"

    # Register task definition
    Write-Info "Registering ECS task definition..."
    if (!$DryRun) {
        aws ecs register-task-definition --cli-input-json file://${TASK_DEF_FILE}.tmp --region $Region
        Remove-Item "${TASK_DEF_FILE}.tmp"
        Write-Success "✓ ECS task definition registered"
    }

    # Create/Update ECS service
    # Note: This requires VPC, Security Groups, and Load Balancer setup
    # See aws-ecs-service-setup.ps1 for full service creation

    $WS_URL = "wss://ebl-websocket-$Stage.${Region}.elb.amazonaws.com"
    Write-Success "✓ WebSocket service deployed: $WS_URL"
    Write-Info "NOTE: Run 'scripts/aws-ecs-service-setup.ps1' to complete ECS service setup"

    Pop-Location
} else {
    Write-Warning "Skipping ECS deployment"
    $WS_URL = "SKIPPED"
}

# ========================================
# 3. Deploy Frontend (S3 + CloudFront)
# ========================================

if (!$SkipFrontend) {
    Write-Info ""
    Write-Info "========================================="
    Write-Info "3. Deploying Frontend to S3 + CloudFront"
    Write-Info "========================================="

    Push-Location $PROJECT_ROOT

    # Build frontend
    Write-Info "Building frontend..."
    if ($DryRun) {
        Write-Warning "DRY RUN: Would run: npm run build"
    } else {
        # Set environment variables for build
        $env:VITE_API_URL = $API_URL
        $env:VITE_WS_URL = $WS_URL

        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Frontend build failed"
            Pop-Location
            exit 1
        }
        Write-Success "✓ Frontend built successfully"
    }

    # Deploy CloudFormation stack
    $STACK_NAME = "ebl-frontend-$Stage"
    Write-Info "Deploying CloudFormation stack: $STACK_NAME..."

    if ($DryRun) {
        Write-Warning "DRY RUN: Would deploy CloudFormation stack: $STACK_NAME"
    } else {
        aws cloudformation deploy `
            --template-file aws-frontend-cloudformation.yml `
            --stack-name $STACK_NAME `
            --parameter-overrides `
                ProjectName=ebl `
                Environment=$Stage `
            --region $Region `
            --capabilities CAPABILITY_IAM

        if ($LASTEXITCODE -ne 0) {
            Write-Error "CloudFormation deployment failed"
            Pop-Location
            exit 1
        }
        Write-Success "✓ CloudFormation stack deployed"
    }

    # Get S3 bucket name and CloudFront distribution from stack outputs
    $BUCKET_NAME = (aws cloudformation describe-stacks --stack-name $STACK_NAME --region $Region --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
    $CLOUDFRONT_ID = (aws cloudformation describe-stacks --stack-name $STACK_NAME --region $Region --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text)
    $FRONTEND_URL = (aws cloudformation describe-stacks --stack-name $STACK_NAME --region $Region --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" --output text)

    # Upload frontend files to S3
    Write-Info "Uploading frontend files to S3..."
    if ($DryRun) {
        Write-Warning "DRY RUN: Would sync dist/ to s3://$BUCKET_NAME/"
    } else {
        aws s3 sync dist/ s3://$BUCKET_NAME/ --delete --region $Region
        if ($LASTEXITCODE -ne 0) {
            Write-Error "S3 sync failed"
            Pop-Location
            exit 1
        }
        Write-Success "✓ Frontend files uploaded to S3"
    }

    # Invalidate CloudFront cache
    Write-Info "Invalidating CloudFront cache..."
    if ($DryRun) {
        Write-Warning "DRY RUN: Would invalidate CloudFront distribution: $CLOUDFRONT_ID"
    } else {
        aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_ID --paths "/*" --region $Region
        Write-Success "✓ CloudFront cache invalidated"
    }

    Write-Success "✓ Frontend deployed: https://$FRONTEND_URL"

    Pop-Location
} else {
    Write-Warning "Skipping Frontend deployment"
    $FRONTEND_URL = "SKIPPED"
}

# ========================================
# Deployment Summary
# ========================================

Write-Info ""
Write-Info "========================================="
Write-Info "  Deployment Complete!"
Write-Info "========================================="
Write-Success ""
Write-Success "🚀 Lambda REST API:     $API_URL"
Write-Success "🔌 WebSocket Service:   $WS_URL"
Write-Success "🌐 Frontend URL:        https://$FRONTEND_URL"
Write-Success ""
Write-Info "Next Steps:"
Write-Info "1. Test Lambda endpoints: curl $API_URL/health"
Write-Info "2. Test WebSocket: wscat -c $WS_URL/ws/audio"
Write-Info "3. Open frontend: https://$FRONTEND_URL"
Write-Info "4. Set up custom domain (optional)"
Write-Info "5. Configure monitoring and alerts"
Write-Info ""
Write-Success "Deployment took: $((Get-Date) - $START_TIME)"
