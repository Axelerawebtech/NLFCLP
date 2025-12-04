# Feedback Form System - Complete Implementation Guide

## ✅ What Has Been Implemented

### 1. **Database Schema Updates**

#### ProgramConfig Model (`models/ProgramConfig.js`)
- Added `feedbackFormTemplate` field to store the default feedback template
- Template includes:
  - `templateName`: Name of the template (e.g., "Pilot Study Feedback Form")
  - `feedbackFields`: Array of field definitions with:
    - `label`: Question text
    - `fieldType`: Type of field (rating, yes-no, text, textarea)
    - `options`: Array of answer options
    - `category`: Group/category for organization

#### Caregiver Model (`models/Caregiver.js`)
- Added `feedbackSubmissions` array to store all feedback responses
- Each submission contains:
  - `taskId`: Unique task identifier
  - `day`: Day number when feedback was submitted
  - `language`: Language in which feedback was submitted
  - `responses`: Object mapping field index to response value
  - `fieldLabels`: Object mapping field index to question text
  - `submittedAt`: Timestamp of submission
  - `participantId`: Caregiver ID

---

### 2. **Admin Interface - Dynamic Day Manager**

#### Task Type Addition (`components/DynamicDayManager.js`)
- Added "📋 Feedback Form" to task types dropdown
- **Auto-loading Template**: When admin selects "Feedback Form":
  1. Automatically fetches the seeded template
  2. If template doesn't exist, creates it automatically
  3. Pre-populates all 13 questions from pilot study feedback
  4. Admin can review, edit, add, or remove fields before saving

#### Feedback Form Editor Features:
- **Field Types Supported**:
  - Rating Scale (e.g., Very Easy to Very Difficult)
  - Yes/No/Somewhat options
  - Single-line text input
  - Multi-line textarea for detailed feedback
- **Field Management**:
  - Add/delete fields
  - Edit question labels
  - Customize answer options
  - Categorize questions (e.g., "Ease of Use", "Learning Modules")
- **Pre-configured Buttons**:
  - "+ Add Rating Field" - Quick add for rating questions
  - "+ Add Text Field" - Quick add for open-ended questions

---

### 3. **Caregiver Interface**

#### Feedback Form Display (`components/SevenDayProgramDashboard.js`)
- Renders feedback forms based on task configuration
- **Dynamic Rendering** based on field type:
  - **Rating fields**: Display as clickable button options
  - **Yes/No fields**: Display as Yes/Somewhat/No buttons
  - **Text fields**: Single-line input box
  - **Textarea fields**: Multi-line text area for detailed responses
- **Features**:
  - Visual feedback when options are selected (highlighted borders)
  - Validation ensures all fields are completed before submission
  - Loading state during submission
  - Success/error toast notifications
  - Task marked as complete after successful submission

---

### 4. **API Endpoints**

#### `/api/admin/seed-feedback-template` (POST)
- Seeds the default feedback template with 13 questions from pilot study
- Categories included:
  1. **Ease of Use** (2 questions)
  2. **Learning Modules** (2 questions)
  3. **Assessments** (2 questions)
  4. **Reminders / Progress** (2 questions)
  5. **Overall Comfort** (2 questions)
  6. **Suggestions / Problems** (3 open-ended questions)

#### `/api/admin/get-feedback-template` (GET)
- Retrieves the current feedback template
- Used by DynamicDayManager to auto-populate fields

#### `/api/caregiver/submit-feedback` (POST)
- Saves caregiver feedback responses to database
- Handles both new submissions and updates to existing feedback
- Body parameters:
  ```json
  {
    "caregiverId": "string",
    "day": "number",
    "taskId": "string",
    "responses": "object",
    "fieldLabels": "object",
    "language": "string"
  }
  ```

#### `/api/admin/caregiver-feedback` (GET)
- Fetches all feedback submissions
- Query parameter: `?caregiverId=XXX` (optional) for specific caregiver
- Returns formatted data with caregiver info and all submissions

---

### 5. **Admin Feedback Viewer**

