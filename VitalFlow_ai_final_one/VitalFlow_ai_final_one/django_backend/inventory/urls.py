from django.urls import path
from . import views

app_name = "inventory"

urlpatterns = [
    path("hospital-inventory/", views.hospital_inventory, name="hospital_inventory"),
    path("blood-request/", views.create_blood_request, name="blood_request"),
    path("request-blood/", views.request_blood, name="request_blood"),
    path("accept-request/", views.accept_request, name="accept_request"),
    path("assign-driver/", views.assign_driver, name="assign_driver"),
]