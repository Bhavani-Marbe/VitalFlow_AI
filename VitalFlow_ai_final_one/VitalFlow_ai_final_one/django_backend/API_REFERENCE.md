# API REFERENCE GUIDE - Blood Bank Management System

## Authentication

All endpoints require Bearer token authentication:

```bash
Authorization: Bearer <your_jwt_token>
```

### Get Token (Example)

```bash
# POST /api/token/
{
  "username": "hospital_user",
  "password": "password123"
}

# Response:
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 🩸 BLOOD REQUEST API

### 1. Create Blood Request (Hospital)

```http
POST /api/blood-requests/
Authorization: Bearer <token>
Content-Type: application/json

{
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
}
```

**Status:** 201 Created

**Response:**

```json
{
  "request_id": "REQ-2026-0001",
  "hospital": 1,
  "hospital_name": "city_hospital",
  "blood_group": "O+",
  "units_requested": 5,
  "component_type": "Whole Blood",
  "patient_id": "PAT-2026-001",
  "patient_name": "John Doe",
  "doctor_name": "Dr. Rajesh Kumar",
  "diagnosis": "Severe anemia requiring immediate transfusion",
  "urgency_level": "CRITICAL",
  "status": "PENDING",
  "requested_at": "2026-03-30T10:30:45Z",
  "accepted_at": null,
  "delivered_at": null,
  "is_locked": false,
  "accepted_by": null,
  "accepted_by_name": null,
  "assigned_driver": null,
  "driver_name": null,
  "delivery_address": "Emergency Ward, City Hospital Delhi",
  "hospital_latitude": 28.7041,
  "hospital_longitude": 77.1025,
  "is_flagged_suspicious": false,
  "anomaly_reason": null
}
```

**Errors:**

```json
// 403 Forbidden - Not a hospital
{
  "error": "Only hospitals can create requests"
}

// 400 Bad Request - Daily limit exceeded
{
  "error": "Daily request limit (5) exceeded. Already made 5 requests today."
}

// 400 Bad Request  - Units exceed limit
{
  "error": "Cannot request more than 10 units per request"
}

// 400 Bad Request - Insufficient inventory
{
  "error": "Not enough O+ blood available in network"
}
```

---

### 2. List Blood Requests

```http
GET /api/blood-requests/?status=PENDING&urgency_level=CRITICAL
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Values | Default |
|-----------|--------|---------|
| `status` | PENDING, ACCEPTED, IN_TRANSIT, DELIVERED, CANCELLED, REJECTED | (all) |
| `urgency_level` | ROUTINE, URGENT, CRITICAL | (all) |
| `page` | 1, 2, 3... | 1 |

**Response:**

```json
[
  {
    "request_id": "REQ-2026-0001",
    "hospital": 1,
    "hospital_name": "city_hospital",
    "blood_group": "O+",
    "units_requested": 5,
    "status": "PENDING",
    "urgency_level": "CRITICAL",
    "requested_at": "2026-03-30T10:30:45Z",
    ...
  }
]
```

---

### 3. Accept Blood Request (Blood Bank)

**CRITICAL FEATURE:** The `is_locked` field prevents other banks from accepting

```http
POST /api/blood-requests/REQ-2026-0001/accept_request/
Authorization: Bearer <token>
Content-Type: application/json

{
  "proof_id": "BANK-DELHI-001"
}
```

**Status:** 200 OK

**Response:**

```json
{
  "status": "ACCEPTED",
  "message": "Request accepted successfully. Driver assigned.",
  "blood_request": {
    "request_id": "REQ-2026-0001",
    "status": "ACCEPTED",
    "is_locked": true,
    "accepted_by": 2,
    "accepted_by_name": "blood_bank_delhi",
    "accepted_at": "2026-03-30T10:35:00Z",
    "assigned_driver": 3,
    "driver_name": "raj_kumar"
  },
  "driver": {
    "id": 3,
    "user": 3,
    "phone": "9876543210",
    "vehicle_number": "DL-01-AB-1234",
    "current_city": "Delhi",
    "current_latitude": 28.6500,
    "current_longitude": 77.0500,
    "is_available": false,
    "current_status": "ON_DELIVERY",
    "average_rating": 4.8,
    "total_deliveries": 145
  },
  "delivery": {
    "delivery_id": "DEL-2026-0001",
    "blood_request": "REQ-2026-0001",
    "driver": 3,
    "driver_name": "raj_kumar",
    "status": "PENDING_PICKUP",
    "created_at": "2026-03-30T10:35:00Z",
    "picked_up_at": null,
    "delivered_at": null,
    "current_latitude": 28.6500,
    "current_longitude": 77.0500
  }
}
```

