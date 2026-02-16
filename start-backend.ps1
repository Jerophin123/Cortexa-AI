# PowerShell script to start backend with environment variables from .env
# Usage: .\start-backend.ps1

# Load environment variables from .env file
if (Test-Path .env) {
    Write-Host "Loading environment variables from .env file..." -ForegroundColor Green
    Get-Content .env | ForEach-Object {
        # Skip empty lines and comments
        if ($_ -and $_ -notmatch '^\s*#') {
            if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                # Remove quotes if present (both single and double quotes)
                if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
                if ($value.StartsWith("'") -and $value.EndsWith("'")) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
                Write-Host "  Set $name" -ForegroundColor Gray
            }
        }
    }
    Write-Host "Environment variables loaded successfully!" -ForegroundColor Green
} else {
    Write-Host "Warning: .env file not found. Email functionality will be disabled." -ForegroundColor Yellow
}

# Verify environment variables are set
Write-Host "`nVerifying environment variables..." -ForegroundColor Cyan
if ($env:EMAIL_USERNAME) {
    Write-Host "  EMAIL_USERNAME: $($env:EMAIL_USERNAME)" -ForegroundColor Green
} else {
    Write-Host "  EMAIL_USERNAME: NOT SET" -ForegroundColor Red
}
if ($env:EMAIL_PASSWORD) {
    Write-Host "  EMAIL_PASSWORD: ***" -ForegroundColor Green
} else {
    Write-Host "  EMAIL_PASSWORD: NOT SET" -ForegroundColor Red
}

# Start the backend
Write-Host "`nStarting backend..." -ForegroundColor Cyan
cd backend
mvn spring-boot:run

