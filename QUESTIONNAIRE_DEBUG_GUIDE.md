# QUESTIONNAIRE SUBMISSION TESTING GUIDE

## Problem
Questionnaire responses not being saved to database even though the patient sees a success message.

## Root Cause
Need to verify the actual API call and data format being sent.

## Testing Steps

### 1. Start the Server Fresh
```bash
cd c:\Users\Admin\Documents\Axelera\ Projects\NLFCP-new\NLFCLP
npm run dev
```
Wait for "Ready" message (3-5 seconds)

### 2. Clear Browser Cache
- Press: `Ctrl + Shift + Delete`
- Clear "All time" or "Since I opened the browser"
- Clear Cookies, Cache, etc.

### 3. Open Browser Console
- Press: `F12`
- Go to "Console" tab
- Keep this open during testing

### 4. Login as Patient
- Go to: http://localhost:3000/login
- Email: test18@example.com
- Password: password123
- Look for console logs starting with `[Dashboard]`

### 5. Fill Out Questionnaire
- Fill out at least 3-5 questions with different answers
- Make sure each question has a value selected

### 6. Click Submit Questionnaire
- Watch the console output - you should see:
  ```
  [Dashboard] Submitting questionnaire:
  [Dashboard] patientId: PTMI4RLYMR
  [Dashboard] answers count: 26 (or however many questions)
  [Dashboard] Sample answer: {questionId: "...", questionText: "...", answer: "Good", submittedAt: "..."}
  [Dashboard] Response status: 200
  [Dashboard] Response data: {success: true, ...}
  ```

### 7. Check Terminal Output
- Look at terminal running npm for `[Submit API]` logs:
  ```
  [Submit API] Received submission:
  [Submit API] patientId: PTMI4RLYMR
  [Submit API] answers type: array
  [Submit API] answers length: 26
  [Submit API] Searched by custom patientId, found: true
  [Submit API] ✅ SUCCESS: Patient PTMI4RLYMR saved 26 answers
  ```

### 8. Verify in Database
Run this command in a new terminal:
```bash
cd c:\Users\Admin\Documents\Axelera\ Projects\NLFCP-new\NLFCLP
node scripts/check-db-direct.js
```
Should show:
```
Answers Count: 26
Found responses:
[1] Q1: How would you rate your quality of life?
    Answer: [your answer]
    Submitted: [timestamp]
...
```

### 9. Verify in Admin View
- Go to: http://localhost:3000/admin/login
- Username: admin
- Password: admin123
- Navigate to Patient Profiles
- Find patient "test eigteen"
- Click "View Profile"
- Check "Questionnaire Responses" section
- Should show all 26 responses with actual answer values

## Debug Checklist

- [ ] Console logs appear with "[Dashboard]" prefix
- [ ] Response status is 200 (not 404, 500, etc.)
- [ ] Terminal shows "[Submit API]" logs
- [ ] Database check shows answer count > 0
- [ ] Admin view shows responses table (not "No responses yet")

## If It Still Doesn't Work

Create a file `/test-api.js` in the project root with:
```javascript
const axios = require('axios');

axios.post('http://localhost:3000/api/patient/questionnaire/submit', {
  patientId: 'PTMI4RLYMR',
  answers: [
    {
      questionId: '1',
      questionText: 'Test Q1',
      answer: 'Test Answer',
      submittedAt: new Date().toISOString()
    }
  ]
}).then(r => console.log('✅ Success:', r.data))
  .catch(e => console.log('❌ Error:', e.response?.data || e.message));
```

Run: `node test-api.js`

This bypasses the dashboard and tests the API directly.