**Errors:**

```json
// 403 Forbidden - Not a blood bank
{
  "error": "Only blood banks can accept requests"
}

// 409 Conflict - CRITICAL: Request already locked by another bank
{
  "error": "This request has already been accepted by another blood bank"
}

// 400 Bad Request - Insufficient inventory
{
  "error": "Insufficient O+ blood inventory"
}

// 400 Bad Request - Wrong status
{
  "error": "Cannot accept request with status ACCEPTED"
}
```

---

### 4. Reject Blood Request (Blood Bank)

Unlocks request so other banks can accept

```http
POST /api/blood-requests/REQ-2026-0001/reject_request/
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Insufficient O+ inventory. Can fulfill only 2 units instead of 5."
}
```

**Response:**

```json
{
  "status": "REJECTED",
  "reason": "Insufficient O+ inventory. Can fulfill only 2 units instead of 5.",
  "message": "This request is now available for other blood banks"
}
```

---

### 5. Update Request Status (Blood Bank/Driver)

Valid transitions: ACCEPTED → IN_TRANSIT → DELIVERED

```http
PATCH /api/blood-requests/REQ-2026-0001/update_status/
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_TRANSIT"
}
```

**Response:**

```json
{
  "request_id": "REQ-2026-0001",
  "status": "IN_TRANSIT",
  "updated_at": "2026-03-30T10:45:00Z"
}
```

---

## 📦 INVENTORY API

### 1. Add Blood Inventory (Blood Bank)

```http
POST /api/inventory/
Authorization: Bearer <token>
Content-Type: application/json

{
  "blood_bank": 2,
  "blood_group": "O+",
  "component_type": "Whole Blood",
  "units_available": 50,
  "expiry_date": "2026-05-30T00:00:00Z",
  "quality_status": "GOOD",
  "storage_location": "Rack A-1, Refrigerator 3",
  "temperature_celsius": 4.2
}
```

**Status:** 201 Created

**Response:**

```json
{
  "id": 15,
  "blood_bank": 2,
  "blood_bank_name": "delhi_blood_bank",
  "blood_group": "O+",
  "component_type": "Whole Blood",
  "units_available": 50,
  "expiry_date": "2026-05-30T00:00:00Z",
  "quality_status": "GOOD",
  "storage_location": "Rack A-1, Refrigerator 3",
  "temperature_celsius": 4.2,
  "added_at": "2026-03-30T10:30:00Z",
  "updated_at": "2026-03-30T10:30:00Z",
  "days_until_expiry": 61,
  "is_expired": false
}
```

---

### 2. List Inventory by Blood Group

```http
GET /api/inventory/by_blood_group/?blood_group=O+
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": 15,
    "blood_bank_name": "delhi_blood_bank",
    "blood_group": "O+",
    "component_type": "Whole Blood",
    "units_available": 50,
    "expiry_date": "2026-05-30T00:00:00Z",
    "quality_status": "GOOD",
    "days_until_expiry": 61,
    "is_expired": false,
    "distance_km": 2.5
  },
  {
    "id": 16,
    "blood_bank_name": "apollo_blood_bank",
    "blood_group": "O+",
    "units_available": 35,
    "expiry_date": "2026-06-15T00:00:00Z",
    "days_until_expiry": 77,
    "distance_km": 8.3
  }
]
```

---

### 3. Get Expiry Alerts (Blood Banks Expiring in 7 Days)

```http
GET /api/inventory/expiry_alerts/
Authorization: Bearer <token>
```

**Response:**

