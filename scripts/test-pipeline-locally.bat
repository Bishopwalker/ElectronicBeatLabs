@echo off
setlocal enabledelayedexpansion

echo ============================================
echo Testing GitLab CI/CD configuration locally...
echo ============================================

set ERRORS=0

:: Test frontend
echo.
echo Testing frontend...
call npm ci
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Frontend dependencies installed
) else (
    echo [FAIL] Failed to install frontend dependencies
    set /a ERRORS+=1
)

call npm run test:ci
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Frontend tests passed
) else (
    echo [FAIL] Frontend tests failed
    set /a ERRORS+=1
)

call npm run lint
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Frontend linting passed
) else (
    echo [FAIL] Frontend linting failed
    set /a ERRORS+=1
)

call npm run build
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Frontend build successful
) else (
    echo [FAIL] Frontend build failed
    set /a ERRORS+=1
)

:: Test backend
echo.
echo Testing backend...
cd backend

:: Create virtual environment
python -m venv test_venv
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Python virtual environment created
) else (
    echo [FAIL] Failed to create virtual environment
    set /a ERRORS+=1
)

:: Activate virtual environment
call test_venv\Scripts\activate

:: Install without PyAudio using CI requirements
if exist "requirements-ci.txt" (
    echo Using requirements-ci.txt ^(no PyAudio^)
    pip install -r requirements-ci.txt
    if %ERRORLEVEL% EQU 0 (
        echo [PASS] Backend CI dependencies installed
    ) else (
        echo [FAIL] Failed to install backend CI dependencies
        set /a ERRORS+=1
    )
) else (
    echo Creating requirements without PyAudio...
    findstr /v pyaudio requirements.txt > requirements-test.txt
    pip install -r requirements-test.txt
    if %ERRORLEVEL% EQU 0 (
        echo [PASS] Backend dependencies installed ^(excluding PyAudio^)
    ) else (
        echo [FAIL] Failed to install backend dependencies
        set /a ERRORS+=1
    )
    del requirements-test.txt
)

:: Set up PyAudio mock
set PYTHONPATH=%PYTHONPATH%;%CD%\mocks

:: Run tests
python -m pytest
if %ERRORLEVEL% EQU 0 (
    echo [PASS] Backend tests passed
) else (
    echo [FAIL] Backend tests failed
    set /a ERRORS+=1
)

:: Cleanup
call deactivate
rmdir /s /q test_venv

cd ..

:: Summary
echo.
echo ============================================
if !ERRORS! EQU 0 (
    echo [SUCCESS] Local pipeline test complete - ALL TESTS PASSED!
    echo Your code is ready to push to GitLab.
) else (
    echo [ERROR] Local pipeline test complete - !ERRORS! ERRORS FOUND
    echo Please fix the issues before pushing to GitLab.
)
echo ============================================

exit /b !ERRORS!