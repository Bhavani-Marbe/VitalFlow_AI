# Troubleshooting Guide - Blood Bank Management System

## Common Issues and Solutions

---

## 🔴 CRITICAL ERRORS

### Error 1: "Module not found" or "ImportError"

**Symptoms:**
```
ModuleNotFoundError: No module named 'rest_framework'
ImportError: cannot import name 'serializers'
```

**Cause:** Django dependencies not installed or incorrect Python environment

**Solution:**
```bash
# 1. Navigate to django_backend directory
cd django_backend

# 2. Activate virtual environment
# On Windows:
.\.venv\Scripts\activate

# On Mac/Linux:
source .venv/bin/activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Verify installation
python -c "import rest_framework; print('DRF OK')"
python -c "import corsheaders; print('CORS OK')"

# 5. Try running server again
python manage.py runserver
```

**Prevention:** Always ensure virtual environment is activated before running Python

---

### Error 2: Database Migration Error

**Symptoms:**
```
django.core.exceptions.ProgrammingError: relation "inventory_bloodrequest" does not exist
relation "inventory_bloodinventory" does not exist
```

**Cause:** Models created but database migrations not applied

**Solution:**
```bash
cd django_backend

# 1. Create migrations for new models
python manage.py makemigrations inventory

# 2. Check migration files created
ls inventory/migrations/  # Should show new numbered files

# 3. Apply migrations
python manage.py migrate

# 4. Verify tables exist
python manage.py dbshell
# Then in SQL:
# SQLite: .tables
# PostgreSQL: \dt

# 5. If migration fails due to conflicts
python manage.py migrate --fake-initial inventory
```

**Prevention:** Always run migrations after adding new models

---

### Error 3: "is_locked" Field Not Found

**Symptoms:**
```
OperationalError: no such column: inventory_bloodrequest.is_locked
AttributeError: 'BloodRequest' object has no attribute 'is_locked'
```

**Cause:** Using old BloodRequest model without `is_locked` field

**Solution:**
```bash
# 1. Check current models
grep -n "is_locked" django_backend/inventory/models.py

# 2. If not present, update models.py with new BloodRequest model from models_updated.py

# 3. Delete old migrations (if safe in development)
cd inventory/migrations/
rm 0003_*.py (or the migrations that added BloodRequest)

# 4. Recreate migrations
cd ../..
python manage.py makemigrations inventory

# 5. Apply new migrations
python manage.py migrate inventory --fake-initial
python manage.py migrate

# For production with existing data
python manage.py makemigrations --no-verify  # Add field without data check
python manage.py migrate
python manage.py shell
# >>> from inventory.models import BloodRequest
# >>> BloodRequest.objects.all().update(is_locked=False)
```

**Key Code (BloodRequest model):**
```python
class BloodRequest(models.Model):
    is_locked = models.BooleanField(default=False)  # CRITICAL field
```

---

### Error 4: Authentication Token Not Working

**Symptoms:**
```
401 Unauthorized
{
  "detail": "Authentication credentials were not provided."
}
```

**Cause:** Token missing, expired, or malformed

**Solution:**
```bash
# 1. Install required package
pip install djangorestframework-simplejwt

# 2. Add to INSTALLED_APPS in settings.py
INSTALLED_APPS = [
    ...
    'rest_framework_simplejwt',
]

# 3. Configure JWT in settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# 4. Add to urls.py
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# 5. Get token
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'

# 6. Use token in requests
curl -X GET http://localhost:8000/api/blood-requests/ \
  -H "Authorization: Bearer <your_token>"
```

---

### Error 5: CORS Error

**Symptoms:**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/...' from origin 
'http://localhost:3000' has been blocked by CORS policy
```

**Cause:** CORS headers not configured

**Solution:**
```bash
# 1. Install package
pip install django-cors-headers

# 2. Add to INSTALLED_APPS in settings.py
INSTALLED_APPS = [
    'corsheaders',
    ...
]

# 3. Add to MIDDLEWARE in settings.py (at TOP before other middleware)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add at top
    'django.middleware.security.SecurityMiddleware',
    ...
]

# 4. Add CORS configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",  # Vite default port
]

CORS_ALLOW_CREDENTIALS = True

# 5. Restart Django server
python manage.py runserver
```

---

## 🟠 FUNCTIONAL ERRORS

### Error 6: Duplicate Request Acceptance (is_locked Not Working)

**Symptoms:**
Multiple blood banks can accept same request (should only allow first)

**Cause:** Atomic transaction not properly implemented or is_locked not checked

**Solution:**
```python
# Verify views_blood_bank.py accept_request() method has this:

from django.db import transaction

