# 🔍 HOW TO FIND THE CORRECT API REQUEST IN NETWORK TAB

## The Issue
You're looking at the PAGE request, not the API request!

- `GET /patient/dashboard` → Returns HTML (the page) ❌ This is what you saw
- `GET /api/patient/dashboard?patientId=...` → Returns JSON (the questionnaire data) ✅ This is what we need

## How to Find the Real API Call

### Step 1: Open DevTools
Press `F12`

### Step 2: Go to Network Tab
Click the "Network" tab

### Step 3: Filter for API Calls
In the Filter field, type: `api`

This will show only API requests, not page loads.

### Step 4: Login as Patient
Once you see the Network tab filtering for "api", login:
- Select: Patient
- ID: PTMI4RLYMR
- Click Login

### Step 5: After Dashboard Loads
Look in the Network tab for requests starting with `/api/`

You should see:
- `POST /api/auth/user-login` (login API)
- `GET /api/patient/dashboard?patientId=PTMI4RLYMR` ← **THIS IS THE ONE WE NEED!**

### Step 6: Click on the Dashboard API Request
Click on: `GET /api/patient/dashboard?patientId=PTMI4RLYMR`

### Step 7: Check the Response
Click the "Response" tab (NOT "Preview" tab)

You should see JSON like:
```json
{
  "success": true,
  "data": {
    "patient": {
      "name": "test eigteen",
      "questionnaireEnabled": true,
      ...
    },
    "questionnaire": {
      "title": "WHOQOL-BREF (Quality of Life Assessment)",
      "questions": [
        {
          "order": 1,
          "questionText": "How would you rate your quality of life?",
          "options": ["Very poor", "Poor", ...],
          ...
        },
        ... (26 total)
      ]
    }
  }
}
```

## What Each Section Means

### Headers Tab
Shows request headers - not important for debugging

### Response Tab
Shows the JSON data returned by API - **THIS IS WHAT WE NEED!**

### Preview Tab
Shows formatted preview - may not show everything

### Timing Tab
Shows how long the request took

## Troubleshooting

### If You Don't See `/api/patient/dashboard?patientId=...`

1. **It might have scrolled off** - scroll down in Network tab
2. **Filter is blocking it** - clear the "api" filter and search again
3. **Request failed** - look for red entries (errors)
4. **API wasn't called** - check browser console (F12 → Console tab)

### How to See Everything

1. Open Network tab **BEFORE** logging in
2. Clear Network tab (circular icon in top-left)
3. Login
4. All requests will be captured
5. Look for `/api/patient/dashboard?patientId=PTMI4RLYMR`

## Expected Response Structure

When API is working correctly, the Response should look like:

```json
{
  "success": true,
  "data": {
    "patient": {
      "_id": "691c994bac1e1fade6145ce3",
      "name": "test eigteen",
      "age": "41-50",
      "cancerType": "jdg",
      "questionnaireEnabled": true,
      "questionnaireAnswers": [...],
      "lastQuestionnaireSubmission": null
    },
    "questionnaire": {
      "_id": "69298195b149188959558376",
      "title": "WHOQOL-BREF (Quality of Life Assessment)",
      "description": "World Health Organization Quality of Life Assessment...",
      "questions": [
        {
          "order": 1,
          "questionText": "How would you rate your quality of life?",
          "type": "radio",
          "required": true,
          "options": ["Very poor", "Poor", "Neither poor nor good", "Good", "Very good"]
        },
        ... (25 more questions)
      ],
      "isActive": true
    }
  }
}
```

## If Response Has `questionnaire: null`

This means:
- API found the patient ✅
- But questionnaire wasn't returned ❌

Reasons:
1. `questionnaireEnabled: false` for patient
2. No questionnaire exists in database
3. Questionnaire is not marked as active

Check by running:
```bash
node scripts/check-questionnaire-status.js
```

---

**After you find the request and check the Response, tell me what you see in the Response section!**
