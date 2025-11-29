# Patient Authentication System - Visual Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PATIENT LOGIN SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

                          UNIFIED LOGIN PAGE
                    (/login - For all user types)
                              │
                   ┌──────────┴──────────┐
                   │                     │
            SELECT USER TYPE      SELECT USER TYPE
            ┌─────────────────┐  ┌─────────────────┐
            │   CAREGIVER     │  │    PATIENT      │
            │    (Option 1)   │  │   (Option 2)    │
            └────────┬────────┘  └────────┬────────┘
                     │                    │
           ENTER ID: caregiverId    ENTER ID: patientId
                     │                    │
        ┌────────────┴────────────────────┴──────────┐
        │                                            │
        ▼                                            ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│   POST /api/auth/user-login  │    │   POST /api/auth/user-login  │
│                              │    │                              │
│  Body: {                     │    │  Body: {                     │
│    userId: caregiverId,      │    │    userId: patientId,        │
│    userType: 'caregiver'     │    │    userType: 'patient'       │
│  }                           │    │  }                           │
└──────────┬───────────────────┘    └──────────┬───────────────────┘
           │                                   │
           └───────────────┬───────────────────┘
                           │
                  ▼ VALIDATION LOGIC ▼
        ┌─────────────────────────────────────────┐
        │  1. Find user by ID in database         │
        │  2. Check if isAssigned = true          │
        │  3. Check if has assigned relationship  │
        │     - Caregiver → assignedPatient       │
        │     - Patient → assignedCaregiver       │
        │  4. Update lastLogin timestamp          │
        │  5. Return user data or error           │
        └─────────────────────────────────────────┘
           │
    ┌──────┴──────────────────┐
    │                         │
    ▼ SUCCESS (200)      ▼ ERROR (403/404)
┌──────────────────┐  ┌──────────────────────┐
│ Return userData: │  │ Return Error Message │
│ - id             │  │ - message            │
│ - name           │  │ - needsAssignment    │
│ - email          │  │ - needsApproval      │
│ - userType       │  │                      │
│ - isAssigned     │  │ "Account not yet     │
│ - lastLogin      │  │ activated. Please    │
│ - caregiver info │  │ wait for admin       │
│   (if patient)   │  │ approval."           │
│ - patient info   │  │                      │
│   (if caregiver) │  └──────────────────────┘
│ - more...        │
└────────┬─────────┘
         │
         ▼ FRONTEND HANDLING
  ┌───────────────────────┐
  │ localStorage.setItem( │
  │   'userData',         │
  │   JSON.stringify(user)│
  │ )                     │
  └───────┬───────────────┘
          │
    ┌─────┴──────────┐
    │                │
    ▼ CAREGIVER    ▼ PATIENT
  REDIRECT TO   REDIRECT TO
  /caregiver/   /patient/
   dashboard    dashboard
     (Page)       (Page)
     │             │
     └─────┬───────┘
           │
     ▼ DASHBOARD PROTECTION
   ┌─────────────────────────┐
   │ 1. Check localStorage   │
   │ 2. Validate userType    │
   │ 3. Validate isAssigned  │
   │ 4. Clear if invalid     │
   │ 5. Redirect to login    │
   │    if not valid         │
   └────────────┬────────────┘
                │
        ✅ DASHBOARD LOADED
        
        Patient sees:
        - Welcome message
        - Caregiver info
        - Questionnaire (if enabled)
        - Patient info card
        - Logout button
```

## 📊 Database Relationships

```
┌──────────────────┐              ┌──────────────────┐
│    CAREGIVER     │◄────────────►│     PATIENT      │
├──────────────────┤  One to One  ├──────────────────┤
│ caregiverId      │              │ patientId        │
│ name             │              │ name             │
│ email            │              │ email            │
│ isAssigned       │──────┐   ┌───│ isAssigned       │
│ assignedPatient  │      │   │   │ assignedCaregiver│
│ lastLogin        │      │   │   │ lastLogin        │
│ createdAt        │      │   │   │ createdAt        │
└──────────────────┘      │   │   │                  │
                          │   │   │ questionnaireEnabled
                          │   │   │ questionnaireAnswers
                 ObjectId │   │   │ ObjectId
                 Reference└───┴───│ Reference
                          │       │
                    Both must be  │
                    populated for │
                    login to work │
                                  │
        ┌───────────────────────────────┐
        │  ┌─────────────────────────┐  │
        │  │  QUESTIONNAIRE MODEL    │  │
        │  ├─────────────────────────┤  │
        │  │ title                   │  │
        │  │ description             │  │
        │  │ questions (array)       │  │
        │  │   - questionText        │  │
        │  │   - type (radio, text..)│  │
        │  │   - options (array)     │  │
        │  │   - required (boolean)  │  │
        │  │ isActive                │  │
        │  │ createdAt               │  │
        │  └─────────────────────────┘  │
        │   (Shared by all patients)    │
        └───────────────────────────────┘
