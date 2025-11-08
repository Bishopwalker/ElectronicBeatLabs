@echo off
setlocal EnableExtensions EnableDelayedExpansion
echo Stopping EBL Development Environment
echo.

rem Target ports for dev services and similar alternates
rem - Vite: 5173 and nearby when auto-incrementing
rem - Vite preview: 4173
rem - Backend (Uvicorn): 8000 and nearby when auto-incrementing
rem - Common frontend alts: 3000,3001
set PORTS=5170 5171 5172 5173 5174 5175 5176 5177 5178 5179 5180 4173 8000 8001 8002 8003 3000 3001

rem Prefer PowerShell script for single source of truth; also run fallback sweep
set "PS1_PATH=%~dp0stop-dev.ps1"
if exist "%PS1_PATH%" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1_PATH%" -Ports 5170,5171,5172,5173,5174,5175,5176,5177,5178,5179,5180,4173,8000,8001,8002,8003,3000,3001 -Aggressive
)

for %%P in (%PORTS%) do (
  echo Stopping listeners on port %%P...

  rem IPv4 LISTENING (exact port match: ":PORT ")
  for /f "tokens=5" %%A in ('netstat -ano -p tcp ^| findstr /R /C:":%%P " ^| findstr LISTENING') do (
    echo Killing PID %%A (IPv4)
    taskkill /F /T /PID %%A >nul 2>&1
  )

  rem IPv6 LISTENING (exact port match: "]:PORT ")
  for /f "tokens=5" %%A in ('netstat -ano -p tcp ^| findstr /R /C:"]:%%P " ^| findstr LISTENING') do (
    echo Killing PID %%A (IPv6)
    taskkill /F /T /PID %%A >nul 2>&1
  )
)
echo.
echo Attempted to stop all dev servers.
endlocal
