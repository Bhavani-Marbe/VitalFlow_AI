# 🚀 VitalFlow AI - Quick Start Guide

## Prerequisites
- Python 3.8 or higher installed
- Virtual environment created (`.venv` folder exists)

## How to Run Django Server - EASY METHOD

### Option 1: PowerShell (Recommended for Windows)
```powershell
# Navigate to project root
cd C:\Users\ADMIN\Downloads\remix_-remix_-vitalflow-ai

# Run the PowerShell script (may need to allow scripts first)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\run_django_server.ps1
```

### Option 2: Command Prompt (Windows)
```cmd
cd C:\Users\ADMIN\Downloads\remix_-remix_-vitalflow-ai
run_django_server.bat
```

### Option 3: Manual Method (PowerShell)
```powershell
# Navigate to the root folder
cd C:\Users\ADMIN\Downloads\remix_-remix_-vitalflow-ai

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Navigate to django_backend
cd django_backend

# Run migrations (first time only)
python manage.py migrate

# Start the server
python manage.py runserver
```

## If You Get "Django Not Found" Error

This error occurs when the virtual environment isn't activated. Use the scripts provided to automatically handle this.

**If scripts don't work:**

1. **Verify virtual environment exists:**
   ```powershell
   ls -la .venv\Scripts\Activate.ps1
   ```

2. **If it doesn't exist, create it:**
   ```powershell
   cd C:\Users\ADMIN\Downloads\remix_-remix_-vitalflow-ai
   python -m venv .venv
   ```

3. **Activate it manually:**
   ```powershell
   .\.venv\Scripts\Activate.ps1
   ```

4. **Install dependencies:**
   ```powershell
   pip install -r django_backend/requirements.txt
   ```

5. **Run the server:**
   ```powershell
   cd django_backend
   python manage.py migrate
   python manage.py runserver
   ```

## Verify Server is Running

Once the server starts, you should see:
```
System check identified no issues (0 silenced).
March 29, 2026 - 07:40:12
Django version 5.0.3, using settings 'vaidyopachar.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

## Test the API

Open a new terminal/PowerShell and test:

```powershell
# Test registration
curl -X POST http://localhost:8000/api/register/ `
  -H "Content-Type: application/json" `
  -d '{
    "username": "driver1",
    "email": "driver1@example.com",
    "password": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "9876543210",
    "city": "Mumbai",
    "user_type": "DRIVER"
  }'

# Test notifications
curl "http://localhost:8000/api/notifications/?city=Mumbai"
```

## Available API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/register/` | POST | Register new user |
| `/api/login/` | POST | User login |
| `/api/notifications/` | GET | Get city-filtered notifications |
| `/api/blood-requests/` | GET/POST | Blood requests management |
| `/api/blood-requests/{id}/accept/` | POST | Accept a blood request |
| `/api/inventory/` | GET | Get blood inventory |

## Stop the Server

Press `Ctrl+C` in the terminal where Django is running.

## Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'django'"
**Solution:** The virtual environment isn't activated. Use one of the startup scripts provided.

### Issue: "Port 8000 is already in use"
**Solution:** Another process is using port 8000. Change the port:
```powershell
python manage.py runserver 8001
```

### Issue: Database errors
**Solution:** Run migrations:
```powershell
python manage.py migrate
```

### Issue: TypeScript/Component errors in VS Code
**Solution:** These are just IDE warnings. The React components will compile fine when using Vite or your build tool.

## Project Structure

```
remix_-remix_-vitalflow-ai/
├── .venv/                    # Virtual environment
├── django_backend/           # Django backend
│   ├── inventory/            # Main app
│   ├── vaidyopachar/         # Project settings
│   ├── manage.py
│   └── requirements.txt
├── components/               # React components
│   ├── DriverDashboardEnhanced.tsx
│   ├── RequesterStatusView.tsx
│   ├── Registration.tsx
│   └── Toast.tsx
├── run_django_server.ps1     # PowerShell launcher
├── run_django_server.bat     # Batch file launcher
└── README.md
```

## Next Steps

1. ✅ Django server is running
2. Test the API endpoints with `curl` or Postman
3. Integrate React components into your main app
4. Start building the frontend!

---

**Version:** 1.0
**Last Updated:** March 29, 2026
**Status:** Ready to use 🚀
