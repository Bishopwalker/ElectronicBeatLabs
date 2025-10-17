# Quick Docker Compose Test
Write-Host "🐳 Starting Docker Compose..." -ForegroundColor Cyan

# Stop and remove old containers
Write-Host "Cleaning up old containers..." -ForegroundColor Yellow
docker-compose down -v

# Build and start fresh
Write-Host "Building and starting containers..." -ForegroundColor Yellow
docker-compose up --build -d

# Wait for services
Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check status
Write-Host ""
Write-Host "Container Status:" -ForegroundColor Green
docker-compose ps

Write-Host ""
Write-Host "✅ Services running at:" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor Blue
Write-Host "  Frontend: http://localhost:80" -ForegroundColor Blue
Write-Host "  Health:   http://localhost:8000/health" -ForegroundColor Blue
Write-Host ""
Write-Host "View logs: docker-compose logs -f" -ForegroundColor Cyan
