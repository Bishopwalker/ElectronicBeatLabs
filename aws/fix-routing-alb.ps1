# EBL ALB Setup Script - Fix Domain Routing
# This creates an ALB that properly routes to frontend and backend

$AWS_REGION = "us-east-1"
$VPC_ID = "" # Will be populated
$SUBNET_IDS = @()

Write-Host "=== EBL Domain Routing Fix ===" -ForegroundColor Cyan
Write-Host "This script sets up an ALB to properly route your domain" -ForegroundColor Yellow
Write-Host ""

# Step 1: Get VPC and Subnets
Write-Host "[1/7] Getting VPC information..." -ForegroundColor Yellow
$VPC_ID = aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --region $AWS_REGION --query "Vpcs[0].VpcId" --output text
Write-Host "VPC ID: $VPC_ID" -ForegroundColor Green

$SUBNETS = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --region $AWS_REGION --query "Subnets[*].SubnetId" --output text
$SUBNET_IDS = $SUBNETS -split '\s+'
Write-Host "Found $($SUBNET_IDS.Length) subnets" -ForegroundColor Green

# Step 2: Create Security Group for ALB
Write-Host "[2/7] Creating ALB security group..." -ForegroundColor Yellow
$ALB_SG_ID = aws ec2 create-security-group `
    --group-name ebl-alb-sg `
    --description "Security group for EBL Application Load Balancer" `
    --vpc-id $VPC_ID `
    --region $AWS_REGION `
    --query "GroupId" `
    --output text 2>$null

if (-not $ALB_SG_ID) {
    # Security group might already exist
    $ALB_SG_ID = aws ec2 describe-security-groups `
        --filters "Name=group-name,Values=ebl-alb-sg" `
        --region $AWS_REGION `
        --query "SecurityGroups[0].GroupId" `
        --output text
}

Write-Host "ALB Security Group: $ALB_SG_ID" -ForegroundColor Green

# Allow HTTP and HTTPS traffic
aws ec2 authorize-security-group-ingress `
    --group-id $ALB_SG_ID `
    --protocol tcp --port 80 --cidr 0.0.0.0/0 `
    --region $AWS_REGION 2>$null

aws ec2 authorize-security-group-ingress `
    --group-id $ALB_SG_ID `
    --protocol tcp --port 443 --cidr 0.0.0.0/0 `
    --region $AWS_REGION 2>$null

# Step 3: Create Target Groups
Write-Host "[3/7] Creating target groups..." -ForegroundColor Yellow

# Frontend target group (port 80)
$FRONTEND_TG = aws elbv2 create-target-group `
    --name ebl-frontend-tg `
    --protocol HTTP `
    --port 80 `
    --vpc-id $VPC_ID `
    --target-type ip `
    --health-check-enabled `
    --health-check-path "/" `
    --health-check-interval-seconds 30 `
    --health-check-timeout-seconds 5 `
    --healthy-threshold-count 2 `
    --unhealthy-threshold-count 3 `
    --region $AWS_REGION `
    --query "TargetGroups[0].TargetGroupArn" `
    --output text 2>$null

if (-not $FRONTEND_TG) {
    $FRONTEND_TG = aws elbv2 describe-target-groups `
        --names ebl-frontend-tg `
        --region $AWS_REGION `
        --query "TargetGroups[0].TargetGroupArn" `
        --output text 2>$null
}

# Backend target group (port 8000)
$BACKEND_TG = aws elbv2 create-target-group `
    --name ebl-backend-tg `
    --protocol HTTP `
    --port 8000 `
    --vpc-id $VPC_ID `
    --target-type ip `
    --health-check-enabled `
    --health-check-path "/health" `
    --health-check-interval-seconds 30 `
    --health-check-timeout-seconds 5 `
    --healthy-threshold-count 2 `
    --unhealthy-threshold-count 3 `
    --region $AWS_REGION `
    --query "TargetGroups[0].TargetGroupArn" `
    --output text 2>$null

if (-not $BACKEND_TG) {
    $BACKEND_TG = aws elbv2 describe-target-groups `
        --names ebl-backend-tg `
        --region $AWS_REGION `
        --query "TargetGroups[0].TargetGroupArn" `
        --output text 2>$null
}

Write-Host "Frontend Target Group: $FRONTEND_TG" -ForegroundColor Green
Write-Host "Backend Target Group: $BACKEND_TG" -ForegroundColor Green

# Step 4: Create Application Load Balancer
Write-Host "[4/7] Creating Application Load Balancer..." -ForegroundColor Yellow

$ALB_ARN = aws elbv2 create-load-balancer `
    --name ebl-alb `
    --subnets $SUBNET_IDS[0] $SUBNET_IDS[1] `
    --security-groups $ALB_SG_ID `
    --scheme internet-facing `
    --type application `
    --region $AWS_REGION `
    --query "LoadBalancers[0].LoadBalancerArn" `
    --output text 2>$null

if (-not $ALB_ARN) {
    $ALB_ARN = aws elbv2 describe-load-balancers `
        --names ebl-alb `
        --region $AWS_REGION `
        --query "LoadBalancers[0].LoadBalancerArn" `
        --output text
}

$ALB_DNS = aws elbv2 describe-load-balancers `
    --load-balancer-arns $ALB_ARN `
    --region $AWS_REGION `
    --query "LoadBalancers[0].DNSName" `
    --output text

Write-Host "ALB Created: $ALB_DNS" -ForegroundColor Green

