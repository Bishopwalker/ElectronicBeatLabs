# Check Current ALB and ECS Configuration
$AWS_REGION = "us-east-1"

Write-Host "=== Checking Current EBL Infrastructure ===" -ForegroundColor Cyan
Write-Host ""

# Check if ALB exists
Write-Host "[1/5] Checking for Application Load Balancer..." -ForegroundColor Yellow
$ALB_INFO = aws elbv2 describe-load-balancers --names ebl-alb --region $AWS_REGION 2>$null | ConvertFrom-Json

if ($ALB_INFO.LoadBalancers) {
    $ALB = $ALB_INFO.LoadBalancers[0]
    Write-Host "✓ ALB Found!" -ForegroundColor Green
    Write-Host "  DNS: $($ALB.DNSName)" -ForegroundColor White
    Write-Host "  ARN: $($ALB.LoadBalancerArn)" -ForegroundColor Gray
    $ALB_ARN = $ALB.LoadBalancerArn
    $ALB_DNS = $ALB.DNSName
} else {
    Write-Host "✗ No ALB named 'ebl-alb' found" -ForegroundColor Red
    Write-Host "  You need to create the ALB first!" -ForegroundColor Yellow
    $ALB_ARN = $null
}

Write-Host ""

# Check Target Groups
Write-Host "[2/5] Checking Target Groups..." -ForegroundColor Yellow
$FRONTEND_TG_INFO = aws elbv2 describe-target-groups --names ebl-frontend-tg --region $AWS_REGION 2>$null | ConvertFrom-Json
$BACKEND_TG_INFO = aws elbv2 describe-target-groups --names ebl-backend-tg --region $AWS_REGION 2>$null | ConvertFrom-Json

if ($FRONTEND_TG_INFO.TargetGroups) {
    Write-Host "✓ Frontend Target Group exists" -ForegroundColor Green
    $FRONTEND_TG_ARN = $FRONTEND_TG_INFO.TargetGroups[0].TargetGroupArn
    
    # Check health
    $FRONTEND_HEALTH = aws elbv2 describe-target-health --target-group-arn $FRONTEND_TG_ARN --region $AWS_REGION | ConvertFrom-Json
    $HEALTHY_COUNT = ($FRONTEND_HEALTH.TargetHealthDescriptions | Where-Object { $_.TargetHealth.State -eq "healthy" }).Count
    $TOTAL_COUNT = $FRONTEND_HEALTH.TargetHealthDescriptions.Count
    Write-Host "  Healthy targets: $HEALTHY_COUNT / $TOTAL_COUNT" -ForegroundColor White
} else {
    Write-Host "✗ Frontend Target Group missing" -ForegroundColor Red
}

if ($BACKEND_TG_INFO.TargetGroups) {
    Write-Host "✓ Backend Target Group exists" -ForegroundColor Green
    $BACKEND_TG_ARN = $BACKEND_TG_INFO.TargetGroups[0].TargetGroupArn
    
    # Check health
    $BACKEND_HEALTH = aws elbv2 describe-target-health --target-group-arn $BACKEND_TG_ARN --region $AWS_REGION | ConvertFrom-Json
    $HEALTHY_COUNT = ($BACKEND_HEALTH.TargetHealthDescriptions | Where-Object { $_.TargetHealth.State -eq "healthy" }).Count
    $TOTAL_COUNT = $BACKEND_HEALTH.TargetHealthDescriptions.Count
    Write-Host "  Healthy targets: $HEALTHY_COUNT / $TOTAL_COUNT" -ForegroundColor White
} else {
    Write-Host "✗ Backend Target Group missing" -ForegroundColor Red
}

Write-Host ""

# Check ECS Services
Write-Host "[3/5] Checking ECS Services..." -ForegroundColor Yellow
$FRONTEND_SERVICE = aws ecs describe-services --cluster ebl-cluster --services ebl-frontend-service --region $AWS_REGION 2>$null | ConvertFrom-Json
$BACKEND_SERVICE = aws ecs describe-services --cluster ebl-cluster --services ebl-backend-service --region $AWS_REGION 2>$null | ConvertFrom-Json

