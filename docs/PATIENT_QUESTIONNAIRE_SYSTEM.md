# Patient Questionnaire System

## Overview
This implementation adds a comprehensive patient questionnaire system to your MERN stack caregiver-patient tracker web app. The system allows admins to create questionnaires, assign them to specific patients, and collect patient responses.

## ✅ Features Implemented

### 1. Database Models
- **Updated Patient Model** (`models/Patient.js`):
  - Added `questionnaireEnabled` boolean field
  - Added `questionnaireAnswers` array with structured response data
  - Added `lastQuestionnaireSubmission` date field

- **New Questionnaire Model** (`models/Questionnaire.js`):
  - Universal questionnaire with title, description, and questions
  - Support for multiple question types: text, textarea, radio, checkbox, select, scale
  - Questions have configurable options and required flags
  - Global activation status

### 2. Backend API Routes

#### Admin Routes:
- `POST/PUT/GET /api/admin/questionnaire/config` - Create/update/fetch questionnaires
- `GET /api/admin/patients` - Get all patients list
- `GET/PUT /api/admin/patients/[patientId]` - Get patient details & toggle questionnaire status

#### Patient Routes:
- `GET /api/patient/dashboard?patientId=X` - Get patient dashboard data
- `POST /api/patient/questionnaire/submit` - Submit questionnaire responses

### 3. Frontend Pages

#### Admin Pages:
- **Configure Patient Questionnaire** (`/admin/configure-patient-questionnaire`):
  - Create/edit universal questionnaires
  - Support for 6 question types with live preview
  - Drag & drop question ordering
  - Real-time validation

- **Patient Profiles** (`/admin/patient-profiles`):
  - View all patients in a comprehensive table
  - Toggle questionnaire enable/disable per patient
  - View detailed patient info and questionnaire responses
  - Real-time status updates

#### Patient Page:
- **Patient Dashboard** (`/pages/patient/dashboard`):
  - Dynamic questionnaire rendering based on enabled status
  - Support for all question types with proper validation
  - Progress tracking and submission confirmation
  - View previous responses

### 4. Navigation Integration
- Added "Configure Patient Questionnaire" button to admin dashboard
- Added "Patient Profiles" button to admin dashboard
- Proper routing and authentication handling

## 🔧 Question Types Supported

1. **Text** - Short text input
2. **Textarea** - Long text input (multiline)
3. **Radio** - Single choice from options
4. **Checkbox** - Multiple choice from options
5. **Select** - Dropdown selection
6. **Scale** - 1-10 rating scale

## 🚀 How to Use

### For Admins:

1. **Create Questionnaire**:
   - Go to Admin Dashboard → "Configure Patient Questionnaire"
   - Add title, description, and questions
   - Set question types and options
   - Save questionnaire (automatically becomes active)

2. **Assign to Patients**:
   - Go to Admin Dashboard → "Patient Profiles"
   - Find target patient
   - Toggle "Questionnaire" switch to "Enabled"

3. **View Responses**:
   - In Patient Profiles, click the eye icon on any patient
   - View all submitted questionnaire responses
   - See submission timestamps and answer details

### For Patients:

1. **Access Dashboard**:
   - Navigate to `/patient/dashboard?patientId=YOUR_ID`
   - System shows questionnaire if enabled by admin

2. **Complete Questionnaire**:
   - Answer all required questions
   - Submit responses
   - View confirmation and previous submissions

## 📁 File Structure

```
/models/
  ├── Patient.js (updated)
  └── Questionnaire.js (new)

/pages/api/
  ├── admin/
  │   ├── questionnaire/
  │   │   └── config.js
  │   └── patients/
  │       ├── index.js
  │       └── [patientId].js
  └── patient/
      ├── dashboard.js
      └── questionnaire/
          └── submit.js

/pages/
  ├── admin/
  │   ├── configure-patient-questionnaire.js (new)
  │   ├── patient-profiles.js (new)
  │   └── dashboard.js (updated)
  └── patient/
      └── dashboard.js (updated)

/demo/
  └── patient-questionnaire-demo.js
```

## 🔄 Data Flow

1. **Admin creates questionnaire** → Stored in Questionnaire collection
2. **Admin enables for patient** → Updates Patient.questionnaireEnabled = true
3. **Patient accesses dashboard** → API checks if questionnaire enabled
4. **Patient submits answers** → Stored in Patient.questionnaireAnswers array
5. **Admin views responses** → Retrieved from patient document

## 🛡️ Security & Validation

- ✅ Input validation on all forms
- ✅ Required field validation
- ✅ Authentication checks for admin routes
- ✅ Patient ID validation for submissions
- ✅ Proper error handling and user feedback

## 🎨 UI/UX Features

- ✅ Material-UI components with consistent styling
- ✅ Responsive design for all screen sizes
- ✅ Loading states and progress indicators
- ✅ Success/error alerts with auto-dismiss
- ✅ Interactive question preview
- ✅ Real-time form validation

## 🚦 Status Indicators

- **Patient Table**: Shows questionnaire enabled/disabled status
- **Admin Dashboard**: Buttons to access questionnaire features
- **Patient Dashboard**: Shows availability and submission status
- **Submission Tracking**: Last submission dates and response counts

## 🔧 Customization Options

The system is designed to be highly customizable:
- Add new question types by extending the question type enum
- Modify UI components with Material-UI theming
- Add custom validation rules per question type
- Extend patient model with additional questionnaire metadata
- Add questionnaire templates and categories

## 📊 Analytics Ready

The system stores structured data that can be easily analyzed:
- Response timestamps for tracking completion patterns
- Question-level analytics for specific insights
- Patient engagement metrics
- Admin usage patterns

This implementation provides a complete, production-ready patient questionnaire system that integrates seamlessly with your existing caregiver-patient tracker application.