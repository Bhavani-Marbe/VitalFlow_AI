# Django Models for Blood Bank Management System
# Add/Update: django_backend/inventory/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid
import json


# ============================================================================
# USER MODEL EXTENSION
# ============================================================================

class User(AbstractUser):
    """Extended user model with location tracking and roles"""
    
    ROLE_CHOICES = [
        ('PATIENT', 'Patient'),
        ('DONOR', 'Donor'),
        ('HOSPITAL', 'Hospital'),
        ('BLOOD_BANK', 'Blood Bank'),
        ('DRIVER', 'Driver'),
        ('ADMIN', 'Admin'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='PATIENT')
    city = models.CharField(max_length=100, default='')
    state = models.CharField(max_length=100, default='')
    phone = models.CharField(max_length=20, blank=True, null=True, unique=True)
    avatar = models.URLField(blank=True, null=True)
    
    # GPS Coordinates for geographic matching
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    # Verification
    is_verified = models.BooleanField(default=False)
    license_id = models.CharField(max_length=50, blank=True, null=True, unique=True)
    registration_number = models.CharField(max_length=100, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        indexes = [
            models.Index(fields=['role', 'city']),
            models.Index(fields=['is_verified']),
        ]


# ============================================================================
# BLOOD REQUEST MODEL
# ============================================================================

class BloodRequest(models.Model):
    """Hospital blood requests with locking mechanism to prevent duplicate acceptance"""
    
    URGENCY_CHOICES = [
        ('ROUTINE', 'Routine'),
        ('URGENT', 'Urgent'),
        ('CRITICAL', 'Critical/Emergency'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted by Blood Bank'),
        ('IN_TRANSIT', 'In Transit by Driver'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
        ('REJECTED', 'Rejected by Blood Bank'),
    ]
    
    BLOOD_GROUPS = [
        ('O+', 'O Positive'), ('O-', 'O Negative'),
        ('A+', 'A Positive'), ('A-', 'A Negative'),
        ('B+', 'B Positive'), ('B-', 'B Negative'),
        ('AB+', 'AB Positive'), ('AB-', 'AB Negative'),
    ]
    
    # Identifiers
    request_id = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    hospital = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blood_requests',
                                 limit_choices_to={'role': 'HOSPITAL'})
    
    # Blood Details
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS)
    units_requested = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(50)])
    component_type = models.CharField(max_length=50, default='Whole Blood')
    
    # Patient Information
    patient_id = models.CharField(max_length=50)
    patient_name = models.CharField(max_length=200)
    doctor_name = models.CharField(max_length=200)
    diagnosis = models.TextField()
    
    # Status
    urgency_level = models.CharField(max_length=20, choices=URGENCY_CHOICES, default='ROUTINE')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Timestamps
    requested_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    # CRITICAL: Lock mechanism to prevent duplicate acceptance
    is_locked = models.BooleanField(default=False)
    accepted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name='accepted_blood_requests',
                                    limit_choices_to={'role': 'BLOOD_BANK'})
    
    # Driver Assignment
    assigned_driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                       related_name='assigned_deliveries',
                                       limit_choices_to={'role': 'DRIVER'})
    
    # Location for delivery
    delivery_address = models.TextField()
    hospital_latitude = models.FloatField(null=True, blank=True)
    hospital_longitude = models.FloatField(null=True, blank=True)
    
    # Anomaly Detection
    is_flagged_suspicious = models.BooleanField(default=False)
    anomaly_reason = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-requested_at']
        indexes = [
            models.Index(fields=['status', 'urgency_level']),
            models.Index(fields=['hospital', 'status']),
            models.Index(fields=['is_locked']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.request_id} - {self.patient_name} ({self.blood_group})"


# ============================================================================
# BLOOD INVENTORY MODEL
# ============================================================================

class BloodInventory(models.Model):
    """Blood bank inventory management"""
    
    BLOOD_GROUPS = [
        ('O+', 'O Positive'), ('O-', 'O Negative'),
        ('A+', 'A Positive'), ('A-', 'A Negative'),
        ('B+', 'B Positive'), ('B-', 'B Negative'),
        ('AB+', 'AB Positive'), ('AB-', 'AB Negative'),
    ]
    
    QUALITY_STATUS = [
        ('GOOD', 'Good'),
        ('QUARANTINE', 'Quarantine'),
        ('EXPIRED', 'Expired'),
    ]
    
    blood_bank = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blood_inventory',
                                   limit_choices_to={'role': 'BLOOD_BANK'})
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUPS)
    component_type = models.CharField(max_length=50, default='Whole Blood')
    units_available = models.IntegerField(validators=[MinValueValidator(0)])
    expiry_date = models.DateTimeField()
    
    # Quality Status
    quality_status = models.CharField(max_length=20, choices=QUALITY_STATUS, default='GOOD')
    storage_location = models.CharField(max_length=200, blank=True)
    temperature_celsius = models.FloatField(null=True, blank=True)
    
    # Timestamps
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('blood_bank', 'blood_group', 'component_type', 'expiry_date')
        ordering = ['expiry_date']
        indexes = [
            models.Index(fields=['blood_group', 'expiry_date']),
            models.Index(fields=['quality_status']),
        ]
    
    def days_until_expiry(self):
        """Returns days remaining before expiration"""
        delta = self.expiry_date - timezone.now()
        return max(0, delta.days)
    
    def is_expired(self):
        return self.days_until_expiry() <= 0
    
    def __str__(self):
        return f"{self.blood_group} - {self.units_available} units @ {self.blood_bank.username}"


