/**
 * PATIENT QUESTIONNAIRE SYSTEM DEMO SCRIPT
 * 
 * This script demonstrates how to test the complete patient questionnaire system.
 * Run these API calls in order to test the complete flow:
 */

// 1. CREATE A QUESTIONNAIRE (Admin)
const createQuestionnaire = async () => {
  const response = await fetch('/api/admin/questionnaire/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Patient Health Assessment',
      description: 'Please answer the following questions about your health and wellbeing.',
      adminId: 'admin123', // Replace with actual admin ID
      questions: [
        {
          questionText: 'How would you rate your current pain level?',
          type: 'scale',
          required: true
        },
        {
          questionText: 'Which symptoms are you currently experiencing?',
          type: 'checkbox',
          options: ['Nausea', 'Fatigue', 'Pain', 'Sleep issues', 'Anxiety'],
          required: true
        },
        {
          questionText: 'How has your mood been lately?',
          type: 'radio',
          options: ['Excellent', 'Good', 'Fair', 'Poor'],
          required: true
        },
        {
          questionText: 'Please describe any additional concerns you have:',
          type: 'textarea',
          required: false
        }
      ]
    })
  });
  return response.json();
};

// 2. GET ALL PATIENTS (Admin)
const getAllPatients = async () => {
  const response = await fetch('/api/admin/patients');
  return response.json();
};

// 3. ENABLE QUESTIONNAIRE FOR A PATIENT (Admin)
const enableQuestionnaireForPatient = async (patientId) => {
  const response = await fetch(`/api/admin/patients/${patientId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      questionnaireEnabled: true
    })
  });
  return response.json();
};

// 4. GET PATIENT DASHBOARD DATA (Patient)
const getPatientDashboard = async (patientId) => {
  const response = await fetch(`/api/patient/dashboard?patientId=${patientId}`);
  return response.json();
};

// 5. SUBMIT QUESTIONNAIRE ANSWERS (Patient)
const submitQuestionnaireAnswers = async (patientId, answers) => {
  const response = await fetch('/api/patient/questionnaire/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      patientId,
      answers: {
        'questionId1': '8', // Scale answer
        'questionId2': ['Fatigue', 'Pain'], // Checkbox answers
        'questionId3': 'Fair', // Radio answer
        'questionId4': 'I have been feeling more tired than usual...' // Textarea answer
      }
    })
  });
  return response.json();
};

// 6. VIEW PATIENT DETAILS WITH ANSWERS (Admin)
const getPatientDetails = async (patientId) => {
  const response = await fetch(`/api/admin/patients/${patientId}`);
  return response.json();
};

/**
 * FRONTEND USAGE EXAMPLES:
 */

// Navigate to questionnaire configuration (Admin)
// router.push('/admin/configure-patient-questionnaire');

// Navigate to patient profiles (Admin)
// router.push('/admin/patient-profiles');

// Navigate to patient dashboard (Patient)
// router.push('/patient/dashboard?patientId=PATIENT_ID');

/**
 * TESTING WORKFLOW:
 * 
 * 1. Admin logs in and navigates to "Configure Patient Questionnaire"
 * 2. Admin creates a new questionnaire with various question types
 * 3. Admin navigates to "Patient Profiles"
 * 4. Admin finds a patient and toggles their questionnaire to "Enabled"
 * 5. Patient logs in and sees the questionnaire on their dashboard
 * 6. Patient fills out and submits the questionnaire
 * 7. Admin can view the patient's responses in their profile
 */

export {
  createQuestionnaire,
  getAllPatients,
  enableQuestionnaireForPatient,
  getPatientDashboard,
  submitQuestionnaireAnswers,
  getPatientDetails
};