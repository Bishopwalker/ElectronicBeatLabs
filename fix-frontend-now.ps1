# Fix Frontend Service - Connect to ALB and Scale Up
$AWS_REGION = "us-east-1"
$CLUSTER = "ebl-cluster"
$SERVICE_NAME = "ebl-frontend-service"

Write-Host "=== Fixing Frontend Service ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Get Target Group ARN
Write-Host "[1/4] Getting Frontend Target Group..." -ForegroundColor Yellow
$TG_INFO = aws elbv2 describe-target-groups --names ebl-frontend-tg --region $AWS_REGION | ConvertFrom-Json
$TG_ARN = $TG_INFO.TargetGroups[0].TargetGroupArn
Write-Host "Target Group: $TG_ARN" -ForegroundColor Green

# Step 2: Get VPC and Subnets
Write-Host "[2/4] Getting network configuration..." -ForegroundColor Yellow
$VPC_ID = aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --region $AWS_REGION --query "Vpcs[0].VpcId" --output text
$SUBNETS = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --region $AWS_REGION --query "Subnets[*].SubnetId" --output text
$SUBNET_ARRAY = $SUBNETS -split '\s+'

# Get ALB security group
$ALB_SG = aws ec2 describe-security-groups --filters "Name=group-name,Values=ebl-alb-sg" --region $AWS_REGION --query "SecurityGroups[0].GroupId" --output text
Write-Host "Security Group: $ALB_SG" -ForegroundColor Green

# Step 3: Check current service status
Write-Host "[3/4] Checking current service..." -ForegroundColor Yellow
$CURRENT_SERVICE = aws ecs describe-services --cluster $CLUSTER --services $SERVICE_NAME --region $AWS_REGION | ConvertFrom-Json

if ($CURRENT_SERVICE.services -and $CURRENT_SERVICE.services[0].status -eq "ACTIVE") {
    Write-Host "Service exists, will update it..." -ForegroundColor Yellow
    
    # Delete and recreate because you can't modify load balancer config on existing service
    Write-Host "  Scaling down to 0..." -ForegroundColor Yellow
    aws ecs update-service --cluster $CLUSTER --service $SERVICE_NAME --desired-count 0 --region $AWS_REGION >$null
    
    Write-Host "  Waiting 30 seconds for tasks to stop..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    Write-Host "  Deleting service..." -ForegroundColor Yellow
    aws ecs delete-service --cluster $CLUSTER --service $SERVICE_NAME --force --region $AWS_REGION >$null
    
    Write-Host "  Waiting 30 seconds for deletion..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
}

# Step 4: Create new service with ALB integration
Write-Host "[4/4] Creating new frontend service with ALB..." -ForegroundColor Yellow

$SERVICE_CONFIG = @{
    cluster = $CLUSTER
    serviceName = $SERVICE_NAME
    taskDefinition = "ebl-frontend"
    loadBalancers = @(
        @{
            targetGroupArn = $TG_ARN
            containerName = "ebl-frontend"
            containerPort = 80
        }
    )
    desiredCount = 1
    launchType = "FARGATE"
    networkConfiguration = @{
        awsvpcConfiguration = @{
            subnets = $SUBNET_ARRAY
            securityGroups = @($ALB_SG)
            assignPublicIp = "ENABLED"
        }
    }
    healthCheckGracePeriodSeconds = 60
}

$SERVICE_JSON = $SERVICE_CONFIG | ConvertTo-Json -Depth 10
$SERVICE_JSON | Out-File -FilePath "frontend-service-config.json" -Encoding UTF8

aws ecs create-service --cli-input-json file://frontend-service-config.json --region $AWS_REGION

Remove-Item frontend-service-config.json

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Frontend Service Created!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service will take 2-3 minutes to start and register with ALB" -ForegroundColor Yellow
Write-Host ""
Write-Host "Check status with:" -ForegroundColor Cyan
Write-Host "  .\check-alb-status.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Or watch it in real-time:" -ForegroundColor Cyan
Write-Host "  aws ecs describe-services --cluster $CLUSTER --services $SERVICE_NAME --region $AWS_REGION --query 'services[0].{Running:runningCount,Desired:desiredCount,Status:status}'" -ForegroundColor White
Write-Host ""
Write-Host "Your ALB DNS: ebl-alb-2035700466.us-east-1.elb.amazonaws.com" -ForegroundColor Green
Write-Host ""
