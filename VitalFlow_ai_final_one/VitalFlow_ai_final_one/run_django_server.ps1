# VitalFlow AI - Django Development Server Launcher (PowerShell)
# This script automatically activates the virtual environment and starts the Django server

Write-Host ""
Write-Host "===================================="
Write-Host "  VitalFlow AI Development Server"
Write-Host "===================================="
Write-Host ""

# Change to script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath
Set-Location django_backend

# Check if venv exists
if (-not (Test-Path "..\venv\Scripts\Activate.ps1")) {
    Write-Host "ERROR: Virtual environment not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please ensure:"
    Write-Host "1. The .venv folder exists in the parent directory"
    Write-Host "2. You have Python 3.8+ installed"
    Write-Host "3. Run: python -m venv ..\venv"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Activating virtual environment..." -ForegroundColor Green
& "..\venv\Scripts\Activate.ps1"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to activate virtual environment!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Installing/checking dependencies..." -ForegroundColor Green
python -m pip install -q Django==5.0.3 djangorestframework==3.15.1 django-cors-headers==4.3.1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install dependencies!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Running migrations..." -ForegroundColor Green
python manage.py migrate --noinput

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to run migrations!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "===================================="
Write-Host "  Starting Django Development Server"
Write-Host "===================================="
Write-Host ""
Write-Host "Django is running at: http://localhost:8000/" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Endpoints:"
Write-Host "  - Register: http://localhost:8000/api/register/" -ForegroundColor Yellow
Write-Host "  - Login: http://localhost:8000/api/login/" -ForegroundColor Yellow
Write-Host "  - Notifications: http://localhost:8000/api/notifications/" -ForegroundColor Yellow
Write-Host "  - Blood Requests: http://localhost:8000/api/blood-requests/" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server"
Write-Host ""

python manage.py runserver

Read-Host "Press Enter to exit"
