@echo off
echo ===============================================
echo EBL Development Environment - Complete Cleanup
echo ===============================================
echo.

echo [1/3] Stopping Docker containers...
docker-compose -f docker-compose.dev.yml down -v
echo.

echo [2/3] Killing any stray Node processes on ports 5173/8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do (
    echo Killing process %%a on port 5173
    taskkill /F /PID %%a 2>nul
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do (
    echo Killing process %%a on port 8000  
    taskkill /F /PID %%a 2>nul
)
echo.

echo [3/3] Verifying ports are clear...
netstat -ano | findstr ":5173 :8000"
if %errorlevel% equ 0 (
    echo WARNING: Some processes still using ports!
) else (
    echo SUCCESS: All ports cleared!
)
echo.

echo ===============================================
echo Cleanup complete! Run start-dev-safe.bat to restart
echo ===============================================
pause
