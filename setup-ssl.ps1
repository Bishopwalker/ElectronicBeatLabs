# Setup SSL Certificate for bishops-ebl.online
$AWS_REGION = "us-east-1"
$DOMAIN = "bishops-ebl.online"
$ALB_ARN = "arn:aws:elasticloadbalancing:us-east-1:498251986918:loadbalancer/app/ebl-alb/ed3813021d2ad311"

Write-Host "=== Setting Up SSL Certificate ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Request Certificate
Write-Host "[1/4] Requesting SSL certificate for $DOMAIN..." -ForegroundColor Yellow
$CERT_ARN = aws acm request-certificate `
    --domain-name $DOMAIN `
    --subject-alternative-names "www.$DOMAIN" `
    --validation-method DNS `
    --region $AWS_REGION `
    --query "CertificateArn" `
    --output text

Write-Host "✓ Certificate requested: $CERT_ARN" -ForegroundColor Green
Write-Host ""

# Step 2: Get validation records
Write-Host "[2/4] Getting DNS validation records..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$CERT_INFO = aws acm describe-certificate --certificate-arn $CERT_ARN --region $AWS_REGION | ConvertFrom-Json
$VALIDATION = $CERT_INFO.Certificate.DomainValidationOptions[0].ResourceRecord

Write-Host "================================" -ForegroundColor Cyan
Write-Host "📋 ADD THIS RECORD TO ROUTE 53:" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Record Name:  $($VALIDATION.Name)" -ForegroundColor White
Write-Host "Record Type:  $($VALIDATION.Type)" -ForegroundColor White
Write-Host "Record Value: $($VALIDATION.Value)" -ForegroundColor White
Write-Host ""
Write-Host "Go to Route 53 → bishops-ebl.online → Create Record" -ForegroundColor Yellow
Write-Host "Add the CNAME record above, then come back here." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press ENTER after you've added the DNS record"

# Step 3: Wait for validation
Write-Host "[3/4] Waiting for certificate validation..." -ForegroundColor Yellow
Write-Host "This can take 5-30 minutes..." -ForegroundColor White

$VALIDATED = $false
$ATTEMPTS = 0
$MAX_ATTEMPTS = 60

while (-not $VALIDATED -and $ATTEMPTS -lt $MAX_ATTEMPTS) {
    Start-Sleep -Seconds 30
    $ATTEMPTS++
    
    $CERT_STATUS = aws acm describe-certificate --certificate-arn $CERT_ARN --region $AWS_REGION | ConvertFrom-Json
    $STATUS = $CERT_STATUS.Certificate.Status
    
    Write-Host "  Check $ATTEMPTS/$MAX_ATTEMPTS - Status: $STATUS" -ForegroundColor Gray
    
    if ($STATUS -eq "ISSUED") {
        $VALIDATED = $true
    }
}

if ($VALIDATED) {
    Write-Host "✓ Certificate validated and issued!" -ForegroundColor Green
} else {
    Write-Host "✗ Validation timed out. Check Route 53 records and run script again." -ForegroundColor Red
    exit 1
}

# Step 4: Attach certificate to ALB HTTPS listener
Write-Host "[4/4] Attaching certificate to ALB..." -ForegroundColor Yellow

# Get HTTPS listener (port 443)
$LISTENERS = aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --region $AWS_REGION | ConvertFrom-Json
$HTTPS_LISTENER = $LISTENERS.Listeners | Where-Object { $_.Port -eq 443 }

if ($HTTPS_LISTENER) {
    $LISTENER_ARN = $HTTPS_LISTENER.ListenerArn
    
    # Attach certificate
    aws elbv2 modify-listener `
        --listener-arn $LISTENER_ARN `
        --certificates "CertificateArn=$CERT_ARN" `
        --region $AWS_REGION >$null
    
    Write-Host "✓ Certificate attached to HTTPS listener" -ForegroundColor Green
} else {
    Write-Host "✗ No HTTPS listener found on port 443!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ SSL Certificate Configured!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your site is now available at:" -ForegroundColor White
Write-Host "  https://bishops-ebl.online/" -ForegroundColor Green
Write-Host "  https://www.bishops-ebl.online/" -ForegroundColor Green
Write-Host ""
Write-Host "HTTP will still work, but you should redirect to HTTPS:" -ForegroundColor Yellow
Write-Host "  Run: .\setup-http-redirect.ps1" -ForegroundColor White
Write-Host ""
