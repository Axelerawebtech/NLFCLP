# Questionnaire Responses Fix - Complete Solution

## Problem Identified:

Patient PTMI4RLYMR completed the questionnaire on the patient dashboard, but when viewing the profile from the admin panel, the questionnaire responses weren't showing.

## Root Cause:

There were **TWO issues** in the API endpoints:

### Issue 1: Questionnaire Submission Failing (Server Error)
**File**: `/pages/api/patient/questionnaire/submit.js`
**Problem**: Line 22 used `Patient.findById(patientId)` but `patientId` from frontend is the custom patient ID (like "PTMI4RLYMR"), not the MongoDB ObjectId
**Error**: `CastError: Cast to ObjectId failed for value "PTMI4RLYMR"`
**Result**: Questionnaire was NEVER being saved to database due to this error

### Issue 2: Admin Profile API Using Wrong Lookup
**File**: `/pages/api/admin/patients/[patientId].js`
**Problem**: Same issue - trying to find by MongoDB _id when receiving custom patientId
**Result**: Even if submission worked, admin couldn't fetch the patient details

## Solution Applied:

### Fix 1: Update Questionnaire Submit API ✅
```javascript
// Before (BROKEN):
const patient = await Patient.findById(patientId);

// After (FIXED):
let patient = null;
if (mongoose.Types.ObjectId.isValid(patientId)) {
  patient = await Patient.findById(patientId);
}
if (!patient) {
  patient = await Patient.findOne({ patientId });
}
```

### Fix 2: Update Admin Patient API ✅
```javascript
// Before (BROKEN):
const patient = await Patient.findById(patientId);

// After (FIXED):
let patient = null;
if (mongoose.Types.ObjectId.isValid(patientId)) {
  patient = await Patient.findById(patientId);
}
if (!patient) {
  patient = await Patient.findOne({ patientId });
}
```

## Files Modified:

1. `/pages/api/patient/questionnaire/submit.js`
   - Added `import mongoose`
   - Added proper ID validation and fallback lookup
   - Added console logging for debugging

2. `/pages/api/admin/patients/[patientId].js`
   - Added `import mongoose`
   - Updated GET method with proper ID lookup
   - Updated PUT method with proper ID lookup

## How to Test:

### Step 1: Clear Old Data (Optional)
```bash
# Check if patient has any existing answers
node scripts/check-patient-answers.js
```

### Step 2: Restart Server
```bash
# Stop current server
Ctrl+C

# Restart
npm run dev
```

### Step 3: Clear Browser Cache
```
Ctrl+Shift+Delete  # Clear all cache/cookies
```

### Step 4: Test Patient Questionnaire Submission
1. Go to http://localhost:3000/login
2. Login as PTMI4RLYMR (or any patient with questionnaireEnabled=true)
3. Fill out all 26 questionnaire questions
4. Click "Submit Questionnaire"
5. Should see: "✅ Questionnaire submitted successfully"

### Step 5: Verify Admin Can See Responses
1. Go to http://localhost:3000/admin/login
2. Login with admin credentials
3. Click "Patient Profiles"
4. Click "View Profile" on patient PTMI4RLYMR
5. Should see: "Questionnaire Responses" table with all 26 answers

## Expected Result:

✅ **Patient submits questionnaire** → No more server errors
✅ **Answers saved to database** → questionnaireAnswers array populated
✅ **Admin can view responses** → Visible in profile dialog
✅ **Responses count shows** → "5 Responses" chip visible
✅ **All details visible** → Question text, answer, submission timestamp

## Troubleshooting:

### If questionnaire still won't submit:
1. Check browser console (F12 → Console tab)
2. Look for error messages
3. Check network tab for /api/patient/questionnaire/submit response
4. Should be HTTP 200, not 500

### If responses don't show in admin view:
1. Verify patient has `questionnaireEnabled: true`
2. Check that submission returned success
3. Try refreshing admin page
4. Clear browser cache completely
5. Logout and login to admin panel

### To verify database:
```bash
node scripts/check-patient-answers.js
```
Should show:
- ✅ Found 26 answers
- Patient ID: PTMI4RLYMR
- Last submission date

## Summary:

**What was broken**: Questionnaire submission failed due to ID lookup error
**What was fixed**: Both submit and admin APIs now handle both MongoDB ID and custom patient ID
**Impact**: Patient responses now successfully save and display in admin profile

**Status**: ✅ COMPLETE - Ready to test