```json
{
  "alerts_count": 3,
  "items": [
    {
      "id": 12,
      "blood_bank_name": "delhi_blood_bank",
      "blood_group": "B+",
      "component_type": "Plasma",
      "units_available": 15,
      "expiry_date": "2026-04-05T00:00:00Z",
      "days_until_expiry": 6,
      "quality_status": "GOOD"
    },
    {
      "id": 13,
      "blood_group": "AB-",
      "units_available": 8,
      "expiry_date": "2026-04-02T00:00:00Z",
      "days_until_expiry": 3
    }
  ]
}
```

---

## 🚗 DRIVER API

### 1. Update Driver Location

```http
PATCH /api/drivers/3/update_location/
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 28.6912,
  "longitude": 77.0604
}
```

**Response:**

```json
{
  "id": 3,
  "user": 3,
  "current_latitude": 28.6912,
  "current_longitude": 77.0604,
  "current_status": "ON_DELIVERY",
  "is_available": false
}
```

---

### 2. Complete Delivery

```http
POST /api/drivers/3/complete_delivery/
Authorization: Bearer <token>
Content-Type: application/json

{
  "delivery_id": "DEL-2026-0001",
  "proof_of_delivery": "https://s3.example.com/proof-image.jpg",
  "notes": "Delivered successfully to emergency ward. Received by Dr. Sharma."
}
```

**Response:**

```json
{
  "delivery_id": "DEL-2026-0001",
  "status": "DELIVERED",
  "delivered_at": "2026-03-30T11:15:00Z",
  "proof_of_delivery": "https://s3.example.com/proof-image.jpg",
  "delivery_notes": "Delivered successfully to emergency ward. Received by Dr. Sharma."
}
```

---

## 📊 DASHBOARD API

### 1. Blood Bank Dashboard

```http
GET /api/dashboards/blood-bank/
Authorization: Bearer <token>
```

**Response:**

```json
{
  "inventory_summary": [
    {
      "blood_group": "O+",
      "component_type": "Whole Blood",
      "total_units": 95,
      "items": [
        {
          "units": 50,
          "expiry_date": "2026-05-30T00:00:00Z",
          "days_until_expiry": 61
        },
        {
          "units": 45,
          "expiry_date": "2026-05-20T00:00:00Z",
          "days_until_expiry": 51
        }
      ]
    },
    {
      "blood_group": "A+",
      "total_units": 65
    }
  ],
  "total_units_available": 210,
  "pending_requests": {
    "count": 3,
    "data": [
      {
        "request_id": "REQ-2026-0001",
        "patient_name": "John Doe",
        "blood_group": "O+",
        "units_requested": 5,
        "urgency_level": "CRITICAL",
        "requested_at": "2026-03-30T10:30:00Z"
      }
    ]
  },
  "accepted_requests": {
    "count": 2,
    "data": [...]
  },
  "critical_requests": {
    "count": 2,
    "data": [...]
  },
  "expiry_alerts": {
    "count": 1,
    "data": [...]
  }
}
```

---

### 2. Hospital Dashboard

```http
GET /api/dashboards/hospital/
Authorization: Bearer <token>
```

**Response:**

```json
{
  "requests_summary": {
    "pending": 2,
    "accepted": 1,
    "in_transit": 0,
    "delivered": 15,
    "total": 18
  },
  "recent_requests": [
    {
      "request_id": "REQ-2026-0001",
      "blood_group": "O+",
      "units_requested": 5,
      "status": "ACCEPTED",
      "urgency_level": "CRITICAL",
      "accepted_by_name": "delhi_blood_bank"
    }
  ],
  "nearest_blood_banks": [
    {
      "bank_id": 2,
      "bank_name": "delhi_blood_bank",
      "distance_km": 2.5,
      "latitude": 28.7050,
      "longitude": 77.1030,
      "phone": "011-2345-6789",
      "city": "Delhi",
      "inventory": [
        {
          "blood_group": "O+",
          "total_units": 95
        },
        {
          "blood_group": "A+",
          "total_units": 65
        }
      ],
      "available_immediately": true,
      "total_units": 160
    },
    {
      "bank_id": 5,
      "bank_name": "apollo_blood_bank",
      "distance_km": 8.3,
      "inventory": [...]
    }
  ],
  "request_limits": {
    "max_units_per_request": 10,
    "daily_limit": 5,
    "requests_today": 2
  }
}
```

---

## 🔔 NOTIFICATION API

### 1. List Notifications

