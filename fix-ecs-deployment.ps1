# ECS Deployment Fix Script
# Fixes CloudWatch logs and gets services running

$ErrorActionPreference = "Continue"
$REGION = "us-east-1"
$CLUSTER = "ebl-cluster"

Write-Host "🔧 EBL ECS Deployment Fixer" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create CloudWatch Log Groups
Write-Host "[1/5] Creating CloudWatch Log Groups..." -ForegroundColor Yellow
aws logs create-log-group --log-group-name /ecs/ebl-frontend --region $REGION 2>$null
aws logs create-log-group --log-group-name /ecs/ebl-backend --region $REGION 2>$null
Write-Host "✅ Log groups ready" -ForegroundColor Green

# Step 2: Check ECS Task Execution Role
Write-Host "[2/5] Verifying IAM roles..." -ForegroundColor Yellow
$ROLE_EXISTS = aws iam get-role --role-name ecsTaskExecutionRole 2>$null
if (-not $ROLE_EXISTS) {
    Write-Host "Creating ecsTaskExecutionRole..." -ForegroundColor Yellow
    aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "ecs-tasks.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }'
    aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
}
Write-Host "✅ IAM roles configured" -ForegroundColor Green

# Step 3: Force restart services
Write-Host "[3/5] Restarting ECS services..." -ForegroundColor Yellow
aws ecs update-service --cluster $CLUSTER --service ebl-frontend-service --force-new-deployment --region $REGION >$null 2>&1
aws ecs update-service --cluster $CLUSTER --service ebl-backend-service --force-new-deployment --region $REGION >$null 2>&1
Write-Host "⏳ Waiting for services to stabilize (60 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Step 4: Check service status
Write-Host "[4/5] Checking service status..." -ForegroundColor Yellow
$FRONTEND_STATUS = aws ecs describe-services `
    --cluster $CLUSTER `
    --services ebl-frontend-service `
    --region $REGION `
    --query "services[0]" `
    --output json | ConvertFrom-Json

$BACKEND_STATUS = aws ecs describe-services `
    --cluster $CLUSTER `
    --services ebl-backend-service `
    --region $REGION `
    --query "services[0]" `
    --output json | ConvertFrom-Json

Write-Host "Frontend: Running $($FRONTEND_STATUS.runningCount)/$($FRONTEND_STATUS.desiredCount)" -ForegroundColor $(if ($FRONTEND_STATUS.runningCount -eq $FRONTEND_STATUS.desiredCount) { "Green" } else { "Red" })
Write-Host "Backend:  Running $($BACKEND_STATUS.runningCount)/$($BACKEND_STATUS.desiredCount)" -ForegroundColor $(if ($BACKEND_STATUS.runningCount -eq $BACKEND_STATUS.desiredCount) { "Green" } else { "Red" })

# Step 5: Get public IPs
Write-Host "[5/5] Getting service URLs..." -ForegroundColor Yellow

# Get Frontend IP
$FRONTEND_TASK = aws ecs list-tasks --cluster $CLUSTER --service-name ebl-frontend-service --region $REGION --query "taskArns[0]" --output text 2>$null
if ($FRONTEND_TASK -and $FRONTEND_TASK -ne "None") {
    $FRONTEND_ENI = aws ecs describe-tasks --cluster $CLUSTER --tasks $FRONTEND_TASK --region $REGION --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text 2>$null
    $FRONTEND_IP = aws ec2 describe-network-interfaces --network-interface-ids $FRONTEND_ENI --region $REGION --query "NetworkInterfaces[0].Association.PublicIp" --output text 2>$null
} else {
    $FRONTEND_IP = "NOT RUNNING"
}

# Get Backend IP
$BACKEND_TASK = aws ecs list-tasks --cluster $CLUSTER --service-name ebl-backend-service --region $REGION --query "taskArns[0]" --output text 2>$null
if ($BACKEND_TASK -and $BACKEND_TASK -ne "None") {
    $BACKEND_ENI = aws ecs describe-tasks --cluster $CLUSTER --tasks $BACKEND_TASK --region $REGION --query "tasks[0].attachments[0].details[?name=='networkInterfaceId'].value" --output text 2>$null
    $BACKEND_IP = aws ec2 describe-network-interfaces --network-interface-ids $BACKEND_ENI --region $REGION --query "NetworkInterfaces[0].Association.PublicIp" --output text 2>$null
} else {
    $BACKEND_IP = "NOT RUNNING"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Deployment Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($FRONTEND_IP -ne "NOT RUNNING") {
    Write-Host "✅ Frontend: http://$FRONTEND_IP" -ForegroundColor Green
    Write-Host "   Test: curl http://${FRONTEND_IP}/" -ForegroundColor Gray
} else {
    Write-Host "❌ Frontend: NOT RUNNING" -ForegroundColor Red
    Write-Host "   Check logs: aws logs tail /ecs/ebl-frontend --follow --region $REGION" -ForegroundColor Yellow
}

if ($BACKEND_IP -ne "NOT RUNNING") {
    Write-Host "✅ Backend:  http://${BACKEND_IP}:8000" -ForegroundColor Green
    Write-Host "   Health:   http://${BACKEND_IP}:8000/health" -ForegroundColor Gray
} else {
    Write-Host "❌ Backend: NOT RUNNING" -ForegroundColor Red
    Write-Host "   Check logs: aws logs tail /ecs/ebl-backend --follow --region $REGION" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Troubleshooting Commands:" -ForegroundColor Yellow
Write-Host "View service events:" -ForegroundColor White
Write-Host "  aws ecs describe-services --cluster $CLUSTER --services ebl-frontend-service --region $REGION --query 'services[0].events[0:5]'" -ForegroundColor Gray
Write-Host ""
Write-Host "View stopped tasks:" -ForegroundColor White
Write-Host "  aws ecs describe-tasks --cluster $CLUSTER --tasks `$(aws ecs list-tasks --cluster $CLUSTER --desired-status STOPPED --region $REGION --query 'taskArns[0]' --output text) --region $REGION" -ForegroundColor Gray

# DNS Update Instructions
if ($FRONTEND_IP -ne "NOT RUNNING") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ ACTION REQUIRED: Update Your Domain!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Your frontend is running at: $FRONTEND_IP" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Update your domain's DNS A record to point to:" -ForegroundColor Cyan
    Write-Host "  $FRONTEND_IP" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This will make your domain show the React app instead of the API JSON." -ForegroundColor White
}
