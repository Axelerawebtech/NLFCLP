# Multilingual Functionality Update Guide

## Current Status
✅ Translation system in place with LanguageContext and translations.js
✅ Support for English, Hindi (Devanagari), Kannada
✅ Most pages using translation functions

## Areas Requiring Updates

### 1. Add Missing Translation Keys

Add these keys to `utils/translations.js` for all 3 languages:

```javascript
// English (en)
{
  // Dashboard & Navigation
  reminders: "Reminders",
  progress: "Progress",
  teleManas: "TELE-MANAS",
  phoneNumber: "1800-89-14416",
  
  // Assessment
  assessment: "Assessment",
  learningModules: "Learning Modules",
  skillDevelopment: "Skill Development",
  selfCare: "Self-Care",
  problemSolving: "Problem Solving",
  emotionalSupport: "Emotional Support",
  
  // Day Program
  day: "Day",
  dayProgram: "7-Day Program",
  dayProgress: "Day Progress",
  completedTasks: "Completed Tasks",
  pendingTasks: "Pending Tasks",
  unlockDay: "Unlock Day",
  dayLocked: "Day Locked",
  
  // Tasks
  videoTask: "Video Task",
  audioTask: "Audio Task",
  textTask: "Text Task",
  reflectionTask: "Reflection Task",
  quickAssessment: "Quick Assessment",
  reminderTask: "Reminder Task",
  
  // Status
  completed: "Completed",
  inProgress: "In Progress",
  notStarted: "Not Started",
  locked: "Locked",
  
  // Actions
  startTask: "Start Task",
  continueTask: "Continue Task",
  reviewTask: "Review Task",
  submitResponse: "Submit Response",
  
  // Common UI
  loading: "Loading...",
  save: "Save",
  close: "Close",
  edit: "Edit",
  delete: "Delete",
  confirm: "Confirm",
  
  // Error Messages
  errorLoadingData: "Error loading data",
  errorSavingData: "Error saving data",
  pleaseTryAgain: "Please try again",
  
  // Success Messages
  savedSuccessfully: "Saved successfully",
  taskCompleted: "Task completed",
  responseSubmitted: "Response submitted"
}
```

### 2. Pages/Components Needing Translation Updates

#### High Priority (User-Facing):
1. **pages/index.js** - Homepage (partially done)
   - Add translations for all button text
   - Feature card titles and descriptions
   
2. **components/SevenDayProgramDashboard.js** - Main dashboard
   - Day titles
   - Task types
   - Progress indicators
   - Status messages

3. **pages/caregiver/dashboard.js**
   - Navigation menu items
   - Assessment instructions
   - Status messages

4. **pages/patient/dashboard.js**
   - All UI text elements
   - Instructions and help text

#### Medium Priority (Admin):
5. **pages/admin/dashboard.js**
   - Stats labels
   - Action buttons
   - Table headers

6. **pages/admin/program-config.js**
   - Configuration labels
   - Form fields

### 3. Implementation Steps

#### Step 1: Update Translation Files
```bash
# Edit utils/translations.js
# Add missing keys for all 3 languages (en, hi, kn)
```

#### Step 2: Update Components to Use Translations

Pattern to follow:
```javascript
import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../utils/translations';

function MyComponent() {
  const { currentLanguage } = useLanguage();
  const t = (key) => getTranslation(currentLanguage, key);
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

#### Step 3: Test Each Page
- Switch between languages using LanguageSelector
- Verify all text changes
- Check for missing translations (will show English as fallback)

### 4. Language Code Consistency

Ensure consistency across the app:
- Context uses: `'en'`, `'hi'`, `'kn'`
- Don't use: `'english'`, `'hindi'`, `'kannada'`

### 5. Special Cases

#### Dynamic Content (Database)
For content from database (like Day module content):
```javascript
// Store in DB with language keys
{
  title: {
    en: "Day 1 - Understanding",
    hi: "दिन 1 - समझना",
    kn: "ದಿನ 1 - ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವುದು"
  }
}

// Display based on current language
<h1>{moduleData.title[currentLanguage]}</h1>
```

#### Numbers and Dates
Use locale-specific formatting:
```javascript
const formattedDate = new Date().toLocaleDateString(
  currentLanguage === 'hi' ? 'hi-IN' : 
  currentLanguage === 'kn' ? 'kn-IN' : 'en-IN'
);
```

### 6. Testing Checklist

- [ ] Homepage displays in all 3 languages
- [ ] Login page fully translated
- [ ] Onboarding flow translated
- [ ] Caregiver dashboard translated
- [ ] Patient dashboard translated
- [ ] Admin dashboard translated
- [ ] Error messages translated
- [ ] Success messages translated
- [ ] Form labels and placeholders translated
- [ ] Button text translated
- [ ] Navigation menu translated
- [ ] Assessment questions translated (already done via API)

### 7. Accessibility Considerations

- Ensure proper `lang` attribute on HTML elements
- RTL support not needed (all 3 languages are LTR)
- Font support for Devanagari and Kannada scripts

### 8. Performance

- Translations loaded once on app init
- No API calls needed for UI translations
- Only assessment content fetched from DB with language parameter

## Next Steps

1. Review this guide
2. Decide which pages to prioritize
3. Add missing translation keys
4. Update components one by one
5. Test thoroughly in all languages

Would you like me to start implementing specific pages?
