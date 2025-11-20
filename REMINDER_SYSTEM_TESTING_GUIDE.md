# Reminder System - Testing Guide

## Overview
The reminder system allows admins to schedule notifications for caregivers at specified intervals (daily, weekly, or custom). Notifications appear as browser push notifications and in-app banners.

## Features Implemented

### 1. Admin Dashboard - Reminder Scheduling UI
Location: `/admin/program-config` → Add Task → Select "Reminder"

**Settings Available:**
- **Reminder Message**: Custom message shown in notification
- **Target Audience**: 
  - 🌍 **All Caregivers**: Send to everyone
  - 🎯 **Specific Groups**: Target by burden/stress level (mild, moderate, severe)
- **Frequency Options**:
  - 📅 **Daily**: Fires once per day at specified time
  - 📆 **Weekly**: Fires on selected days of week at specified time
  - 🕐 **Custom Time**: Fires at custom intervals (in minutes)
- **Time**: Specific time when reminder should fire (HH:MM format)
- **Week Days** (for weekly): Select which days to send reminders
- **Custom Interval** (for custom): Set interval in minutes (e.g., 30 = every 30 minutes)

### 2. Caregiver Dashboard - Notification Display
Location: `/caregiver/dashboard`

**Notification Types:**
1. **Browser Push Notifications**: Native browser notifications with sound
2. **In-App Banner**: Yellow notification banner at top-right of screen
3. **Permission Request**: Banner at bottom prompting user to enable notifications

### 3. Backend API - Reminder Checking
Endpoint: `/api/caregiver/check-reminders`

**Logic:**
- Checks every 30 seconds for pending reminders
- Compares current time with schedule
- **Filters by target audience**: Only includes reminders if caregiver's burden/stress level matches target groups
- Tracks last notification time to prevent duplicates
- Returns list of reminders to show