@action(detail=True, methods=['post'])
def accept_request(self, request, request_id=None):
    blood_request = self.get_object()
    
    # CRITICAL: Check if already locked
    if blood_request.is_locked:
        return Response(
            {'error': 'This request has already been accepted by another blood bank'},
            status=status.HTTP_409_CONFLICT
        )
    
    # CRITICAL: Use atomic transaction
    with transaction.atomic():
        # 1. Lock the request
        blood_request.is_locked = True
        blood_request.accepted_by = request.user
        blood_request.status = 'ACCEPTED'
        blood_request.accepted_at = timezone.now()
        blood_request.save()
        
        # 2. Deduct inventory atomically
        inventory = BloodInventory.objects.select_for_update().get(...)
        
        # 3. All other updates...
```

**Test:**
```bash
# Get request ID
REQUEST_ID="REQ-2026-0001"

# Accept with bank 1
curl -X POST http://localhost:8000/api/blood-requests/$REQUEST_ID/accept_request/ \
  -H "Authorization: Bearer $BANK1_TOKEN" \
  -d '{"proof_id":"BANK1"}'
# Should return 200 ACCEPTED

# Accept same request with bank 2
curl -X POST http://localhost:8000/api/blood-requests/$REQUEST_ID/accept_request/ \
  -H "Authorization: Bearer $BANK2_TOKEN" \
  -d '{"proof_id":"BANK2"}'
# Should return 409 Conflict
```

---

### Error 7: Geographic Search Returns Nothing

**Symptoms:**
```
{
  "results_count": 0,
  "banks": []
}
```

**Cause:** Blood banks too far away or search radius too small

**Solution:**
```bash
# 1. Verify blood banks have GPS coordinates
python manage.py shell
>>> from vaidyopachar.models import User  # Or your model
>>> from inventory.models import BloodBank
>>> users = User.objects.filter(role='BLOOD_BANK')
>>> for u in users:
...     print(f"{u.username}: {u.latitude}, {u.longitude}")

# 2. If missing, update them
python manage.py shell
>>> user = User.objects.get(username='blood_bank_delhi')
>>> user.latitude = 28.7050
>>> user.longitude = 77.1030
>>> user.save()

# 3. Use larger radius in search
curl -X GET "http://localhost:8000/api/search/nearest-blood-banks/?latitude=28.7041&longitude=77.1025&radius_km=50" \
  -H "Authorization: Bearer $TOKEN"

# 4. Check Haversine calculation
python manage.py shell
>>> from inventory.utils import calculate_distance
>>> distance = calculate_distance(28.7041, 77.1025, 28.7050, 77.1030)
>>> print(f"Distance: {distance} km")  # Should be ~1.2 km
```

**Function Verification:**
```python
# In utils.py, ensure this function exists:
def calculate_distance(lat1, lon1, lat2, lon2):
    """Haversine formula"""
    import math
    R = 6371  # Earth radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad)*math.cos(lat2_rad)*math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

# Test: Distance from Delhi to Gurgaon should be ~25 km
>>> calculate_distance(28.7041, 77.1025, 28.4595, 77.0266)
```

---

### Error 8: Hospital Daily Request Limit Not Enforced

**Symptoms:**
Hospital can create more than 5 requests per day

**Cause:** HospitalRequestLimit model not populated or validator not checking

**Solution:**
```python
# 1. Verify model exists in models.py
class HospitalRequestLimit(models.Model):
    hospital = models.OneToOneField(User, on_delete=models.CASCADE)
    daily_request_limit = models.IntegerField(default=5)
    max_units_per_request = models.IntegerField(default=10)

# 2. Create limits for all hospitals
python manage.py shell
>>> from vaidyopachar.models import User
>>> from inventory.models import HospitalRequestLimit
>>> hospitals = User.objects.filter(role='HOSPITAL')
>>> for hospital in hospitals:
...     HospitalRequestLimit.objects.get_or_create(
...         hospital=hospital,
...         defaults={'daily_request_limit': 5, 'max_units_per_request': 10}
...     )

# 3. Verify BloodRequestSerializer has validation
class BloodRequestSerializer(serializers.ModelSerializer):
    def validate(self, data):
        hospital = data['hospital']
        
        # Check daily limit
        today = timezone.now().date()
        todays_count = BloodRequest.objects.filter(
            hospital=hospital,
            requested_at__date=today
        ).count()
        
        limit = HospitalRequestLimit.objects.get(hospital=hospital)
        
        if todays_count >= limit.daily_request_limit:
            raise serializers.ValidationError(
                f"Daily request limit ({limit.daily_request_limit}) exceeded"
            )
        
        # Check units per request
        if data['units_requested'] > limit.max_units_per_request:
            raise serializers.ValidationError(
                f"Cannot request more than {limit.max_units_per_request} units"
            )
        
        return data
