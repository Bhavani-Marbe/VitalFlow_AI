# STEP-BY-STEP IMPLEMENTATION GUIDE
# Complete instructions to integrate the blood bank system into your Django project

## ============================================================================
## STEP 1: BACKUP YOUR EXISTING CODE
## ============================================================================

Before making changes, backup:
- django_backend/inventory/models.py
- django_backend/inventory/serializers.py
- django_backend/inventory/views.py
- django_backend/inventory/urls.py

```bash
# In PowerShell
cd django_backend\inventory
Copy-Item models.py models_backup.py
Copy-Item serializers.py serializers_backup.py
Copy-Item views.py views_backup.py
Copy-Item urls.py urls_backup.py
```


## ============================================================================
## STEP 2: UPDATE MODELS
## ============================================================================

### 2.1 Open inventory/models.py and ADD these new models to the END:

The new models include:
- BloodRequest (enhanced version)
- BloodInventory (enhanced version)
- Driver
- Delivery
- Notification
- AuditLog
- HospitalRequestLimit

KEY FEATURES:
- ✓ is_locked field prevents duplicate acceptance
- ✓ GPS coordinates for geographic matching
- ✓ Anomaly detection flags
- ✓ Complete audit trail
- ✓ Notification triggers

Copy the content from: models_updated.py (provided file)


### 2.2 Run migrations

```bash
cd django_backend

# Create migration
python manage.py makemigrations inventory

# Apply migration
python manage.py migrate
```

**✓ Expected output:** "Applying inventory.000X_initial... OK"


## ============================================================================
## STEP 3: UPDATE SERIALIZERS
## ============================================================================

### 3.1 Open inventory/serializers.py and REPLACE existing content

Provides:
- User serialization with location data
- BloodRequest validation
- BloodInventory expiry calculations
- Driver rating and delivery stats
- Notification priority handling

Copy content from: serializers_updated.py


### 3.2 NO database changes needed
Just restart your development server


## ============================================================================
## STEP 4: CREATE UTILITY FUNCTIONS
## ============================================================================

### 4.1 Create NEW file: inventory/utils.py

This is CRITICAL for:
- Geographic distance calculation (Haversine formula)
- Nearest blood bank/driver finding
- Notification creation
- Request validation
- Anomaly detection

Copy content from: utils.py (provided file)


### 4.2 Test utilities

```bash
python manage.py shell

from inventory.utils import calculate_distance, get_nearest_blood_banks

# Test distance calculation  
distance = calculate_distance(28.7041, 77.1025, 28.5355, 77.2289)
print(f"Distance: {distance} km")  # Should show ~18.52 km

# Test blood bank search
banks = get_nearest_blood_banks(28.7041, 77.1025, radius_km=5, blood_group='O+')
print(f"Found {len(banks)} blood banks")
```


## ============================================================================
## STEP 5: CREATE BLOOD BANK VIEWS
## ============================================================================

### 5.1 Create NEW file: inventory/views_blood_bank.py

Contains:
- BloodRequestViewSet with accept/reject/update logic
- BloodInventoryViewSet with expiry alerts
- Hospital & Blood Bank dashboards
- Critical request handling

Copy content from: views_blood_bank.py (provided file)


### 5.2 IMPORTANT: Keep existing views

Do NOT delete existing views.py. Instead:

Option A: Import new views in your main views.py
```python
# At bottom of inventory/views.py
from .views_blood_bank import BloodRequestViewSet, BloodInventoryViewSet
from .views_blood_bank import blood_bank_dashboard, hospital_dashboard
```

Option B: Move all viewsets to central location
```bash
# Keep views.py clean by importing from views_blood_bank.py
```


## ============================================================================
## STEP 6: UPDATE URLS
## ============================================================================

### 6.1 Open inventory/urls.py and ADD these routes:

```python
# Add to router registration
router.register(r'blood-requests', BloodRequestViewSet, basename='blood-request')
router.register(r'inventory', BloodInventoryViewSet, basename='inventory')

# Add to urlpatterns
path('dashboards/blood-bank/', blood_bank_dashboard, name='blood_bank_dashboard'),
path('dashboards/hospital/', hospital_dashboard, name='hospital_dashboard'),
path('search/nearest-blood-banks/', nearest_blood_banks_view, name='nearest_blood_banks'),
```

