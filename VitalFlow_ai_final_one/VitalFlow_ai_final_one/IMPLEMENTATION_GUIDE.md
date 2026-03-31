# VitalFlow AI Blood Dispatch System - Implementation Guide

## ✅ Completed Setup & Features

### Django Dependencies Installed
- ✅ Django 5.0.3
- ✅ Django REST Framework 3.15.1
- ✅ Django CORS Headers 4.3.1

### Backend Models & APIs

#### 1. **User Model Enhancement**
Added fields for registration with city and user type:
- `user_type`: DRIVER, DONOR, HOSPITAL, ADMIN
- `city`: User's service city
- `phone`: Contact number for verification

#### 2. **BloodRequest Model Enhancement**
Added real-time acceptance tracking:
- `accepted_by`: ForeignKey to Driver/Donor
- `accepted_by_name`: Name of accepting provider
- `accepted_by_phone`: Phone of accepting provider
- `driver_proof_details`: ID/proof information
- `accepted_at`: Timestamp of acceptance
- New status: `PENDING` (for requests awaiting acceptance)

#### 3. **Notification Model (NEW)**
Tracks notifications for city-based filtering:
- Automatic creation when requests are accepted
- Priority levels: URGENT, HIGH, NORMAL, LOW
- Read status tracking

### API Endpoints

#### Authentication
```
POST /api/register/
- Register new user with city and user type
- Returns: User object with JWT-compatible data
- Required fields: username, email, password, phone, city, user_type

POST /api/login/
- Standard login endpoint
- Returns: User object for session management
```

#### Notifications
```
GET /api/notifications/
- List notifications filtered by user's city
- Query params: city (required), is_read (optional)
- Returns paginated notification list

POST /api/notifications/{id}/mark_as_read/
- Mark single notification as read

POST /api/notifications/mark_all_as_read/
- Mark all user notifications as read
```

#### Blood Requests
```
POST /api/blood-requests/{id}/accept/
- Driver/Donor accepts a blood request
- Body: { proof_id: "DL123456789" }
- Returns: Updated request with acceptance details
- Creates notification for requester automatically

GET /api/blood-requests/
- List all blood requests with status filtering
- Real-time status updates via polling

PATCH /api/blood-requests/{id}/update_status/
- Update request status (for admin use)
```

## 🎨 React Components Implemented

### 1. **Registration Component** (`components/Registration.tsx`)
Professional registration form with:
- ✅ Full name fields (First & Last)
- ✅ Email with validation
- ✅ Phone number validation (10 digits)
- ✅ City dropdown (15 major Indian cities)
- ✅ User Type selection (Driver, Donor, Hospital, Admin)
- ✅ Password confirmation
- ✅ Field-by-field error messages
- ✅ Success screen with redirect
- ✅ localStorage token storage

**Features:**
- Real-time form validation
- Professional medical theme with Tailwind CSS
- Animates success confirmation
- Stores user_id and user_data in localStorage

### 2. **Driver/Donor Dashboard Enhanced** (`components/DriverDashboardEnhanced.tsx`)
Real-time notification and acceptance system:
- ✅ Live notification polling (every 10 seconds)
- ✅ Huge URGENT ALERT banner for critical requests
- ✅ Pulsing animation for urgent requests
- ✅ City-filtered notifications
- ✅ Acceptance button with submission state
- ✅ "Submission Initiated" progress indicator
- ✅ Real-time status updates

**Key Features:**
- Toast notifications for success/error/retry
- Auto-retry on network failure (every 5 seconds)
- Task In Progress status after acceptance
- Active deliveries tracking
- Performance metrics dashboard
- Professional Tailwind CSS styling

### 3. **Requester Status View** (`components/RequesterStatusView.tsx`)
Hospital/Requester real-time tracking:
- ✅ Pending status with "Searching..." pulse animation
- ✅ Live status updates via polling
- ✅ Shows Driver/Donor details when accepted:
  - Name from `accepted_by_name`
  - Contact from `accepted_by_phone`
  - Identity proof from `driver_proof_details`
- ✅ Three tabs: Pending, In Progress, Completed
- ✅ No page refresh needed (5-second polling)

**Features:**
- Color-coded status stages
- Animated progress indicators
- Real-time driver information display
- Toast notifications for errors
- Request summary statistics

### 4. **Toast Component** (`components/Toast.tsx`)
Lightweight toast notification system:
- Success notifications (green)
- Error notifications (red)
- Info notifications (blue)
- Auto-dismiss after 3 seconds

## 🔄 Real-Time Flow Explanation

### Driver/Donor Accepts Request
1. Driver opens Dashboard → Gets city-filtered notifications
2. URGENT notification appears with:
   - Blood type and quantity needed
   - Hospital/facility name
   - Accept button
3. Driver clicks "Accept Request"
   - Endpoint: `POST /api/blood-requests/{id}/accept/`
   - Backend updates: accepted_by, accepted_by_name, accepted_by_phone, driver_proof_details
   - Status changes: PENDING → INITIATED
   - Notification created for requester
   - UI shows "Submission Initiated" with green checkmark
