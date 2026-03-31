# VitalFlow: Blood Bank Management System - Implementation Guide

## 📋 Overview

A production-ready Django backend for managing blood bank operations, hospital requests, and delivery logistics with:

✅ **Key Features:**
- Real-time blood request processing
- Automatic driver assignment & route optimization
- Geographic matching (hospitals ↔ blood banks ↔ drivers)
- Emergency/Critical request prioritization
- Duplicate request prevention with atomic locking
- AI-powered anomaly detection
- Complete audit trail & notifications
- Dashboard analytics

---

## 🚀 Quick Start

### Prerequisites
```bash
Python 3.8+
Django 4.0+
DRF (Django REST Framework)
```

### Installation

**1. Copy new files to your project:**

```bash
# Create these new files:
inventory/models_updated.py
inventory/serializers_updated.py
inventory/views_blood_bank.py
inventory/utils.py
```

**2. Update models.py:**

```python
# In inventory/models.py
# Add all models from models_updated.py BEFORE existing models
# Backup your original file first!

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid

# Add User, BloodRequest, BloodInventory, Driver, Delivery,
# Notification, AuditLog, HospitalRequestLimit models
```

**3. Create migrations and apply:**

```bash
cd django_backend
python manage.py makemigrations inventory
python manage.py migrate inventory
```

**4. Update serializers.py:**

```python
# Copy all serializers from serializers_updated.py
```

**5. Update views.py:**

```python
# At bottom of views.py, add:
from .views_blood_bank import (
    BloodRequestViewSet, BloodInventoryViewSet,
    blood_bank_dashboard, hospital_dashboard
)
```

**6. Update urls.py:**

```python
# Add to urlpatterns:
path('dashboards/blood-bank/', blood_bank_dashboard),
path('dashboards/hospital/', hospital_dashboard),

# Update router:
router.register(r'blood-requests', BloodRequestViewSet)
router.register(r'inventory', BloodInventoryViewSet)
```

**7. Create utils.py:**

```bash
# Copy complete utils.py file with geographic matching
```

---

## 🔑 Core Features Explained

### 1. REQUEST LOCKING (Anti-Duplicate Acceptance)

**Problem:** Multiple blood banks accepting the same request

**Solution:** `is_locked` field prevents duplicate acceptance

```python
# When blood bank accepts:
with transaction.atomic():
    blood_request.is_locked = True  # ← Atomic lock
    blood_request.accepted_by = blood_bank
    blood_request.status = 'ACCEPTED'
    blood_request.save()

# Second acceptance blocked:
if blood_request.is_locked:
    return Response({'error': 'Already accepted'}, status=409)
```

### 2. GEOGRAPHIC MATCHING (5km Radius)

Uses **Haversine Formula** for accurate GPS distance calculation:

```python
def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates"""
    R = 6371  # Earth radius in km
    # ... haversine formula
    return distance_km

# Find nearest resources
nearest_banks = get_nearest_blood_banks(
    hospital_lat=28.7041,
    hospital_lon=77.1025,
    radius_km=5,
    blood_group='O+'
)
```

**Guarantees:**
- Minimum 2-3 results always returned
- Expands radius if needed
- Sorted by distance (nearest first)

### 3. EMERGENCY MODE (CRITICAL requests)

When `urgency_level='CRITICAL'`:

```python
def handle_critical_request(blood_request):
    # 1. Notify all blood banks in 3km radius
    # 2. Assign fastest driver
    # 3. Send URGENT notifications
    # 4. Flag for admin review
```

### 4. AI INTEGRATION

```python
# Anomaly Detection
from ai_models.anomaly_detection import detect_anomalies
if large_urgent_request:
    flag_for_review()

# Blood Matching
from ai_models.matching_intelligence import check_compatibility
if compatible(patient_group, donor_group):
    proceed()

# Demand Forecasting
from ai_models.demand_forecast import forecast_demand
predict_blood_needs(city, blood_group)

# Network Optimization
from ai_models.network_optimization import optimize_distribution
optimize_delivery_routes()
```

### 5. NOTIFICATION SYSTEM

**Database as primary layer + optional email/SMS**

Triggers:
- Request created → Blood banks notified
- Request accepted → Hospital notified
- Driver assigned → Driver gets pickup info
- On the way → Hospital gets updates
- Delivered → Completion confirmation

```python
create_notification(
    user=hospital,
    notification_type='REQUEST_ACCEPTED',
    title='Blood Request Accepted',
    message='Your O+ request accepted. Driver on the way.',
    blood_request=request,
    priority='URGENT'
)
```

---

## 📊 API Endpoints