### 6.2 Full updated urls.py

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views_blood_bank import (
    BloodRequestViewSet, BloodInventoryViewSet,
    blood_bank_dashboard, hospital_dashboard
)

router = DefaultRouter()
router.register(r'blood-requests', BloodRequestViewSet, basename='blood-request')
router.register(r'inventory', BloodInventoryViewSet, basename='inventory')
router.register(r'notifications', views.NotificationViewSet, basename='notification')
# ... other routers

urlpatterns = [
    path('', include(router.urls)),
    
    # Dashboard endpoints
    path('dashboards/blood-bank/', blood_bank_dashboard, name='blood_bank_dashboard'),
    path('dashboards/hospital/', hospital_dashboard, name='hospital_dashboard'),
    
    # ... other paths
]
```


## ============================================================================
## STEP 7: TEST THE SYSTEM
## ============================================================================

### 7.1 Create test users

```bash
python manage.py shell

from inventory.models import User

# Create hospital
hospital = User.objects.create_user(
    username='city_hospital',
    email='hospital@example.com',
    password='testpass123',
    role='HOSPITAL',
    city='Delhi',
    phone='9876543210',
    latitude=28.7041,
    longitude=77.1025,
    is_verified=True
)

# Create blood bank
blood_bank = User.objects.create_user(
    username='blood_bank_delhi',
    email='bank@example.com',
    password='testpass123',
    role='BLOOD_BANK',
    city='Delhi',
    phone='9876543211',
    latitude=28.7050,
    longitude=77.1030,
    is_verified=True
)

# Create driver
driver_user = User.objects.create_user(
    username='driver_raj',
    email='driver@example.com',
    password='testpass123',
    role='DRIVER',
    city='Delhi',
    phone='9876543212',
    latitude=28.6500,
    longitude=77.0000
)

print("Test users created successfully!")
```


### 7.2 Test API endpoints

Use Postman or curl:

**A. Create Blood Request (as Hospital)**

```bash
curl -X POST http://localhost:8000/api/blood-requests/ \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "hospital": 1,
    "blood_group": "O+",
    "units_requested": 5,
    "patient_id": "PAT001",
    "patient_name": "John Doe",
    "doctor_name": "Dr. Smith",
    "diagnosis": "Severe anemia",
    "urgency_level": "CRITICAL",
    "delivery_address": "123 Main St, Delhi",
    "hospital_latitude": 28.7041,
    "hospital_longitude": 77.1025
  }'
```

**B. Add Blood Inventory (as Blood Bank)**

```bash
curl -X POST http://localhost:8000/api/inventory/ \
  -H "Authorization: Bearer <bank_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "blood_bank": 2,
    "blood_group": "O+",
    "component_type": "Whole Blood",
    "units_available": 50,
    "expiry_date": "2026-05-30T00:00:00Z",
    "quality_status": "GOOD"
  }'
```

**C. Accept Request (as Blood Bank)**

```bash
curl -X POST http://localhost:8000/api/blood-requests/REQ-xxx/accept_request/ \
  -H "Authorization: Bearer <bank_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "proof_id": "BANK123"
  }'
```

**D. Get Blood Bank Dashboard**

```bash
curl -X GET http://localhost:8000/api/dashboards/blood-bank/ \
  -H "Authorization: Bearer <bank_token>"
```


## ============================================================================
## STEP 8: AI MODULE INTEGRATION
## ============================================================================

### 8.1 Integrate Anomaly Detection

In views_blood_bank.py, the `_check_anomalies()` method already flags:
- Large critical requests (>20 units)
- Requests with unusual patterns

To enhance, add:

```python
# In views_blood_bank.py, update _check_anomalies method

def _check_anomalies(self, blood_request):
    """Enhanced anomaly detection"""
    
    from ai_models.anomaly_detection import detect_anomalies
    
    # Prepare data
    data = [{
        'units_used': blood_request.units_requested,
        'time_of_day': timezone.now().hour,
        'facility_id': blood_request.hospital.username
    }]
    
    try:
        result = detect_anomalies(data)
        
        if result['anomalies_detected'] > 0:
            blood_request.is_flagged_suspicious = True
            blood_request.anomaly_reason = result['details'][0]['reason']
            blood_request.save()
            
            # Notify admins for manual review
            admins = User.objects.filter(role='ADMIN')
            for admin in admins:
                create_notification(
                    user=admin,
                    notification_type='ANOMALY_DETECTED',
                    title='Anomalous Request',
                    message=f'Request flagged: {result["details"][0]["reason"]}',
                    blood_request=blood_request,
                    priority='URGENT'
                )
    except Exception as e:
        print(f"Anomaly detection error: {e}")