#### Feedback Viewer Component (`components/FeedbackViewer.js`)
- **List View**: Shows all caregivers with feedback submissions
  - Displays caregiver name, ID, phone, and submission count
  - Clickable cards to view detailed feedback
- **Detail View**: Shows all feedback for selected caregiver
  - Organized by submission with metadata (day, date, language)
  - All questions and responses displayed clearly
  - Category grouping preserved
  
#### Export Features:
- **Export to PDF** (individual caregiver):
  - Professional formatted PDF report
  - Includes caregiver information
  - All feedback submissions with timestamps
  - Questions and responses clearly formatted
  - Handles multi-page documents automatically
  
- **Export to CSV** (individual or all):
  - Structured CSV format for analysis
  - Columns: Caregiver ID, Name, Phone, Feedback #, Day, Task ID, Date, Language, Question, Response
  - One row per question-response pair
  - Easy to import into Excel, SPSS, or statistical software
  
- **Export All to CSV**:
  - Combines feedback from all caregivers into single CSV
  - Perfect for comprehensive data analysis

#### Admin Dashboard Integration (`pages/admin/feedback.js`)
- New page at `/admin/feedback`
- Authenticated admin access only
- Added "💬 View Feedback Responses" button to admin dashboard
- Navigation breadcrumb back to dashboard

---

## 📋 Default Feedback Template (Pre-seeded)

The system automatically includes these 13 questions:

### Ease of Use
1. "The app was easy to use" - Rating (Very Easy to Very Difficult)
2. "I could understand how to navigate" - Yes/Somewhat/No

### Learning Modules
3. "Content was easy to understand" - Yes/Somewhat/No
4. "The modules were useful" - Yes/Somewhat/No

### Assessments
5. "Questions were clear" - Yes/Somewhat/No
6. "Completing assessment was easy" - Yes/Somewhat/No

### Reminders / Progress
7. "Reminder feature was helpful" - Yes/Somewhat/No
8. "I liked seeing my progress" - Yes/Somewhat/No

### Overall Comfort
9. "I felt comfortable using the app" - Yes/Somewhat/No
10. "I would like to use this app in future" - Yes/Maybe/No

### Suggestions / Problems
11. "What did you like?" - Textarea (open-ended)
12. "What was difficult or confusing?" - Textarea (open-ended)
13. "What improvements do you suggest?" - Textarea (open-ended)

---

## 🚀 How to Use

### For Admin:

#### Step 1: Add Feedback Form to a Day
1. Navigate to **Admin Dashboard** → **Configure 7-Day Program**
2. Select the day you want to add feedback (e.g., Day 7 for end-of-program feedback)
3. Choose language and burden level (or "default" for all levels)
4. Click **"+ Add Task"**
5. Select **"📋 Feedback Form"** from task type dropdown
6. **Template auto-loads** with all 13 pilot study questions
7. Review and modify questions if needed:
   - Edit question text
   - Change field types
   - Add/remove options
   - Add new fields or delete unwanted ones
8. Add title and description (optional)
9. Click **"Save Task"**

#### Step 2: View Feedback Responses
1. Go to **Admin Dashboard**
2. Click **"💬 View Feedback Responses"**
3. See list of all caregivers who submitted feedback
4. Click on any caregiver to view their detailed responses
5. Use export buttons:
   - **📄 Export PDF** - Download formatted PDF report
   - **📊 Export CSV** - Download spreadsheet for analysis
   - **📊 Export All to CSV** - Download combined data from all caregivers

### For Caregiver:

1. Complete program days as assigned
2. When feedback form day unlocks, see the feedback task card
3. Read each question and provide responses:
   - Click buttons for rating/yes-no questions
   - Type text for open-ended questions
4. Ensure all fields are filled (validation enforced)
5. Click **"Submit Feedback"**
6. Feedback is saved immediately to database

---

## 🔧 Technical Details

### Libraries Installed:
- `jspdf` - PDF generation
- `jspdf-autotable` - PDF table formatting

