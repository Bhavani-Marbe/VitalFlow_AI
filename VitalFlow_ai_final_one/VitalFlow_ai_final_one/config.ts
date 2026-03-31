/**
 * API Configuration
 */

export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-api-domain.com/api"
    : "http://localhost:3000/api";

// If you run a Django backend on 8000 instead, set environment or adjust here:
// export const API_BASE_URL = "http://localhost:8000/api"; // Django API path

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login/`,
  REGISTER: `${API_BASE_URL}/register/`,

  INVENTORY: `${API_BASE_URL}/inventory/`,

  BLOOD_REQUEST: `${API_BASE_URL}/blood-request/`,

  BLOOD_REQUESTS: `${API_BASE_URL}/blood-requests`,

  HOSPITALS_INVENTORY: `${API_BASE_URL}/hospital-inventory/`,
  HOSPITAL_INVENTORY_UPDATE: `${API_BASE_URL}/hospital-inventory/update`,

  ACTIVITIES: `${API_BASE_URL}/activities`,

  ACCEPT_REQUEST: `${API_BASE_URL}/accept-request/`,

  ASSIGN_DRIVER: `${API_BASE_URL}/assign-driver/`,

  NOTIFICATIONS: `${API_BASE_URL}/notifications/`,

  AUDIT_LOGS: `${API_BASE_URL}/audit-logs/`,
  NEAREST_BANK: `${API_BASE_URL}/nearest-blood-bank`,
  EMERGENCY_ALERT: `${API_BASE_URL}/emergency-alert`,
  EMERGENCY_ALERTS: `${API_BASE_URL}/emergency-alerts`,
  AVAILABILITY_MAP: `${API_BASE_URL}/availability-map`,
};

export async function apiCall(url: string, options: RequestInit = {}) {
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const headers = {
    ...defaultHeaders,
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = "API request failed";
    try {
      const errorData = await response.json();
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (err) {
      // Ignore JSON parse errors and keep default
    }
    throw new Error(errorMessage);
  }

  return response.json();
}