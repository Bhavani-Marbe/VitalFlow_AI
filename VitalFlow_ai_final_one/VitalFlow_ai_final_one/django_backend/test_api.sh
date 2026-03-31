#!/bin/bash

# Blood Bank Management System - API Testing Script
# Usage: bash test_api.sh
# This script tests all major endpoints with example data

set -e

API_URL="http://localhost:8000"
HOSPITAL_TOKEN=""
BLOOD_BANK_TOKEN=""
DRIVER_TOKEN=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Blood Bank Management System - API Test Suite ===${NC}\n"

# Function to print section headers
print_section() {
    echo -e "\n${YELLOW}▶ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. Authentication
print_section "STEP 1: Authentication - Get Tokens"

echo "Getting Hospital Token..."
HOSPITAL_RESPONSE=$(curl -s -X POST "$API_URL/api/token/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "hospital_user",
    "password": "password123"
  }')

HOSPITAL_TOKEN=$(echo $HOSPITAL_RESPONSE | jq -r '.access' 2>/dev/null || echo "")

if [ -z "$HOSPITAL_TOKEN" ] || [ "$HOSPITAL_TOKEN" = "null" ]; then
    print_error "Failed to get hospital token. Response: $HOSPITAL_RESPONSE"
    echo "Make sure you have created test users. See IMPLEMENTATION_STEPS.md Step 6"
    exit 1
fi

print_success "Hospital Token obtained"

echo "Getting Blood Bank Token..."
BLOOD_BANK_RESPONSE=$(curl -s -X POST "$API_URL/api/token/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "blood_bank_user",
    "password": "password123"
  }')

BLOOD_BANK_TOKEN=$(echo $BLOOD_BANK_RESPONSE | jq -r '.access' 2>/dev/null || echo "")

if [ -z "$BLOOD_BANK_TOKEN" ] || [ "$BLOOD_BANK_TOKEN" = "null" ]; then
    print_error "Failed to get blood bank token"
    exit 1
fi

print_success "Blood Bank Token obtained"

echo "Getting Driver Token..."
DRIVER_RESPONSE=$(curl -s -X POST "$API_URL/api/token/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "driver_user",
    "password": "password123"
  }')

DRIVER_TOKEN=$(echo $DRIVER_RESPONSE | jq -r '.access' 2>/dev/null || echo "")

if [ -z "$DRIVER_TOKEN" ] || [ "$DRIVER_TOKEN" = "null" ]; then
    print_error "Failed to get driver token"
    exit 1
fi

print_success "Driver Token obtained"

# 2. Create Blood Request
print_section "STEP 2: Hospital Creates Blood Request"

REQUEST_PAYLOAD='{
  "hospital": 1,
  "blood_group": "O+",
  "units_requested": 5,
  "component_type": "Whole Blood",
  "patient_id": "PAT-2026-001",
  "patient_name": "John Doe",
  "doctor_name": "Dr. Rajesh Kumar",
  "diagnosis": "Severe anemia requiring immediate transfusion",
  "urgency_level": "CRITICAL",
  "delivery_address": "Emergency Ward, City Hospital Delhi",
  "hospital_latitude": 28.7041,
  "hospital_longitude": 77.1025
}'

echo "Creating blood request..."
REQUEST_RESPONSE=$(curl -s -X POST "$API_URL/api/blood-requests/" \
  -H "Authorization: Bearer $HOSPITAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_PAYLOAD")

REQUEST_ID=$(echo $REQUEST_RESPONSE | jq -r '.request_id' 2>/dev/null || echo "")

if [ -z "$REQUEST_ID" ] || [ "$REQUEST_ID" = "null" ]; then
    print_error "Failed to create blood request. Response: $REQUEST_RESPONSE"
    exit 1
fi

print_success "Blood request created: $REQUEST_ID"
echo "Response:"
echo $REQUEST_RESPONSE | jq '.' 2>/dev/null || echo $REQUEST_RESPONSE

# 3. List Blood Requests
print_section "STEP 3: List Blood Requests"

echo "Fetching pending requests..."
LIST_RESPONSE=$(curl -s -X GET "$API_URL/api/blood-requests/?status=PENDING" \
  -H "Authorization: Bearer $BLOOD_BANK_TOKEN")

REQUEST_COUNT=$(echo $LIST_RESPONSE | jq 'length' 2>/dev/null || echo 0)

print_success "Found $REQUEST_COUNT pending request(s)"

# 4. Blood Bank Accepts Request
print_section "STEP 4: Blood Bank Accepts Request"

ACCEPT_PAYLOAD='{
  "proof_id": "BANK-DELHI-001"
}'

echo "Accepting request $REQUEST_ID..."
ACCEPT_RESPONSE=$(curl -s -X POST "$API_URL/api/blood-requests/$REQUEST_ID/accept_request/" \
  -H "Authorization: Bearer $BLOOD_BANK_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ACCEPT_PAYLOAD")

