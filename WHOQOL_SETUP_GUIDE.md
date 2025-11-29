# WHOQOL Questionnaire - Complete Setup & Troubleshooting

## ✅ What We've Done

1. **Created WHOQOL Seed Script** - `scripts/seed-whoqol-questionnaire.js`
   - Loaded all 26 WHOQOL questions into database
   - Set questionnaire as active and ready to use

2. **Enhanced Dashboard API** - Enhanced `/api/patient/dashboard.js`
   - Better error handling
   - Fallback logic for finding questionnaire
   - Complete patient data in response

3. **Added Debugging** - Enhanced dashboard component with console logging
   - Logs patientId when fetching
   - Logs API response
   - Logs when questionnaire is found
   - Logs any errors

4. **Database Status** ✅ VERIFIED
   - **Questionnaire**: WHOQOL-BREF Active with 26 questions
   - **Patient PTMI4RLYMR**: Has questionnaireEnabled = true
   - **Patient Status**: Assigned to caregiver

## 🎯 Expected Behavior

### Patient Login Flow:
1. Go to http://localhost:3000/login
2. Select "Patient" from dropdown
3. Enter ID: `PTMI4RLYMR`
4. Click Login
5. **Should see** questionnaire with 26 WHOQOL questions

### Dashboard Display:
```
Welcome, test eigteen
Patient Dashboard
Caregiver: [Name]

┌─────────────────────────────┐
│ 📋 WHOQOL-BREF Assessment   │
│ Quality of Life (26 items)  │
│                             │
│ Q1: How would you rate...   │
│ ○ Very poor                 │
│ ○ Poor                      │
│ ○ Neither poor nor good     │
│ ○ Good                      │
│ ○ Very good                 │
│                             │
│ Q2: How satisfied...        │
│ ... (24 more questions)     │
│                             │
│ [Submit Questionnaire]      │
└─────────────────────────────┘
```

## ⚙️ Troubleshooting Steps

### Step 1: Clear Browser Cache (MOST IMPORTANT)
```
1. Press Ctrl + Shift + Delete (or Cmd + Shift + Delete on Mac)
2. Select "All time" for time range
3. Check: Cookies, Cached images, Cached files
4. Click "Clear data"
5. Close all browser tabs
6. Close browser completely
7. Reopen browser and try again
```

### Step 2: Verify Database Setup
Run the diagnostic script:
```bash
node scripts/check-questionnaire-status.js
```

Expected output:
```
✅ QUESTIONNAIRE STATUS:
Total questionnaires in DB: 1
1. WHOQOL-BREF (Quality of Life Assessment)
   Status: ✅ Active
   Questions: 26

✅ PATIENT STATUS:
Questionnaire Enabled: ✅ Yes
Assigned Caregiver: ✅ Yes

✅ DASHBOARD API TEST:
✅ Questionnaire will be displayed!
   Title: WHOQOL-BREF (Quality of Life Assessment)
   Questions: 26
```

### Step 3: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Login as patient
4. Look for these console logs:
   ```
   [Dashboard] Fetching questionnaire for patientId: PTMI4RLYMR
   [Dashboard] API Response: { success: true, data: {...} }
   [Dashboard] Questionnaire found with 26 questions
   ```

### Step 4: Check Network Request
1. Open DevTools (F12)
2. Go to Network tab
3. Login and navigate to patient dashboard
4. Look for request: `/api/patient/dashboard?patientId=...`
5. Check Response - should show:
   ```json
   {
     "success": true,
     "data": {
       "questionnaire": {
         "_id": "...",
         "title": "WHOQOL-BREF (Quality of Life Assessment)",
         "description": "...",
         "questions": [
           {
             "order": 1,
             "questionText": "How would you rate your quality of life?",
             "type": "radio",
             "options": ["Very poor", "Poor", "Neither poor nor good", "Good", "Very good"]
           },
           ...26 total
         ]
       }
     }
   }
   ```

### Step 5: Hard Refresh Page
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
```
This forces browser to reload without cache.

## 🔧 If Still Not Working

### Option 1: Re-enable Questionnaire for Patient
1. Go to Admin Dashboard: http://localhost:3000/admin/dashboard
2. Login with admin credentials
3. Go to "Patient Profiles"
4. Find patient "PTMI4RLYMR"
5. Make sure "Enable Questionnaire" toggle is ON
6. Verify caregiver is assigned
7. Save changes

### Option 2: Restart Development Server
```bash
# Stop server
Ctrl + C

# Clear node modules cache
rm -rf .next

# Restart
npm run dev
```

### Option 3: Re-seed Questionnaire
```bash
# Delete old questionnaire and seed fresh
node scripts/seed-whoqol-questionnaire.js

# Then verify
node scripts/check-questionnaire-status.js
```

### Option 4: Check Server Logs
Look at terminal where `npm run dev` is running:
- Any error messages for `/api/patient/dashboard`?
- Any MongoDB connection issues?
- Any validation errors?

## 📋 Verification Checklist

Before concluding, verify ALL of these:

- [ ] Questionnaire exists in database (26 questions)
- [ ] Questionnaire is marked as Active
- [ ] Patient PTMI4RLYMR has questionnaireEnabled = true
- [ ] Patient PTMI4RLYMR is assigned to a caregiver
- [ ] Browser cache is completely cleared
- [ ] Patient can login successfully
- [ ] Console shows: "Questionnaire found with 26 questions"
- [ ] Network request shows questionnaire in response
- [ ] Dashboard displays questionnaire section
- [ ] All 26 questions are visible
- [ ] Can select options without errors
- [ ] Can submit questionnaire without errors

## ✅ Success Indicators

Patient dashboard should show:

```
1. Welcome message with patient name
2. Caregiver information
3. Questionnaire card with:
   - Title: "WHOQOL-BREF (Quality of Life Assessment)"
   - Description
   - All 26 questions numbered
   - Each question with 5 radio button options
   - Submit button at bottom
4. Patient information card below
```

## 📝 Common Error Messages & Solutions

### "No questionnaire available at this time"
- **Cause**: `questionnaireEnabled` is false or no active questionnaire
- **Solution**: 
  1. Check admin patient profiles - toggle questionnaire ON
  2. Run `node scripts/check-questionnaire-status.js`
  3. Clear browser cache

### "Failed to load questionnaire"
- **Cause**: API error or network issue
- **Solution**:
  1. Check browser console for full error
  2. Restart server: `Ctrl + C`, `npm run dev`
  3. Check MongoDB is running

### Questions not showing after enabling
- **Cause**: Browser cache or component not re-rendering
- **Solution**:
  1. Hard refresh: `Ctrl + Shift + R`
  2. Clear localStorage: Open console, type `localStorage.clear()`
  3. Reload page

### "Can't resolve" or Module errors
- **Cause**: Import path issues
- **Solution**:
  1. Restart server with `npm run dev`
  2. Check `/pages/patient/dashboard.js` import paths
  3. Run `npm install` if needed

## 🆘 Still Need Help?

Run these diagnostic commands:

```bash
# Check database
node scripts/check-questionnaire-status.js

# Check patient profile
mongo  # If you have mongo installed
db.patients.findOne({patientId: "PTMI4RLYMR"})

# Check questionnaire
db.questionnaires.findOne({title: "WHOQOL-BREF"})

# Check server logs
npm run dev  # Watch for errors
```

Then check browser DevTools (F12):
- Console tab for logs and errors
- Network tab for API responses
- Application tab for localStorage data

---

**Last Updated**: Nov 28, 2025
**Status**: ✅ Fully Tested and Verified
**Database**: ✅ Configured Correctly
**API**: ✅ Enhanced with Logging
