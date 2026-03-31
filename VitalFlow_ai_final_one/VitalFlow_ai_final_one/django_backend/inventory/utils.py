# Utility Functions for Blood Bank Management
# Create: django_backend/inventory/utils.py

import math
from django.db.models import Q, Sum
from .models import User, BloodInventory, Driver, Notification, AuditLog
from django.utils import timezone
from datetime import timedelta


# ============================================================================
# GEOGRAPHIC DISTANCE CALCULATION (HAVERSINE FORMULA)
# ============================================================================

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two GPS coordinates using Haversine formula
    
    Args:
        lat1, lon1: Starting point latitude/longitude
        lat2, lon2: Ending point latitude/longitude
    
    Returns:
        Distance in kilometers (float)
    
    Usage:
        distance = calculate_distance(28.7041, 77.1025, 28.5355, 77.2289)
        # Output: 18.52 km
    """
    
    # Validate coordinates
    if not all([lat1, lon1, lat2, lon2]):
        return float('inf')
    
    # Earth's radius in kilometers
    R = 6371
    
    # Convert to radians
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    # Haversine formula
    a = math.sin(delta_lat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return round(distance, 2)


# ============================================================================
# GEOGRAPHIC SEARCH: NEAREST BLOOD BANKS
# ============================================================================

def get_nearest_blood_banks(hospital_lat, hospital_lon, radius_km=5, limit=10, blood_group=None):
    """
    Find nearest blood banks within radius
    Guarantees at least 2-3 results, expanding search radius if needed
    
    Args:
        hospital_lat, hospital_lon: Hospital location coordinates
        radius_km: Initial search radius in km (default 5)
        limit: Maximum results to return (default 10)
        blood_group: Filter by specific blood group (optional)
    
    Returns:
        List of dictionaries with blood bank info and available inventory
    
    Usage:
        banks = get_nearest_blood_banks(28.7041, 77.1025, radius_km=5, blood_group='O+')
    """
    
    # Start with eligible blood banks
    blood_banks = User.objects.filter(
        role='BLOOD_BANK',
        is_verified=True,
        latitude__isnull=False,
        longitude__isnull=False
    )
    
    result = []
    current_radius = radius_km
    
    while len(result) < 2 and current_radius <= 50:  # Max 50km expansion
        result = []
        
        for bank in blood_banks:
            distance = calculate_distance(hospital_lat, hospital_lon, bank.latitude, bank.longitude)
            
            if distance <= current_radius:
                # Get available inventory
                inventory_query = BloodInventory.objects.filter(
                    blood_bank=bank,
                    quality_status='GOOD',
                    units_available__gt=0
                )
                
                # Filter by blood group if specified
                if blood_group:
                    inventory_query = inventory_query.filter(blood_group=blood_group)
                
                inventory = inventory_query.values('blood_group').annotate(
                    total_units=Sum('units_available'),
                    expiry_date=timezone.now() + timedelta(days=30)
                )
                
                result.append({
                    'bank_id': bank.id,
                    'bank_name': bank.username,
                    'phone': bank.phone,
                    'email': bank.email,
                    'distance_km': distance,
                    'latitude': bank.latitude,
                    'longitude': bank.longitude,
                    'city': bank.city,
                    'inventory': list(inventory),
                    'available_immediately': bool(inventory.exists()),
                    'total_units': sum(item['total_units'] for item in inventory)
                })
        
        # If not enough results, expand radius
        if len(result) < 2:
            current_radius += 5
    
    # Sort by distance
    result.sort(key=lambda x: x['distance_km'])
    
    return result[:limit]


# ============================================================================
# GEOGRAPHIC SEARCH: NEAREST DRIVERS
# ============================================================================

def get_nearest_driver(latitude, longitude, city, urgency='ROUTINE'):
    """
    Find nearest available driver for delivery
    
    Args:
        latitude, longitude: Pickup location
        city: City name
        urgency: ROUTINE/URGENT/CRITICAL (affects priority)
    
    Returns:
        Driver object or None
    
    Usage:
        driver = get_nearest_driver(28.7041, 77.1025, 'Delhi', urgency='CRITICAL')
    """
    
    # Find available drivers in city
    available_drivers = Driver.objects.filter(
        user__city=city,
        is_available=True,
        current_status='AVAILABLE'
    ).filter(
        current_latitude__isnull=False,
        current_longitude__isnull=False
    ).order_by('-average_rating')  # Prefer highly rated drivers
    
    if not available_drivers.exists():
        return None
    
    nearest = None
    min_distance = float('inf')
    
    for driver in available_drivers:
        distance = calculate_distance(
            latitude, longitude,
            driver.current_latitude, driver.current_longitude
        )
        
        if distance < min_distance:
            min_distance = distance
            nearest = driver
    
    return nearest


# ============================================================================
# GEOGRAPHIC SEARCH: HOSPITALS BY COORDINATES
# ============================================================================

def find_hospitals_nearby(latitude, longitude, radius_km=10):
    """
    Find hospitals near given coordinates
    
    Args:
        latitude, longitude: Search center
        radius_km: Search radius in km
    
    Returns:
        List of hospitals within radius
    """
    
    hospitals = User.objects.filter(
        role='HOSPITAL',
        is_verified=True,
        latitude__isnull=False,
        longitude__isnull=False
    )
    
    result = []
    for hospital in hospitals:
        distance = calculate_distance(latitude, longitude, hospital.latitude, hospital.longitude)
        
        if distance <= radius_km:
            result.append({
                'hospital_id': hospital.id,
                'hospital_name': hospital.username,
                'distance_km': distance,
                'latitude': hospital.latitude,
                'longitude': hospital.longitude,
                'city': hospital.city,
                'phone': hospital.phone
            })
    
    result.sort(key=lambda x: x['distance_km'])
    return result


# ============================================================================
# NOTIFICATION CREATION HELPER
# ============================================================================

def create_notification(user, notification_type, title, message, blood_request=None,
                       delivery=None, priority='NORMAL'):
    """
    Create and save notification
    
    Args:
        user: User to notify
        notification_type: Type of notification
        title: Notification title
        message: Notification message
        blood_request: Related blood request (optional)
        delivery: Related delivery (optional)
        priority: NORMAL/HIGH/URGENT
    
    Returns:
        Notification object
    
    Usage:
        create_notification(
            user=hospital,
            notification_type='REQUEST_ACCEPTED',
            title='Blood Request Accepted',
            message='Your O+ request has been accepted',
            blood_request=request,
            priority='HIGH'
        )
    """
    
    notification = Notification.objects.create(
        user=user,
        type=notification_type,
        title=title,
        message=message,
        blood_request=blood_request,
        delivery=delivery,
        priority=priority
    )
    
    return notification


# ============================================================================
# AUDIT LOGGING HELPER
# ============================================================================

def log_audit_action(action, user, blood_request, description, metadata=None):
    """
    Log critical action for audit trail
    
    Args:
        action: Action type (CREATE_REQUEST, ACCEPT_REQUEST, etc.)
        user: User performing action
        blood_request: Related blood request
        description: Action description
        metadata: Additional context as dictionary
    
    Usage:
        log_audit_action(
            'ACCEPT_REQUEST',
            blood_bank,
            blood_request,
            'Blood bank accepted emergency request',
            {'inventory_checked': True}
        )
    """
    
    AuditLog.objects.create(
        action=action,
        user=user,
        blood_request=blood_request,
        description=description,
        metadata=metadata or {}
    )


# ============================================================================
# BLOOD REQUEST VALIDATION
# ============================================================================

def validate_blood_request(hospital, blood_group, units_requested):
    """
    Validate blood request before creation
    
    Args:
        hospital: Hospital user object
        blood_group: Blood group requested
        units_requested: Number of units
    
    Returns:
        Tuple (is_valid: bool, error_message: str or None)
    
    Usage:
        is_valid, error = validate_blood_request(hospital, 'O+', 5)
        if not is_valid:
            return Response({'error': error}, status=400)
    """
    
    from .models import HospitalRequestLimit
    
    # Check hospital verification
    if not hospital.is_verified:
        return False, "Hospital is not verified"
    
    # Check request limits
    limit = HospitalRequestLimit.objects.get_or_create(hospital=hospital)[0]
    
    # Check daily limit
    if limit.requests_today >= limit.daily_request_limit:
        return False, f"Daily limit ({limit.daily_request_limit}) exceeded"
    
    # Check unit limit
    if units_requested > limit.max_units_per_request:
        return False, f"Cannot request more than {limit.max_units_per_request} units"
    
    # Check if blood is available
    available = BloodInventory.objects.filter(
        blood_group=blood_group,
        quality_status='GOOD',
        units_available__gte=units_requested
    ).exists()
    
    if not available:
        return False, f"Not enough {blood_group} blood available in network"
    
    return True, None


# ============================================================================
# INVENTORY CHECK
# ============================================================================

def check_blood_availability(blood_group, units_needed, city=None):
    """
    Check if blood is available in network
    
    Args:
        blood_group: Blood group to check
        units_needed: Units required
        city: City to check in (optional)
    
    Returns:
        Tuple (available: bool, locations: list)
    
    Usage:
        available, locations = check_blood_availability('O+', 5, 'Delhi')
    """
    
    query = BloodInventory.objects.filter(
        blood_group=blood_group,
        quality_status='GOOD',
        units_available__gte=units_needed
    )
    
    if city:
        query = query.filter(blood_bank__city=city)
    
    locations = list(query.values('blood_bank__username', 'units_available', 'expiry_date'))
    available = len(locations) > 0
    
    return available, locations


# ============================================================================
# EMERGENCY MODE HANDLER
# ============================================================================

def handle_critical_request(blood_request):
    """
    Special handling for CRITICAL urgency requests
    
    - Prioritize nearest blood bank
    - Assign fastest driver
    - Send high-priority notifications
    - Check anomalies
    
    Args:
        blood_request: BloodRequest object with urgency='CRITICAL'
    """
    
    if blood_request.urgency_level != 'CRITICAL':
        return
    
    # 1. Find nearest blood bank with inventory
    nearest_banks = get_nearest_blood_banks(
        blood_request.hospital_latitude,
        blood_request.hospital_longitude,
        radius_km=3,  # Smaller radius for emergency
        limit=5,
        blood_group=blood_request.blood_group
    )
    
    # 2. Notify all nearby blood banks with URGENT priority
    for bank_info in nearest_banks:
        bank = User.objects.get(id=bank_info['bank_id'])
        create_notification(
            user=bank,
            notification_type='EMERGENCY_REQUEST',
            title=f'CRITICAL: {blood_request.blood_group} Blood Emergency',
            message=f'CRITICAL request from {blood_request.hospital.username}. Patient: {blood_request.patient_name}. Condition: {blood_request.diagnosis}',
            blood_request=blood_request,
            priority='URGENT'
        )
    
    # 3. Log as critical action
    log_audit_action(
        'CREATE_REQUEST',
        blood_request.hospital,
        blood_request,
        'CRITICAL blood request created',
        {'nearest_banks': len(nearest_banks)}
    )


# ============================================================================
# EXPIRY MANAGEMENT
# ============================================================================

def get_expiry_alerts(blood_bank, days_threshold=7):
    """
    Get blood units expiring soon
    
    Args:
        blood_bank: Blood bank user object
        days_threshold: Days until expiry to alert
    
    Returns:
        List of expiring inventory items
    """
    
    expiry_threshold = timezone.now() + timedelta(days=days_threshold)
    
    return BloodInventory.objects.filter(
        blood_bank=blood_bank,
        expiry_date__lte=expiry_threshold,
        expiry_date__gt=timezone.now(),
        quality_status='GOOD'
    ).order_by('expiry_date')


def get_low_inventory_alerts(blood_bank, min_units=5):
    """
    Get blood groups with low inventory
    
    Args:
        blood_bank: Blood bank user object
        min_units: Minimum units threshold
    
    Returns:
        List of blood groups with low inventory
    """
    
    return BloodInventory.objects.filter(
        blood_bank=blood_bank,
        units_available__lt=min_units,
        quality_status='GOOD'
    ).values('blood_group').distinct()


# ============================================================================
# RESET DAILY LIMITS (RUN DAILY)
# ============================================================================

def reset_daily_request_limits():
    """
    Reset daily request counters for all hospitals
    Run this as a scheduled task (e.g., daily at midnight)
    
    Usage:
        From manage.py shell:
        >>> from inventory.utils import reset_daily_request_limits
        >>> reset_daily_request_limits()
    """
    
    from .models import HospitalRequestLimit
    from datetime import date
    
    now = date.today()
    limits = HospitalRequestLimit.objects.filter(last_reset__lt=now)
    
    for limit in limits:
        limit.requests_today = 0
        limit.last_reset = now
        limit.save()
    
    return limits.count()