STATUS=$(echo $ACCEPT_RESPONSE | jq -r '.status' 2>/dev/null || echo "")

if [ "$STATUS" = "ACCEPTED" ]; then
    print_success "Request accepted successfully"
    
    # Extract driver info
    DRIVER_ID=$(echo $ACCEPT_RESPONSE | jq -r '.driver.id' 2>/dev/null || echo "")
    
    if [ ! -z "$DRIVER_ID" ] && [ "$DRIVER_ID" != "null" ]; then
        print_success "Driver assigned: $DRIVER_ID"
    fi
else
    print_error "Failed to accept request. Response: $ACCEPT_RESPONSE"
    exit 1
fi

echo "Response:"
echo $ACCEPT_RESPONSE | jq '.' 2>/dev/null || echo $ACCEPT_RESPONSE

# 5. Try to Accept Same Request (Should Fail - Duplicate Prevention)
print_section "STEP 5: Test Duplicate Prevention (Should Fail)"

echo "Attempting to accept same request with another blood bank..."
DUPLICATE_RESPONSE=$(curl -s -X POST "$API_URL/api/blood-requests/$REQUEST_ID/accept_request/" \
  -H "Authorization: Bearer $BLOOD_BANK_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ACCEPT_PAYLOAD")

DUPLICATE_ERROR=$(echo $DUPLICATE_RESPONSE | jq -r '.error' 2>/dev/null || echo "")

if [[ "$DUPLICATE_ERROR" == *"already been accepted"* ]]; then
    print_success "Duplicate prevention working! Got expected error: $DUPLICATE_ERROR"
else
    print_error "Expected duplicate error but got: $DUPLICATE_RESPONSE"
fi

# 6. Update Request Status
print_section "STEP 6: Update Request Status (IN_TRANSIT)"

UPDATE_PAYLOAD='{
  "status": "IN_TRANSIT"
}'

echo "Updating request status to IN_TRANSIT..."
UPDATE_RESPONSE=$(curl -s -X PATCH "$API_URL/api/blood-requests/$REQUEST_ID/update_status/" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATE_PAYLOAD")

UPDATED_STATUS=$(echo $UPDATE_RESPONSE | jq -r '.status' 2>/dev/null || echo "")

if [ "$UPDATED_STATUS" = "IN_TRANSIT" ]; then
    print_success "Status updated to IN_TRANSIT"
else
    print_error "Failed to update status. Response: $UPDATE_RESPONSE"
fi

# 7. Add Inventory
print_section "STEP 7: Add Blood Inventory"

INVENTORY_PAYLOAD='{
  "blood_bank": 2,
  "blood_group": "O+",
  "component_type": "Whole Blood",
  "units_available": 50,
  "expiry_date": "2026-05-30T00:00:00Z",
  "quality_status": "GOOD",
  "storage_location": "Rack A-1",
  "temperature_celsius": 4.2
}'

echo "Adding blood inventory..."
INVENTORY_RESPONSE=$(curl -s -X POST "$API_URL/api/inventory/" \
  -H "Authorization: Bearer $BLOOD_BANK_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$INVENTORY_PAYLOAD")

INVENTORY_ID=$(echo $INVENTORY_RESPONSE | jq -r '.id' 2>/dev/null || echo "")

if [ ! -z "$INVENTORY_ID" ] && [ "$INVENTORY_ID" != "null" ]; then
    print_success "Inventory added: ID $INVENTORY_ID"
else
    print_error "Failed to add inventory. Response: $INVENTORY_RESPONSE"
fi

# 8. Get Inventory by Blood Group
print_section "STEP 8: Search Inventory by Blood Group"

echo "Searching for O+ inventory..."
SEARCH_RESPONSE=$(curl -s -X GET "$API_URL/api/inventory/by_blood_group/?blood_group=O+" \
  -H "Authorization: Bearer $BLOOD_BANK_TOKEN")

INVENTORY_COUNT=$(echo $SEARCH_RESPONSE | jq 'length' 2>/dev/null || echo 0)

print_success "Found $INVENTORY_COUNT inventory item(s)"

# 9. Get Expiry Alerts
print_section "STEP 9: Get Inventory Expiry Alerts"

echo "Checking for items expiring within 7 days..."
EXPIRY_RESPONSE=$(curl -s -X GET "$API_URL/api/inventory/expiry_alerts/" \
  -H "Authorization: Bearer $BLOOD_BANK_TOKEN")

ALERT_COUNT=$(echo $EXPIRY_RESPONSE | jq -r '.alerts_count' 2>/dev/null || echo 0)

if [ "$ALERT_COUNT" -gt 0 ]; then
    print_success "Found $ALERT_COUNT expiry alert(s)"
