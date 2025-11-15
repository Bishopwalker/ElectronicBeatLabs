# Force Delete and Recreate Frontend Service
$AWS_REGION = "us-east-1"
$CLUSTER = "ebl-cluster"
$SERVICE_NAME = "ebl-frontend-service"

Write-Host "=== Force Recreating Frontend Service ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check current service status
Write-Host "[1/5] Checking service status..." -ForegroundColor Yellow
$SERVICE_INFO = aws ecs describe-services --cluster $CLUSTER --services $SERVICE_NAME --region $AWS_REGION 2>$null | ConvertFrom-Json

if ($SERVICE_INFO.services) {
    $SERVICE_STATUS = $SERVICE_INFO.services[0].status
    Write-Host "Current status: $SERVICE_STATUS" -ForegroundColor White
    
    if ($SERVICE_STATUS -eq "DRAINING" -or $SERVICE_STATUS -eq "INACTIVE") {
        Write-Host "Service is $SERVICE_STATUS, waiting for cleanup..." -ForegroundColor Yellow
        Start-Sleep -Seconds 60
    }
    
    # Force delete
    Write-Host "Deleting service..." -ForegroundColor Yellow
    aws ecs delete-service --cluster $CLUSTER --service $SERVICE_NAME --force --region $AWS_REGION >$null 2>&1
    
    Write-Host "Waiting 60 seconds for complete deletion..." -ForegroundColor Yellow
    Start-Sleep -Seconds 60
}

# Step 2: Get network config
Write-Host "[2/5] Getting network configuration..." -ForegroundColor Yellow
$VPC_ID = aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --region $AWS_REGION --query "Vpcs[0].VpcId" --output text
$SUBNETS = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --region $AWS_REGION --query "Subnets[*].SubnetId" --output text
$SUBNET_ARRAY = $SUBNETS -split '\s+'
$ALB_SG = aws ec2 describe-security-groups --filters "Name=group-name,Values=ebl-alb-sg" --region $AWS_REGION --query "SecurityGroups[0].GroupId" --output text

Write-Host "✓ Network configured" -ForegroundColor Green

# Step 3: Get target group
Write-Host "[3/5] Getting target group..." -ForegroundColor Yellow
$TG_INFO = aws elbv2 describe-target-groups --names ebl-frontend-tg --region $AWS_REGION | ConvertFrom-Json
$TG_ARN = $TG_INFO.TargetGroups[0].TargetGroupArn
Write-Host "✓ Target group: $TG_ARN" -ForegroundColor Green

# Step 4: Register latest task definition
Write-Host "[4/5] Registering task definition..." -ForegroundColor Yellow
$TASK_DEF = Get-Content "aws\ecs-task-definition-frontend.json" | ConvertFrom-Json
$TASK_DEF_JSON = $TASK_DEF | ConvertTo-Json -Depth 10
$TASK_DEF_JSON | Out-File -FilePath "temp-task-def.json" -Encoding UTF8
aws ecs register-task-definition --cli-input-json file://temp-task-def.json --region $AWS_REGION >$null
Remove-Item "temp-task-def.json"
Write-Host "✓ Task definition registered" -ForegroundColor Green

# Step 5: Create service
Write-Host "[5/5] Creating service..." -ForegroundColor Yellow

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
    healthCheckGracePeriodSeconds = 120
    enableExecuteCommand = $true
}

$SERVICE_JSON = $SERVICE_CONFIG | ConvertTo-Json -Depth 10
$SERVICE_JSON | Out-File -FilePath "temp-service-config.json" -Encoding UTF8

$CREATE_RESULT = aws ecs create-service --cli-input-json file://temp-service-config.json --region $AWS_REGION 2>&1

Remove-Item "temp-service-config.json"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Service created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "✅ Frontend Service Running!" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Wait 2-3 minutes for task to become healthy, then run:" -ForegroundColor Yellow
    Write-Host "  .\check-alb-status.ps1" -ForegroundColor White
} else {
    Write-Host "✗ Service creation failed!" -ForegroundColor Red
    Write-Host $CREATE_RESULT -ForegroundColor Red
}

Write-Host ""
