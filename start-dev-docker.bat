@echo off
echo ===============================================
echo EBL Development Environment - Safe Starter
echo ===============================================
echo.

echo [1/4] Stopping any existing containers...
docker-compose -f docker-compose.dev.yml down 2>nul
echo.

echo [2/4] Checking for port conflicts...
netstat -ano | findstr ":5173 :8000" >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Ports 5173 or 8000 may be in use by non-Docker processes
    echo Attempting to continue anyway...
)
echo.

echo [3/4] Starting Docker containers...
docker-compose -f docker-compose.dev.yml up -d
echo.

echo [4/4] Waiting for services to be ready...
timeout /t 5 /nobreak >nul
echo.

echo ===============================================
echo Services Status:
echo ===============================================
docker-compose -f docker-compose.dev.yml ps
echo.

echo ===============================================
echo Access URLs:
echo ===============================================
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo ===============================================
echo.

echo Press any key to view logs (Ctrl+C to exit logs)...
pause >nul

docker-compose -f docker-compose.dev.yml logs -f
