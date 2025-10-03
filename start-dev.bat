@echo off
echo 🚀 Starting EBL Development Environment (Optimized)
echo.

REM Kill any existing servers silently
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :24678 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1

echo ✅ Starting servers in parallel...
echo.

REM Start backend with optimized reload settings
start "EBL Backend" cmd /k "cd /d %~dp0backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000 --reload-exclude '*.pyc' --reload-exclude '__pycache__/*' --reload-exclude '*.log'"

REM Start frontend immediately (parallel start)
start "EBL Frontend" cmd /k "cd /d %~dp0 && npm run dev"

REM Minimal wait for health check
timeout /t 2 /nobreak >nul

echo 🎉 Servers starting!
echo.
echo 📖 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:8000/docs
echo.
echo Servers will be ready in ~5 seconds
echo Auto-opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173