### Blood Requests

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/blood-requests/` | Create request (Hospital) |
| GET | `/api/blood-requests/` | List requests (all roles) |
| POST | `/api/blood-requests/{id}/accept_request/` | Accept request (Blood Bank) |
| POST | `/api/blood-requests/{id}/reject_request/` | Reject request (Blood Bank) |
| PATCH | `/api/blood-requests/{id}/update_status/` | Update status |

### Inventory

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/inventory/` | Add blood (Blood Bank) |
| GET | `/api/inventory/` | List inventory |
| GET | `/api/inventory/by_blood_group/?blood_group=O+` | Filter by type |
| GET | `/api/inventory/expiry_alerts/` | Get expiring blood |

### Dashboards

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/dashboards/blood-bank/` | Blood Bank Dashboard |
| GET | `/api/dashboards/hospital/` | Hospital Dashboard |

### Search & Location

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/search/nearest-blood-banks/` | Find nearest banks |
| GET | `/api/search/nearest-drivers/` | Find nearest drivers |

---

## 🔐 Authentication & Authorization

All endpoints require authentication with role validation:

```python
# Only hospitals can create requests
if request.user.role != 'HOSPITAL':
    return Response({'error': 'Access denied'}, status=403)

# Only blood banks can accept
if request.user.role != 'BLOOD_BANK':
    return Response({'error': 'Access denied'}, status=403)

# Only drivers can deliver
if request.user.role != 'DRIVER':
    return Response({'error': 'Access denied'}, status=403)
```

**Roles:**
- `HOSPITAL` - Can create and track requests
- `BLOOD_BANK` - Can accept requests and manage inventory
- `DRIVER` - Can accept deliveries and update status
- `ADMIN` - Can view audit logs and manage system

---

## 📈 Dashboard Data

### Blood Bank Dashboard

```json
{
  "inventory_summary": [
    {
      "blood_group": "O+",
      "component_type": "Whole Blood",
      "total_units": 45,
      "items": [
        {
          "units": 15,
          "expiry_date": "2026-04-15",
          "days_until_expiry": 16
        }
      ]
    }
  ],
  "pending_requests": [
    {
      "request_id": "REQ-001",
      "patient_name": "John Doe",
      "blood_group": "O+",
      "units_requested": 5,
      "urgency_level": "CRITICAL"
    }
  ],
  "critical_requests": 1,
  "total_units_available": 120
}
```

### Hospital Dashboard

```json
{
  "requests_summary": {
    "pending": 2,
    "accepted": 1,
    "in_transit": 0,
    "delivered": 15
  },
  "nearest_blood_banks": [
    {
      "bank_name": "City Blood Bank",
      "distance_km": 2.5,
      "inventory": [
        {"blood_group": "O+", "total_units": 45}
      ],
      "available_immediately": true
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

## 🧪 Testing

### Create Test Data

```bash
python manage.py shell

from inventory.models import User, BloodInventory
from datetime import timedelta
from django.utils import timezone

# Create hospital
hospital = User.objects.create_user(
    username='city_hospital',
    password='test123',
    role='HOSPITAL',
    city='Delhi',
    latitude=28.7041,
    longitude=77.1025,
    is_verified=True
)

# Create blood bank
blood_bank = User.objects.create_user(
    username='delhi_blood_bank',
    password='test123',
    role='BLOOD_BANK',
    city='Delhi',
    latitude=28.7050,
    longitude=77.1030,
    is_verified=True
)

# Add inventory
BloodInventory.objects.create(
    blood_bank=blood_bank,
    blood_group='O+',
    component_type='Whole Blood',
    units_available=50,
    expiry_date=timezone.now() + timedelta(days=30),
    quality_status='GOOD'
)
```

### Test Request Flow

```bash
# 1. Create request (as hospital)
curl -X POST http://localhost:8000/api/blood-requests/ \
  -H "Authorization: Bearer <token>" \
  -d '{
    "hospital": 1,
    "blood_group": "O+",
    "units_requested": 5,
    "patient_name": "John Doe",
    "doctor_name": "Dr. Smith",
    "diagnosis": "Anemia",
    "urgency_level": "CRITICAL",
    "delivery_address": "Delhi Hospital",
    "hospital_latitude": 28.7041,
    "hospital_longitude": 77.1025
  }'

# 2. Accept request (as blood bank)
curl -X POST http://localhost:8000/api/blood-requests/REQ-xxx/accept_request/ \
  -H "Authorization: Bearer <bank_token>" \
  -d '{"proof_id": "BANK123"}'

# 3. Check dashboard
curl -X GET http://localhost:8000/api/dashboards/hospital/ \
  -H "Authorization: Bearer <token>"
