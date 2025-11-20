# Reminder Target Audience Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN DASHBOARD                             │
│                  (DynamicDayManager.js)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⏰ Create Reminder                                             │
│  ┌────────────────────────────────────────────┐                │
│  │ Title: "Morning Wellness Check"             │                │
│  │ Message: "Time for self-care!"              │                │
│  │                                              │                │
│  │ 👥 Target Audience:                         │                │
│  │    ○ 🌍 All Caregivers                      │                │
│  │    ● 🎯 Specific Groups:                    │                │
│  │       ☑ 🟢 Mild                              │                │
│  │       ☑ 🟡 Moderate                          │                │
│  │       ☐ 🔴 Severe                            │                │
│  │                                              │                │
│  │ Frequency: Daily at 09:00                   │                │
│  └────────────────────────────────────────────┘                │
│                          │                                       │
│                          │ Save Task                             │
│                          ▼                                       │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MONGODB DATABASE                            │
│                    (ProgramConfig)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  {                                                               │
│    taskType: "reminder",                                        │
│    title: "Morning Wellness Check",                             │
│    content: {                                                   │
│      reminderMessage: "Time for self-care!",                    │
│      targetAudience: "specific",              ◄─────┐          │
│      targetLevels: ["mild", "moderate"],      ◄─────┤ Stored   │
│      frequency: "daily",                            │          │
│      reminderTime: "09:00"                          │          │
│    }                                                 │          │
│  }                                                   │          │
│                                                      │          │
└──────────────────────────────────────────────────────┼──────────┘
                                                       │
                           ┌───────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CAREGIVER DASHBOARD                            │
