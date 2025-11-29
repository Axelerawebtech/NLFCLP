# QUICK FIX - Questionnaire Not Showing ⚡

## ✅ Database is Verified - Working Correctly!

The database setup is 100% correct:
- ✅ 26 WHOQOL questions in database
- ✅ Questionnaire is Active
- ✅ Patient has questionnaireEnabled = true
- ✅ Patient is assigned to caregiver

## 🎯 Most Likely Cause: Browser Cache

### Quick Fix (Do This First):

```
1. Ctrl + Shift + Delete (Clear browser cache)
2. Select "All time"
3. Check all options
4. Click "Clear data"
5. Close browser completely
6. Reopen and login again
```

## 🔄 If Cache Clear Didn't Work:

### Step 1: Verify in Browser Console (F12)
Paste this in console and check output:
```javascript
JSON.parse(localStorage.getItem('userData'))
// Look for: questionnaireEnabled: true
```

### Step 2: Restart Server
```bash
Ctrl + C  # Stop npm run dev
npm run dev  # Restart
```

### Step 3: Hard Refresh
```
Ctrl + Shift + R  (Windows/Linux)
or
Cmd + Shift + R   (Mac)
```

### Step 4: Login Fresh
1. Go to http://localhost:3000/login
2. Select "Patient"
3. Enter: PTMI4RLYMR
4. Click Login

## 📊 Verify It's Working

After login, check:
1. **Title shows**: "WHOQOL-BREF (Quality of Life Assessment)"
2. **Questions visible**: Should see Q1, Q2, Q3, etc.
3. **Options appear**: Each question has radio buttons

If you see all this → ✅ **WORKING CORRECTLY!**

## 🆘 Debug Commands

Run these if still having issues:

```bash
# Check database
node scripts/check-questionnaire-status.js

# Check questionnaire in admin
Go to: http://localhost:3000/admin/configure-patient-questionnaire
# Should show 26 WHOQOL questions
```

## 📝 What Should Appear

```
┌──────────────────────────────────────┐
│ Welcome, test eigteen                │
│ Patient Dashboard                    │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ 📋 WHOQOL-BREF (Quality of Life...)  │
│                                      │
│ Question 1 [Required]                │
│ How would you rate your quality...   │
│ ○ Very poor                          │
│ ○ Poor                               │
│ ○ Neither poor nor good              │
│ ○ Good                               │
│ ○ Very good                          │
│                                      │
│ Question 2 [Required]                │
│ How satisfied are you with...        │
│ ○ Very dissatisfied                  │
│ ... (24 more questions)              │
│                                      │
│ [Submit Questionnaire]               │
└──────────────────────────────────────┘
```

---

**TL;DR**: Clear cache → Restart server → Hard refresh → Login again ✅
