# Patient Authentication & Dashboard Flow

## Overview
Complete authentication system for patients with caregiver assignment requirement. Patients must be assigned to a caregiver by the admin before they can login and access their dashboard.

## ✅ Authentication System Features

### 1. Unified Login Page (`/login`)
- Single login interface for all user types
- Dropdown selector: "I am a..." (Caregiver / Patient)
- Two-step authentication:
  1. Select user type
  2. Enter User ID

### 2. User Type Support
- **Caregiver**: Uses `caregiverId`
- **Patient**: Uses `patientId`
- **Admin**: Separate admin login page

### 3. Assignment-Based Access Control
- **Caregiver**: Can only login if assigned to a patient
- **Patient**: Can only login if assigned to a caregiver by admin
- Error message: "Your account has not been activated yet. Please wait for the administrator to assign you to a caregiver."

## 🔄 Complete Authentication Flow

### Step 1: Patient Registration (Admin Dashboard)
```
Admin Dashboard → Patient Management → Add New Patient
↓
Patient record created with:
  - patientId (unique identifier)
  - name, phone, age, gender
  - Medical information
  - isAssigned = false (initially)
  - assignedCaregiver = null
```

### Step 2: Caregiver Assignment (Admin Dashboard)
```
Admin Dashboard → Patient Management → "Assign Caregiver to Patient" button
↓
Admin selects:
  - Patient to assign
  - Caregiver to assign
↓
Database Updated:
  - Patient.isAssigned = true
  - Patient.assignedCaregiver = caregiverId (ObjectId reference)
  - Caregiver.isAssigned = true
  - Caregiver.assignedPatient = patientId (ObjectId reference)
```

### Step 3: Patient Login
```
User navigates to: http://localhost:3000/login
↓
Form displays:
  1. Dropdown: "I am a..." → Select "Patient"
  2. Text field: "Your ID" → Enter patientId
  3. Submit button
↓
API Call: POST /api/auth/user-login
```

### Step 4: Backend Validation
```
Endpoint: POST /api/auth/user-login
Request Body:
{
  "userId": "PATIENT_ID_HERE",
  "userType": "patient"
}

Validation Steps:
1. Check if userId provided → Error if missing
2. Find patient by patientId
   - Error if not found: "Patient not found. Please check your ID."
3. Check if isAssigned = true AND assignedCaregiver exists
   - Error if false: "Your account has not been activated yet..."
4. Update patient.lastLogin = now
5. Save patient record
6. Return patient data
```

### Step 5: Success Response
```
Response Status: 200 OK
Response Body:
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "PAT001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "userType": "patient",
    "isAssigned": true,
    "lastLogin": "2025-11-28T10:30:00Z",
    "age": "45",
    "cancerType": "Breast Cancer",
    "stage": "Stage II",
    "treatmentStatus": ["Chemotherapy", "Radiation"],
    "diagnosisDate": "2025-01-15",
    "postTestAvailable": false,
    "assignedCaregiver": {
      "id": "CG001",
      "name": "Dr. Smith",
      "email": "smith@example.com"
    },
    "questionnaireEnabled": true,
    "lastQuestionnaireSubmission": "2025-11-25T14:20:00Z"
  }
}
```

### Step 6: Frontend Storage & Redirect
```
JavaScript (Frontend):
1. localStorage.setItem('userData', JSON.stringify(data.user))
2. Router redirects to: /patient/dashboard
```

### Step 7: Patient Dashboard Access
```
Patient Dashboard (/patient/dashboard)

On Load:
1. Reads localStorage.userData
2. Validates: userType === 'patient' && isAssigned === true
3. If invalid → Redirect to /login
4. If valid → Load dashboard

Dashboard Features:
- Welcome section with patient name & caregiver info
- Questionnaire section (if enabled)
- Patient information card
- Logout button
- Last submission tracking
```

### Step 8: Logout
```
Patient clicks "Logout" button
↓
1. Clear localStorage: removeItem('userData')
2. Redirect to: /login
↓
Patient returned to login page (clean session)
```

## 🚀 Error Scenarios

### Scenario 1: Patient Not Found
```
User enters invalid patientId
↓
Response: 404 Not Found
{
  "success": false,
  "message": "Patient not found. Please check your ID."
}
UI: Shows error alert
```

### Scenario 2: Patient Not Assigned
```
Patient exists but isAssigned = false
↓
Response: 403 Forbidden
{
  "success": false,
  "message": "Your account has not been activated yet. Please wait for the administrator to assign you to a caregiver.",
  "needsAssignment": true
}
UI: Shows error alert with specific message
```

### Scenario 3: Missing Required Fields
```
User submits without selecting user type or entering ID
↓
Response: 400 Bad Request
{
  "success": false,
  "message": "User ID and type are required"
}
UI: Form validation error message
```