if ($FRONTEND_SERVICE.services -and $FRONTEND_SERVICE.services[0].status -ne "INACTIVE") {
    $FS = $FRONTEND_SERVICE.services[0]
    Write-Host "✓ Frontend Service: $($FS.runningCount)/$($FS.desiredCount) running" -ForegroundColor Green
    if ($FS.loadBalancers.Count -eq 0) {
        Write-Host "  ⚠ WARNING: Service NOT connected to ALB!" -ForegroundColor Red
    } else {
        Write-Host "  Connected to Target Group" -ForegroundColor White
    }
} else {
    Write-Host "✗ Frontend Service not found or inactive" -ForegroundColor Red
}

if ($BACKEND_SERVICE.services -and $BACKEND_SERVICE.services[0].status -ne "INACTIVE") {
    $BS = $BACKEND_SERVICE.services[0]
    Write-Host "✓ Backend Service: $($BS.runningCount)/$($BS.desiredCount) running" -ForegroundColor Green
    if ($BS.loadBalancers.Count -eq 0) {
        Write-Host "  ⚠ WARNING: Service NOT connected to ALB!" -ForegroundColor Red
    } else {
        Write-Host "  Connected to Target Group" -ForegroundColor White
    }
} else {
    Write-Host "✗ Backend Service not found or inactive" -ForegroundColor Red
}

Write-Host ""

# Check Listeners
if ($ALB_ARN) {
    Write-Host "[4/5] Checking Listener Rules..." -ForegroundColor Yellow
    $LISTENERS = aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --region $AWS_REGION | ConvertFrom-Json
    
    if ($LISTENERS.Listeners) {
        foreach ($LISTENER in $LISTENERS.Listeners) {
            Write-Host "✓ Listener on port $($LISTENER.Port)" -ForegroundColor Green
            
            # Get rules for this listener
            $RULES = aws elbv2 describe-rules --listener-arn $LISTENER.ListenerArn --region $AWS_REGION | ConvertFrom-Json
            Write-Host "  Rules configured: $($RULES.Rules.Count)" -ForegroundColor White
            
            foreach ($RULE in $RULES.Rules | Where-Object { $_.Priority -ne "default" }) {
                $CONDITION = $RULE.Conditions | Where-Object { $_.Field -eq "path-pattern" }
                if ($CONDITION) {
                    Write-Host "    - Path: $($CONDITION.Values -join ', ') → Priority $($RULE.Priority)" -ForegroundColor Gray
                }
            }
        }
    } else {
        Write-Host "✗ No listeners configured!" -ForegroundColor Red
    }
} else {
    Write-Host "[4/5] Skipping listener check (no ALB)" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "[5/5] Summary & Recommendations" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan

if (-not $ALB_ARN) {
    Write-Host "❌ CRITICAL: No ALB found! Run: .\fix-routing-alb.ps1" -ForegroundColor Red
} elseif ($FRONTEND_SERVICE.services[0].loadBalancers.Count -eq 0 -or $BACKEND_SERVICE.services[0].loadBalancers.Count -eq 0) {
    Write-Host "❌ CRITICAL: Services not connected to ALB!" -ForegroundColor Red
    Write-Host "   Solution: Delete and recreate services with ALB integration" -ForegroundColor Yellow
    Write-Host "   Run: .\fix-routing-alb.ps1" -ForegroundColor Yellow
} else {
    Write-Host "✓ Infrastructure looks good!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your ALB DNS: $ALB_DNS" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Test it:" -ForegroundColor White
    Write-Host "  curl http://$ALB_DNS/" -ForegroundColor Gray
    Write-Host "  curl http://$ALB_DNS/health" -ForegroundColor Gray
}

Write-Host ""
