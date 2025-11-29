# WHOQOL Questionnaire Not Displaying - Debugging Guide

## ✅ Database Status Verified
- **Questionnaire**: Active with 26 WHOQOL questions
- **Patient**: PTMI4RLYMR with `questionnaireEnabled = true`
- **Assignment**: Patient is assigned to caregiver

## Common Issues & Solutions

### 1. **Browser Cache** (Most Common)
```bash
# Clear browser cache:
Ctrl + Shift + Delete  (Windows/Linux)
or
Cmd + Shift + Delete   (Mac)

# Then:
1. Close all browser tabs
2. Close browser completely
3. Reopen and go to http://localhost:3000/login
4. Login as patient with ID: PTMI4RLYMR
```

### 2. **API Response Check**
Open browser DevTools (F12) → Network tab → Look for:
- `dashboard?patientId=...` request
- Should show Status: 200
- Response should include `questionnaire` object with 26 questions

### 3. **localStorage Check**
In browser console (F12 → Console), run:
```javascript
console.log(JSON.parse(localStorage.getItem('userData')));
// Should show:
// {
//   id: "[patient_id]",
//   name: "test eigteen",
//   userType: "patient",
//   questionnaireEnabled: true,
//   isAssigned: true,
//   ...
// }
```

### 4. **Console Errors**
In browser DevTools (F12 → Console), look for:
- Any red error messages
- "Cannot read property..." errors
- "Module not found" errors

### 5. **Hard Refresh**
```
Ctrl + Shift + R   (Windows/Linux)
or
Cmd + Shift + R    (Mac)
```
This forces browser to reload without cache.

## Step-by-Step Testing

### Step 1: Clear Cache & Refresh
1. Open browser DevTools (F12)
2. Right-click on refresh button → Empty Cache and Hard Reload
3. Go to http://localhost:3000/login
4. Clear all localStorage
5. Refresh page

### Step 2: Login Fresh
1. Select "Patient" from dropdown
2. Enter ID: `PTMI4RLYMR`
3. Click Login

### Step 3: Check Network Request
1. Open DevTools → Network tab
2. Look for request starting with `/api/patient/dashboard?patientId=`
3. Click on it
4. Check "Response" tab
5. Should contain full questionnaire data with 26 questions

### Step 4: Check Console
1. Switch to Console tab
2. Paste: `JSON.parse(localStorage.getItem('userData'))`
3. Verify `questionnaireEnabled: true`

### Step 5: Verify Dashboard Load
1. Check if you see section: "WHOQOL-BREF (Quality of Life Assessment)"
2. Check if 26 questions are listed
3. If not, check console for JavaScript errors

## If Questions Still Don't Show

### Check 1: Is Patient Questionnaire Enabled?
Run this in browser console:
```javascript
const userData = JSON.parse(localStorage.getItem('userData'));
console.log('Questionnaire Enabled:', userData.questionnaireEnabled);
```
Should show: `true`

### Check 2: API Response Has Questionnaire
Check Network tab → `/api/patient/dashboard?...` → Response:
```javascript
{
  "success": true,
  "data": {
    "patient": { ... },
    "questionnaire": {
      "_id": "...",
      "title": "WHOQOL-BREF (Quality of Life Assessment)",
      "questions": [ /* 26 items */ ]
    }
  }
}
```

### Check 3: React Component Rendering
In console, run:
```javascript
const userData = JSON.parse(localStorage.getItem('userData'));
console.log('questionnaire should display:', userData.questionnaireEnabled === true);
```

## Force Retest

### Option A: Clear Everything
```bash
# In MongoDB
db.questionnaires.deleteMany({});
node scripts/seed-whoqol-questionnaire.js

# Then in browser:
1. Press Ctrl+Shift+Delete (clear cache)
2. Go to http://localhost:3000/admin/dashboard
3. Re-enable questionnaire for PTMI4RLYMR
4. Login as patient again
```

### Option B: Check Server Logs
Look at terminal running `npm run dev`:
- Any errors when accessing `/api/patient/dashboard`?
- Any database connection issues?

## Expected Output on Dashboard

After successful login, patient should see:

```
┌─────────────────────────────────────────┐
│   Welcome, test eigteen                 │
│   Patient Dashboard                     │
│   Caregiver: [Caregiver Name]           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📋 WHOQOL-BREF (Quality of Life...)     │
│                                         │
│ Question 1: How would you rate...       │
│ ○ Very poor  ○ Poor  ○ Good...         │
│                                         │
│ Question 2: How satisfied...            │
│ ○ Very dissatisfied  ○ Dissatisfied... │
│ ...                                     │
│                                         │
│ [Submit Questionnaire]                  │
└─────────────────────────────────────────┘
```

## Still Not Working?

1. **Check if you're using Incognito/Private Mode**
   - Try in normal mode with cache cleared
   
2. **Try Different Patient**
   - Maybe enable questionnaire for another patient and test
   
3. **Check Patient ID**
   - Verify ID is exactly: `PTMI4RLYMR` (case-sensitive)

4. **Restart Server**
   ```bash
   Ctrl + C (stop server)
   npm run dev (restart)
   ```

5. **Check for Multiple Questionnaires**
   - Run: `node scripts/check-questionnaire-status.js`
   - Should show exactly 1 active questionnaire

## Success Criteria ✅

- [ ] Patient can login
- [ ] Patient sees welcome message
- [ ] Patient sees "WHOQOL-BREF..." questionnaire title
- [ ] All 26 questions are visible
- [ ] Each question has 5 radio button options
- [ ] Can select options and submit
- [ ] Answers are saved

---

**Need more help?** Check the server logs in the terminal where you ran `npm run dev`.