### Scenario 4: Patient Tries Direct Dashboard Access Without Login
```
User navigates directly to /patient/dashboard without login
↓
Dashboard checks localStorage.userData
↓
If empty or invalid:
  - Clear localStorage
  - Redirect to /login
```

## 📁 API Endpoints

### Authentication
```
POST /api/auth/user-login
  - Authenticates caregiver or patient
  - Checks assignment status
  - Returns user data

POST /api/patient/login (legacy, kept for backward compatibility)
  - Patient-specific login
  - Also checks assignment status
```

### Patient Dashboard
```
GET /api/patient/dashboard?patientId=X
  - Fetches patient data
  - Fetches assigned questionnaire
  - Returns dashboard data

POST /api/patient/questionnaire/submit
  - Submits questionnaire responses
  - Updates patient answers
  - Returns success confirmation
```

## 🛡️ Security Measures

1. **Session Management**:
   - localStorage stores userData after successful login
   - Session cleared on logout
   - Persistent authentication across page reloads

2. **Access Control**:
   - Dashboard checks authentication on mount
   - Redirects unauthorized users to login
   - Validates user type and assignment status

3. **Data Validation**:
   - Required field validation on login form
   - Server-side validation of userId and userType
   - Database queries verify assignment relationship

4. **Error Handling**:
   - Descriptive error messages for user feedback
   - No sensitive data in error responses
   - Proper HTTP status codes

## 📊 Data Model References

### Patient Model
```javascript
{
  patientId: String (unique),
  name: String,
  email: String,
  phone: String,
  age: String,
  cancerType: String,
  cancerStage: String,
  
  // Assignment
  isAssigned: Boolean (false by default),
  assignedCaregiver: ObjectId (Reference to Caregiver),
  
  // Questionnaire
  questionnaireEnabled: Boolean,
  questionnaireAnswers: Array,
  lastQuestionnaireSubmission: Date,
  
  // Tracking
  lastLogin: Date,
  createdAt: Date
}
```

### Caregiver Model
```javascript
{
  caregiverId: String (unique),
  name: String,
  email: String,
  phone: String,
  
  // Assignment
  isAssigned: Boolean,
  assignedPatient: ObjectId (Reference to Patient),
  
  // Tracking
  lastLogin: Date,
  createdAt: Date
}
```

## 🔐 Authentication Best Practices

1. ✅ Assignment validation before login allowed
2. ✅ localStorage for session persistence
3. ✅ Automatic redirect for unauthorized access
4. ✅ Logout clears all session data
5. ✅ User type validation on dashboard
6. ✅ HTTP status codes match error types

## 📝 Admin Assignment Process

### Via Admin Dashboard
1. Navigate to Admin Dashboard
2. Click "Assign Caregiver to Patient" button
3. Select patient from dropdown
4. Select caregiver from dropdown
5. Confirm assignment
6. System updates:
   - Patient.isAssigned = true
   - Patient.assignedCaregiver = caregiverId
   - Caregiver.isAssigned = true
   - Caregiver.assignedPatient = patientId

### Patient Can Now Login
- Patient has received their patientId during registration
- Patient navigates to http://localhost:3000/login
- Selects "Patient" from dropdown
- Enters their patientId
- Gets authenticated and redirected to dashboard

## 🧪 Testing the Flow

### Test Case 1: Successful Patient Login
```
1. Create patient in admin dashboard
2. Assign caregiver to patient
3. Go to /login
4. Select "Patient" → Enter patientId
5. Expect: Redirect to /patient/dashboard
6. Verify: Patient name and caregiver info displayed
```

### Test Case 2: Unassigned Patient Blocked
```
1. Create patient (don't assign caregiver)
2. Go to /login
3. Select "Patient" → Enter patientId
4. Expect: Error message about activation
5. Verify: Not redirected to dashboard
```

### Test Case 3: Invalid Patient ID
```
1. Go to /login
2. Select "Patient" → Enter invalid ID
3. Expect: "Patient not found" error
4. Verify: Stays on login page
```

### Test Case 4: Logout & Re-login
```
1. Login as patient (successful)
2. Click Logout button
3. Expect: Redirect to /login
4. Verify: localStorage cleared
5. Try accessing /patient/dashboard directly
6. Expect: Redirect back to /login
```

## 🎯 Key Points Summary

| Aspect | Detail |
|--------|--------|
| **Login URL** | `http://localhost:3000/login` |
| **User Selection** | Dropdown: "I am a..." |
| **ID Entry** | TextField for userId (patientId for patients) |
| **Assignment Required** | Yes, must be assigned to caregiver first |
| **Success Response** | Redirects to `/patient/dashboard` |
| **Failed Response** | Shows error message, stays on login |
| **Session Storage** | localStorage.userData |
| **Logout** | Clears localStorage, redirects to `/login` |
| **Dashboard Protection** | Validates authentication on load |
| **Similar Behavior** | Identical to caregiver login flow |

This authentication system ensures that only properly assigned patients can access the system, maintaining data integrity and proper caregiver-patient relationships.
