# Reminder Target Audience Feature - Implementation Complete

## Overview
Enhanced the reminder system to support targeting specific caregiver groups based on their burden/stress assessment levels (Day 1 Zarit Burden Test, Day 2 Stress Assessment).

## Changes Implemented

### 1. Admin UI Enhancement (`components/DynamicDayManager.js`)

**New Fields Added:**
- **Target Audience Selector**:
  - 🌍 All Caregivers (default)
  - 🎯 Specific Groups (by burden/stress level)

- **Burden/Stress Level Checkboxes** (when Specific Groups selected):
  - 🟢 Mild (Low burden/stress level)
  - 🟡 Moderate (Medium burden/stress level)
  - 🔴 Severe (High burden/stress level)

**UI Features:**
- Visual checkbox interface with color-coded levels
- Warning message if no levels selected
- Preview shows target audience in summary
- Clean, user-friendly design with descriptions

**Data Structure:**
```javascript
{
  reminderMessage: "Your message here",
  targetAudience: "all" | "specific",
  targetLevels: ["mild", "moderate", "severe"], // array of selected levels
  frequency: "daily" | "weekly" | "custom",
  reminderTime: "09:00",
  // ... other fields
}
```

### 2. Backend API Update (`pages/api/caregiver/check-reminders.js`)

**Filtering Logic:**
1. Retrieve caregiver's current `burdenLevel` from database
2. For each reminder task:
   - Check `targetAudience` field
   - If `"all"` → include for all caregivers
   - If `"specific"` → check if caregiver's level is in `targetLevels` array
   - Skip reminder if caregiver has no level and reminder is targeted

**Code Changes:**
```javascript
// Get caregiver's current burden/stress level
const caregiverLevel = caregiverProgram.burdenLevel || null;

// Filter by target audience
if (targetAudience === 'specific') {
  if (!caregiverLevel) continue; // Skip if no level assigned
  if (!targetLevels.includes(caregiverLevel)) continue; // Skip if level doesn't match
}
```

### 3. Database Structure

**CaregiverProgram Model:**
- `burdenLevel`: String enum (`'mild'`, `'moderate'`, `'severe'`)
- Set after completing Day 1 Zarit Burden Test or Day 2 Stress Assessment

**ProgramConfig Model (Task Content):**
```javascript
{
  taskType: "reminder",
  content: {
    reminderMessage: String,
    targetAudience: String, // "all" or "specific"
    targetLevels: [String], // ["mild", "moderate", "severe"]
    frequency: String,
    reminderTime: String,
    // ... other fields
  }
}
```

## Use Cases

### Example 1: General Wellness (All Caregivers)
```javascript
{
  title: "Daily Meditation",
  targetAudience: "all",
  targetLevels: [],
  frequency: "daily",
  reminderTime: "07:00",
  reminderMessage: "Good morning! Take 5 minutes for meditation."
}
```
**Result**: Every caregiver receives this reminder daily at 7 AM.

### Example 2: Severe Burden Support Only
```javascript
{
  title: "Frequent Check-in",
  targetAudience: "specific",
  targetLevels: ["severe"],
  frequency: "custom",
  customInterval: 120, // every 2 hours
  reminderMessage: "Remember to take a break. Your well-being matters."
}
```
**Result**: Only caregivers with severe burden level receive this every 2 hours.

### Example 3: Multi-Level Support
```javascript
{
  title: "Evening Relaxation",
  targetAudience: "specific",
  targetLevels: ["moderate", "severe"],
  frequency: "daily",
  reminderTime: "21:00",
  reminderMessage: "Try deep breathing before sleep."
}
```
**Result**: Caregivers with moderate OR severe levels receive this daily at 9 PM.

## Testing

### Quick Test Steps:

1. **Create Targeted Reminder**:
   - Admin Dashboard → Program Config → Add Task → Reminder
   - Set Target Audience to "Specific Groups"
   - Select "Mild" only
   - Set Custom Interval: 1 minute

2. **Test Caregiver with Mild Level**:
   ```javascript
   db.caregiverprograms.updateOne(
     { caregiverId: ObjectId("YOUR_ID") },
     { $set: { burdenLevel: "mild" } }
   )
   ```
   - ✅ Should receive notification every minute

3. **Test Caregiver with Moderate Level**:
   ```javascript
   db.caregiverprograms.updateOne(
     { caregiverId: ObjectId("YOUR_ID") },
     { $set: { burdenLevel: "moderate" } }
   )
   ```
   - ❌ Should NOT receive notification (only mild targeted)

4. **Run Test Script**:
   ```bash
   node test-reminder-targeting.js
   ```
   - Shows all reminders with target audiences
   - Tests filtering logic for sample caregivers
   - Provides statistics on reminder distribution

## Files Modified

1. ✅ `components/DynamicDayManager.js`
   - Added target audience UI section
   - Added level checkbox selection
   - Updated preview display

2. ✅ `pages/api/caregiver/check-reminders.js`
   - Added caregiver level retrieval
   - Added target audience filtering logic
   - Returns targetAudience and targetLevels in response

3. ✅ `REMINDER_SYSTEM_TESTING_GUIDE.md`
   - Added target audience section
   - Added test cases for different scenarios
   - Added use case examples
   - Updated database queries

4. ✅ `test-reminder-targeting.js` (NEW)
   - Comprehensive test script
   - Lists all reminders with targeting info
   - Tests filtering logic
   - Provides statistics

## Important Notes

### Caregiver Level Assignment
- **Day 1**: After completing Zarit Burden Test → `burdenLevel` assigned
- **Day 2**: After completing Stress Assessment → `burdenLevel` updated
- **Before Assessment**: `burdenLevel` is `null` → only "All Caregivers" reminders received

### Backward Compatibility
- Existing reminders without `targetAudience` field → treated as "all" (default)
- Existing reminders without `targetLevels` field → treated as empty array
- No breaking changes to existing functionality

### API Response Format
```json
{
  "success": true,
  "reminders": [
    {
      "id": "task_123",
      "title": "Morning Reminder",
      "message": "Time for self-care!",
      "frequency": "daily",
      "time": "09:00",
      "targetAudience": "specific",
      "targetLevels": ["mild", "moderate"]
    }
  ]
}
```

## Next Steps

1. ✅ **Implementation Complete** - All code changes applied
2. ⏳ **Testing Required** - Manual end-to-end testing needed
3. 🔄 **User Feedback** - Gather feedback from admins on UI usability
4. 📈 **Analytics** (Future) - Track reminder engagement by burden level

## Benefits

1. **Personalized Care**: Different support levels for different caregiver needs
2. **Reduced Notification Fatigue**: Caregivers only get relevant reminders
3. **Targeted Interventions**: High-frequency support for severe cases
4. **Scalable**: Easy to add more reminders for specific groups
5. **Flexible**: Admins can target any combination of levels

## Summary

The reminder system now supports intelligent targeting based on caregiver assessment results. Admins can create:
- Universal reminders for everyone
- Specific reminders for mild burden caregivers (gentle encouragement)
- Specific reminders for moderate caregivers (regular check-ins)
- Specific reminders for severe caregivers (intensive support)
- Multi-level reminders (e.g., moderate + severe)

This enables a more personalized and effective caregiver support experience! 🎯✨