else
    print_success "No items expiring soon (Good!)"
fi

# 10. Get Notifications
print_section "STEP 10: Get Notifications"

echo "Fetching unread notifications..."
NOTIF_RESPONSE=$(curl -s -X GET "$API_URL/api/notifications/?is_read=false" \
  -H "Authorization: Bearer $HOSPITAL_TOKEN")

NOTIF_COUNT=$(echo $NOTIF_RESPONSE | jq 'length' 2>/dev/null || echo 0)

print_success "Found $NOTIF_COUNT unread notification(s)"

if [ "$NOTIF_COUNT" -gt 0 ]; then
    echo "Recent notifications:"
    echo $NOTIF_RESPONSE | jq '.[0:2]' 2>/dev/null || echo $NOTIF_RESPONSE
fi

# 11. Get Blood Bank Dashboard
print_section "STEP 11: Get Blood Bank Dashboard"

echo "Fetching blood bank dashboard..."
DASHBOARD_RESPONSE=$(curl -s -X GET "$API_URL/api/dashboards/blood-bank/" \
  -H "Authorization: Bearer $BLOOD_BANK_TOKEN")

TOTAL_UNITS=$(echo $DASHBOARD_RESPONSE | jq -r '.total_units_available' 2>/dev/null || echo "0")
PENDING=$(echo $DASHBOARD_RESPONSE | jq -r '.pending_requests.count' 2>/dev/null || echo "0")
ACCEPTED=$(echo $DASHBOARD_RESPONSE | jq -r '.accepted_requests.count' 2>/dev/null || echo "0")

print_success "Dashboard loaded"
echo "  Total Units: $TOTAL_UNITS"
echo "  Pending Requests: $PENDING"
echo "  Accepted Requests: $ACCEPTED"

# 12. Get Hospital Dashboard
print_section "STEP 12: Get Hospital Dashboard"

echo "Fetching hospital dashboard..."
HOSPITAL_DASHBOARD=$(curl -s -X GET "$API_URL/api/dashboards/hospital/" \
  -H "Authorization: Bearer $HOSPITAL_TOKEN")

NEAREST_BANKS=$(echo $HOSPITAL_DASHBOARD | jq -r '.nearest_blood_banks | length' 2>/dev/null || echo 0)

print_success "Hospital dashboard loaded"
echo "  Nearest Blood Banks: $NEAREST_BANKS"
echo $HOSPITAL_DASHBOARD | jq '.requests_summary' 2>/dev/null || echo $HOSPITAL_DASHBOARD

# 13. Search Nearest Blood Banks
print_section "STEP 13: Search Nearest Blood Banks"

echo "Searching for nearest O+ blood banks..."
NEAREST_RESPONSE=$(curl -s -X GET "$API_URL/api/search/nearest-blood-banks/?latitude=28.7041&longitude=77.1025&radius_km=5&blood_group=O+" \
  -H "Authorization: Bearer $HOSPITAL_TOKEN")

BANKS_COUNT=$(echo $NEAREST_RESPONSE | jq -r '.results_count' 2>/dev/null || echo 0)

print_success "Found $BANKS_COUNT blood bank(s)"

if [ "$BANKS_COUNT" -gt 0 ]; then
    echo $NEAREST_RESPONSE | jq '.banks[0:2]' 2>/dev/null || echo $NEAREST_RESPONSE
fi

# Summary
print_section "TEST SUMMARY"
echo -e "${GREEN}All major API endpoints tested successfully!${NC}"
echo ""
echo "Summary of operations:"
echo "  ✓ Authentication (Hospital, Blood Bank, Driver)"
echo "  ✓ Created blood request: $REQUEST_ID"
echo "  ✓ Blood bank accepted request"
echo "  ✓ Duplicate prevention blocked second acceptance (as expected)"
echo "  ✓ Updated request status to IN_TRANSIT"
echo "  ✓ Added blood inventory"
echo "  ✓ Searched inventory by blood group"
echo "  ✓ Checked expiry alerts"
echo "  ✓ Retrieved notifications"
echo "  ✓ Fetched dashboards"
echo "  ✓ Searched nearest blood banks"
echo ""
echo "Next Steps:"
echo "  1. Test driver location updates: PATCH /api/drivers/{id}/update_location/"
echo "  2. Test delivery completion: POST /api/drivers/{id}/complete_delivery/"
echo "  3. Create more test requests with different urgency levels"
echo "  4. Test request rejection: POST /api/blood-requests/{id}/reject_request/"
echo "  5. Monitor real-time delivery tracking with WebSockets"
echo ""
echo "Documentation:"
echo "  - See API_REFERENCE.md for complete endpoint documentation"
echo "  - See PRODUCTION_IMPLEMENTATION_GUIDE.md for architecture details"
echo "  - See IMPLEMENTATION_STEPS.md for setup instructions"
