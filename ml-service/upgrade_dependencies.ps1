# Script to upgrade dependencies to match model requirements
# Usage: .\upgrade_dependencies.ps1

Write-Host "Upgrading dependencies to match model requirements..." -ForegroundColor Green

# Activate virtual environment if it exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    Write-Host "Activating virtual environment..." -ForegroundColor Cyan
    & "venv\Scripts\Activate.ps1"
}

Write-Host "Upgrading pip..." -ForegroundColor Cyan
python -m pip install --upgrade pip

Write-Host "Upgrading numpy and scikit-learn..." -ForegroundColor Cyan
python -m pip install --upgrade "numpy>=2.0.0" "scikit-learn>=1.6.0"

Write-Host "Installing/updating all requirements..." -ForegroundColor Cyan
python -m pip install -r requirements.txt --upgrade

Write-Host "`nVerifying installations..." -ForegroundColor Cyan
python -c "import numpy; import sklearn; print(f'numpy version: {numpy.__version__}'); print(f'scikit-learn version: {sklearn.__version__}')"

Write-Host "`nDependencies upgraded successfully!" -ForegroundColor Green
Write-Host "You can now run: .\run.ps1" -ForegroundColor Cyan




