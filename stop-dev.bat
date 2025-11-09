@echo off
echo 🛑 Stopping EBL Development Environment
echo.

REM Kill frontend servers on ports 5174-5180
echo 🧹 Stopping frontend servers (ports 5174-5180)...
for /L %%p in (5174,1,5180) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING 2^>nul') do (
        echo Killing process on port %%p (PID %%a)
        taskkill /F /PID %%a >nul 2>&1
    )
)

REM Also check port 5173 in case it's being used
echo 🧹 Stopping frontend server (port 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173 ^| findstr LISTENING 2^>nul') do (
    echo Killing process on port 5173 (PID %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill backend servers on port 8000
echo 🧹 Stopping backend server (port 8000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING 2^>nul') do (
    echo Killing process on port 8000 (PID %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill any other common backend ports
echo 🧹 Checking additional backend ports (8001-8005)...
for /L %%p in (8001,1,8005) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p ^| findstr LISTENING 2^>nul') do (
        echo Killing process on port %%p (PID %%a)
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo ✅ All development servers stopped\!
pause