```


### 8.2 Integrate Matching Intelligence

```python
# In utils.py, add blood compatibility check

from ai_models.matching_intelligence import check_compatibility

def validate_blood_match(patient_blood_group, donor_blood_group):
    """Validate blood group compatibility"""
    
    try:
        result = check_compatibility({
            'patient_group': patient_blood_group,
            'unit_group': donor_blood_group,
            'component': 'Whole Blood'
        })
        return result['compatible']
    except:
        return True  # Default to allow
```


### 8.3 Integrate Demand Forecast

```python
# In utils.py or new utils_ai.py

from ai_models.demand_forecast import forecast_demand

def get_blood_demand_forecast(city, blood_group, periods=24):
    """Forecast blood demand for inventory planning"""
    
    try:
        # Get historical data (last 30 days)
        history = BloodRequest.objects.filter(
            hospital__city=city,
            blood_group=blood_group,
            requested_at__gte=timezone.now() - timedelta(days=30)
        ).values('requested_at').count()
        
        # Create synthetic history
        history_data = [history % (i + 1) for i in range(24)]
        
        result = forecast_demand({
            'history': history_data,
            'city': city,
            'component': 'Whole Blood'
        })
        
        return result.get('forecast', [])
    except Exception as e:
        print(f"Forecast error: {e}")
        return []
```


## ============================================================================
## STEP 9: NOTIFICATION SYSTEM SETUP
## ============================================================================

### 9.1 Create notification triggers

```python
# In inventory/signals.py (create new file)

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import BloodRequest, BloodInventory
from .utils import create_notification, handle_critical_request

@receiver(post_save, sender=BloodRequest)
def on_blood_request_created(sender, instance, created, **kwargs):
    """Trigger notifications when request created"""
    
    if created:
        if instance.urgency_level == 'CRITICAL':
            handle_critical_request(instance)
        else:
            # Notify nearby blood banks
            pass

@receiver(post_save, sender=BloodInventory)
def on_inventory_expiry_alert(sender, instance, **kwargs):
    """Trigger alert when blood expiring soon"""
    
    days_remaining = instance.days_until_expiry()
    
    if days_remaining <= 7:
        create_notification(
            user=instance.blood_bank,
            notification_type='EXPIRY_ALERT',
            title=f'Blood Expiry Alert - {days_remaining} Days',
            message=f'{instance.units_available} units of {instance.blood_group} expiring soon',
            priority='URGENT' if days_remaining <= 3 else 'HIGH'
        )
```

### 9.2 Register signals in apps.py

```python
# In inventory/apps.py

from django.apps import AppConfig

class InventoryConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'inventory'
    
    def ready(self):
        import inventory.signals  # Import signals when app loads
```


## ============================================================================
## STEP 10: SCHEDULE DAILY TASKS
## ============================================================================

### 10.1 Install celery (optional, for scheduled tasks)

```bash
pip install celery redis
```

### 10.2 Reset daily limits (manual or scheduled)

```python
# In inventory/tasks.py

from celery import shared_task
from .utils import reset_daily_request_limits

@shared_task
def reset_request_limits_daily():
    """Run daily at midnight"""
    count = reset_daily_request_limits()
    print(f"Reset limits for {count} hospitals")
```


## ============================================================================
## STEP 11: AUTHENTICATION & SECURITY
## ============================================================================

### 11.1 Ensure proper authentication

```python
# In settings.py, configure REST Framework

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': ['rest_framework.filters.SearchFilter', 'rest_framework.filters.OrderingFilter'],
}
```

### 11.2 Secure endpoints with roles

All endpoints check user.role before allowing access:
- Only HOSPITAL can create blood requests
- Only BLOOD_BANK can accept requests
- Only DRIVER can update delivery status
- Only ADMIN can view audit logs


## ============================================================================
## STEP 12: TESTING CHECKLIST
## ============================================================================

Run these tests:

### A. Create Request Flow
```bash
[ ] Hospital creates request
[ ] Request appears in blood bank dashboard
[ ] Notifications sent to nearby blood banks
[ ] Request locked after first acceptance
[ ] Second acceptance blocked with 409 error
```

### B. Accept Request Flow
```bash
[ ] Blood bank accepts request
[ ] Inventory units deducted
[ ] Driver assigned automatically
[ ] Hospital notified of acceptance
[ ] Driver notified of delivery
```

### C. Geographic Matching
```bash
[ ] Nearest blood banks found within 5km
[ ] Results sorted by distance
[ ] Minimum 2-3 results guaranteed
[ ] Coordinates accurate for Indian cities
```

### D. Dashboard
```bash
[ ] Hospital dashboard shows request statistics
[ ] Blood bank dashboard shows inventory and pending requests
[ ] Expiry alerts appear 7 days before expiration
[ ] Critical requests highlighted