```

## 🔄 Complete Patient Onboarding Flow

```
START
  │
  ▼
┌──────────────────────────────────────┐
│  ADMIN: Create New Patient           │
│  - Fill registration form            │
│  - Patient gets patientId (PAT001)   │
│  - Status: isAssigned = false        │
│  - assignedCaregiver = null          │
└────────────┬─────────────────────────┘
             │
             ▼
    ┌────────────────────────┐
    │  PATIENT IN SYSTEM:    │
    │  - Created ✓           │
    │  - Waiting for         │
    │    caregiver           │
    │    assignment          │
    │  - Cannot login yet    │
    └────────────┬───────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │  ADMIN: Assign Caregiver         │
    │  - Click button in dashboard     │
    │  - Select patient: PAT001        │
    │  - Select caregiver: CG001       │
    │  - Confirm assignment            │
    └────────────┬─────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │  DATABASE UPDATE:                │
    │  Patient:                        │
    │    isAssigned = true             │
    │    assignedCaregiver = CG001_ID  │
    │  Caregiver:                      │
    │    isAssigned = true             │
    │    assignedPatient = PAT001_ID   │
    │  ✓ Assignment complete           │
    └────────────┬─────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │  PATIENT: Ready to Login         │
    │  - Navigate to /login            │
    │  - Select: "Patient"             │
    │  - Enter ID: PAT001              │
    │  - Click: Login                  │
    └────────────┬─────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │  API: Validate Login             │
    │  ✓ Patient exists                │
    │  ✓ isAssigned = true             │
    │  ✓ assignedCaregiver populated   │
    │  → Access Granted                │
    └────────────┬─────────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │  DASHBOARD LOADED:               │
    │  - Welcome, [Name]!              │
    │  - Caregiver: [Caregiver Name]   │
    │  - Questionnaire (if enabled)    │
    │  - Logout option                 │
    └────────────┬─────────────────────┘
                 │
                 ├─────────┬─────────┬──────────┐
                 │         │         │          │
                 ▼         ▼         ▼          ▼
            COMPLETE   REFRESH   LOGOUT    LOGOUT
            QUESTIONNAIRE         (clears  (stay
            (submit)            session)  logged)
                │                  │         │
                ▼                  ▼         ▼
            UPDATE DB    REDIRECT TO   REDIRECT TO
            + ALERT          LOGIN        LOGIN
                │               │          │
                └───────┬───────┴──────────┘
                        │
                        ▼
                      END
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
└─────────────────────────────────────────────────────────────┘

LAYER 1: FORM VALIDATION
├─ User type required (dropdown)
├─ User ID required (text field)
└─ Submit button disabled if incomplete

LAYER 2: API VALIDATION
├─ userId and userType required
├─ User must exist in database
├─ User must be assigned (isAssigned = true)
├─ Assigned relationship must exist
└─ Return proper HTTP status codes

LAYER 3: FRONTEND STORAGE
├─ Session stored in localStorage only
├─ No sensitive passwords stored
├─ Session cleared on logout
└─ Session data validated on page load

LAYER 4: DASHBOARD PROTECTION
├─ Check localStorage on mount
├─ Validate userType matches
├─ Validate isAssigned status
├─ Auto-logout if invalid
└─ Redirect to login if unauthorized

