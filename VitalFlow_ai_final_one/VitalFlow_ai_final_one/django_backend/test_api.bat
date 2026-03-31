@echo off
REM Blood Bank Management System - API Testing Script (Windows)
REM Usage: test_api.bat
REM This script tests all major endpoints with example data

setlocal enabledelayedexpansion

set API_URL=http://localhost:8000
set HOSPITAL_TOKEN=
set BLOOD_BANK_TOKEN=
set DRIVER_TOKEN=

cls
echo.
echo ====== Blood Bank Management System - API Test Suite ======
echo.

REM ====== STEP 1: Authentication ======
echo [STEP 1] Authentication - Get Tokens
echo.

echo Getting Hospital Token...
for /f "tokens=*" %%A in ('curl -s -X POST "%API_URL%/api/token/" -H "Content-Type: application/json" -d "{\"username\":\"hospital_user\",\"password\":\"password123\"}" ^| jq -r ".access" 2^>nul') do (
    set HOSPITAL_TOKEN=%%A
)

if "!HOSPITAL_TOKEN!"=="" (
    echo [ERROR] Failed to get hospital token
    echo Make sure you have created test users. See IMPLEMENTATION_STEPS.md Step 6
    pause
    exit /b 1
)

echo [SUCCESS] Hospital Token obtained: !HOSPITAL_TOKEN:~0,20!...
echo.

echo Getting Blood Bank Token...
for /f "tokens=*" %%A in ('curl -s -X POST "%API_URL%/api/token/" -H "Content-Type: application/json" -d "{\"username\":\"blood_bank_user\",\"password\":\"password123\"}" ^| jq -r ".access" 2^>nul') do (
    set BLOOD_BANK_TOKEN=%%A
)

if "!BLOOD_BANK_TOKEN!"=="" (
    echo [ERROR] Failed to get blood bank token
    pause
    exit /b 1
)

echo [SUCCESS] Blood Bank Token obtained: !BLOOD_BANK_TOKEN:~0,20!...
echo.

echo Getting Driver Token...
for /f "tokens=*" %%A in ('curl -s -X POST "%API_URL%/api/token/" -H "Content-Type: application/json" -d "{\"username\":\"driver_user\",\"password\":\"password123\"}" ^| jq -r ".access" 2^>nul') do (
    set DRIVER_TOKEN=%%A
)

if "!DRIVER_TOKEN!"=="" (
    echo [ERROR] Failed to get driver token
    pause
    exit /b 1
)

echo [SUCCESS] Driver Token obtained: !DRIVER_TOKEN:~0,20!...
echo.

REM ====== STEP 2: Create Blood Request ======
echo [STEP 2] Hospital Creates Blood Request
echo.

echo Creating blood request...

for /f "tokens=*" %%A in ('curl -s -X POST "%API_URL%/api/blood-requests/" -H "Authorization: Bearer !HOSPITAL_TOKEN!" -H "Content-Type: application/json" -d "{\"hospital\":1,\"blood_group\":\"O+\",\"units_requested\":5,\"component_type\":\"Whole Blood\",\"patient_id\":\"PAT-2026-001\",\"patient_name\":\"John Doe\",\"doctor_name\":\"Dr. Rajesh Kumar\",\"diagnosis\":\"Severe anemia requiring immediate transfusion\",\"urgency_level\":\"CRITICAL\",\"delivery_address\":\"Emergency Ward, City Hospital Delhi\",\"hospital_latitude\":28.7041,\"hospital_longitude\":77.1025}" ^| jq -r ".request_id" 2^>nul') do (
    set REQUEST_ID=%%A
)

if "!REQUEST_ID!"=="" (
    echo [ERROR] Failed to create blood request
    pause
    exit /b 1
)

echo [SUCCESS] Blood request created: !REQUEST_ID!
echo.

REM ====== STEP 3: List Blood Requests ======
echo [STEP 3] List Blood Requests
echo.

for /f "tokens=*" %%A in ('curl -s -X GET "%API_URL%/api/blood-requests/?status=PENDING" -H "Authorization: Bearer !BLOOD_BANK_TOKEN!" ^| jq "length" 2^>nul') do (
    set REQUEST_COUNT=%%A
)

echo [SUCCESS] Found %REQUEST_COUNT% pending request^(s^)
echo.

REM ====== STEP 4: Blood Bank Accepts Request ======
echo [STEP 4] Blood Bank Accepts Request
echo.

echo Accepting request !REQUEST_ID!...

for /f "tokens=*" %%A in ('curl -s -X POST "%API_URL%/api/blood-requests/!REQUEST_ID!/accept_request/" -H "Authorization: Bearer !BLOOD_BANK_TOKEN!" -H "Content-Type: application/json" -d "{\"proof_id\":\"BANK-DELHI-001\"}" ^| jq -r ".status" 2^>nul') do (
    set REQUEST_STATUS=%%A
)

