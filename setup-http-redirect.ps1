# Setup HTTP to HTTPS Redirect
$AWS_REGION = "us-east-1"
$ALB_ARN = "arn:aws:elasticloadbalancing:us-east-1:498251986918:loadbalancer/app/ebl-alb/ed3813021d2ad311"

Write-Host "=== Setting Up HTTP → HTTPS Redirect ===" -ForegroundColor Cyan
Write-Host ""

# Get HTTP listener (port 80)
Write-Host "Getting HTTP listener..." -ForegroundColor Yellow
$LISTENERS = aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --region $AWS_REGION | ConvertFrom-Json
$HTTP_LISTENER = $LISTENERS.Listeners | Where-Object { $_.Port -eq 80 }

if (-not $HTTP_LISTENER) {
    Write-Host "✗ No HTTP listener found!" -ForegroundColor Red
    exit 1
}

$LISTENER_ARN = $HTTP_LISTENER.ListenerArn

# Modify default action to redirect to HTTPS
Write-Host "Configuring redirect..." -ForegroundColor Yellow
aws elbv2 modify-listener `
    --listener-arn $LISTENER_ARN `
    --default-actions Type=redirect,RedirectConfig="{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}" `
    --region $AWS_REGION >$null

Write-Host "✓ HTTP → HTTPS redirect configured!" -ForegroundColor Green
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Redirect Active!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All HTTP traffic will now redirect to HTTPS:" -ForegroundColor White
Write-Host "  http://bishops-ebl.online/ → https://bishops-ebl.online/" -ForegroundColor Green
Write-Host ""
