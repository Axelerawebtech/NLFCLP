# Reminder Target Audience - Quick Reference Card

## 🎯 What Is This Feature?

Target specific groups of caregivers for reminders based on their burden/stress assessment results.

## 👥 Target Audiences

| Option | Icon | Description | Who Receives |
|--------|------|-------------|--------------|
| **All Caregivers** | 🌍 | Universal reminders | Everyone, regardless of level |
| **Specific Groups** | 🎯 | Targeted reminders | Only selected burden/stress levels |

## 📊 Burden/Stress Levels

| Level | Icon | Score Range | Typical Characteristics |
|-------|------|-------------|------------------------|
| **Mild** | 🟢 | Low scores | Managing well, light support needed |
| **Moderate** | 🟡 | Medium scores | Some stress, regular check-ins helpful |
| **Severe** | 🔴 | High scores | High stress, intensive support needed |

## 🛠️ Admin Configuration

### Step 1: Create Reminder
```
Admin Dashboard → Program Config → Add Task → Select "Reminder"
```

### Step 2: Set Target Audience
```javascript
Option 1: All Caregivers
  ✓ Everyone receives this reminder
  ✗ No filtering by level

Option 2: Specific Groups
  ✓ Select which levels receive it
  ✓ Can select multiple levels
  ✗ Caregivers without levels won't receive it
```

### Step 3: Select Levels (if Specific Groups)
```
☑ 🟢 Mild       → Low burden caregivers
☑ 🟡 Moderate   → Medium burden caregivers
☐ 🔴 Severe     → High burden caregivers
```

## 📝 Common Use Cases

### 1. Universal Wellness
```yaml
Target: All Caregivers
Example: "Daily meditation reminder"
Result: Everyone gets it
```

### 2. Mild Support
```yaml
Target: Mild only
Example: "Weekend self-care tip"
Result: Only mild burden caregivers
```

### 3. High-Need Support
```yaml
Target: Severe only
Example: "Frequent break reminders"
Result: Only severe burden caregivers
```

### 4. Multi-Level Support
```yaml
Target: Moderate + Severe
Example: "Evening relaxation"
Result: Both moderate and severe caregivers
```

## 🔍 Filtering Logic

```
                    Reminder
                       │
                       ▼
              Is targetAudience "all"?
                       │
            ┌──────────┴──────────┐
           YES                    NO
            │                      │
            ▼                      ▼
         ✅ SEND          Does caregiver have
                          a burdenLevel?
                                  │
                       ┌──────────┴──────────┐
                      YES                    NO
                       │                      │
                       ▼                      ▼
           Is burdenLevel in            ❌ SKIP
           targetLevels array?
                       │
            ┌──────────┴──────────┐
           YES                    NO
            │                      │
            ▼                      ▼
         ✅ SEND                ❌ SKIP
```

## 🧪 Quick Testing Commands

### Set Caregiver Level
```bash
# Set to mild
node set-caregiver-burden-level.js <caregiverId> mild

# Set to moderate
node set-caregiver-burden-level.js <caregiverId> moderate

# Set to severe
node set-caregiver-burden-level.js <caregiverId> severe

# Remove level
node set-caregiver-burden-level.js <caregiverId> null
```

### Test Reminder Targeting
```bash
node test-reminder-targeting.js
```

### View in MongoDB
```javascript
// Check caregiver level
db.caregiverprograms.findOne(
  { caregiverId: ObjectId("...") },
  { burdenLevel: 1 }
)

// Check reminder settings
db.programconfigs.find(
  { "dynamicDays.contentByLevel.tasks.taskType": "reminder" }
)
```

## ⚠️ Important Notes

### Caregiver Without Level
```
Before assessment: burdenLevel = null
  → Only receives "All Caregivers" reminders
  → "Specific Groups" reminders are skipped

After assessment: burdenLevel = "mild" | "moderate" | "severe"
  → Now eligible for targeted reminders
```

