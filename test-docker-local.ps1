# Test Docker Build and Deployment Locally
Write-Host "🐳 Testing Docker Build & Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop any existing containers
Write-Host "Step 1: Cleaning up existing containers..." -ForegroundColor Yellow
docker stop ebl-backend-test 2>$null
docker rm ebl-backend-test 2>$null
docker stop ebl-frontend-test 2>$null
docker rm ebl-frontend-test 2>$null

# Step 2: Build backend
Write-Host ""
Write-Host "Step 2: Building backend image..." -ForegroundColor Yellow
docker build -f backend/Dockerfile -t ebl-backend:test backend/
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend built successfully" -ForegroundColor Green

# Step 3: Build frontend
Write-Host ""
Write-Host "Step 3: Building frontend image..." -ForegroundColor Yellow
docker build -f Dockerfile.frontend -t ebl-frontend:test .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend built successfully" -ForegroundColor Green

# Step 4: Run backend
Write-Host ""
Write-Host "Step 4: Starting backend container..." -ForegroundColor Yellow
docker run -d -p 8000:8000 --name ebl-backend-test ebl-backend:test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend start failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend started on http://localhost:8000" -ForegroundColor Green

# Step 5: Wait for backend health
Write-Host ""
Write-Host "Step 5: Waiting for backend health check..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
$healthCheck = curl -s http://localhost:8000/health 2>$null
if ($healthCheck) {
    Write-Host "✅ Backend is healthy!" -ForegroundColor Green
    Write-Host $healthCheck
} else {
    Write-Host "⚠️  Backend health check failed (may still be starting)" -ForegroundColor Yellow
}

# Step 6: Run frontend
Write-Host ""
Write-Host "Step 6: Starting frontend container..." -ForegroundColor Yellow
docker run -d -p 3000:80 --name ebl-frontend-test ebl-frontend:test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend start failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend started on http://localhost:3000" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "🎉 Docker Deployment Test Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Blue
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host "Health:   http://localhost:8000/health" -ForegroundColor Blue
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Blue
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Cyan
Write-Host "  docker logs ebl-backend-test" -ForegroundColor White
Write-Host "  docker logs ebl-frontend-test" -ForegroundColor White
Write-Host ""
Write-Host "To stop:" -ForegroundColor Cyan
Write-Host "  docker stop ebl-backend-test ebl-frontend-test" -ForegroundColor White
Write-Host ""
