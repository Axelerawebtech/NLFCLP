# ⚡ QUICK ACTION - Questionnaire Fix

## What Was Fixed
✅ API endpoint now correctly finds patients by custom ID (e.g., "PTMI4RLYMR")

## Do This Now

### 1️⃣ Restart Server
```bash
Ctrl + C
npm run dev
```
Wait for: `✓ Ready in X.Xs`

### 2️⃣ Clear Browser Cache
```
Ctrl + Shift + Delete
→ Select "All time"
→ Check all boxes
→ Clear data
→ Close browser completely
→ Reopen browser
```

### 3️⃣ Go to Login
```
http://localhost:3000/login
```

### 4️⃣ Login as Patient
- Select: **Patient**
- Enter ID: **PTMI4RLYMR**
- Click: **Login**

### 5️⃣ Check Dashboard
After redirect to `/patient/dashboard`, you should see:
- ✅ Welcome message
- ✅ **WHOQOL-BREF** section with title
- ✅ **26 Questions** listed
- ✅ Each question with **radio buttons**
- ✅ **Submit Questionnaire** button

## ✅ Success Indicators

```
Visual ✓
├─ "WHOQOL-BREF (Quality of Life Assessment)" visible
├─ "Q1: How would you rate your quality of life?" shown
└─ Radio button options displayed

Functional ✓
├─ Can select answer options
├─ Can scroll through 26 questions
└─ Can click Submit Questionnaire
```

## 🔧 If Still Not Showing

Open browser console (F12) and paste:
```javascript
JSON.parse(localStorage.getItem('userData'))
```

Should show:
```json
{
  "id": "PTMI4RLYMR",
  "userType": "patient",
  "questionnaireEnabled": true
}
```

If `questionnaireEnabled: false` → Go to Admin Dashboard and enable it

## 🆘 Last Resort

1. Delete `.next` folder: `rm -rf .next`
2. Restart server: `npm run dev`
3. Clear cache again
4. Retry login

---

**Status**: 🟢 **READY TO TEST**
