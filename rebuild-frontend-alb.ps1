# Rebuild Frontend for ALB Architecture
$AWS_REGION = "us-east-1"
$AWS_ACCOUNT = "498251986918"
$ECR_REPO = "$AWS_ACCOUNT.dkr.ecr.$AWS_REGION.amazonaws.com/ebl-frontend"
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"

Write-Host "=== Rebuilding Frontend for ALB ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Login to ECR
Write-Host "[1/5] Logging into ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO
Write-Host "✓ Logged in" -ForegroundColor Green

# Step 2: Build new image
Write-Host "[2/5] Building frontend image (ALB architecture)..." -ForegroundColor Yellow
docker build -f Dockerfile.frontend.alb -t ebl-frontend:latest -t ebl-frontend:$TIMESTAMP .

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Built successfully" -ForegroundColor Green

# Step 3: Tag for ECR
Write-Host "[3/5] Tagging for ECR..." -ForegroundColor Yellow
docker tag ebl-frontend:latest "${ECR_REPO}:latest"
docker tag ebl-frontend:$TIMESTAMP "${ECR_REPO}:$TIMESTAMP"
Write-Host "✓ Tagged" -ForegroundColor Green

# Step 4: Push to ECR
Write-Host "[4/5] Pushing to ECR..." -ForegroundColor Yellow
docker push "${ECR_REPO}:latest"
docker push "${ECR_REPO}:$TIMESTAMP"

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Pushed successfully" -ForegroundColor Green

# Step 5: Force new deployment
Write-Host "[5/5] Forcing new deployment..." -ForegroundColor Yellow
aws ecs update-service `
    --cluster ebl-cluster `
    --service ebl-frontend-service `
    --force-new-deployment `
    --region $AWS_REGION >$null

Write-Host "✓ Deployment triggered" -ForegroundColor Green

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Frontend Rebuilt!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Image: $ECR_REPO:latest" -ForegroundColor White
Write-Host "Tag:   $TIMESTAMP" -ForegroundColor White
Write-Host ""
Write-Host "Wait 2-3 minutes for new task to start, then:" -ForegroundColor Yellow
Write-Host "  .\check-alb-status.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Test your ALB:" -ForegroundColor Yellow
Write-Host "  curl http://ebl-alb-2035700466.us-east-1.elb.amazonaws.com/" -ForegroundColor White
Write-Host "  curl http://ebl-alb-2035700466.us-east-1.elb.amazonaws.com/health" -ForegroundColor White
Write-Host ""
