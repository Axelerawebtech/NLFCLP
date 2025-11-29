# Patient Login & Dashboard - Quick Reference Guide

## 🎯 How It Works

### For Patients
1. **Receive Patient ID** → During registration with admin
2. **Go to Login** → Navigate to `http://localhost:3000/login`
3. **Select Patient** → Choose "Patient" from dropdown
4. **Enter ID** → Input your Patient ID
5. **Click Login** → Submit form
6. **Access Dashboard** → View personalized content after assignment by admin

### For Admin
1. **Create Patient** → Add patient with registration form
2. **Assign Caregiver** → Click "Assign Caregiver to Patient" button on admin dashboard
3. **Patient Gets Access** → Patient can now login with their ID

## 🚫 Access Denied Scenarios

### ❌ Patient Not Assigned Yet
```
Error: "Your account has not been activated yet. 
Please wait for the administrator to assign you to a caregiver."
```
**Solution**: Admin needs to assign caregiver to this patient first

### ❌ Invalid Patient ID
```
Error: "Patient not found. Please check your ID."
```
**Solution**: Double-check the patient ID or create new patient

### ❌ Direct Dashboard Access Without Login
```
Automatic Redirect to: /login
```
**Solution**: Login first through the login page

## ✅ Successful Login

### What Happens
1. ✅ Patient ID and caregiver verified
2. ✅ Session data saved in browser
3. ✅ Redirected to dashboard
4. ✅ Patient name and caregiver info displayed
5. ✅ Questionnaire available (if enabled by admin)

### Dashboard Features
- Welcome message with patient name
- Assigned caregiver info
- Questionnaire (if enabled)
- Patient information summary
- Logout button

## 📱 URLs

| Page | URL |
|------|-----|
| Unified Login | `http://localhost:3000/login` |
| Patient Dashboard | `http://localhost:3000/patient/dashboard` |
| Admin Dashboard | `http://localhost:3000/admin/dashboard` |

## 🔄 Logout Process

1. Click **"Logout"** button on dashboard
2. Session automatically cleared
3. Redirected to login page
4. Next login requires entering ID again

## 🆘 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Can't login | Not assigned yet | Contact admin for assignment |
| Wrong patient ID error | Incorrect ID entered | Verify ID from registration confirmation |
| Session lost after refresh | Browser cache cleared | Login again (normal behavior) |
| Dashboard shows blank | Questionnaire not enabled | Admin needs to enable for patient |
| Can access dashboard without login | Browser cache issue | Clear cache and try again |

## 📋 Patient ID Information

- **Provided During**: Registration completion
- **Format**: Alphanumeric string (e.g., "PAT001", "PATIENT123")
- **Location**: Confirmation email or registration summary
- **Can Request**: Contact administrator if ID lost

## 🔐 Security Notes

- ✅ Session stored locally (browser storage)
- ✅ Each login updates last login timestamp
- ✅ Invalid session auto-clears on load
- ✅ Logout clears all session data
- ✅ Only assigned patients can login
- ✅ One caregiver per patient

## 📞 Admin Quick Tasks

### Assign Patient to Caregiver
1. Go to Admin Dashboard
2. Look for patient in list
3. Click **"Assign Caregiver to Patient"** button
4. Select patient from dropdown
5. Select caregiver from dropdown
6. Confirm assignment

### Enable Questionnaire for Patient
1. Go to **"Patient Profiles"** in Admin Dashboard
2. Find patient in table
3. Toggle **"Questionnaire"** switch to ON
4. Patient will see questionnaire on next login

### View Patient Responses
1. Go to **"Patient Profiles"** in Admin Dashboard
2. Find patient in table
3. Click **"View Responses"** icon
4. See all submitted answers with dates

## 🎓 System Features

### For Patients
- ✅ Login with single ID
- ✅ View assigned caregiver info
- ✅ Complete questionnaires
- ✅ View submission history
- ✅ Logout anytime

### For Admins
- ✅ Manage patient assignments
- ✅ Control questionnaire access
- ✅ View patient responses
- ✅ Track login history
- ✅ Enable/disable features per patient

## 🌐 System Behavior

| Action | Result |
|--------|--------|
| Patient navigates to `/login` | Shows login form with user type dropdown |
| Patient selects "Patient" | Shows ID input field |
| Patient enters correct ID (assigned) | ✅ Redirects to dashboard |
| Patient enters correct ID (not assigned) | ❌ Shows "Not activated" error |
| Patient enters wrong ID | ❌ Shows "Patient not found" error |
| Patient clicks Logout | ✅ Clears session, goes to login |
| Patient directly visits dashboard (logged out) | ❌ Redirects to login |
| Patient directly visits dashboard (logged in) | ✅ Shows dashboard |

## 💡 Tips & Best Practices

1. **Save Patient ID** → Keep the ID safe; it's your login credentials
2. **Contact Support** → If you forgot your ID, contact administrator
3. **Regular Logout** → For security, logout from shared computers
4. **Check Questionnaires** → New questionnaires may be enabled anytime
5. **Browser Compatibility** → Works on all modern browsers (Chrome, Firefox, Safari, Edge)

---

**Last Updated**: November 28, 2025  
**System Version**: 1.0  
**Status**: ✅ Live
