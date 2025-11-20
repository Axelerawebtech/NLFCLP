# Reminder System - Troubleshooting & Complete Setup Guide

## Issue: Notifications Not Appearing

### Root Causes Identified

1. **Time Matching Window**: The API checks if current time is within ±1 minute of scheduled time
2. **Caregiver Burden Level**: If reminder targets specific groups, caregiver must have `burdenLevel` set
3. **First-Time Notification**: Reminder only fires when time exactly matches (within 1-minute window)

### Complete Setup Steps

#### Step 1: Configure Reminder in Admin Dashboard

1. Go to `http://localhost:3000/admin/program-config`
2. Select a day (e.g., Day 0)
3. Click **+ Add Task**
4. Select task type: **⏰ Reminder**
5. Fill in details:
   ```
   Title: "Test Reminder"
   Description: "Testing notification system"
   Reminder Message: "This is a test reminder!"
   Target Audience: 🌍 All Caregivers (for initial testing)
   Frequency: Custom Time
   Custom Interval: 1 (minute)
   Time: [Leave as default or set to current time]
   ```
6. Click **➕ Add Task**
7. Click **💾 Save Day Configuration**

**✅ Reminder is now visible in admin UI** - You'll see the yellow "Active Reminders" section showing your configured reminder

#### Step 2: View Reminder on Caregiver Dashboard

1. Go to `http://localhost:3000/caregiver/dashboard`
2. Select the day where you configured the reminder (e.g., Day 0)
3. **✅ You should now see** the yellow "Your Reminders for Today" card showing:
   - Reminder title
   - Reminder message
   - Schedule (frequency and time)
   - Tip about enabling browser notifications

#### Step 3: Enable Browser Notifications

1. On caregiver dashboard, you'll see a blue banner at the bottom
2. Click **Enable** button
3. Browser will prompt: **Allow notifications from localhost?**
4. Click **Allow**

#### Step 4: Test Notification Firing

**Option A: Custom Interval (Recommended for Testing)**
```
Set reminder with:
- Frequency: Custom Time
- Custom Interval: 1 minute
- This will fire every minute once enabled
```

**Option B: Specific Time**
```
Set reminder with:
- Frequency: Daily
- Time: [Current time + 2 minutes]
- Wait for the scheduled time
```

#### Step 5: Verify in Browser Console

Open browser DevTools (F12) → Console tab

You should see logs like:
```
🔔 Checking reminders for caregiver [ID], day 0
   Caregiver level: NOT SET
   Found 1 reminder tasks
   Current time: 2025-11-19T...

  📋 Checking reminder: Test Reminder
     Task ID: task_...
     Target: all
     ✅ MATCH: Reminder targets all caregivers
     Schedule: custom at 09:00
     Last notif: NEVER
     Should fire: ✅ YES
```

### Debugging Checklist

#### ✅ Reminders Not Showing in Admin UI?
- Check: Did you save the day configuration?
- Check: Is the task enabled?
- Look for: Yellow "Active Reminders for This Day" section above task list

#### ✅ Reminders Not Showing on Caregiver Dashboard?
- Check: Did you select the correct day?
- Check: Does the day have any reminder tasks?
- Look for: Yellow "Your Reminders for Today" card below burden level badge

#### ✅ Browser Notifications Not Appearing?
1. **Check permission**: DevTools → Application → Notifications → Should show "Granted"
2. **Check console**: Look for API calls to `/api/caregiver/check-reminders`
3. **Check time window**: For daily/weekly, must be within ±1 minute of scheduled time
4. **Check target audience**: If "specific groups", caregiver must have matching burden level

#### ✅ Set Caregiver Burden Level (for targeted reminders)
```bash
node set-caregiver-burden-level.js <caregiverId> mild
```

### Updated Features

#### 1. Admin Dashboard Improvements
- **Reminder Summary Card**: Shows all active reminders at the top of task list
- **Visual Preview**: See frequency, time, and target audience at a glance
- **Color-coded badges**: Easy to identify reminder settings

#### 2. Caregiver Dashboard Improvements
- **Reminder Display Card**: Shows all configured reminders for the current day
- **Schedule Information**: Clear display of when notifications will arrive
- **Tip Section**: Reminds users to enable notifications
- **Notification Manager**: Handles browser notifications + in-app banners

#### 3. Backend Enhancements
- **Detailed Logging**: Console logs show exactly why reminders fire or don't fire
- **Target Audience Filtering**: Only sends to matching caregiver levels
- **Schedule Matching**: Precise time windows for daily/weekly reminders

### API Logging Output

When reminders are being checked, you'll see detailed logs in the server console:

```
🔔 Checking reminders for caregiver 6911d20e8d8b7c2404583fe4, day 0
   Caregiver level: NOT SET
   Found 1 reminder tasks
   Current time: 2025-11-19T10:30:00.000Z (10:30)

  📋 Checking reminder: Morning Wellness Check
     Task ID: task_1763570109487_ocyeai436
     Target: all
     ✅ MATCH: Reminder targets all caregivers
     Schedule: custom at 09:00
     Last notif: NEVER
     Should fire: ✅ YES
```

### Testing Workflow

1. **Create reminder** in admin → ✅ See it in "Active Reminders" section
2. **Go to caregiver dashboard** → ✅ See it in "Your Reminders for Today" card
3. **Enable notifications** → Blue banner → Click "Enable"
4. **Wait for schedule** (or use custom 1-minute interval)
5. **See notification**:
   - Browser push notification (top-right of screen)
   - Yellow in-app banner (top-right of page)
   - Console logs showing reminder fired

### Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| "No reminders showing in admin" | Save the day configuration after adding reminder |
| "Card not showing on caregiver UI" | Ensure you're viewing the correct day |
| "Notification permission not asked" | Refresh page, NotificationManager requests on load |
| "Time doesn't match" | Use custom interval = 1 minute for testing |
| "Reminder fires repeatedly" | This is normal for custom intervals |
| "Reminder doesn't fire for specific group" | Set caregiver burden level: `node set-caregiver-burden-level.js <id> mild` |

### Files Modified

1. ✅ `pages/api/caregiver/check-reminders.js` - Added detailed logging
2. ✅ `components/DynamicDayManager.js` - Added "Active Reminders" summary card
3. ✅ `components/ReminderDisplayCard.js` - NEW: Caregiver reminder display
4. ✅ `components/SevenDayProgramDashboard.js` - Integrated ReminderDisplayCard
5. ✅ `debug-reminder-not-firing.js` - NEW: Debug script

### Next Steps

1. **Test with custom interval**: Set to 1 minute, should fire immediately
2. **Check both dashboards**: Verify reminders visible in admin AND caregiver UI
3. **Enable notifications**: Grant browser permission
4. **Monitor console**: Watch for API logs showing reminder checks
5. **Verify notification appears**: Both browser push + in-app banner

### Success Criteria

✅ Admin sees: Yellow reminder card with details above task list  
✅ Caregiver sees: Yellow "Your Reminders for Today" card  
✅ Browser notifications: Permission granted  
✅ Notification fires: Push notification + banner appear  
✅ Console logs: Show reminder checking and firing logic  

---

**Status**: System is now fully implemented with visibility in both dashboards. Testing required to verify notification firing.
