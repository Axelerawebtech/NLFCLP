# 🚀 PATIENT AUTHENTICATION - QUICK START GUIDE

## 📍 URLs

| Page | URL | Purpose |
|------|-----|---------|
| **Unified Login** | `http://localhost:3000/login` | Login for all users (caregiver, patient, admin) |
| **Patient Dashboard** | `http://localhost:3000/patient/dashboard` | Patient's personalized dashboard (protected) |
| **Admin Dashboard** | `http://localhost:3000/admin/dashboard` | Admin features and assignments |

---

## 🔑 Patient Login Process (Step by Step)

### Step 1: Admin Creates Patient ✅
```
Admin Dashboard → Patient Management → Add New Patient

Input:
  - Name: "John Doe"
  - Phone: "+1234567890"
  - Age: "45"
  - Gender: "Male"
  - Medical Info: [filled in]
  
Result:
  - Patient created with patientId: "PAT001"
  - isAssigned = false (not yet assigned)
  - Patient appears in patient list
```

### Step 2: Admin Assigns Caregiver ✅
```
Admin Dashboard → Find "Assign Caregiver to Patient" Button

Click Button:
  - Select Patient: "John Doe (PAT001)"
  - Select Caregiver: "Dr. Smith (CG001)"
  - Confirm Assignment
  
Database Updates:
  - Patient.isAssigned = true
  - Patient.assignedCaregiver = CG001_ObjectId
  - Caregiver.isAssigned = true
  - Caregiver.assignedPatient = PAT001_ObjectId
```

### Step 3: Patient Goes to Login ✅
```
Open Browser:
  URL: http://localhost:3000/login

Display:
  - "NLFCLP User Login" heading
  - Language selector (top right)
  - Theme toggle (top right)
  
  Form Fields:
    1. Dropdown: "I am a..." (required)
    2. TextField: "Your ID" (required)
    3. Button: "Sign In"
```

### Step 4: Patient Selects User Type ✅
```
Click Dropdown: "I am a..."

Options Shown:
  ├─ 👨‍⚕️ Caregiver
  └─ 👤 Patient ← SELECT THIS

Selected: "Patient"
```

### Step 5: Patient Enters ID ✅
```
Click TextField: "Your ID"
Type: "PAT001"

Form Now Shows:
  - User Type: "Patient" ✓
  - Your ID: "PAT001" ✓
  - Submit Button: Enabled ✓
```

### Step 6: Patient Clicks Login ✅
```
Click Button: "Sign In"

Behind the Scenes:
  1. Form Validation: Check both fields filled
  2. API Call: POST /api/auth/user-login
     Request: {
       "userId": "PAT001",
       "userType": "patient"
     }
  
  3. Server Validation:
     - Find patient by patientId
     - Check: isAssigned === true ✓
     - Check: assignedCaregiver exists ✓
     - Update: lastLogin = now
     - Return: User data with caregiver info
```

### Step 7: Success - Login Confirmed ✅
```
Server Response (200 OK):
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
    "age": "45",
    "cancerType": "Breast Cancer",
    "stage": "Stage II",
    "assignedCaregiver": {
      "id": "CG001",
      "name": "Dr. Smith",
      "email": "smith@example.com"
    },
    "questionnaireEnabled": true,
    "lastQuestionnaireSubmission": null
  }
}

Frontend Actions:
  1. localStorage.setItem('userData', JSON.stringify(user))
  2. Display: "Login successful! Redirecting..."
  3. Redirect to: /patient/dashboard
```

### Step 8: Patient Dashboard Loads ✅
```
URL Changed to: http://localhost:3000/patient/dashboard

Dashboard Checks:
  1. Read localStorage.userData
  2. Validate: userType === 'patient' ✓
  3. Validate: isAssigned === true ✓
  4. Load: Dashboard data
  5. Fetch: Questionnaire (if enabled)

Dashboard Display:
┌─────────────────────────────────────┐
│ Patient Dashboard                   │
├─────────────────────────────────────┤
│ ┌─ Header ─────────────────────────┐│
│ │ 👤 Welcome, John Doe!            ││
│ │ Patient Dashboard                ││
│ │ Caregiver: Dr. Smith             ││
│ │              [Logout]            ││
│ └──────────────────────────────────┘│
│                                     │
│ ┌─ Questionnaire (if enabled) ────┐│
│ │ 📋 Emotional Support Assessment  ││
│ │ Description: Your emotional...   ││
│ │                                  ││
│ │ Question 1: How do you feel...   ││
│ │   ○ Very Good                    ││
│ │   ○ Good                         ││
│ │   ○ Fair                         ││
│ │   ○ Poor                         ││
│ │                                  ││
│ │ Question 2: Rate your support... ││
│ │ [Scale 1-10 with buttons]        ││
│ │                                  ││
│ │                [Submit] [Cancel] ││
│ └──────────────────────────────────┘│
│                                     │
│ ┌─ Your Information ────────────────┐│
│ │ Name: John Doe                   ││
│ │ Age: 45                          ││
│ │ Cancer Type: Breast Cancer       ││
│ │ Treatment Status: Chemotherapy   ││
│ └──────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

## ❌ Error Scenarios

### Scenario 1: Patient Not Yet Assigned
```
Steps 1-5: Same as above
Step 6: Click "Sign In"

Server Response (403 Forbidden):
{
  "success": false,
  "message": "Your account has not been activated yet. 
              Please wait for the administrator to 
              assign you to a caregiver.",
  "needsAssignment": true
}

Frontend Display:
┌─────────────────────────────────────┐
│ ⚠️ ERROR                            │
├─────────────────────────────────────┤
│ Your account has not been activated │
│ yet. Please wait for the            │
│ administrator to assign you to a    │
│ caregiver.                          │
│                                     │
│ [Close]                             │
└─────────────────────────────────────┘