### Files Created:
- `pages/api/admin/seed-feedback-template.js`
- `pages/api/admin/get-feedback-template.js`
- `pages/api/admin/caregiver-feedback.js`
- `pages/api/caregiver/submit-feedback.js`
- `components/FeedbackViewer.js`
- `pages/admin/feedback.js`

### Files Modified:
- `models/ProgramConfig.js` - Added feedbackFormTemplate field
- `models/Caregiver.js` - Added feedbackSubmissions array
- `components/DynamicDayManager.js` - Added feedback form task type and editor
- `components/SevenDayProgramDashboard.js` - Added feedback form rendering
- `pages/admin/dashboard.js` - Added feedback viewer link

---

## 📊 Data Export Formats

### PDF Export Format:
```
Caregiver Feedback Report
━━━━━━━━━━━━━━━━━━━━━━━━
Caregiver ID: CGXXX
Name: John Doe
Phone: 1234567890
Total Submissions: 2

Feedback #1
Day: 7 | Task ID: task_xxx
Date: Dec 4, 2025, 10:30 AM
Language: english

Question 1: The app was easy to use
Response: Easy

Question 2: What did you like?
Response: The interface was intuitive and helpful...
```

### CSV Export Format:
```csv
"Caregiver ID","Name","Phone","Feedback #","Day","Task ID","Submission Date","Language","Question","Response"
"CGXXX","John Doe","1234567890","1","7","task_xxx","12/4/2025, 10:30 AM","english","The app was easy to use","Easy"
"CGXXX","John Doe","1234567890","1","7","task_xxx","12/4/2025, 10:30 AM","english","What did you like?","The interface was intuitive..."
```

---

## ✨ Key Features

1. **Automatic Template Seeding**: No manual setup required
2. **Flexible Customization**: Admin can modify any aspect of the feedback form
3. **Multi-language Support**: Works with English, Kannada, and Hindi
4. **Real-time Validation**: Prevents incomplete submissions
5. **Professional Exports**: PDF and CSV formats for reporting and analysis
6. **Integrated Workflow**: Seamlessly fits into the existing program structure
7. **Data Persistence**: All responses stored permanently in database
8. **User-friendly Interface**: Both admin and caregiver interfaces are intuitive

---

## 🎯 Use Cases

1. **Pilot Study Feedback**: Collect structured feedback from pilot participants
2. **End-of-Program Evaluation**: Add to Day 7 for program completion feedback
3. **Mid-Program Check-ins**: Add to any day for progress assessment
4. **Feature-specific Feedback**: Create custom forms for specific features
5. **Research Data Collection**: Export data for analysis in research papers

---

## 🔒 Security & Privacy

- Admin authentication required for feedback viewer
- Caregiver-specific data isolation
- No data modification after submission (read-only for caregivers)
- Secure API endpoints with proper validation
- Export features only accessible to authenticated admins

---

## 📝 Notes

- Feedback forms respect the day unlock logic - caregivers can only submit when day is unlocked
- Multiple feedback forms can be added to different days
- Each feedback submission is timestamped for tracking
- Responses are stored even if task is reset (for audit trail)
- Template can be re-seeded if needed by calling the seed endpoint again

---

## 🆘 Troubleshooting

**Issue**: Template not loading automatically
- **Solution**: Manually seed by calling `POST /api/admin/seed-feedback-template`

**Issue**: Export buttons not working
- **Solution**: Ensure jspdf libraries are installed: `npm install jspdf jspdf-autotable`

**Issue**: Feedback not saving
- **Solution**: Check browser console for errors, verify API endpoint is accessible

**Issue**: Can't see feedback viewer page
- **Solution**: Ensure you're logged in as admin, clear browser cache

---

## 🎓 Future Enhancements (Optional)

- Add analytics dashboard showing aggregated feedback statistics
- Support for conditional logic (show question B only if answer to question A is X)
- Add rating visualization (charts for rating distributions)
- Email notifications to admin when new feedback is submitted
- Support for attachments in feedback responses
- Multi-select checkbox fields for questions