# ============================================================================
# DRIVER MODEL
# ============================================================================

class Driver(models.Model):
    """Driver management and tracking"""
    
    STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('ON_DELIVERY', 'On Delivery'),
        ('UNAVAILABLE', 'Unavailable'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile',
                               limit_choices_to={'role': 'DRIVER'})
    phone = models.CharField(max_length=20)
    vehicle_number = models.CharField(max_length=20, unique=True)
    license_number = models.CharField(max_length=50, unique=True)
    license_expiry = models.DateField()
    
    # Location Tracking
    current_latitude = models.FloatField(null=True, blank=True)
    current_longitude = models.FloatField(null=True, blank=True)
    current_city = models.CharField(max_length=100)
    
    # Status
    is_available = models.BooleanField(default=True)
    current_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE')
    
    # Performance Metrics
    average_rating = models.FloatField(default=5.0, validators=[MaxValueValidator(5.0)])
    total_deliveries = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_available', '-average_rating']
    
    def __str__(self):
        return f"{self.user.first_name} - {self.vehicle_number}"


# ============================================================================
# DELIVERY MODEL
# ============================================================================

class Delivery(models.Model):
    """Track deliveries in real-time"""
    
    STATUS_CHOICES = [
        ('PENDING_PICKUP', 'Pending Pickup'),
        ('PICKED_UP', 'Blood Picked Up'),
        ('ON_THE_WAY', 'On The Way'),
        ('DELIVERED', 'Delivered'),
        ('FAILED', 'Delivery Failed'),
    ]
    
    delivery_id = models.CharField(max_length=50, unique=True, default=uuid.uuid4)
    blood_request = models.OneToOneField(BloodRequest, on_delete=models.CASCADE, related_name='delivery')
    driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True,
                              related_name='deliveries')
    
    # Timeline
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING_PICKUP')
    created_at = models.DateTimeField(auto_now_add=True)
    picked_up_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    
    # Real-time Tracking
    current_latitude = models.FloatField(null=True, blank=True)
    current_longitude = models.FloatField(null=True, blank=True)
    distance_traveled_km = models.FloatField(default=0.0)
    estimated_arrival = models.DateTimeField(null=True, blank=True)
    
    # Evidence
    proof_of_delivery = models.URLField(blank=True, null=True)
    delivery_notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Delivery {self.delivery_id}"


# ============================================================================
# NOTIFICATION MODEL
# ============================================================================

class Notification(models.Model):
    """Comprehensive notification system"""
    
    TYPE_CHOICES = [
        ('REQUEST_CREATED', 'Blood Request Created'),
        ('REQUEST_ACCEPTED', 'Request Accepted'),
        ('DRIVER_ASSIGNED', 'Driver Assigned'),
        ('ON_THE_WAY', 'Blood is On The Way'),
        ('DELIVERED', 'Blood Delivered'),
        ('EXPIRY_ALERT', 'Blood Expiry Alert'),
        ('LOW_INVENTORY', 'Low Inventory Alert'),
        ('EMERGENCY_REQUEST', 'Emergency Blood Request'),
        ('REQUEST_REJECT', 'Request Rejected'),
        ('ANOMALY_DETECTED', 'Anomaly Detected'),
    ]
    
    PRIORITY_CHOICES = [
        ('NORMAL', 'Normal'),
        ('HIGH', 'High'),
        ('URGENT', 'Urgent'),
    ]
    
    id = models.CharField(max_length=50, primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    
    # Content
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='NORMAL')
    
    # Relations
    blood_request = models.ForeignKey(BloodRequest, on_delete=models.SET_NULL, null=True, blank=True)
    delivery = models.ForeignKey(Delivery, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['type', 'priority']),
        ]
    
    def __str__(self):
        return f"{self.type} - {self.user.username}"


# ============================================================================
# AUDIT LOG MODEL
# ============================================================================

class AuditLog(models.Model):
    """Track all critical actions"""
    
    ACTION_CHOICES = [
        ('CREATE_REQUEST', 'Create Request'),
        ('ACCEPT_REQUEST', 'Accept Request'),
        ('REJECT_REQUEST', 'Reject Request'),
        ('ASSIGN_DRIVER', 'Assign Driver'),
        ('UPDATE_STATUS', 'Update Status'),
        ('COMPLETE_DELIVERY', 'Complete Delivery'),
        ('INVENTORY_UPDATE', 'Inventory Update'),
        ('ANOMALY_DETECTED', 'Anomaly Detected'),
    ]
    
    action = models.CharField(max_length=30, choices=ACTION_CHOICES)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    blood_request = models.ForeignKey(BloodRequest, on_delete=models.SET_NULL, null=True, blank=True)
    
    description = models.TextField()
    metadata = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['action', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.action} - {self.user}"


# ============================================================================
# HOSPITAL REQUEST LIMIT
# ============================================================================

class HospitalRequestLimit(models.Model):
    """Prevent over-requesting by hospitals"""
    
    hospital = models.OneToOneField(User, on_delete=models.CASCADE, related_name='request_limit',
                                    limit_choices_to={'role': 'HOSPITAL'})
    max_units_per_request = models.IntegerField(default=10)
    daily_request_limit = models.IntegerField(default=5)
    
    # Tracking
    requests_today = models.IntegerField(default=0)
    last_reset = models.DateField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Hospital Request Limit"
    
    def __str__(self):
        return f"{self.hospital.username} - Max {self.max_units_per_request} units/request"
