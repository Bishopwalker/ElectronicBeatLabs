@echo off
echo 🛑 Stopping EBL Development Environment
echo.

REM Kill frontend servers
echo 🧹 Stopping frontend server (port 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do (
    echo Killing PID %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill backend servers
echo 🧹 Stopping backend server (port 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo Killing PID %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ✅ All development servers stopped\!
pause
