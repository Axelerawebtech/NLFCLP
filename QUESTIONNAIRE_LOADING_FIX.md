## Questionnaire Loading Issue - Fixed! ✅

### Problem
When enabling the questionnaire for a caregiver, the questionnaire wasn't loading on the caregiver dashboard - showing a blank screen or no assessment sections.

### Root Cause
The `CaregiverAssessment` document didn't exist in the database. The dashboard API (`/api/caregiver/questionnaire-dashboard`) was trying to fetch it but returned `null` when not found, causing the frontend to show nothing.

### Solution Implemented
Updated `/pages/api/caregiver/questionnaire-dashboard.js` to **auto-create** the default 3-section assessment if it doesn't exist when:
1. Caregiver has `questionnaireEnabled = true`
2. No active `CaregiverAssessment` is found in database

### Changes Made
```javascript
// Before: Returned null if assessment not found
assessment = await CaregiverAssessment.findOne({ isActive: true });
if (!assessment) {
  console.log('No active assessment found');
  // Returned null → blank screen
}

// After: Auto-creates assessment if not found
assessment = await CaregiverAssessment.findOne({ isActive: true });
if (!assessment) {
  console.log('Creating default assessment...');
  assessment = await CaregiverAssessment.create({
    title: 'Caregiver Comprehensive Assessment',
    description: 'Complete all three sections in order',
    sections: await generateDefaultSections(), // Zarit + DASS-7 + WHOQOL
    isActive: true
  });
}
```

### Added Helper Functions
- `generateDefaultSections()` - Creates 3 assessment sections
- `generateZaritQuestions()` - 22 burden assessment questions
- `generateDASS7Questions()` - 7 stress assessment questions  
- `generateWHOQOLQuestions()` - 2 quality of life questions

All questions include English, Hindi, and Kannada translations.

### Testing Steps

1. **Enable Questionnaire for a Caregiver:**
   - Go to Admin Panel → Caregiver Profile
   - Click "Questionnaire" tab
   - Toggle "Enable Questionnaire" to ON

2. **Login as Caregiver:**
   - Go to caregiver dashboard
   - You should now see:
     - "Immediate Post Test" label
     - "Start Assessment" button
     - When clicked, shows Section 1: Zarit Burden Assessment

3. **Verify Sections Load:**
   - Section 1: Zarit Burden (22 questions)
   - Section 2: DASS-7 Stress (7 questions)
   - Section 3: WHOQOL (2 questions)
   - Progress indicators show: 🔵 1 → ⚪ 2 → ⚪ 3

### Browser Console Check
Open browser console (F12) and look for:
```
[Caregiver Dashboard API] Questionnaire enabled, fetching multi-section assessment...
[Caregiver Dashboard API] Assessment found with 3 sections
```

OR if it was just created:
```
[Caregiver Dashboard API] No active assessment found - creating default assessment...
[Caregiver Dashboard API] Default assessment created with 3 sections
```

### API Endpoint Logs
The server console (terminal) will show:
```
[Caregiver Dashboard API] caregiverId: xxx
[Caregiver Dashboard API] Questionnaire enabled, fetching multi-section assessment...
[Caregiver Dashboard API] Default assessment created with 3 sections
```

### Fallback Mechanism
If auto-creation fails for any reason:
- Returns `null` for assessment
- Frontend should show an error message
- Admin can manually create config via: `/api/admin/caregiver-assessment/config`

### Status
✅ **FIXED** - Questionnaire now auto-loads when enabled, no manual database setup needed!

### Files Modified
- `pages/api/caregiver/questionnaire-dashboard.js` (+100 lines)
  - Added auto-creation logic
  - Added helper functions for default questions

### Next Steps (If Still Not Working)
1. Check browser console for JavaScript errors
2. Verify caregiver `questionnaireEnabled = true` in database
3. Check network tab: `/api/caregiver/questionnaire-dashboard` response
4. Run debug script: `node debug-questionnaire-loading.js <caregiverId>`
5. Manually trigger config creation: GET `/api/admin/caregiver-assessment/config`
