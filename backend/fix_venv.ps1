# EBL Backend venv Fix Script
# Run this with: powershell -ExecutionPolicy Bypass -File fix_venv.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "EBL Backend venv Repair Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

$BackendPath = "C:\Users\bisho\IdeaProjects\ebl\backend"
$VenvPath = "$BackendPath\.venv"
$PythonPath = "C:\Users\bisho\AppData\Local\Programs\Python\Python311\python.exe"

# Step 1: Navigate to backend
Write-Host "[1/6] Navigating to backend folder..." -ForegroundColor Yellow
Set-Location $BackendPath
Write-Host "✓ Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Step 2: Remove old venv
Write-Host "[2/6] Removing old venv..." -ForegroundColor Yellow
if (Test-Path $VenvPath) {
    Remove-Item -Recurse -Force $VenvPath
    Write-Host "✓ Old venv deleted" -ForegroundColor Green
} else {
    Write-Host "✓ No old venv found (clean slate)" -ForegroundColor Green
}
Write-Host ""

# Step 3: Create fresh venv
Write-Host "[3/6] Creating fresh venv with Python 3.11..." -ForegroundColor Yellow
& $PythonPath -m venv .venv
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Venv created successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to create venv" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Activate venv and verify
Write-Host "[4/6] Activating venv..." -ForegroundColor Yellow
& "$VenvPath\Scripts\Activate.ps1"
$PythonVersion = & python --version
Write-Host "✓ Venv activated - $PythonVersion" -ForegroundColor Green
Write-Host ""

# Step 5: Upgrade pip first
Write-Host "[5/6] Upgrading pip..." -ForegroundColor Yellow
& python -m pip install --upgrade pip --quiet
Write-Host "✓ pip upgraded" -ForegroundColor Green
Write-Host ""

# Step 6: Install from requirements.txt
Write-Host "[6/6] Installing all dependencies (this will take a few minutes)..." -ForegroundColor Yellow
if (Test-Path "requirements.txt") {
    Write-Host "  Installing from requirements.txt..." -ForegroundColor Gray
    & pip install -r requirements.txt --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ All requirements.txt dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠ Some dependencies may have failed - check output above" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ No requirements.txt found - installing minimal deps" -ForegroundColor Yellow
    & pip install fastapi uvicorn[standard] websockets numpy pydantic --quiet
}
Write-Host ""

# Step 7: Install RAG dependencies (the missing ones!)
Write-Host "[7/7] Installing RAG dependencies..." -ForegroundColor Yellow
Write-Host "  Installing sentence-transformers..." -ForegroundColor Gray
& pip install sentence-transformers --quiet

Write-Host "  Installing scikit-learn..." -ForegroundColor Gray
& pip install scikit-learn --quiet

Write-Host "  Installing chromadb..." -ForegroundColor Gray
& pip install chromadb --quiet

Write-Host "✓ RAG dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 8: Install loguru if missing (for logging)
Write-Host "[8/8] Ensuring loguru is installed..." -ForegroundColor Yellow
& pip install loguru --quiet
Write-Host "✓ loguru installed" -ForegroundColor Green
Write-Host ""

# Verification
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Verification" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Python version:" -ForegroundColor Yellow
& python --version

Write-Host "`nPython location:" -ForegroundColor Yellow
& where.exe python | Select-Object -First 1

Write-Host "`nInstalled RAG packages:" -ForegroundColor Yellow
& pip list | Select-String -Pattern "sentence-transformers|scikit-learn|chromadb"

Write-Host "`nTotal packages installed:" -ForegroundColor Yellow
$PackageCount = (& pip list | Measure-Object -Line).Lines - 2
Write-Host "  $PackageCount packages" -ForegroundColor White

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✓ ALL DONE!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Activate venv:" -ForegroundColor White
Write-Host "   .\.venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start backend:" -ForegroundColor White
Write-Host "   python -m uvicorn ebl.main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Backend should now start WITHOUT RAG errors!" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
