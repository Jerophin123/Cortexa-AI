# PowerShell script to run the ML Service
# Usage: .\run.ps1

Write-Host "Starting Dementia Risk Assessment ML Service..." -ForegroundColor Green

# Check if virtual environment exists
if (-not (Test-Path "venv\Scripts\Activate.ps1")) {
    Write-Host "Error: Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please create a virtual environment first:" -ForegroundColor Yellow
    Write-Host "  python -m venv venv" -ForegroundColor Yellow
    Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Yellow
    Write-Host "  pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& "venv\Scripts\Activate.ps1"

# Check if required packages are installed
Write-Host "Checking dependencies..." -ForegroundColor Cyan
$uvicornInstalled = python -c "import uvicorn" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    python -m pip install -r requirements.txt
}

# Check if model files exist
if (-not (Test-Path "dementia_model.pkl")) {
    Write-Host "Warning: dementia_model.pkl not found!" -ForegroundColor Yellow
    Write-Host "The service will create a dummy model for testing." -ForegroundColor Yellow
}

if (-not (Test-Path "scaler.pkl")) {
    Write-Host "Warning: scaler.pkl not found!" -ForegroundColor Yellow
    Write-Host "Creating preprocessors..." -ForegroundColor Yellow
    python create_preprocessors.py
}

if (-not (Test-Path "label_encoder.pkl")) {
    Write-Host "Warning: label_encoder.pkl not found!" -ForegroundColor Yellow
    Write-Host "Creating preprocessors..." -ForegroundColor Yellow
    python create_preprocessors.py
}

# Run the service
Write-Host "`nStarting ML Service on http://0.0.0.0:8000" -ForegroundColor Green
Write-Host "API Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Health Check: http://localhost:8000/health" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C to stop the service`n" -ForegroundColor Yellow

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

