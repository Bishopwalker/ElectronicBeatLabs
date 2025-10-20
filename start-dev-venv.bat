@echo off
echo 🚀 Starting EBL Development Environment (with venv)
echo.

REM Kill any existing servers silently
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1

echo ✅ Starting servers with virtual environment...
echo.

REM Start backend using venv's uvicorn
start "EBL Backend" cmd /k "cd /d %~dp0 && .\.venv\Scripts\activate && cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
start "EBL Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo 🎉 Servers starting!
echo.
echo 📖 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:8000/docs
echo.
echo Servers will be ready in ~5 seconds
echo Auto-opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173
