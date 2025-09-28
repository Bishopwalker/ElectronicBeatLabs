@echo off
echo 🚀 Starting EBL Development Environment with Hot Reload
echo.

REM Kill any existing servers
echo 🧹 Cleaning up existing servers...
netstat -ano | findstr :5173 >nul 2>&1
if %errorlevel%==0 (
    echo Killing frontend server on port 5173...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
)

netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel%==0 (
    echo Killing backend server on port 8000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ✅ Starting development servers with hot reload...

REM Start backend with hot reload in new window
start "EBL Backend" cmd /k "cd /d %~dp0backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend with hot reload in new window
start "EBL Frontend" cmd /k "cd /d %~dp0 && npm run dev"

REM Wait a moment for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo 🎉 Development environment started!
echo 📖 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:8000
echo.
echo Press any key to open in browser...
pause >nul
start http://localhost:5173