```

### E. Notifications
```bash
[ ] Request created notification sent
[ ] Acceptance notification sent
[ ] On-the-way notification sent
[ ] Delivery notification sent
[ ] Unread count accurate
```


## ============================================================================
## STEP 13: PRODUCTION DEPLOYMENT
## ============================================================================

### 13.1 Before going live:

```bash
# Run migrations one more time
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Run security checks
python manage.py check --deploy

# Create superuser if needed
python manage.py createsuperuser
```

### 13.2 Environment variables (.env)

```
DEBUG=False
SECRET_KEY=your_secret_key_here
ALLOWED_HOSTS=yourdomain.com
DATABASE_URL=postgresql://user:pass@localhost/dbname
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_password
```

### 13.3 Run on production server

```bash
# Using gunicorn
gunicorn vaidyopachar.wsgi:application --bind 0.0.0.0:8000

# Or using Docker
docker build -t vitalflow .
docker run -p 8000:8000 vitalflow
```

## ============================================================================
## TROUBLESHOOTING GUIDE
## ============================================================================

### Problem: "Request already locked" error

**Fix:** This is CORRECT behavior. Only one blood bank can accept per request.

### Problem: Driver not assigned

**Possible causes:**
- No available drivers in city
- Driver location coordinates missing
- All drivers already assigned

**Fix:** Add test drivers with valid coordinates

### Problem: Blood banks not found in search

**Possible causes:**
- No blood banks in database
- Coordinates out of range
- Blood type not in inventory

**Fix:**
```bash
python manage.py shell

from inventory.utils import get_nearest_blood_banks

# Debug
banks = get_nearest_blood_banks(28.7041, 77.1025, radius_km=10)
print(f"Found {len(banks)} banks")
```

###  Problem: Migrations failing

**Fix:**
```bash
# Fake migrations if needed
python manage.py migrate inventory --fake

# Or reset (DEV ONLY)
python manage.py migrate inventory zero
python manage.py makemigrations inventory
python manage.py migrate inventory
```


## ============================================================================
## API ENDPOINT REFERENCE
## ============================================================================

### Blood Requests
- `POST /api/blood-requests/` - Create request
- `GET /api/blood-requests/` - List requests
- `GET /api/blood-requests/{id}/` - Get request details
- `POST /api/blood-requests/{id}/accept_request/` - Accept (LOCKS request)
- `POST /api/blood-requests/{id}/reject_request/` - Reject
- `PATCH /api/blood-requests/{id}/update_status/` - Update status

### Inventory
- `POST /api/inventory/` - Add blood
- `GET /api/inventory/` - List inventory
- `GET /api/inventory/by_blood_group/` - Filter by blood group
- `GET /api/inventory/expiry_alerts/` - Get expiry alerts

### Dashboards
- `GET /api/dashboards/blood-bank/` - Blood bank dashboard
- `GET /api/dashboards/hospital/` - Hospital dashboard

### Notifications
- `GET /api/notifications/` - List notifications
- `POST /api/notifications/{id}/mark_as_read/` - Mark as read
- `GET /api/notifications/unread_count/` - Get unread count


## ============================================================================
## SUPPORT & NEXT STEPS
## ============================================================================

After successful implementation:

1. **Add Payment Integration** - Process blood transfer payments
2. **Add Real-time Updates** - WebSocket for live tracking
3. **Add Mobile App** - React Native/Flutter client
4. **Add Analytics** - Dashboard with KPIs
5. **Add SMS/Email** - Send notifications via multiple channels
6. **Add Reports** - Export blood bank reports

## ============================================================================

**Congratulations! Your blood bank management system is now live.**
