@echo off
REM ================================================
REM EBL - ONE-CLICK AWS DEPLOYMENT
REM ================================================
echo.
echo ========================================
echo  EBL - AWS DEPLOYMENT STARTING
echo ========================================
echo.

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] AWS CLI not installed!
    echo.
    echo Download from: https://aws.amazon.com/cli/
    echo After installing, run: aws configure
    echo.
    pause
    exit /b 1
)

REM Check if AWS credentials are configured
aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo [ERROR] AWS credentials not configured!
    echo.
    echo Run this command first: aws configure
    echo You'll need your AWS Access Key ID and Secret Key
    echo.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo [OK] AWS CLI is installed
echo [OK] AWS credentials are configured
echo.
echo Starting deployment...
echo This will take about 20-30 minutes.
echo.
pause

REM Run PowerShell deployment script
powershell -ExecutionPolicy Bypass -File "%~dp0aws-deploy-quick.ps1"

echo.
echo ========================================
echo  DEPLOYMENT COMPLETE
echo ========================================
echo.
echo Check aws-deployment-info.txt for your URLs
echo.
pause
