# Cancer Care App - Setup & Testing Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Create `.env.local` with:
```
MONGODB_URI=mongodb://localhost:27017/cancer-care-app
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-here
```

### 3. Create Admin User
```bash
node scripts/create-admin.js
```

### 4. Start Application
```bash
npm run dev
```

## 🔐 Complete Sign-In Flow Testing

### Test 1: Admin Login
1. Go to: `http://localhost:3000/admin/login`
2. Login with:
   - Username: `admin`
   - Password: `admin123`
3. ✅ Should redirect to admin dashboard
4. View caregivers/patients tables (will be empty initially)

### Test 2: Caregiver Onboarding & Login
1. Go to: `http://localhost:3000/onboarding`
2. Select "Caregiver"
3. Complete questionnaire:
   - Name: John Doe
   - Email: john@example.com
   - Phone: +1234567890
   - Experience: 3-5 years
   - Specialization: Oncology
   - Relationship: Professional Caregiver
4. ✅ Get unique ID (e.g., CG1729612345ABC)
5. Go to: `http://localhost:3000/login`
6. Select "Caregiver" and enter ID
7. ✅ Should access caregiver dashboard immediately

### Test 3: Patient Onboarding (Cannot Login Yet)
1. Go to: `http://localhost:3000/onboarding`
2. Select "Patient"
3. Complete questionnaire:
   - Name: Jane Smith
   - Email: jane@example.com
   - Phone: +1234567891
   - Age: 45
   - Cancer Type: Breast Cancer
   - Stage: Stage II
   - Treatment Status: Currently in Treatment
   - Diagnosis Date: 2024-01-15
4. ✅ Get unique ID (e.g., PT1729612345XYZ)
5. Try to login at: `http://localhost:3000/login`
6. Select "Patient" and enter ID
7. ❌ Should show "Account not yet activated" message

### Test 4: Admin Assignment
1. Login as admin
2. Go to admin dashboard
3. Click "Assign Caregiver to Patient"
4. Select the caregiver and patient created above
5. ✅ Assignment should be successful

### Test 5: Patient Login After Assignment
1. Go to: `http://localhost:3000/login`
2. Select "Patient" and enter patient ID
3. ✅ Should now access patient dashboard
4. Post-test should be locked initially

### Test 6: Complete Caregiver Program
1. Login as caregiver
2. Go through 10-day program
3. Complete all days
4. ✅ Patient post-test should become available

### Test 7: Patient Post-Test
1. Login as patient
2. ✅ Post-test should now be available
3. Complete test and get score
4. Score reflects caregiver's teaching effectiveness

## 🔄 User Access URLs

- **Homepage (QR Code)**: `http://localhost:3000`
- **Onboarding**: `http://localhost:3000/onboarding`
- **User Login**: `http://localhost:3000/login`
- **Admin Login**: `http://localhost:3000/admin/login`
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard`
- **Caregiver Dashboard**: `http://localhost:3000/caregiver/dashboard`
- **Patient Dashboard**: `http://localhost:3000/patient/dashboard`

## 🎯 Key Features to Test

### Caregiver Dashboard:
- ✅ 10-Day Program with interactive lessons
- ✅ Red Alert emergency button
- ✅ Daily Health Tips categorized
- ✅ Progress tracking
- ✅ Dark/Light mode toggle

### Patient Dashboard:
- ✅ Post-test locked until caregiver completes program
- ✅ Comprehensive knowledge assessment
- ✅ Score evaluation and feedback
- ✅ Results reflect caregiver effectiveness

### Admin Dashboard:
- ✅ User management tables
- ✅ Assignment functionality
- ✅ Real-time statistics
- ✅ Professional interface

## 🚨 Troubleshooting

### If Admin Login Fails:
Run the admin creation script again:
```bash
node scripts/create-admin.js
```

### If User IDs Don't Work:
Check MongoDB connection and ensure users were created during onboarding.

### If Assignments Don't Work:
Verify both caregiver and patient completed onboarding and appear in admin dashboard.

## 📱 Mobile Testing
All dashboards are responsive and work on mobile devices. Test on different screen sizes to verify UI adapts properly.
