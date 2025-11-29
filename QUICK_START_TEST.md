# QUICK START - TEST THE NEW FEATURES

## 1️⃣ Start the Server
```bash
cd "c:\Users\Admin\Documents\Axelera Projects\NLFCP-new\NLFCLP"
npm run dev
```
Wait for "Ready" message (~3-5 seconds)

## 2️⃣ Clear Browser Cache
Press `Ctrl+Shift+Delete` → Clear all data → Close browser tab

## 3️⃣ Test Fresh Submission
1. Go to http://localhost:3000/login
2. Login as patient PTMI4RLYMR
3. **Fill ALL 26 questions** (important - all must be answered)
4. Click "Submit Questionnaire"
5. ✅ Should see **GREEN SUCCESS CARD** with:
   - Checkmark icon
   - "Questionnaire Submitted Successfully!"
   - "You have submitted the pre-test. Please wait for the post-test questionnaires."
   - Submission timestamp
   - "Review / Edit Answers" button

## 4️⃣ Test Review/Edit
1. Click "Review / Edit Answers" button
2. ✅ All 26 questions should show with previous answers pre-filled
3. Change a few answers (e.g., Q1, Q5, Q10)
4. Click "Save Changes"
5. ✅ Should return to green success card

## 5️⃣ Verify in Admin
1. Go to http://localhost:3000/admin/login
2. Login: admin / admin123
3. Click "Patient Profiles"
4. Click "View Profile" on patient PTMI4RLYMR
5. Scroll to "Questionnaire Responses"
6. ✅ Should see TABLE with all 26 responses
7. ✅ Answers should be the UPDATED values you just saved

## 6️⃣ Test Re-Login
1. Click "Logout" in top right
2. Clear browser cache again: `Ctrl+Shift+Delete`
3. Go to http://localhost:3000/login
4. Login as PTMI4RLYMR again
5. ✅ Should see **GREEN SUCCESS CARD IMMEDIATELY** (no questionnaire form)
6. ✅ Message should say "You have submitted the pre-test..."

## 7️⃣ Test Edit After Re-Login
1. Click "Review / Edit Answers" again
2. Change different answers (e.g., Q2, Q7, Q15)
3. Click "Save Changes"
4. Go back to admin and refresh patient profile
5. ✅ Should see latest changes

## Expected Behavior Summary

| Action | Expected Result |
|--------|-----------------|
| Submit questionnaire | Green success card appears |
| Click "Review/Edit" | Form shows with pre-filled answers |
| Save changes | Returns to success card, admin updated |
| Re-login | Success card shows immediately |
| Click "Review/Edit" again | Form shows updated answers |
| Save again | Admin sees latest changes |

## Troubleshooting

If you don't see the success card:
- Check browser console (F12) for errors
- Check server terminal for API errors
- Make sure you filled all 26 questions
- Clear cache and try again

If answers don't pre-fill on edit:
- Refresh the page
- Check that submittedAnswers has data (console log)
- Make sure API returns answers

If changes don't appear in admin:
- Refresh admin page
- Logout/login to admin
- Check database: `node scripts/check-db-direct.js`

## Database Verification

To check if responses are saved:
```bash
node scripts/check-db-direct.js
```

Should output all 26 answers with actual values.
