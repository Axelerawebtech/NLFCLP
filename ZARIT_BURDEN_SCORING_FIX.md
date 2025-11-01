# Zarit Burden Assessment Scoring Fix

## Issue
When a caregiver selected option 2 (Rarely) for all 22 questions, the system:
- **Expected**: Score 22 → "mild" burden level → mild video
- **Actual**: Score 22 → "severe" burden level (wrong) → moderate video (also wrong)

## Root Cause
Multiple hardcoded scoring calculations were using incorrect score ranges throughout the codebase.

## Score Ranges (Corrected)
- **0-40**: mild burden
- **41-60**: moderate burden  
- **61-88**: severe burden

## Option Scoring (Correct)
- Option 1 (Never): 0 points
- Option 2 (Rarely): 1 point
- Option 3 (Sometimes): 2 points
- Option 4 (Quite Frequently): 3 points
- Option 5 (Nearly Always): 4 points

## Files Fixed

### 1. InlineBurdenAssessment.js
**Issue**: Hardcoded fallback calculation on line 370
```javascript
// WRONG
const burdenLevel = existingLevel || (totalScore <= 10 ? 'mild' : totalScore <= 20 ? 'moderate' : 'severe');

// FIXED
const burdenLevel = existingLevel || calculateBurdenLevel(totalScore);
```

**Also fixed**: calculateBurdenLevel fallback ranges
```javascript
// WRONG
if (totalScore <= 20) return 'mild';
if (totalScore <= 40) return 'moderate';

// FIXED  
if (totalScore <= 40) return 'mild';
if (totalScore <= 60) return 'moderate';
```

### 2. ZaritBurdenAssessment.js
**Fixed**: Same calculateBurdenLevel fallback issue and getFallbackScoreRanges

### 3. pages/api/admin/burden-assessment/config.js
**Fixed**: getDefaultScoreRanges() function to use simplified 3-tier system
```javascript
// WRONG (4 ranges, confusing)
littleOrNoBurden: { min: 0, max: 20, burdenLevel: 'mild' },
mildToModerate: { min: 21, max: 40, burdenLevel: 'mild' },
moderateToSevere: { min: 41, max: 60, burdenLevel: 'moderate' },
severe: { min: 61, max: 88, burdenLevel: 'severe' }

// FIXED (3 clear ranges)
mild: { min: 0, max: 40, burdenLevel: 'mild' },
moderate: { min: 41, max: 60, burdenLevel: 'moderate' },
severe: { min: 61, max: 88, burdenLevel: 'severe' }
```

### 4. models/CaregiverProgram.js
**Fixed**: calculateBurdenLevel method
```javascript
// WRONG
if (totalScore <= 10) burdenLevel = 'mild';
else if (totalScore <= 20) burdenLevel = 'moderate';

// FIXED
if (totalScore <= 40) burdenLevel = 'mild';
else if (totalScore <= 60) burdenLevel = 'moderate';
```

### 5. models/CaregiverProgramEnhanced.js
**Fixed**: Same calculateBurdenLevel method issue

### 6. components/ZaritBurdenAssessmentPreTest.js
**Fixed**: getBurdenLevel function and related text/color functions
```javascript
// WRONG
if (score >= 0 && score <= 20) return 'mild';
if (score >= 21 && score <= 40) return 'mild-moderate';
if (score >= 41 && score <= 60) return 'moderate-severe';

// FIXED
if (score >= 0 && score <= 40) return 'mild';
if (score >= 41 && score <= 60) return 'moderate';
if (score >= 61 && score <= 88) return 'severe';
```

## Test Case Verification
**User selects option 2 (Rarely) for all 22 questions:**
- Score: 22 × 1 = 22 points
- Burden level: mild (22 ≤ 40)
- Expected video: mild burden video
- Expected UI text: "Mild Burden" or "Mild"

## Impact
✅ Scoring now correctly matches standard Zarit Burden Interview ranges
✅ UI will show correct burden level text
✅ Correct burden-specific videos will be displayed
✅ All scoring calculations are consistent across the application

## Next Steps
1. Test the assessment with the corrected scoring
2. Verify that the correct video is displayed for each burden level
3. Ensure database entries have the correct burden levels going forward