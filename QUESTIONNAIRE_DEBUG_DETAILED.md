# 🔧 DEBUGGING QUESTIONNAIRE NOT SHOWING - DETAILED STEPS

## ⚠️ IMPORTANT: Server Must Be Restarted!

The API code was changed, so **you MUST restart the development server** for the changes to take effect.

## Step-by-Step Debugging

### Step 1: STOP the Server
```bash
In the terminal where npm run dev is running:
Ctrl + C
```

Wait for it to fully stop. You should see:
```
^C
```

### Step 2: RESTART the Server
```bash
npm run dev
```

Wait for it to say:
```
✓ Ready in X.Xs
```

### Step 3: Clear Browser Cache
```
Ctrl + Shift + Delete
Select "All time"
Check all checkboxes
Click "Clear data"
Close browser completely
```

### Step 4: Open Browser Fresh
```
Open new browser window
Go to http://localhost:3000/login
```

### Step 5: Open DevTools BEFORE Login
```
Press F12 to open Developer Tools
Go to "Console" tab
Keep console visible
```

### Step 6: Login as Patient
```
Select: Patient
Enter ID: PTMI4RLYMR
Click: Login
```

### Step 7: Check Console Output

In the browser console, you should see messages like:
```
[Dashboard] Fetching questionnaire for patientId: PTMI4RLYMR
[Dashboard] Full API Response: {...}
[Dashboard] Response status: 200
[Dashboard] Response success: true
✅ [Dashboard] Questionnaire found with 26 questions
```

### Step 8: Check Network Tab

1. Open DevTools
2. Go to "Network" tab
3. Look for request: `/api/patient/dashboard?patientId=PTMI4RLYMR`
4. Click on it
5. Go to "Response" tab
6. Should show:
```json
{
  "success": true,
  "data": {
    "questionnaire": {
      "title": "WHOQOL-BREF...",
      "questions": [
        {
          "order": 1,
          "questionText": "How would you rate...",
          ...
        },
        ... (26 total)
      ]
    }
  }
}
```

## Expected Results After Fix

### What You Should See on Dashboard:
✅ "WHOQOL-BREF (Quality of Life Assessment)"  
✅ "Question 1: How would you rate..."  
✅ Radio buttons for options  
✅ "Question 2, Question 3" etc.  
✅ "Submit Questionnaire" button  

### What Should Appear in Console:
✅ "[Dashboard] Fetching questionnaire for patientId: PTMI4RLYMR"  
✅ "[Dashboard] Response status: 200"  
✅ "[Dashboard] Response success: true"  
✅ "✅ [Dashboard] Questionnaire found with 26 questions"  

## Troubleshooting

### Problem: Still showing "No questionnaire available"

**Check Console for:**
```
❌ [Dashboard] No questionnaire in response
```

**If you see this**, check Network tab:
- Is the API request returning status 200?
- Is `success` field true?
- Is `questionnaire` null?

### Problem: Console shows error message

**Copy the exact error message and:**
1. Check if API returned 404 (Patient not found)
2. Check if API returned 500 (Server error)
3. Look at server logs in terminal running `npm run dev`

### Problem: Network request shows 404

```json
{
  "success": false,
  "message": "Patient not found"
}
```

**This means:**
- API is working
- But patient was not found with ID: PTMI4RLYMR
- Verify patient exists in database:
```bash
node scripts/debug-patient.js
```

### Problem: Network request shows 500

```json
{
  "success": false,
  "message": "Failed to fetch dashboard data",
  "error": "..."
}
```

**This means:**
- API is running
- But there's an error (check the error message)
- Check terminal logs where `npm run dev` is running

## Verification Commands

Run these to verify everything is set up correctly:

```bash
# Check patient exists and is enabled
node scripts/debug-patient.js

# Check questionnaire exists
node scripts/check-questionnaire-status.js

# Test API response simulation
node scripts/test-dashboard-api.js
```

## Key Points to Remember

1. **⚠️ MUST restart server** after code changes - this is the most common issue!
2. **⚠️ MUST clear browser cache** completely
3. **⚠️ MUST close and reopen browser** after cache clear
4. Keep browser console open while testing
5. Watch server logs in terminal for `[Dashboard API]` messages
6. Check Network tab for actual API response

## Server Logs You Should See

When you login, the terminal running `npm run dev` should show:
```
[Dashboard API] Received patientId: PTMI4RLYMR
[Dashboard API] Trying to find by custom patientId
[Dashboard API] Patient found: test eigteen
[Dashboard API] Questionnaire enabled, fetching...
[Dashboard API] Questionnaire found: WHOQOL-BREF... with 26 questions
GET /api/patient/dashboard?patientId=PTMI4RLYMR 200 in XXXms
```

If you don't see these, the API isn't being called or the server isn't restarted.

---

## Quick Checklist

- [ ] Stopped server (Ctrl + C)
- [ ] Restarted server (`npm run dev`)
- [ ] Waited for "Ready" message
- [ ] Cleared browser cache (Ctrl + Shift + Delete)
- [ ] Closed browser completely
- [ ] Opened fresh browser
- [ ] Opened DevTools (F12)
- [ ] Went to Console tab
- [ ] Logged in as patient
- [ ] Checked console for messages
- [ ] Checked Network tab for API response

**Do all these in order, then come back and let me know what you see in the console!**
