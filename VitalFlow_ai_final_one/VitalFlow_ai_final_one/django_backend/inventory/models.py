from django.db import models
from django.contrib.auth.models import User


class Hospital(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    hospital_name = models.CharField(max_length=200)
    license_number = models.CharField(max_length=100)
    address = models.TextField()
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.hospital_name


class BloodBank(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    contact = models.CharField(max_length=20)

    def __str__(self):
        return self.name


class Driver(models.Model):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    vehicle_number = models.CharField(max_length=50)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class BloodInventory(models.Model):
    blood_bank = models.ForeignKey(BloodBank, on_delete=models.CASCADE)
    blood_group = models.CharField(max_length=5)
    units_available = models.IntegerField()
    expiry_date = models.DateField()

    def __str__(self):
        return f"{self.blood_group} - {self.units_available}"


class BloodRequest(models.Model):

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('IN_TRANSIT', 'In Transit'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    ]

    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE)
    blood_group = models.CharField(max_length=5)
    units_requested = models.IntegerField()
    patient_name = models.CharField(max_length=200)
    urgency_level = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    accepted_by = models.ForeignKey(BloodBank, null=True, blank=True, on_delete=models.SET_NULL)

    driver = models.ForeignKey(Driver, null=True, blank=True, on_delete=models.SET_NULL)

    is_locked = models.BooleanField(default=False)

    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.blood_group} request from {self.hospital}"