4. Toast confirms success

### Hospital/Requester Tracks Status
1. Hospital opens Request Status view
2. Sees "Pending" requests with:
   - Pulsing animation
   - "Searching for nearby Drivers/Donors..." text
3. When driver accepts:
   - Status auto-updates via polling (every 5 seconds)
   - Shows driver's name, phone, proof ID
   - Status changes to "In Progress"
4. No refresh needed - automatic update

## 🛠️ File Changes Summary

### Django Backend
- ✅ `models.py`: Added User city/user_type, BloodRequest acceptance fields, Notification model
- ✅ `serializers.py`: Updated to include new fields
- ✅ `views.py`: Added RegisterView, NotificationViewSet, enhanced BloodRequestViewSet with accept action
- ✅ `urls.py`: Added /api/register/, /api/notifications/ endpoints
- ✅ Migrations: Auto-generated and applied

### React Frontend
- ✅ `Registration.tsx`: New component (created)
- ✅ `DriverDashboardEnhanced.tsx`: New component (created)
- ✅ `RequesterStatusView.tsx`: New component (created)
- ✅ `Toast.tsx`: New component (created)

## 📊 Error Handling

### Network Errors
- **400 Bad Request**: Shows "Sync Error" toast
- **500 Server Error**: Shows "Sync Error: Retrying..."
- **Network Failure**: Auto-retries every 5 seconds with toast notification

### Validation
- Required fields: Form won't submit if any field is blank
- Email format: Must be valid email
- Phone: Must be 10 digits
- Password confirmation: Must match
- Field-specific error messages under each field

## 🚀 Testing the System

### 1. Test Registration
```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "driver1",
    "email": "driver1@example.com",
    "password": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "9876543210",
    "city": "Mumbai",
    "user_type": "DRIVER"
  }'
```

### 2. Test Notifications
```bash
curl -X GET "http://localhost:8000/api/notifications/?city=Mumbai"
```

### 3. Test Blood Request Accept
```bash
curl -X POST http://localhost:8000/api/blood-requests/1/accept/ \
  -H "Content-Type: application/json" \
  -d '{"proof_id": "DL123456789"}'
```

## 📱 Frontend Integration

### Using the Components

```tsx
import Registration from './components/Registration';
import DriverDashboardEnhanced from './components/DriverDashboardEnhanced';
import RequesterStatusView from './components/RequesterStatusView';

// In your main app:
<Registration 
  onRegistrationSuccess={handleRegistrationSuccess}
  onCancel={handleCancel}
  t={translations}
/>

<DriverDashboardEnhanced 
  user={currentUser}
  t={translations}
/>

<RequesterStatusView 
  userCity={currentUser.city}
  t={translations}
/>
```

## 🔐 Security Considerations

- Passwords are hashed using Django's built-in `make_password`
- User authentication required for accepting requests
- City-based notification filtering prevents unauthorized access
- CORS headers configured for cross-origin requests

## 📈 Performance Optimizations

- **Polling Interval**: 10 seconds for notifications (configurable)
- **Status Updates**: 5 seconds for requester view
- **Toast Auto-dismiss**: 3-4 seconds
- **Lazy Loading**: Components only fetch data when mounted

## 🎯 Future Enhancements

1. **WebSocket Support**: Real-time updates instead of polling
2. **Push Notifications**: Mobile app alerts
3. **Proof Upload**: File upload instead of text ID
4. **Rating System**: Driver/Donor ratings from hospitals
5. **Analytics Dashboard**: Request metrics and trends
6. **SMS Integration**: Direct SMS alerts for drivers
7. **Map Integration**: Show driver location in real-time
8. **Payment Gateway**: For hospital-to-driver payments

## 📝 Database Schema Changes

```
User
├── user_type (NEW)
├── city (NEW)
└── phone (NEW)

BloodRequest
├── accepted_by (NEW) - FK to User
├── accepted_by_name (NEW)
├── accepted_by_phone (NEW)
├── driver_proof_details (NEW)
├── accepted_at (NEW)
└── status (UPDATED with PENDING)

Notification (NEW MODEL)
├── user - FK to User
├── blood_request - FK to BloodRequest
├── title
├── message
├── city
├── priority
├── is_read
└── created_at
```

## ✨ Key Features Delivered

✅ **Unified Registration & Login** with city/user type selection
✅ **Emergency Notification System** with city-based filtering
✅ **Real-time Acceptance** with driver details display
✅ **Live Dispatch Dashboard** with urgent alerts
✅ **Requester Status Tracking** with no page refresh needed
✅ **Network Error Handling** with auto-retry
✅ **Professional UI** with Tailwind CSS medical theme
✅ **Toast Notifications** for user feedback

---

**Version**: 1.0
**Last Updated**: March 29, 2026
**Django Version**: 5.0.3
**React**: With motion/framer-motion animations