User stays on login page
Can try again after admin assigns them
```

### Scenario 2: Invalid Patient ID
```
Step 5: Type "INVALID123"
Step 6: Click "Sign In"

Server Response (404 Not Found):
{
  "success": false,
  "message": "Patient not found. Please check your ID."
}

Frontend Display:
┌─────────────────────────────────────┐
│ ⚠️ ERROR                            │
├─────────────────────────────────────┤
│ Patient not found. Please check     │
│ your ID.                            │
│                                     │
│ [Close]                             │
└─────────────────────────────────────┘

User stays on login page
Should verify ID from registration
```

### Scenario 3: Missing Required Fields
```
Step 4: Don't select user type
Step 5: Leave ID field empty
Step 6: Try to click "Sign In"

Frontend Validation (Before API Call):
  - "I am a..." field is empty ❌
  - "Your ID" field is empty ❌
  - Submit button appears disabled
  OR shows error message: "Please fill in all fields"

User cannot proceed until all fields filled
```

---

## 🔄 Logout Process

### From Dashboard
```
Patient Dashboard loaded

Click Button: "Logout" (top right)

Frontend Actions:
  1. localStorage.removeItem('userData')
  2. Clear all session data
  3. Redirect to: /login

Result:
  - User back at login page
  - Must login again to access dashboard
  - Session completely cleared
```

---

## 🔐 Session Behavior

### Session Persists Across Reloads
```
1. Patient logs in successfully
2. Dashboard loads
3. Patient refreshes page (F5)
4. Dashboard checks localStorage
5. localStorage.userData still exists
6. Dashboard loads with session intact
7. User stays logged in ✓
```

### Session Lost on Logout
```
1. Patient on dashboard
2. Clicks logout
3. localStorage cleared
4. Redirected to /login
5. Try to access /patient/dashboard
6. No userData in localStorage
7. Redirected back to /login ✓
```

### Direct Dashboard Access Without Login
```
1. Patient tries: http://localhost:3000/patient/dashboard
2. No userData in localStorage
3. Dashboard detects unauthorized access
4. Clears any stale data
5. Redirects to /login ✓
6. User must login first
```

---

## 📊 Example Patient Data Flow

### Successful Login Example
```
Input Data (Patient Enters):
  User Type: "Patient"
  Patient ID: "PAT001"

API Processing:
  1. Query: Patient.findOne({ patientId: "PAT001" })
     Result: ✓ Patient found
  
  2. Check: patient.isAssigned === true
     Result: ✓ Yes, assigned
  
  3. Check: patient.assignedCaregiver exists
     Result: ✓ Yes, CG001 found
  
  4. Update: patient.lastLogin = 2025-11-28T16:30:00Z
  
  5. Return: Complete user object with caregiver data

localStorage Storage:
{
  "userData": {
    "id": "PAT001",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "userType": "patient",
    "isAssigned": true,
    "lastLogin": "2025-11-28T16:30:00Z",
    "age": "45",
    "cancerType": "Breast Cancer",
    "stage": "Stage II",
    "treatmentStatus": ["Chemotherapy"],
    "assignedCaregiver": {
      "id": "CG001",
      "name": "Dr. Smith",
      "email": "smith@example.com"
    },
    "questionnaireEnabled": true,
    "lastQuestionnaireSubmission": null
  }
}

Dashboard Display:
  - Welcome, John Doe!
  - Caregiver: Dr. Smith
  - Questionnaire enabled
  - Ready for interaction
```

---

## 🎯 Key Points to Remember

| Point | Detail |
|-------|--------|
| **Login URL** | `http://localhost:3000/login` |
| **Dashboard URL** | `http://localhost:3000/patient/dashboard` |
| **User Type** | Select "Patient" from dropdown |
| **ID Required** | Your patientId (from registration) |
| **Assignment Needed** | Admin must assign you first |
| **Error Unassigned** | "Account not yet activated" |
| **Session Storage** | localStorage (browser storage) |
| **Logout** | Clears session completely |
| **Dashboard Protected** | Can't access without login |
| **Caregiver Info** | Shown on dashboard after login |

---

## 🆘 If You Have Issues

### Issue: Can't Login
```
Checklist:
  ✓ Admin created you in system?
  ✓ Admin assigned caregiver to you?
  ✓ Correct patientId entered?
  ✓ Spelled exactly as shown in registration?
  
If all checked: Contact administrator
```

### Issue: Forgot Patient ID
```
Solution:
  - Check registration confirmation email
  - Contact administrator for your ID
  - Do NOT guess or try random IDs
```

### Issue: Dashboard Not Loading
```
Troubleshooting:
  1. Refresh page (F5)
  2. Clear browser cache (Ctrl+Shift+Delete)
  3. Close and reopen browser
  4. Try different browser
  
If still failing: Contact support
```

### Issue: Logged Out Unexpectedly
```
Cause: Browser cache or session timeout
Solution:
  1. Login again
  2. Try logging in from fresh browser tab
  3. Clear cache and try again
```

---

## 📱 Compatible Browsers

✅ Chrome / Chromium  
✅ Firefox  
✅ Safari  
✅ Edge  
✅ Opera  
✅ Brave  

---

## 🎓 Remember

- **Your Patient ID** = Your login username (unique to you)
- **Assignment Required** = Admin must assign caregiver first
- **Login URL** = `http://localhost:3000/login` (always the same)
- **Dashboard** = Personalized with your caregiver info
- **Questionnaire** = Admin enables as needed
- **Logout** = Clears everything for security
- **Session** = Persists until you logout or close browser

---

**You're all set!** 🎉  
Start by navigating to: **http://localhost:3000/login**

Last Updated: November 28, 2025