```

---

### Error 9: AI Module Integration Not Working

**Symptoms:**
```
ModuleNotFoundError: No module named 'ai_models'
Anomaly detection function returns None
```

**Cause:** AI module path incorrect or not properly integrated

**Solution:**
```bash
# 1. Verify ai_models files exist
ls ../ai_models/
# Should show: anomaly_detection.py, matching_intelligence.py, etc.

# 2. Add parent directory to Python path in views_blood_bank.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 3. Import AI modules
from ai_models.anomaly_detection import detect_anomalies
from ai_models.matching_intelligence import find_match
from ai_models.demand_forecast import predict_demand

# 4. Verify AI module functions
python manage.py shell
>>> from ai_models.anomaly_detection import detect_anomalies
>>> result = detect_anomalies({
...     'patient_age': 5,  # If < 10, flag
...     'units_requested': 30  # If > 20, flag
... })
>>> print(result)

# 5. If AI modules missing, create stub implementations
# In ai_models/anomaly_detection.py:
def detect_anomalies(request_data):
    """Stub implementation"""
    flags = []
    if request_data.get('patient_age', 0) < 1 or request_data.get('patient_age', 0) > 100:
        flags.append("Unusual patient age")
    if request_data.get('units_requested', 0) > 50:
        flags.append("Unusually large request")
    return bool(flags), " | ".join(flags) if flags else None
```

---

## 🟡 PERFORMANCE ISSUES

### Error 10: Slow Database Queries

**Symptoms:**
```
Django request slow (>1 second)
Database queries taking long time
```

**Cause:** Missing database indexes or inefficient queries (N+1 problem)

**Solution:**
```python
# 1. Add database indexes to models
class BloodRequest(models.Model):
    status = models.CharField(max_length=20, db_index=True)
    urgency_level = models.CharField(max_index=True)
    is_locked = models.BooleanField(db_index=True)
    hospital = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    requested_at = models.DateTimeField(db_index=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['status', 'urgency_level']),
            models.Index(fields=['hospital', 'requested_at']),
        ]

# 2. Use select_related/prefetch_related
# Bad:
blood_requests = BloodRequest.objects.all()
for req in blood_requests:
    print(req.hospital.name)  # Database query per row!

# Good:
blood_requests = BloodRequest.objects.select_related('hospital').all()
for req in blood_requests:
    print(req.hospital.name)  # No additional queries

# 3. Paginate large queries
# In views_blood_bank.py:
class BloodRequestViewSet(viewsets.ModelViewSet):
    pagination_class = PageNumberPagination
    queryset = BloodRequest.objects.select_related('hospital', 'accepted_by')

# 4. Use only() to fetch specific fields
BloodRequest.objects.only('request_id', 'blood_group', 'status')

# 5. Cache frequently accessed data
from django.views.decorators.cache import cache_page
@cache_page(60)  # Cache for 60 seconds
def get_inventory(request):
    ...
```

---

### Error 11: Memory Issues with Large Requests

**Symptoms:**
```
MemoryError when processing bulk operations
timeout on large searches
```

**Solution:**
```python
# Use iterator() for large querysets
for blood_bank in BloodBank.objects.iterator(chunk_size=100):
    process(blood_bank)

# Use bulk_create for mass inserts
notifications = [
    Notification(...),
    Notification(...),
    # ... many more
]
Notification.objects.bulk_create(notifications, batch_size=100)

# Use select_for_update() carefully
with transaction.atomic():
    bloodrequest = BloodRequest.objects.select_for_update().get(id=1)
    # Process safely
```

---

## 🔵 DATA VALIDATION ERRORS

### Error 12: Invalid Blood Group

**Symptoms:**
```
400 Bad Request
Invalid choice for blood_group field
```

**Cause:** Blood group value not in choices

**Solution:**
```python
# In models.py, ensure valid choices:
BLOOD_GROUPS = [
    ('O+', 'O+'),
    ('O-', 'O-'),
    ('A+', 'A+'),
    ('A-', 'A-'),
    ('B+', 'B+'),
    ('B-', 'B-'),
    ('AB+', 'AB+'),
    ('AB-', 'AB-'),
]

class BloodRequest(models.Model):
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUPS)

# Valid values: O+, O-, A+, A-, B+, B-, AB+, AB-
# NOT: "O Positive", "A/B+", etc.
```

---

### Error 13: Pagination Not Working

**Symptoms:**
```
No pagination in list responses
Cannot get page 2
```

**Cause:** Pagination class not configured

**Solution:**
```python
# In settings.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# Or custom pagination per viewset
from rest_framework.pagination import PageNumberPagination

class BloodRequestPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class BloodRequestViewSet(viewsets.ModelViewSet):
    pagination_class = BloodRequestPagination

# Usage:
curl -X GET "http://localhost:8000/api/blood-requests/?page=2&page_size=10"
```

---

## 🟣 PERMISSION ERRORS

### Error 14: "You do not have permission to perform this action"

**Symptoms:**
```
403 Forbidden
"You do not have permission to perform this action"
```

**Cause:** Role-based access control blocking request

**Solution:**
```python
# Verify role in user object
python manage.py shell
>>> from vaidyopachar.models import User
>>> user = User.objects.first()
>>> print(user.role)  # Should be: HOSPITAL, BLOOD_BANK, DRIVER, or ADMIN

# Ensure view checks correct role
# In views_blood_bank.py:
@action(detail=True, methods=['post'])
def accept_request(self, request, pk=None):
    if request.user.role != 'BLOOD_BANK':
        return Response(
            {'error': 'Only blood banks can accept requests'},
            status=status.HTTP_403_FORBIDDEN
        )

# Create users with correct roles
python manage.py createsuperuser  # Creates staff user first
# Then in shell:
>>> from vaidyopachar.models import User
>>> user = User.objects.create_user(
...     username='hospital_user',
...     password='pass123',
...     role='HOSPITAL'
... )
```

---

## 🔞 TESTING CHECKLIST

Use this checklist to verify system is working:

📋 **Setup Tests:**
- [ ] Django server running on port 8000
- [ ] Frontend server running on port 3000
- [ ] Database migrations completed
- [ ] Test users created (hospital, blood_bank, driver)
- [ ] JWT tokens can be obtained

📋 **Core Functionality:**
- [ ] Hospital can create blood request
- [ ] Blood bank can see pending requests
- [ ] Blood bank can accept request
- [ ] Request becomes locked (is_locked=true)
- [ ] Other blood banks cannot accept locked request (409 error)
- [ ] Status can be updated (PENDING → ACCEPTED → IN_TRANSIT → DELIVERED)
- [ ] Driver can be assigned automatically

📋 **Inventory Management:**
- [ ] Blood bank can add inventory
- [ ] Inventory appears in searches
- [ ] Expiry alerts show items expiring in 7 days
- [ ] Inventory units decrease when request accepted

📋 **Location Services:**
- [ ] Users have GPS coordinates
- [ ] Geographic search returns nearby blood banks
- [ ] Search expands radius if insufficient results (guarantees 2-3 minimum)
- [ ] Distance calculations are accurate

📋 **Notifications:**
- [ ] Notifications created when request accepted
- [ ] Unread notifications retrievable
- [ ] Notifications can be marked as read
- [ ] Different notification types created (REQUEST_ACCEPTED, DRIVER_ASSIGNED, etc.)

📋 **Dashboards:**
- [ ] Blood bank dashboard shows inventory summary
- [ ] Hospital dashboard shows request history and nearby banks
- [ ] Counts are accurate

📋 **Error Handling:**
- [ ] Invalid blood group rejected
- [ ] Duplicate requests prevented (409 error)
- [ ] Rate limits enforced (5 daily max)
- [ ] Unit limits enforced (10 units max per request)
- [ ] Authentication required (401 if no token)
- [ ] Authorization enforced (403 for wrong role)

---

## 📞 Getting Help

### Check Logs

```bash
# Django console output
# Shows most errors immediately when running server

# Database logs
python manage.py dbshell
.log  # SQLite
select * from pg_stat_statements;  # PostgreSQL

# Check specific request
python manage.py shell
>>> from inventory.models import BloodRequest
>>> req = BloodRequest.objects.get(request_id='REQ-2026-0001')
>>> print(req.__dict__)
```

### Debug Print Statements

```python
# Add temporary debugging
import logging
logger = logging.getLogger(__name__)

logger.debug(f"Blood banks found: {len(blood_banks)}")
logger.error(f"Failed to accept request: {str(e)}")

# In settings.py enable debug logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

### Common Commands for Debugging

```bash
# Check Python version
python --version

# List installed packages
pip list | grep django

# Check project structure
tree VitalFlow_ai/django_backend/

# Run specific tests
python manage.py test inventory.tests

# Reset database (careful!)
python manage.py flush
python manage.py migrate
python manage.py loaddata initial_data.json

# Test imports
python -c "from inventory.models import BloodRequest; print('OK')"
python -c "from inventory.utils import calculate_distance; print('OK')"
```

---

**Last Updated:** March 30, 2026
**Version:** 1.0
**Status:** Production Ready
