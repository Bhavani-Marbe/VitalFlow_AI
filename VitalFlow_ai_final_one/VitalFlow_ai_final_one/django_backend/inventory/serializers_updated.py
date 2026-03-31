# Serializers for Blood Bank Management System
# Add/Update: django_backend/inventory/serializers_updated.py

from rest_framework import serializers
from .models import (
    User, BloodRequest, BloodInventory, Driver, Delivery,
    Notification, AuditLog, HospitalRequestLimit
)
from django.utils import timezone


class UserSerializer(serializers.ModelSerializer):
    """User serializer with role-based fields"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'city', 'state', 'phone', 'avatar',
                  'first_name', 'last_name', 'is_verified', 'latitude', 'longitude']
        read_only_fields = ['id', 'is_verified']


class DriverSerializer(serializers.ModelSerializer):
    """Driver serializer with user details"""
    
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Driver
        fields = ['id', 'user', 'user_details', 'phone', 'vehicle_number', 'license_number',
                  'current_city', 'is_available', 'current_status', 'average_rating',
                  'total_deliveries', 'current_latitude', 'current_longitude']
    
    def validate_license_expiry(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Driver license has expired")
        return value


class BloodInventorySerializer(serializers.ModelSerializer):
    """Blood inventory with expiry tracking"""
    
    blood_bank_name = serializers.CharField(source='blood_bank.username', read_only=True)
    days_until_expiry = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    
    class Meta:
        model = BloodInventory
        fields = ['id', 'blood_bank', 'blood_bank_name', 'blood_group', 'component_type',
                  'units_available', 'expiry_date', 'quality_status', 'storage_location',
                  'temperature_celsius', 'added_at', 'updated_at', 'days_until_expiry',
                  'is_expired']
        read_only_fields = ['added_at', 'updated_at']
    
    def get_days_until_expiry(self, obj):
        return obj.days_until_expiry()
    
    def get_is_expired(self, obj):
        return obj.is_expired()
    
    def validate_expiry_date(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Expiry date must be in the future")
        return value
    
    def validate_units_available(self, value):
        if value < 0:
            raise serializers.ValidationError("Units cannot be negative")
        return value


class BloodRequestSerializer(serializers.ModelSerializer):
    """Blood request with nested relationships"""
    
    hospital_name = serializers.CharField(source='hospital.username', read_only=True)
    accepted_by_name = serializers.CharField(source='accepted_by.username', read_only=True)
    driver_name = serializers.CharField(source='assigned_driver.username', read_only=True)
    
    class Meta:
        model = BloodRequest
        fields = [
            'request_id', 'hospital', 'hospital_name', 'blood_group', 'units_requested',
            'component_type', 'patient_id', 'patient_name', 'doctor_name', 'diagnosis',
            'urgency_level', 'status', 'requested_at', 'accepted_at', 'delivered_at',
            'is_locked', 'accepted_by', 'accepted_by_name', 'assigned_driver', 'driver_name',
            'delivery_address', 'hospital_latitude', 'hospital_longitude',
            'is_flagged_suspicious', 'anomaly_reason'
        ]
        read_only_fields = ['request_id', 'requested_at', 'is_locked', 'is_flagged_suspicious',
                            'anomaly_reason']
    
    def validate_units_requested(self, value):
        if value <= 0 or value > 50:
            raise serializers.ValidationError("Units must be between 1 and 50")
        return value
    
    def validate_patient_name(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("Patient name cannot be empty")
        return value
    
    def validate(self, data):
        hospital = data.get('hospital')
        
        # Check hospital request limits
        if hospital:
            limit = HospitalRequestLimit.objects.get_or_create(hospital=hospital)[0]
            
            # Check daily limit
            if limit.requests_today >= limit.daily_request_limit:
                raise serializers.ValidationError(
                    f"Daily request limit ({limit.daily_request_limit}) exceeded. "
                    f"Already made {limit.requests_today} requests today."
                )
            
            # Check unit limit
            if data.get('units_requested', 0) > limit.max_units_per_request:
                raise serializers.ValidationError(
                    f"Cannot request more than {limit.max_units_per_request} units per request"
                )
        
        return data


class DeliverySerializer(serializers.ModelSerializer):
    """Delivery tracking with driver and request details"""
    
    driver_name = serializers.CharField(source='driver.user.first_name', read_only=True)
    blood_request_details = BloodRequestSerializer(source='blood_request', read_only=True)
    
    class Meta:
        model = Delivery
        fields = [
            'delivery_id', 'blood_request', 'blood_request_details', 'driver', 'driver_name',
            'status', 'created_at', 'picked_up_at', 'delivered_at', 'current_latitude',
            'current_longitude', 'distance_traveled_km', 'estimated_arrival',
            'proof_of_delivery', 'delivery_notes'
        ]
        read_only_fields = ['delivery_id', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    """Notification serializer"""
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'type', 'title', 'message', 'priority', 'blood_request',
            'delivery', 'is_read', 'read_at', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'read_at']


class AuditLogSerializer(serializers.ModelSerializer):
    """Audit log serializer"""
    
    user_name = serializers.CharField(source='user.username', read_only=True)
    request_id = serializers.CharField(source='blood_request.request_id', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = ['id', 'action', 'user', 'user_name', 'blood_request', 'request_id',
                  'description', 'metadata', 'created_at']


class HospitalRequestLimitSerializer(serializers.ModelSerializer):
    """Hospital request limit serializer"""
    
    hospital_name = serializers.CharField(source='hospital.username', read_only=True)
    
    class Meta:
        model = HospitalRequestLimit
        fields = ['id', 'hospital', 'hospital_name', 'max_units_per_request',
                  'daily_request_limit', 'requests_today', 'last_reset']
        read_only_fields = ['requests_today', 'last_reset']


class DashboardSummarySerializer(serializers.Serializer):
    """Dashboard summary data"""
    
    requests_summary = serializers.DictField()
    recent_requests = BloodRequestSerializer(many=True)
    available_blood_banks = serializers.ListField()
    request_limits = serializers.DictField()