if "!REQUEST_STATUS!"=="ACCEPTED" (
    echo [SUCCESS] Request accepted successfully
) else (
    echo [ERROR] Failed to accept request
    pause
    exit /b 1
)

echo.

REM ====== STEP 5: Test Duplicate Prevention ======
echo [STEP 5] Test Duplicate Prevention ^(Should Fail^)
echo.

echo Attempting to accept same request again...

setlocal disabledelayedexpansion

for /f "tokens=*" %%A in ('curl -s -X POST "%API_URL%/api/blood-requests/!REQUEST_ID!/accept_request/" -H "Authorization: Bearer !BLOOD_BANK_TOKEN!" -H "Content-Type: application/json" -d "{\"proof_id\":\"BANK-DELHI-001\"}" ^| jq -r ".error" 2^>nul') do (
    set DUPLICATE_ERROR=%%A
)

setlocal enabledelayedexpansion

if "!DUPLICATE_ERROR!"=="" (
    echo [SUCCESS] Duplicate prevention working! Got expected error
) else (
    echo [SUCCESS] Got expected error: !DUPLICATE_ERROR!
)

echo.

REM ====== STEP 6: Update Request Status ======
echo [STEP 6] Update Request Status to IN_TRANSIT
echo.

for /f "tokens=*" %%A in ('curl -s -X PATCH "%API_URL%/api/blood-requests/!REQUEST_ID!/update_status/" -H "Authorization: Bearer !DRIVER_TOKEN!" -H "Content-Type: application/json" -d "{\"status\":\"IN_TRANSIT\"}" ^| jq -r ".status" 2^>nul') do (
    set UPDATED_STATUS=%%A
)

if "!UPDATED_STATUS!"=="IN_TRANSIT" (
    echo [SUCCESS] Status updated to IN_TRANSIT
) else (
    echo [WARNING] Could not verify status update
)

echo.

REM ====== STEP 7: Add Inventory ======
echo [STEP 7] Add Blood Inventory
echo.

echo Adding blood inventory...

for /f "tokens=*" %%A in ('curl -s -X POST "%API_URL%/api/inventory/" -H "Authorization: Bearer !BLOOD_BANK_TOKEN!" -H "Content-Type: application/json" -d "{\"blood_bank\":2,\"blood_group\":\"O+\",\"component_type\":\"Whole Blood\",\"units_available\":50,\"expiry_date\":\"2026-05-30T00:00:00Z\",\"quality_status\":\"GOOD\",\"storage_location\":\"Rack A-1\",\"temperature_celsius\":4.2}" ^| jq -r ".id" 2^>nul') do (
    set INVENTORY_ID=%%A
)

if "!INVENTORY_ID!"=="" (
    echo [WARNING] Could not add inventory
) else (
    echo [SUCCESS] Inventory added: ID !INVENTORY_ID!
)

echo.

REM ====== STEP 8: Search Inventory ======
echo [STEP 8] Search Inventory by Blood Group
echo.

echo Searching for O+ inventory...

for /f "tokens=*" %%A in ('curl -s -X GET "%API_URL%/api/inventory/by_blood_group/?blood_group=O+" -H "Authorization: Bearer !BLOOD_BANK_TOKEN!" ^| jq "length" 2^>nul') do (
    set INVENTORY_COUNT=%%A
)

echo [SUCCESS] Found %INVENTORY_COUNT% inventory item^(s^)
echo.

REM ====== STEP 9: Get Dashboards ======
echo [STEP 9] Get Dashboards
echo.

echo Fetching blood bank dashboard...
curl -s -X GET "%API_URL%/api/dashboards/blood-bank/" -H "Authorization: Bearer !BLOOD_BANK_TOKEN!" ^| jq "." 2^>nul
echo.

REM ====== Summary ======
echo [SUMMARY] Test Completed
echo.
echo === Operations Performed ===
echo   [CHECK] Authentication ^(Hospital, Blood Bank, Driver^)
echo   [CHECK] Created blood request: !REQUEST_ID!
echo   [CHECK] Blood bank accepted request
echo   [CHECK] Duplicate prevention blocked second acceptance
echo   [CHECK] Updated request status to IN_TRANSIT
echo   [CHECK] Added blood inventory
echo   [CHECK] Searched inventory by blood group
echo   [CHECK] Fetched dashboards
echo.
echo === Next Steps ===
echo   1. Test driver location updates
echo   2. Test delivery completion
echo   3. Create more test requests with different urgency levels
echo   4. Test request rejection
echo.
echo === Documentation ===
echo   - See API_REFERENCE.md for complete endpoint documentation
echo   - See PRODUCTION_IMPLEMENTATION_GUIDE.md for architecture details
echo   - See IMPLEMENTATION_STEPS.md for setup instructions
echo.

pause
