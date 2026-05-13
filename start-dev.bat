@echo off
echo 🚀 Starting EBL Development Environment (Optimized)
echo.

REM Kill any existing servers silently (port 8080 only — 8000-8002 belong to USPS ICDA / Docker)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :24678 ^| findstr LISTENING 2^>nul') do taskkill /F /PID %%a >nul 2>&1

echo ✅ Starting servers in parallel (Python 3.11 venv)...
echo.

REM Ensure backend\.venv (Python 3.11) exists
if exist "backend\.venv\Scripts\activate" goto venv_ready
echo Creating Python 3.11 virtual environment (backend\.venv)...
where py >nul 2>&1
if %errorlevel%==0 goto use_py
where python3.11 >nul 2>&1
if %errorlevel%==0 goto use_python311
python -m venv backend\.venv
goto venv_ready
:use_py
py -3.11 -m venv backend\.venv
goto venv_ready
:use_python311
python3.11 -m venv backend\.venv
:venv_ready

REM Install backend requirements into venv if uvicorn not available
call .\backend\.venv\Scripts\activate
where uvicorn >nul 2>&1
if %errorlevel% neq 0 (
  echo Installing backend dependencies into backend\.venv...
  pip install -r backend\requirements.txt
  if exist backend\rag\requirements.txt pip install -r backend\rag\requirements.txt
)
deactivate >nul 2>&1

REM Start backend with optimized reload settings under venv
start "EBL Backend" cmd /k "cd /d %~dp0 && call .\backend\.venv\Scripts\activate && cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8080 --reload-exclude '*.pyc' --reload-exclude '__pycache__/*' --reload-exclude '*.log'"

REM Start frontend immediately (parallel start)
start "EBL Frontend" cmd /k "cd /d %~dp0 && npm run dev"

REM Minimal wait for health check
timeout /t 2 /nobreak >nul

echo 🎉 Servers starting!
echo.
echo 📖 Frontend: http://localhost:5173
echo 🔧 Backend:  http://localhost:8080/docs
echo.
echo Servers will be ready in ~5 seconds
echo Auto-opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173
