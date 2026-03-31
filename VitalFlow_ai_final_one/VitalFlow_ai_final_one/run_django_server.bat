@echo off
REM VitalFlow AI - Django Development Server Launcher
REM This script automatically activates the virtual environment and starts the Django server

cd /d "%~dp0"
cd django_backend

echo.
echo ====================================
echo  VitalFlow AI Development Server
echo ====================================
echo.
echo Activating virtual environment...
call ..\venv\Scripts\activate.bat

if errorlevel 1 (
    echo.
    echo ERROR: Failed to activate virtual environment!
    echo.
    echo Please ensure:
    echo 1. The .venv folder exists in the parent directory
    echo 2. You have Python 3.8+ installed
    echo 3. Run: python -m venv ..\venv
    echo.
    pause
    exit /b 1
)

echo.
echo Installing/checking dependencies...
python -m pip install -q Django==5.0.3 djangorestframework==3.15.1 django-cors-headers==4.3.1

if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Running migrations...
python manage.py migrate --noinput

if errorlevel 1 (
    echo.
    echo ERROR: Failed to run migrations!
    pause
    exit /b 1
)

echo.
echo ====================================
echo  Starting Django Development Server
echo ====================================
echo.
echo Django is running at: http://localhost:8000/
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver

pause