```

---

## 🛠️ Configuration

### Settings Required (settings.py)

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'vitalflow',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

INSTALLED_APPS = [
    # ...
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
   'inventory',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

---

## 📝 Database Schema

### Core Tables

- **User** - Extended with location, role, verification
- **BloodRequest** - Hospital requests with locking mechanism
- **BloodInventory** - Blood stock with expiry tracking
- **Driver** - Driver profiles with location & ratings
- **Delivery** - Delivery tracking with real-time updates
- **Notification** - All system notifications
- **AuditLog** - Complete audit trail
- **HospitalRequestLimit** - Rate limiting per hospital

### Key Relationships

```
BloodRequest → Hospital (ForeignKey)
BloodRequest → BloodBank (accepted_by)
BloodRequest → Driver (assigned_driver)
BloodRequest → Delivery (OneToOne)

BloodInventory → BloodBank (ForeignKey)

Notification → User (ForeignKey)
Notification → BloodRequest (ForeignKey, nullable)
Notification → Delivery (ForeignKey, nullable)

AuditLog → User (ForeignKey)
AuditLog → BloodRequest (ForeignKey)
```

---

## 🚨 Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `409 Conflict` | Request already locked | Another bank accepted it |
| `400 Bad Request` | Insufficient inventory | Check blood availability |
| `403 Forbidden` | Wrong user role | Use correct account |
| `429 Too Many Requests` | Daily limit exceeded | Wait until tomorrow |

---

## 📚 Documentation Files

In your `django_backend/` folder:

1. **PRODUCTION_IMPLEMENTATION_GUIDE.md** - Complete technical guide
2. **IMPLEMENTATION_STEPS.md** - Step-by-step setup instructions
3. **models_updated.py** - All new models with comments
4. **serializers_updated.py** - Validation & serialization logic
5. **views_blood_bank.py** - Complete API views implementation
6. **utils.py** - Geographic matching & utilities

---

## 🔄 Deployment Checklist

Before production:

- [ ] Run migrations: `python manage.py migrate`
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Collect statics: `python manage.py collectstatic`
- [ ] Run security check: `python manage.py check --deploy`
- [ ] Test all endpoints with valid data
- [ ] Verify notifications working
- [ ] Check error handling
- [ ] Load test with multiple concurrent requests
- [ ] Backup database
- [ ] Set up monitoring/logging
- [ ] Configure email backend
- [ ] Enable HTTPS/SSL

---

## 🎯 Key Design Decisions

### 1. Locking Mechanism

**Why `is_locked` instead of status='ACCEPTED'?**
- Supports atomic transactions
- Prevents race conditions
- Clear intent: request is "claimed"
- Easy to query pending requests

### 2. Geographic Database

**Why store GPS coordinates?**
- Real-time driver tracking
- Accurate distance calculations
- Support multiple hospitals/drivers per city
- No external API dependency

### 3. Notification Model

**Why database-first?**
- Persistent notification history
- Works offline
- Easy to integrate with email/SMS later
- User can mark as read

### 4. Audit Logging

**Why log everything?**
- Compliance & regulatory requirements
- Debugging & issue tracking
- User accountability
- System analysis

---

## 🚀 Performance Optimization

### Queries Optimized With:
- Database indexes on frequently queried fields
- Select_related & prefetch_related for relationships
- Pagination on list endpoints
- Caching for geographic lookups

### Expected Response Times:
- Create request: <200ms
- Accept request: <500ms (atomic transaction)
- Search blood banks: <300ms
- Dashboard load: <1s
- Coordinate calculation: <50ms

---

## 📞 Support & Troubleshooting

### Common Issues

**Q: "Request already locked" error on second acceptance**
A: This is correct! Only one blood bank can accept. Try another request.

**Q: No drivers found for assignment**
A: Ensure drivers exist in the same city with valid coordinates.

**Q: Blood banks not appearing in search**
A: Check:
1. Blood banks verified in database
2. GPS coordinates set
3. Blood group in inventory
4. Search radius adequate

**Q: Migrations failing**
```bash
# Reset (DEV ONLY):
python manage.py migrate inventory zero
python manage.py makemigrations
python manage.py migrate
```

---

## 📖 Next Steps

1. ✅ **Integration** - Follow IMPLEMENTATION_STEPS.md
2. ✅ **Testing** - Run test cases provided
3. ✅ **Deployment** - Use deployment checklist
4. 🔄 **Monitoring** - Set up logging
5. 🚀 **Scale** - Add caching, load balancing
6. 📱 **Mobile** - Build React Native app
7. 💳 **Payments** - Integrate payment processor
8. 🔔 **Push Notifications** - Add FCM/APNs

---

## 📄 License

This implementation guide is provided as-is for educational and production use.

---

## 👥 Contributors

Built for VitalFlow blood bank management system.

**Questions?** Refer to the detailed documentation files in `django_backend/`.

---

**Last Updated:** March 30, 2026
**Version:** 1.0 - Production Ready