```http
GET /api/notifications/?is_read=false
Authorization: Bearer <token>
```

**Response:**

```json
[
  {
    "id": "notif-001",
    "type": "REQUEST_ACCEPTED",
    "title": "✓ Blood Request Accepted",
    "message": "delhi_blood_bank has accepted your O+ request. Driver assignment in progress.",
    "priority": "HIGH",
    "is_read": false,
    "created_at": "2026-03-30T10:35:00Z"
  },
  {
    "id": "notif-002",
    "type": "DRIVER_ASSIGNED",
    "title": "New Delivery Assignment",
    "message": "Pickup: delhi_blood_bank -> Deliver to: city_hospital",
    "priority": "URGENT",
    "is_read": false,
    "created_at": "2026-03-30T10:35:15Z"
  },
  {
    "id": "notif-003",
    "type": "ON_THE_WAY",
    "title": "Blood in Transit",
    "message": "Raj Kumar is on the way with your blood. Vehicle: DL-01-AB-1234",
    "priority": "NORMAL",
    "is_read": false,
    "created_at": "2026-03-30T10:40:00Z"
  }
]
```

---

### 2. Mark Notification as Read

```http
POST /api/notifications/notif-001/mark_as_read/
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "notif-001",
  "is_read": true,
  "read_at": "2026-03-30T10:50:00Z"
}
```

---

### 3. Get Unread Count

```http
GET /api/notifications/unread_count/
Authorization: Bearer <token>
```

**Response:**

```json
{
  "unread_count": 5
}
```

---

## 🔍 SEARCH API

### 1. Search Nearest Blood Banks

```http
GET /api/search/nearest-blood-banks/?latitude=28.7041&longitude=77.1025&radius_km=5&blood_group=O+
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `latitude` | float | Yes | - |
| `longitude` | float | Yes | - |
| `radius_km` | int | No | 5 |
| `blood_group` | string | No | (all) |

**Response:**

```json
{
  "search_center": {
    "latitude": 28.7041,
    "longitude": 77.1025
  },
  "search_radius_km": 5,
  "results_count": 3,
  "banks": [
    {
      "bank_id": 2,
      "bank_name": "delhi_blood_bank",
      "distance_km": 0.8,
      "phone": "011-2345-6789",
      "latitude": 28.7050,
      "longitude": 77.1030,
      "city": "Delhi",
      "inventory": [
        {
          "blood_group": "O+",
          "total_units": 95
        }
      ],
      "available_immediately": true
    },
    {
      "bank_id": 5,
      "bank_name": "apollo_blood_bank",
      "distance_km": 4.2,
      "inventory": [...]
    }
  ]
}
```

---

## ❌ Common Error Responses

### 401 Unauthorized

```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Solution:** Include valid Bearer token in Authorization header

### 403 Forbidden

```json
{
  "error": "Only hospitals can create requests"
}
```

**Solution:** Use correct user role for the operation

### 404 Not Found

```json
{
  "detail": "Not found."
}
```

**Solution:** Check if resource ID/request_id is correct

### 409 Conflict

```json
{
  "error": "This request has already been accepted by another blood bank"
}
```

**Solution:** This is expected behavior. Request is locked. Try another request.

### 429 Too Many Requests

```json
{
  "error": "Daily request limit (5) exceeded"
}
```

**Solution:** Wait until next day or request fewer units

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

**Solution:** Check Django logs for details

---

## 📝 HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 204 | No Content - Success, no body |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Request locked/duplicate |
| 429 | Too Many Requests - Rate limit |
| 500 | Server Error - See logs |

---

## 🧪 Testing with cURL

```bash
# Set token
export TOKEN="your_jwt_token_here"

# Create request
curl -X POST http://localhost:8000/api/blood-requests/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @request.json

# List requests
curl -X GET http://localhost:8000/api/blood-requests/?status=PENDING \
  -H "Authorization: Bearer $TOKEN"

# Accept request
curl -X POST http://localhost:8000/api/blood-requests/REQ-xxx/accept_request/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"proof_id":"BANK123"}'

# Get dashboard
curl -X GET http://localhost:8000/api/dashboards/blood-bank/ \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

---

**Document Version:** 1.0
**Last Updated:** March 30, 2026
**Status:** Production Ready