│              (NotificationManager.js)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Every 30 seconds:                                               │
│  ┌────────────────────────────────────────┐                     │
│  │ Poll: /api/caregiver/check-reminders   │                     │
│  │       ?caregiverId=123&day=1            │                     │
│  └────────────────────────────────────────┘                     │
│                          │                                       │
│                          ▼                                       │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API                                 │
│           (check-reminders.js)                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Get caregiver info from database:                           │
│     caregiverProgram = { burdenLevel: "mild" }                  │
│                                                                  │
│  2. Get reminder tasks for current day                          │
│                                                                  │
│  3. FILTER reminders:                                           │
│                                                                  │
│     FOR EACH reminder:                                          │
│       if targetAudience === "all":                              │
│         ✓ Include (everyone gets it)                            │
│                                                                  │
│       if targetAudience === "specific":                         │
│         if caregiver.burdenLevel in targetLevels:               │
│           ✓ Include (caregiver matches target)                  │
│         else:                                                   │
│           ✗ Skip (caregiver doesn't match)                      │
│                                                                  │
│  4. Check schedule (time matching)                              │
│                                                                  │
│  5. Return eligible reminders                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              NOTIFICATION DISPLAY                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Browser Push Notification:                                     │
│  ┌────────────────────────────────────┐                         │
│  │ 🔔 Morning Wellness Check          │                         │
│  │ Time for self-care!                 │                         │
│  └────────────────────────────────────┘                         │
│                                                                  │
│  In-App Banner (top-right):                                     │
│  ┌────────────────────────────────────┐                         │
│  │ ⏰ Morning Wellness Check      [✕] │                         │
│  │ Time for self-care!                 │                         │
│  └────────────────────────────────────┘                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Filtering Examples

### Example 1: All Caregivers Reminder
```
Admin Creates:
  targetAudience: "all"
  targetLevels: []

Caregiver A (mild)      → ✅ Receives
Caregiver B (moderate)  → ✅ Receives  
Caregiver C (severe)    → ✅ Receives
Caregiver D (no level)  → ✅ Receives
```

### Example 2: Mild Only
```
Admin Creates:
  targetAudience: "specific"
  targetLevels: ["mild"]

Caregiver A (mild)      → ✅ Receives
Caregiver B (moderate)  → ❌ Filtered out
Caregiver C (severe)    → ❌ Filtered out
Caregiver D (no level)  → ❌ Filtered out (no level set)
```

### Example 3: Moderate + Severe
```
Admin Creates:
  targetAudience: "specific"
  targetLevels: ["moderate", "severe"]

Caregiver A (mild)      → ❌ Filtered out
Caregiver B (moderate)  → ✅ Receives
Caregiver C (severe)    → ✅ Receives
Caregiver D (no level)  → ❌ Filtered out (no level set)
```

### Example 4: Multiple Reminders
```
Reminder 1: All caregivers
Reminder 2: Mild only
Reminder 3: Severe only

Caregiver A (mild):
  - Receives: Reminder 1, Reminder 2
  - Total: 2 reminders

Caregiver B (moderate):
  - Receives: Reminder 1
  - Total: 1 reminder

Caregiver C (severe):
  - Receives: Reminder 1, Reminder 3
  - Total: 2 reminders

Caregiver D (no level):
  - Receives: Reminder 1
  - Total: 1 reminder (only universal reminders)
```

## Assessment Flow

```
Day 0: Caregiver Registration
  └─> burdenLevel = null

Day 1: Zarit Burden Test
  └─> Score calculated
      └─> burdenLevel = "mild" | "moderate" | "severe"
          └─> Now eligible for targeted reminders!

Day 2: Stress Assessment (optional update)
  └─> Score calculated
      └─> burdenLevel updated (if different)
          └─> Reminder eligibility changes
```

## Data Model

### CaregiverProgram
```javascript
{
  caregiverId: ObjectId("..."),
  burdenLevel: "mild",  // Set after Day 1 assessment
  lastNotifications: {
    "task_123": "2025-11-19T09:00:00Z",
    "task_456": "2025-11-19T10:30:00Z"
  },
  language: "english"
}
```

### ProgramConfig (Reminder Task)
```javascript
{
  taskType: "reminder",
  taskId: "task_123",
  title: "Morning Wellness",
  enabled: true,
  content: {
    reminderMessage: "Time for self-care!",
    targetAudience: "specific",
    targetLevels: ["mild", "moderate"],
    frequency: "daily",
    reminderTime: "09:00"
  }
}
```

## Notification Decision Tree

```
                    Check Reminder
                         │
                         ▼
              ┌──────────────────────┐
              │ targetAudience?      │
              └──────────┬───────────┘
                         │
         ┌───────────────┴────────────────┐
         │                                │
         ▼                                ▼
    "all"                           "specific"
         │                                │
         │                                ▼
         │                   ┌────────────────────┐
         │                   │ Has burdenLevel?   │
         │                   └────────┬───────────┘
         │                            │
         │                   ┌────────┴────────┐
         │                   │                 │
         │                  YES               NO
         │                   │                 │
         │                   ▼                 ▼
         │        ┌─────────────────┐    ❌ SKIP
         │        │ Level in        │    (no level set)
         │        │ targetLevels?   │
         │        └────────┬────────┘
         │                 │
         │        ┌────────┴────────┐
         │       YES               NO
         │        │                 │
         ▼        ▼                 ▼
    ✅ SEND   ✅ SEND          ❌ SKIP
  (everyone) (matches)    (doesn't match)
```

## Timeline Example

```
09:00 - Reminder scheduled time
  │
  ├─> Caregiver A (mild) checks in
  │   └─> API filters: targetLevels includes "mild"
  │       └─> ✅ Notification sent
  │
  ├─> Caregiver B (moderate) checks in
  │   └─> API filters: targetLevels doesn't include "moderate"
  │       └─> ❌ Notification NOT sent
  │
  └─> Caregiver C (severe) checks in
      └─> API filters: targetLevels doesn't include "severe"
          └─> ❌ Notification NOT sent

09:30 - Polling continues
  └─> All caregivers already checked at 09:00
      └─> lastNotifications tracked to prevent duplicates
```

## Benefits Visualization

```
Traditional Approach:
┌──────────────────────────────┐
│ All caregivers get           │
│ same reminders               │
│                              │
│ 😐 😐 😐 😐 😐               │
│                              │
│ • Not personalized           │
│ • Notification fatigue       │
│ • One-size-fits-all          │
└──────────────────────────────┘

New Target Audience Approach:
┌──────────────────────────────┐
│ Personalized by burden level │
│                              │
│ 😊 (mild)                    │
│   → Gentle encouragement     │
│                              │
│ 😐 (moderate)                │
│   → Regular check-ins        │
│                              │
│ 😟 (severe)                  │
│   → Intensive support        │
│                              │
│ • Personalized care          │
│ • Reduced fatigue            │
│ • Better outcomes            │
└──────────────────────────────┘
```
