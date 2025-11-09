@echo off
echo ================================
echo EBL Backend venv Repair
echo ================================
echo.
echo Running PowerShell fix script...
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0fix_venv.ps1"

echo.
echo Script completed!
pause
