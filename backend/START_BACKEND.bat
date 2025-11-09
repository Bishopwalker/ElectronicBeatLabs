@echo off
echo ================================
echo Starting EBL Backend Server
echo ================================
echo.

cd /d "%~dp0"

echo Activating venv...
call .venv\Scripts\activate.bat

echo.
echo Starting FastAPI server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn ebl.main:app --reload --host 0.0.0.0 --port 8000

pause