LAYER 5: API ENDPOINT PROTECTION
├─ Patient ID must match authenticated user
├─ Verify assignedCaregiver relationship
├─ Validate questionnaire belongs to patient
└─ Return only patient's own data
```

## 📈 Data Flow Diagram

```
┌────────┐                           ┌──────────────┐
│ PATIENT│                           │ ADMIN        │
│ Browser│                           │ Dashboard    │
└────┬───┘                           └──────┬───────┘
     │                                      │
     │ 1. Navigate to /login                │
     ├─────────────────────────────────────►│
     │                                      │
     │ 2. Admin assigns caregiver           │
     │ to patient                           │
     │                                      │
     │                        ┌─────────────┼────────────┐
     │                        │             │            │
     │                        ▼             ▼            ▼
     │                    DATABASE UPDATE:
     │                    - Patient.isAssigned = true
     │                    - Patient.assignedCaregiver = caregiverId
     │
     │ 3. Fill login form                   │
     │    - Select: Patient                 │
     │    - Enter ID: PAT001                │
     │    - Click: Login                    │
     │                                      │
     │ 4. POST /api/auth/user-login         │
     ├─────────────────────────────────────►│
     │    { userId: 'PAT001',               │
     │      userType: 'patient' }           │
     │                                      │
     │                        ┌──────────────────────┐
     │                        │  VALIDATION:        │
     │                        │  - Find patient     │
     │                        │  - Check isAssigned │
     │                        │  - Check caregiver  │
     │                        │  - Update lastLogin │
     │                        └──────────────────────┘
     │                                      │
     │ 5. Response: 200 OK                  │
     │◄─────────────────────────────────────┤
     │    { success: true,                  │
     │      user: {                         │
     │        id: 'PAT001',                 │
     │        name: 'John Doe',             │
     │        userType: 'patient',          │
     │        isAssigned: true,             │
     │        assignedCaregiver: {...}      │
     │      }                               │
     │    }                                 │
     │                                      │
     │ 6. localStorage.userData = {...}     │
     │ 7. Redirect to /patient/dashboard    │
     │
     │ 8. Dashboard mounts                  │
     │    - Checks localStorage             │
     │    - Validates userType & isAssigned │
     │    - Fetches questionnaire data      │
     │                                      │
     │ 9. Dashboard renders                 │
     │    - Patient info displayed          │
     │    - Caregiver info shown            │
     │    - Questionnaire available         │
     │                                      │
     │ 10. Patient completes questionnaire  │
     │     and submits                      │
     │                                      │
     │ 11. POST /api/patient/questionnaire/submit
     ├────────────────────────────────────►│
     │     { patientId, answers }           │
     │                                      │
     │                        ┌──────────────────────┐
     │                        │  SAVE TO DB:        │
     │                        │  - Store answers    │
     │                        │  - Update timestamp │
     │                        └──────────────────────┘
     │                                      │
     │ 12. Response: Success                │
     │◄────────────────────────────────────┤
     │                                      │
     │ 13. Dashboard updated                │
     │     - Confirmation shown             │
     │     - Submission date updated        │
     │                                      │
     │ 14. Patient clicks Logout            │
     │                                      │
     │ 15. localStorage cleared             │
     │ 16. Redirect to /login               │
     │
     └─────────────────────────────────────┘
```

## ✨ Key Takeaways

```
┌─────────────────────────────────────────────┐
│         PATIENT AUTHENTICATION FLOW         │
├─────────────────────────────────────────────┤
│                                             │
│  1️⃣  ADMIN creates patient                  │
│     → Patient registered, cannot login yet │
│                                             │
│  2️⃣  ADMIN assigns caregiver               │
│     → Patient record updated                │
│     → isAssigned = true                     │
│     → assignedCaregiver = caregiverId       │
│                                             │
│  3️⃣  PATIENT goes to /login                 │
│     → Unified login page                    │
│     → Select: "Patient"                     │
│     → Enter: Patient ID                     │
│                                             │
│  4️⃣  API validates assignment               │
│     → Check if isAssigned = true            │
│     → Check if caregiver assigned           │
│     → Return user data or error             │
│                                             │
│  5️⃣  SUCCESS: Session created               │
│     → Redirect to dashboard                 │
│     → Session stored in localStorage        │
│     → Dashboard protected & validated       │
│                                             │
│  6️⃣  PATIENT accesses features              │
│     → View assigned caregiver               │
│     → Complete questionnaire (if enabled)   │
│     → Logout anytime                        │
│                                             │
│  ✅  Behavior identical to caregiver flow    │
│                                             │
└─────────────────────────────────────────────┘
```

---

**Last Updated**: November 28, 2025  
**System Version**: 1.0
