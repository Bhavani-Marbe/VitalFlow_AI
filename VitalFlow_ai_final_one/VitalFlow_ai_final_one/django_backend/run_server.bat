@echo off
REM Django Server Launcher - Batch Script
REM This script activates the virtual environment and starts the Django server

setlocal enabledelayedexpansion

cd /d "%~dp0"

set "VENV_PATH=%cd%\venv"
set "ACTIVATE_SCRIPT=%VENV_PATH%\Scripts\activate.bat"

REM Check if venv exists
if not exist "%VENV_PATH%" (
    echo.
    echo ❌ Virtual environment not found at: %VENV_PATH%
    echo.
    pause
    exit /b 1
)

echo.
echo 🔄 Activating virtual environment...
call "%ACTIVATE_SCRIPT%"
echo ✅ Virtual environment activated
echo.

echo 🔍 Checking for pending migrations...
python manage.py migrate --noinput

echo.
echo 🚀 Starting Django development server...
echo 📡 Server will run at http://localhost:8000/
echo.

REM Start server
python manage.py runserver 0.0.0.0:8000

pause
