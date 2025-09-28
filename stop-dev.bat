@echo off
echo Stopping EBL development servers...

echo Checking for processes on port 5173 (frontend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    echo Killing PID %%a
    taskkill -F -PID %%a 2>nul
)

echo Checking for processes on port 8000 (backend)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    echo Killing PID %%a
    taskkill -F -PID %%a 2>nul
)

echo Checking for Node.js processes...
taskkill -F -IM node.exe 2>nul

echo Checking for Python processes...
taskkill -F -IM python.exe 2>nul

echo All development servers stopped.
pause