# Step 5: Create Listener with Rules
Write-Host "[5/7] Creating listener rules..." -ForegroundColor Yellow

# Create listener
$LISTENER_ARN = aws elbv2 create-listener `
    --load-balancer-arn $ALB_ARN `
    --protocol HTTP `
    --port 80 `
    --default-actions "Type=forward,TargetGroupArn=$FRONTEND_TG" `
    --region $AWS_REGION `
    --query "Listeners[0].ListenerArn" `
    --output text 2>$null

if (-not $LISTENER_ARN) {
    $LISTENER_ARN = aws elbv2 describe-listeners `
        --load-balancer-arn $ALB_ARN `
        --region $AWS_REGION `
        --query "Listeners[0].ListenerArn" `
        --output text
}

# Add rules for API and WebSocket paths
aws elbv2 create-rule `
    --listener-arn $LISTENER_ARN `
    --conditions "Field=path-pattern,Values=/api/*" `
    --priority 1 `
    --actions "Type=forward,TargetGroupArn=$BACKEND_TG" `
    --region $AWS_REGION >$null 2>&1

aws elbv2 create-rule `
    --listener-arn $LISTENER_ARN `
    --conditions "Field=path-pattern,Values=/ws/*" `
    --priority 2 `
    --actions "Type=forward,TargetGroupArn=$BACKEND_TG" `
    --region $AWS_REGION >$null 2>&1

aws elbv2 create-rule `
    --listener-arn $LISTENER_ARN `
    --conditions "Field=path-pattern,Values=/health" `
    --priority 3 `
    --actions "Type=forward,TargetGroupArn=$BACKEND_TG" `
    --region $AWS_REGION >$null 2>&1

Write-Host "Listener rules configured" -ForegroundColor Green

# Step 6: Update ECS Services to use Target Groups
Write-Host "[6/7] Updating ECS services..." -ForegroundColor Yellow

# Get current service configurations
$FRONTEND_SERVICE_CONFIG = @"
{
    "cluster": "ebl-cluster",
    "serviceName": "ebl-frontend-service",
    "taskDefinition": "ebl-frontend",
    "loadBalancers": [
        {
            "targetGroupArn": "$FRONTEND_TG",
            "containerName": "ebl-frontend",
            "containerPort": 80
        }
    ],
    "desiredCount": 1,
    "launchType": "FARGATE",
    "networkConfiguration": {
        "awsvpcConfiguration": {
            "subnets": $($SUBNET_IDS[0..1] | ConvertTo-Json),
            "securityGroups": ["$ALB_SG_ID"],
            "assignPublicIp": "ENABLED"
        }
    }
}
"@

$BACKEND_SERVICE_CONFIG = @"
{
    "cluster": "ebl-cluster",
    "serviceName": "ebl-backend-service",
    "taskDefinition": "ebl-backend",
    "loadBalancers": [
        {
            "targetGroupArn": "$BACKEND_TG",
            "containerName": "ebl-backend",
            "containerPort": 8000
        }
    ],
    "desiredCount": 1,
    "launchType": "FARGATE",
    "networkConfiguration": {
        "awsvpcConfiguration": {
            "subnets": $($SUBNET_IDS[0..1] | ConvertTo-Json),
            "securityGroups": ["$ALB_SG_ID"],
            "assignPublicIp": "ENABLED"
        }
    }
}
"@

# Delete existing services if they exist
aws ecs update-service --cluster ebl-cluster --service ebl-frontend-service --desired-count 0 --region $AWS_REGION 2>$null
aws ecs update-service --cluster ebl-cluster --service ebl-backend-service --desired-count 0 --region $AWS_REGION 2>$null
Start-Sleep -Seconds 10
aws ecs delete-service --cluster ebl-cluster --service ebl-frontend-service --force --region $AWS_REGION 2>$null
aws ecs delete-service --cluster ebl-cluster --service ebl-backend-service --force --region $AWS_REGION 2>$null

Write-Host "Waiting for services to be deleted..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Create new services with ALB integration
$FRONTEND_SERVICE_CONFIG | Out-File -FilePath frontend-service.json -Encoding UTF8
$BACKEND_SERVICE_CONFIG | Out-File -FilePath backend-service.json -Encoding UTF8

aws ecs create-service --cli-input-json file://frontend-service.json --region $AWS_REGION >$null 2>&1
aws ecs create-service --cli-input-json file://backend-service.json --region $AWS_REGION >$null 2>&1

Remove-Item frontend-service.json
Remove-Item backend-service.json

Write-Host "Services updated with ALB integration" -ForegroundColor Green

# Step 7: Output Instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ALB Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ALB DNS Name: $ALB_DNS" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Wait 2-3 minutes for services to stabilize" -ForegroundColor White
Write-Host "2. Test the ALB: http://$ALB_DNS" -ForegroundColor White
Write-Host "3. Update your domain's DNS to point to:" -ForegroundColor White
Write-Host "   $ALB_DNS" -ForegroundColor Yellow
Write-Host ""
Write-Host "To check service status:" -ForegroundColor Cyan
Write-Host "aws ecs describe-services --cluster ebl-cluster --services ebl-frontend-service ebl-backend-service --region $AWS_REGION" -ForegroundColor White
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Cyan
Write-Host "aws logs tail /ecs/ebl-frontend --follow --region $AWS_REGION" -ForegroundColor White
Write-Host "aws logs tail /ecs/ebl-backend --follow --region $AWS_REGION" -ForegroundColor White
