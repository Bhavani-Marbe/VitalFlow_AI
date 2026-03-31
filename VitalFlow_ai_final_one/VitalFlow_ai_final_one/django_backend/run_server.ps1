# Django Server Launcher - PowerShell Script
# This script activates the virtual environment and starts the Django server

$ScriptPath = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$VenvPath = Join-Path -Path $ScriptPath -ChildPath "venv"
$ActivateScript = Join-Path -Path $VenvPath -ChildPath "Scripts\Activate.ps1"

# Check if venv exists
if (-not (Test-Path $VenvPath)) {
    Write-Host "❌ Virtual environment not found at: $VenvPath" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Activating virtual environment..." -ForegroundColor Yellow
& $ActivateScript

Write-Host "✅ Virtual environment activated" -ForegroundColor Green
Write-Host "🚀 Starting Django development server..." -ForegroundColor Cyan
Write-Host "📡 Server will run at http://localhost:8000/" -ForegroundColor Yellow
Write-Host ""

# Run migrations if needed
Write-Host "🔍 Checking for pending migrations..." -ForegroundColor Cyan
python manage.py migrate --noinput

# Start server
python manage.py runserver 0.0.0.0:8000
