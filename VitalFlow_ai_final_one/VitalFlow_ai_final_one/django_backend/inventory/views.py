from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


def hospital_inventory(request):
    data = [
        {"blood_group": "A+", "units": 12},
        {"blood_group": "B+", "units": 9},
        {"blood_group": "O+", "units": 15},
        {"blood_group": "AB+", "units": 6},
        {"blood_group": "A-", "units": 4},
    ]
    return JsonResponse(data, safe=False)


@csrf_exempt
def create_blood_request(request):
    if request.method == "POST":
        try:
            body = json.loads(request.body)

            response = {
                "status": "success",
                "message": "Blood request created",
                "data": body
            }

            return JsonResponse(response)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)


def request_blood(request):
    return JsonResponse({"message": "Blood request page"})


@csrf_exempt
def accept_request(request):
    return JsonResponse({"status": "accepted"})


@csrf_exempt
def assign_driver(request):
    return JsonResponse({"status": "driver assigned"})