**Target Audience Filtering:**
- If reminder is set to "All Caregivers" → everyone receives it
- If reminder is set to "Specific Groups" → only caregivers with matching `burdenLevel` receive it
- Caregivers without a `burdenLevel` (haven't completed assessment) → only receive "All Caregivers" reminders

## Testing Steps

### Step 1: Create a Reminder Task (Admin)

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Open admin dashboard:
   ```
   http://localhost:3000/admin/program-config
   ```

3. Select a day (e.g., Day 0) and click **+ Add Task**

4. Configure reminder:
   - **Task Type**: Select "⏰ Reminder"
   - **Title**: "Morning Reminder"
   - **Description**: "Daily check-in reminder"
   - **Reminder Message**: "Time for your daily self-care check-in!"
   - **Target Audience**: Select "🌍 All Caregivers" (or "🎯 Specific Groups" to target by burden/stress level)
   - **Frequency**: Daily
   - **Time**: Set to current time + 2 minutes (for quick testing)

5. Click **➕ Add Task** to save

### Step 2: Test on Caregiver Dashboard

1. Open caregiver dashboard:
   ```
   http://localhost:3000/caregiver/dashboard
   ```

2. **Enable Notifications**:
   - You should see a blue banner at bottom: "Enable Notifications"
   - Click **Enable** button
   - Browser will prompt for notification permission → Click **Allow**

3. **Wait for Reminder**:
   - The system checks every 30 seconds
   - When scheduled time arrives (within 1-minute window), you'll see:
     - ✅ Browser push notification (with sound)
     - ✅ Yellow banner at top-right of screen
     - ✅ Console log in browser DevTools

4. **Interact with Notification**:
   - Click browser notification → window focuses and notification dismisses
   - Click **✕** on banner → banner dismisses
   - Notification auto-dismisses after 10 seconds

### Step 3: Test Target Audience Filtering

The reminder system supports targeting specific caregiver groups based on their burden/stress assessment results.

#### Understanding Target Audiences
- **All Caregivers**: Reminder is sent to everyone regardless of their burden/stress level
- **Specific Groups**: Reminder is sent only to caregivers with selected burden/stress levels:
  - 🟢 **Mild**: Caregivers assessed with low burden/stress
  - 🟡 **Moderate**: Caregivers assessed with medium burden/stress
  - 🔴 **Severe**: Caregivers assessed with high burden/stress

#### Test Case 1: All Caregivers Reminder
1. Create reminder with:
   - **Target Audience**: "🌍 All Caregivers"
   - **Frequency**: Custom Time, Interval: 1 minute
   - Result: All caregivers receive notification regardless of their level

#### Test Case 2: Mild Caregivers Only
1. Create reminder with:
   - **Target Audience**: "🎯 Specific Groups"
   - **Select Levels**: Check only "🟢 Mild"
   - **Frequency**: Custom Time, Interval: 1 minute

2. Set test caregiver to mild level:
   ```bash
   node set-caregiver-burden-level.js YOUR_CAREGIVER_ID mild
   ```
   - ✅ Should receive notification every minute

3. Change to moderate level:
   ```bash
   node set-caregiver-burden-level.js YOUR_CAREGIVER_ID moderate
   ```
   - ❌ Should NOT receive notification (only mild targeted)

#### Test Case 3: Multiple Groups
1. Create reminder with:
   - **Target Audience**: "🎯 Specific Groups"
   - **Select Levels**: Check "🟡 Moderate" and "🔴 Severe"
   - **Frequency**: Daily
2. Only caregivers with moderate or severe levels will receive this reminder

#### Test Case 4: Caregiver Without Assessment
1. Create targeted reminder (specific groups)
2. Test with caregiver who hasn't completed burden/stress assessment yet
   - ❌ Should NOT receive notification (no level assigned)
3. Once they complete assessment and get assigned a level
   - ✅ Will receive notifications if level matches target

### Step 4: Test Different Frequencies

#### Weekly Reminder
1. Create new reminder task with:
   - **Frequency**: Weekly
   - **Week Days**: Select 2-3 days (e.g., Monday, Wednesday, Friday)
   - **Time**: Current time + 2 minutes
   - Check that reminder only fires on selected days

#### Custom Interval
1. Create new reminder task with:
   - **Frequency**: Custom Time
   - **Custom Interval**: 1 (for testing - fires every minute)
   - Should see notification every minute

### Step 5: Verify Database Storage

Check MongoDB to verify reminder settings are saved:

```javascript
// In MongoDB Compass or shell:
db.programconfigs.find(
  { "dynamicDays.contentByLevel.tasks.taskType": "reminder" },
  { "dynamicDays.contentByLevel.tasks.$": 1 }
)

// Check reminder content with target audience:
db.programconfigs.aggregate([
  { $unwind: "$dynamicDays" },
  { $unwind: "$dynamicDays.contentByLevel" },
  { $unwind: "$dynamicDays.contentByLevel.tasks" },
  { $match: { "dynamicDays.contentByLevel.tasks.taskType": "reminder" } },
  { $project: {
    day: "$dynamicDays.dayNumber",
    title: "$dynamicDays.contentByLevel.tasks.title",
    message: "$dynamicDays.contentByLevel.tasks.content.reminderMessage",
    targetAudience: "$dynamicDays.contentByLevel.tasks.content.targetAudience",
    targetLevels: "$dynamicDays.contentByLevel.tasks.content.targetLevels",
    frequency: "$dynamicDays.contentByLevel.tasks.content.frequency"
  }}
])

// Check caregiver burden level:
db.caregiverprograms.find(
  { caregiverId: ObjectId("YOUR_CAREGIVER_ID") },
  { burdenLevel: 1, lastNotifications: 1 }
)

// Update caregiver burden level for testing:
db.caregiverprograms.updateOne(
  { caregiverId: ObjectId("YOUR_CAREGIVER_ID") },
  { $set: { burdenLevel: "mild" } }  // or "moderate" or "severe"
)
```

## File Changes Summary

### New Files Created
1. `components/NotificationManager.js` - Notification management component
2. `pages/api/caregiver/check-reminders.js` - API to check pending reminders

### Modified Files
1. `components/DynamicDayManager.js` - Added reminder scheduling UI
2. `components/SevenDayProgramDashboard.js` - Integrated NotificationManager
3. `models/CaregiverProgram.js` - Added `lastNotifications` field and `language` field

## Notification Logic

### Daily Reminder
- Fires if:
  - Current time matches scheduled time (±1 minute)
  - At least 23 hours since last notification

### Weekly Reminder
- Fires if:
  - Current day is in selected weekDays array
  - Current time matches scheduled time (±1 minute)
  - At least 6.9 days since last notification

### Custom Interval
- Fires if:
  - Minutes since last notification ≥ customInterval value

## Helper Scripts

### 1. Set Caregiver Burden Level
Quickly change a caregiver's burden level for testing:

```bash
# Set to mild
node set-caregiver-burden-level.js <caregiverId> mild

# Set to moderate  
node set-caregiver-burden-level.js <caregiverId> moderate

# Set to severe
node set-caregiver-burden-level.js <caregiverId> severe

# Remove level (only receive "All Caregivers" reminders)
node set-caregiver-burden-level.js <caregiverId> null
```

The script will:
- Show current level
- Update to new level
- List all reminders the caregiver can now receive

### 2. Test Reminder Targeting
View all reminders and test filtering logic:

```bash
node test-reminder-targeting.js
```

This shows:
- All configured reminders with target audiences
- Which caregivers would receive each reminder
- Statistics on reminder distribution by level

## Troubleshooting

### Notifications Not Showing
1. **Check browser permission**: Settings → Site Settings → Notifications → Allow
2. **Check console**: Open DevTools → Console → Look for "Error checking reminders"
3. **Verify time**: Ensure scheduled time is correct (use 24-hour format)
4. **Check API**: Network tab → Look for `/api/caregiver/check-reminders` calls
5. **Check target audience**: 
   - Run `node set-caregiver-burden-level.js <id> mild` to verify caregiver's level
   - Ensure reminder's target levels include caregiver's current level
   - If no level is set, only "All Caregivers" reminders will work

### Notifications Firing Multiple Times
- System tracks last notification time per task
- Only fires again after interval has passed
- Clear `lastNotifications` in MongoDB to reset:
  ```javascript
  db.caregiverprograms.updateOne(
    { caregiverId: ObjectId("YOUR_CAREGIVER_ID") },
    { $set: { lastNotifications: {} } }
  )
  ```

### Testing Quick Reminders
For quick testing, use Custom Interval = 1 minute:
1. Create reminder with customInterval: 1
2. Should fire every minute
3. Good for testing notification display and sound

## Browser Compatibility

✅ Tested on:
- Chrome/Edge (Chromium)
- Firefox
- Safari (macOS/iOS)

⚠️ Note: Some browsers require HTTPS for push notifications in production

## Next Steps

1. **Add notification sound file**: Place `notification.mp3` in `/public/`
2. **Add app icons**: Place `logo.png` and `badge.png` in `/public/`
3. **Production deployment**: Ensure HTTPS is configured
4. **Service Worker** (optional): For offline notifications and better reliability

## Real-World Use Cases

### Use Case 1: General Wellness Reminders
**Scenario**: Daily meditation reminder for all caregivers
- **Target Audience**: All Caregivers
- **Frequency**: Daily at 7:00 AM
- **Message**: "Good morning! Take 5 minutes for meditation and mindfulness."

### Use Case 2: Severe Burden Support
**Scenario**: Frequent check-ins for high-stress caregivers
- **Target Audience**: Specific Groups → Severe only
- **Frequency**: Custom Time, every 2 hours
- **Message**: "Remember to take a short break. Your well-being matters."

### Use Case 3: Moderate Weekly Check-in
**Scenario**: Weekly reflection prompt for moderate burden caregivers
- **Target Audience**: Specific Groups → Moderate only
- **Frequency**: Weekly (Monday, Wednesday, Friday) at 8:00 PM
- **Message**: "Time for your weekly reflection. How are you feeling today?"

### Use Case 4: Mild Group Encouragement
**Scenario**: Weekend self-care reminder for mild burden caregivers
- **Target Audience**: Specific Groups → Mild only
- **Frequency**: Weekly (Saturday, Sunday) at 10:00 AM
- **Message**: "Enjoy your weekend! Remember to practice self-care."

### Use Case 5: Multi-Level Support
**Scenario**: Evening relaxation reminder for moderate and severe groups
- **Target Audience**: Specific Groups → Moderate + Severe
- **Frequency**: Daily at 9:00 PM
- **Message**: "Bedtime approaching. Try deep breathing exercises before sleep."

## API Response Example

```json
{
  "success": true,
  "reminders": [
    {
      "id": "task_1763567477046_8mygswn3k",
      "title": "Morning Reminder",
      "message": "Time for your daily self-care check-in!",
      "frequency": "daily",
      "time": "09:00",
      "targetAudience": "specific",
      "targetLevels": ["mild", "moderate"]
    }
  ]
}
```
