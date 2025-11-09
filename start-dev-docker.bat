@echo off
echo ===============================================
echo EBL Development Environment - Safe Starter
echo ===============================================
echo.

echo [1/4] Stopping any existing containers...
docker-compose -f docker-compose.dev.yml down 2>nul
echo.

echo [2/4] Cleaning up non-Docker processes on ports...
REM Kill all frontend servers on ports 5173-5180
for /L %%p in (5173,1,5180) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING 2^>nul') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)

REM Kill all backend servers on ports 8000-8005
for /L %%p in (8000,1,8005) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING 2^>nul') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)
echo Cleanup complete!
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