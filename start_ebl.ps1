# EBL Quick Start Script - Fix backend connection and audio issues
# Run this from your project directory: C:\Users\bisho\IdeaProjects\ebl

Write-Host "🚀 Starting EBL with fixed configuration..." -ForegroundColor Green
Write-Host "==========================================="

# Check if we're in the right directory
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ Error: docker-compose.yml not found!" -ForegroundColor Red
    Write-Host "Please run this script from the EBL project root directory"
    exit 1
}

# Stop any existing containers
Write-Host ""
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose down

# Remove any problematic containers
Write-Host ""
Write-Host "🧹 Cleaning up old containers..." -ForegroundColor Yellow
docker container prune -f

# Build backend with fresh configuration
Write-Host ""
Write-Host "🔨 Building backend with 48kHz sample rate..." -ForegroundColor Yellow
docker-compose build backend

# Start services
Write-Host ""
Write-Host "🎯 Starting services..." -ForegroundColor Yellow
docker-compose up -d

# Wait for backend to be healthy
Write-Host ""
Write-Host "⏳ Waiting for backend to be healthy..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$healthy = $false

while ($attempt -lt $maxAttempts) {
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend is healthy!" -ForegroundColor Green
            $healthy = $true
            break
        }
    } catch {
        Write-Host "." -NoNewline
    }
    Start-Sleep -Seconds 2
}

if (-not $healthy) {
    Write-Host ""
    Write-Host "⚠️ Backend didn't become healthy in time. Check logs." -ForegroundColor Yellow
}

Write-Host ""

# Show container status
Write-Host ""
Write-Host "📊 Container Status:" -ForegroundColor Cyan
docker-compose ps

# Show recent logs
Write-Host ""
Write-Host "📜 Recent Backend Logs:" -ForegroundColor Cyan
docker-compose logs --tail=10 backend | Select-String -Pattern "WebSocket|audio|Audio|connected|ERROR"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✨ EBL should now be running!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://localhost (or http://localhost:5173 for dev)"
Write-Host "🔌 Backend API: http://localhost:8000"
Write-Host "📡 WebSocket: ws://localhost:8000/ws/audio/{session_id}"
Write-Host ""
Write-Host "🎧 To test:" -ForegroundColor Yellow
Write-Host "  1. Open http://localhost or http://localhost:5173"
Write-Host "  2. Click on a pattern to start"
Write-Host "  3. Check browser console for WebSocket connection status"
Write-Host ""
Write-Host "🔍 If still having issues, check:" -ForegroundColor Yellow
Write-Host "  - docker-compose logs -f backend"
Write-Host "  - Browser console (F12) for errors"
Write-Host "============================================" -ForegroundColor Cyan