### Backward Compatibility
```
Old reminders (no targetAudience field)
  → Treated as "all" (everyone gets them)
  → No breaking changes
```

### Level Assignment Timeline
```
Day 0:  Registration        → burdenLevel = null
Day 1:  Burden Test        → burdenLevel assigned
Day 2+: Stress Assessment  → burdenLevel may update
```

## 📋 Checklist for Creating Targeted Reminder

- [ ] Clear, actionable message written
- [ ] Target audience selected (all vs specific)
- [ ] If specific: At least one level checkbox checked
- [ ] Frequency configured (daily/weekly/custom)
- [ ] Time set appropriately for target audience
- [ ] Preview reviewed and confirmed
- [ ] Tested with sample caregiver

## 🚨 Troubleshooting

| Problem | Solution |
|---------|----------|
| Notification not showing | Check if caregiver's level matches target |
| No one receives reminder | Verify at least one level is selected |
| Wrong caregivers receive | Double-check targetLevels array |
| Caregiver has no level | They only get "All Caregivers" reminders |

## 📊 Example Scenarios

### Scenario 1: New Caregiver
```
Day 0: Register
  burdenLevel: null
  Receives: Only "All Caregivers" reminders

Day 1: Complete burden test (score: 35)
  burdenLevel: "moderate"
  Receives: "All Caregivers" + "Moderate" targeted reminders
```

### Scenario 2: Multiple Reminders
```
Reminder A: All Caregivers
Reminder B: Mild only
Reminder C: Moderate + Severe

Caregiver (mild):
  → Receives A, B (2 total)

Caregiver (moderate):
  → Receives A, C (2 total)

Caregiver (severe):
  → Receives A, C (2 total)

Caregiver (no level):
  → Receives A only (1 total)
```

## 🎨 UI Preview

### Admin Dashboard
```
┌──────────────────────────────────────┐
│ 👥 Target Audience                   │
│ ┌────────────────────────────────┐   │
│ │ ● 🎯 Specific Groups           │   │
│ └────────────────────────────────┘   │
│                                      │
│ Select caregiver groups:             │
│ ┌────────────────────────────────┐   │
│ │ ☑ 🟢 Mild                       │   │
│ │   Low burden/stress level      │   │
│ └────────────────────────────────┘   │
│ ┌────────────────────────────────┐   │
│ │ ☑ 🟡 Moderate                   │   │
│ │   Medium burden/stress level   │   │
│ └────────────────────────────────┘   │
│ ┌────────────────────────────────┐   │
│ │ ☐ 🔴 Severe                     │   │
│ │   High burden/stress level     │   │
│ └────────────────────────────────┘   │
└──────────────────────────────────────┘

Preview: Daily at 09:00
Audience: mild, moderate caregivers only
```

## 📚 Related Files

- **Admin UI**: `components/DynamicDayManager.js`
- **API Logic**: `pages/api/caregiver/check-reminders.js`
- **Notification UI**: `components/NotificationManager.js`
- **Data Model**: `models/CaregiverProgram.js`
- **Test Scripts**: 
  - `test-reminder-targeting.js`
  - `set-caregiver-burden-level.js`

## 🎓 Best Practices

1. **Start Broad**: Create "All Caregivers" reminders first
2. **Add Targeted**: Layer specific reminders for each level
3. **Test Thoroughly**: Use helper scripts to verify targeting
4. **Monitor Engagement**: Track which levels respond best
5. **Adjust Frequency**: Higher levels may need more frequent reminders
6. **Clear Messages**: Make content relevant to target audience

## 💡 Pro Tips

- Use mild reminders for encouragement and tips
- Use moderate reminders for regular check-ins
- Use severe reminders for intensive support and breaks
- Combine general wellness (all) + level-specific reminders
- Test with different caregivers before going live
- Use custom intervals for urgent high-need support

---

**Last Updated**: November 19, 2025  
**Version**: 1.0  
**Status**: ✅ Fully Implemented
