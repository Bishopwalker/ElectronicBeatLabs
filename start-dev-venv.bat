@echo off
echo 🚀 Starting EBL Development Environment (with venv)
echo.

REM Kill any existing servers silently
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1

echo ✅ Starting servers with Python 3.11 virtual environment...
echo.

REM Ensure .venv311 (Python 3.11) exists
if not exist ".venv311\Scripts\activate" (
  echo Creating Python 3.11 virtual environment (.venv311)...
  where py >nul 2>&1 && ( py -3.11 -m venv .venv311 ) || (
    where python3.11 >nul 2>&1 && ( python3.11 -m venv .venv311 ) || ( python -m venv .venv311 )
  )
)

REM Install backend requirements into venv if uvicorn not available
call .\.venv311\Scripts\activate
where uvicorn >nul 2>&1
if %errorlevel% neq 0 (
  echo Installing backend dependencies into .venv311...
  pip install -r backend\requirements.txt
  if exist backend\rag\requirements.txt pip install -r backend\rag\requirements.txt
)
deactivate >nul 2>&1

REM Start backend using venv's uvicorn
start "EBL Backend" cmd /k "cd /d %~dp0 && call .\.venv311\Scripts\activate && cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

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
