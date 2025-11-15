# Attach Frontend Target Group to ALB Listeners
$AWS_REGION = "us-east-1"

Write-Host "=== Fixing ALB Listener Configuration ===" -ForegroundColor Cyan
Write-Host ""

# Get ALB and Target Group info
Write-Host "[1/4] Getting ALB and Target Group info..." -ForegroundColor Yellow
$ALB = aws elbv2 describe-load-balancers --names ebl-alb --region $AWS_REGION | ConvertFrom-Json
$ALB_ARN = $ALB.LoadBalancers[0].LoadBalancerArn

$FRONTEND_TG = aws elbv2 describe-target-groups --names ebl-frontend-tg --region $AWS_REGION | ConvertFrom-Json
$FRONTEND_TG_ARN = $FRONTEND_TG.TargetGroups[0].TargetGroupArn

$BACKEND_TG = aws elbv2 describe-target-groups --names ebl-backend-tg --region $AWS_REGION | ConvertFrom-Json
$BACKEND_TG_ARN = $BACKEND_TG.TargetGroups[0].TargetGroupArn

Write-Host "✓ ALB ARN: $ALB_ARN" -ForegroundColor Green
Write-Host "✓ Frontend TG: $FRONTEND_TG_ARN" -ForegroundColor Green
Write-Host "✓ Backend TG: $BACKEND_TG_ARN" -ForegroundColor Green

# Get current listeners
Write-Host ""
Write-Host "[2/4] Checking current listeners..." -ForegroundColor Yellow
$LISTENERS = aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --region $AWS_REGION | ConvertFrom-Json

foreach ($LISTENER in $LISTENERS.Listeners) {
    Write-Host "Found listener on port $($LISTENER.Port)" -ForegroundColor White
    
    # Update default action to point to frontend
    Write-Host "  Updating default action to frontend target group..." -ForegroundColor Yellow
    
    aws elbv2 modify-listener `
        --listener-arn $LISTENER.ListenerArn `
        --default-actions "Type=forward,TargetGroupArn=$FRONTEND_TG_ARN" `
        --region $AWS_REGION >$null 2>&1
    
    Write-Host "  ✓ Updated" -ForegroundColor Green
}

# Recreate rules for backend paths (might have been overwritten)
Write-Host ""
Write-Host "[3/4] Ensuring backend routing rules exist..." -ForegroundColor Yellow

# Get the HTTP listener (port 80)
$HTTP_LISTENER = $LISTENERS.Listeners | Where-Object { $_.Port -eq 80 }
$HTTPS_LISTENER = $LISTENERS.Listeners | Where-Object { $_.Port -eq 443 }

if ($HTTP_LISTENER) {
    Write-Host "Configuring HTTP listener rules..." -ForegroundColor White
    $HTTP_ARN = $HTTP_LISTENER.ListenerArn
    
    # Delete old rules first (keep default)
    $RULES = aws elbv2 describe-rules --listener-arn $HTTP_ARN --region $AWS_REGION | ConvertFrom-Json
    foreach ($RULE in $RULES.Rules | Where-Object { $_.Priority -ne "default" }) {
        aws elbv2 delete-rule --rule-arn $RULE.RuleArn --region $AWS_REGION >$null 2>&1
    }
    
    # Create backend routing rules
    aws elbv2 create-rule `
        --listener-arn $HTTP_ARN `
        --conditions "Field=path-pattern,Values=/api/*" `
        --priority 10 `
        --actions "Type=forward,TargetGroupArn=$BACKEND_TG_ARN" `
        --region $AWS_REGION >$null 2>&1
    
    aws elbv2 create-rule `
        --listener-arn $HTTP_ARN `
        --conditions "Field=path-pattern,Values=/ws/*" `
        --priority 20 `
        --actions "Type=forward,TargetGroupArn=$BACKEND_TG_ARN" `
        --region $AWS_REGION >$null 2>&1
    
    aws elbv2 create-rule `
        --listener-arn $HTTP_ARN `
        --conditions "Field=path-pattern,Values=/health" `
        --priority 30 `
        --actions "Type=forward,TargetGroupArn=$BACKEND_TG_ARN" `
        --region $AWS_REGION >$null 2>&1
    
    aws elbv2 create-rule `
        --listener-arn $HTTP_ARN `
        --conditions "Field=path-pattern,Values=/docs*" `
        --priority 40 `
        --actions "Type=forward,TargetGroupArn=$BACKEND_TG_ARN" `
        --region $AWS_REGION >$null 2>&1
    
    Write-Host "  ✓ HTTP rules configured" -ForegroundColor Green
}

if ($HTTPS_LISTENER) {
    Write-Host "Configuring HTTPS listener rules..." -ForegroundColor White
    $HTTPS_ARN = $HTTPS_LISTENER.ListenerArn
    
    # Delete old rules first (keep default)
    $RULES = aws elbv2 describe-rules --listener-arn $HTTPS_ARN --region $AWS_REGION | ConvertFrom-Json
    foreach ($RULE in $RULES.Rules | Where-Object { $_.Priority -ne "default" }) {
        aws elbv2 delete-rule --rule-arn $RULE.RuleArn --region $AWS_REGION >$null 2>&1
    }
    
    # Create backend routing rules
    aws elbv2 create-rule `
        --listener-arn $HTTPS_ARN `
        --conditions "Field=path-pattern,Values=/api/*" `
        --priority 10 `
        --actions "Type=forward,TargetGroupArn=$BACKEND_TG_ARN" `
        --region $AWS_REGION >$null 2>&1
    
    aws elbv2 create-rule `
        --listener-arn $HTTPS_ARN `
        --conditions "Field=path-pattern,Values=/ws/*" `
        --priority 20 `
        --actions "Type=forward,TargetGroupArn=$BACKEND_TG_ARN" `
        --region $AWS_REGION >$null 2>&1
    
    aws elbv2 create-rule `
        --listener-arn $HTTPS_ARN `
        --conditions "Field=path-pattern,Values=/health" `
        --priority 30 `
        --actions "Type=forward,TargetGroupArn=$BACKEND_TG_ARN" `
        --region $AWS_REGION >$null 2>&1
    
    aws elbv2 create-rule `
        --listener-arn $HTTPS_ARN `
        --conditions "Field=path-pattern,Values=/docs*" `
        --priority 40 `
        --actions "Type=forward,TargetGroupArn=$BACKEND_TG_ARN" `
        --region $AWS_REGION >$null 2>&1
    
    Write-Host "  ✓ HTTPS rules configured" -ForegroundColor Green
}

Write-Host ""
Write-Host "[4/4] Listener configuration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ ALB Configuration Fixed!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Routing now configured as:" -ForegroundColor White
Write-Host "  Default (/) → Frontend Target Group (React app)" -ForegroundColor Cyan
Write-Host "  /api/*      → Backend Target Group (FastAPI)" -ForegroundColor Yellow
Write-Host "  /ws/*       → Backend Target Group (WebSocket)" -ForegroundColor Yellow
Write-Host "  /health     → Backend Target Group (Health Check)" -ForegroundColor Yellow
Write-Host "  /docs*      → Backend Target Group (API Docs)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Now run: .\fix-frontend-now.ps1" -ForegroundColor Green
Write-Host ""
