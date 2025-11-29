/**
 * DIAGNOSTIC SCRIPT: Check what a new patient sees on login
 * 
 * This script will:
 * 1. Find a new patient (never submitted questionnaire)
 * 2. Check their questionnaireEnabled status
 * 3. Check their questionnaireAnswers
 * 4. Simulate what the dashboard will render
 */

const mongoose = require('mongoose');
const path = require('path');

// Import Patient model
const PatientSchema = new mongoose.Schema({
  patientId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: String, required: true },
  gender: { type: String, required: true },
  maritalStatus: { type: String, required: true },
  educationLevel: { type: String, required: true },
  employmentStatus: { type: String, required: true },
  residentialArea: { type: String, required: true },
  cancerType: { type: String, required: true },
  cancerStage: { type: String, required: true },
  treatmentModality: { type: [String], required: true },
  illnessDuration: { type: String, required: true },
  comorbidities: { type: [String], required: true },
  healthInsurance: { type: String, required: true },
  isAssigned: { type: Boolean, default: false },
  assignedCaregiver: { type: mongoose.Schema.Types.ObjectId, ref: 'Caregiver', default: null },
  consentAccepted: { type: Boolean, default: true },
  consentAcceptedAt: { type: Date, default: Date.now },
  questionnaireEnabled: { type: Boolean, default: false },
  questionnaireAnswers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId },
    questionText: { type: String },
    answer: { type: mongoose.Schema.Types.Mixed },
    submittedAt: { type: Date, default: Date.now },
  }],
  lastQuestionnaireSubmission: { type: Date, default: null },
  legacyQuestionnaireAnswers: { type: Object, default: {} },
  postTestAvailable: { type: Boolean, default: false },
  postTestCompleted: { type: Boolean, default: false },
  postTestScore: { type: Number, default: null },
  postTestDate: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null },
});

const Patient = mongoose.model('Patient', PatientSchema);

async function diagnosticNewPatient() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cancer-care');
    console.log('✅ Connected to MongoDB\n');

  console.log('\n===== DIAGNOSTIC: NEW PATIENT QUESTIONNAIRE FLOW =====\n');

  // Find a patient with NO questionnaire responses (new patient)
  const newPatients = await Patient.find({
    $or: [
      { questionnaireAnswers: { $size: 0 } },
      { questionnaireAnswers: { $exists: false } }
    ]
  }).limit(1);

  if (newPatients.length === 0) {
    console.log('❌ No new patients found (all have questionnaire responses)');
    console.log('\nCreating a test new patient for diagnosis...');
    
    // Create a test patient
    const testPatient = new Patient({
      patientId: `TEST-${Date.now()}`,
      name: 'Test New Patient',
      phone: '9999999999',
      age: '45',
      gender: 'Male',
      maritalStatus: 'Married',
      educationLevel: 'Graduate',
      employmentStatus: 'Employed',
      residentialArea: 'Urban',
      cancerType: 'Breast',
      cancerStage: 'Stage 2',
      treatmentModality: ['Chemotherapy'],
      illnessDuration: '6 months',
      comorbidities: [],
      healthInsurance: 'Yes',
      questionnaireEnabled: false, // NEW PATIENT - NOT ENABLED
      questionnaireAnswers: [], // NEW PATIENT - NO ANSWERS
    });
    
    await testPatient.save();
    console.log(`✅ Created test patient: ${testPatient.patientId}\n`);
    
    newPatients.push(testPatient);
  }

  const patient = newPatients[0];

  console.log('📋 PATIENT DATA:');
  console.log(`  Patient ID: ${patient.patientId}`);
  console.log(`  Name: ${patient.name}`);
  console.log(`  questionnaireEnabled: ${patient.questionnaireEnabled}`);
  console.log(`  questionnaireAnswers length: ${patient.questionnaireAnswers?.length || 0}`);
  console.log(`  questionnaireAnswers array: ${JSON.stringify(patient.questionnaireAnswers)}`);

  console.log('\n🔍 DASHBOARD LOGIC CHECK:');
  
  const isQuestionnaireEnabled = patient.questionnaireEnabled;
  const existingAnswers = patient.questionnaireAnswers;
  const isArray = Array.isArray(existingAnswers);
  const hasAnswers = isArray && existingAnswers.length > 0;
  const shouldShowSubmitted = isQuestionnaireEnabled === true && hasAnswers;

  console.log(`  isQuestionnaireEnabled: ${isQuestionnaireEnabled}`);
  console.log(`  existingAnswers: ${JSON.stringify(existingAnswers)}`);
  console.log(`  Array.isArray(existingAnswers): ${isArray}`);
  console.log(`  existingAnswers.length > 0: ${hasAnswers}`);
  console.log(`  shouldShowSubmitted (enabled AND hasAnswers): ${shouldShowSubmitted}`);

  console.log('\n🎬 WHAT WILL THE DASHBOARD SHOW?');
  
  if (isQuestionnaireEnabled && existingAnswers) {
    console.log('  ✅ Will show questionnaire form/submitted card');
    if (shouldShowSubmitted) {
      console.log('  📊 Specific UI: SUCCESS CARD (Questionnaire Submitted)');
    } else {
      console.log('  📝 Specific UI: BLANK FORM (Ready for submission)');
    }
  } else {
    console.log('  ❌ Will show "No questionnaire available" message');
    console.log(`     Reason: questionnaireEnabled=${isQuestionnaireEnabled}, questionnaire exists=${!!existingAnswers}`);
  }

  console.log('\n💡 EXPECTED BEHAVIOR FOR NEW PATIENT:');
  console.log('  1. New patient created → questionnaireEnabled = false, questionnaireAnswers = []');
  console.log('  2. Admin enables questionnaire → questionnaireEnabled = true');
  console.log('  3. Patient logs in → Dashboard shows blank form (because no answers yet)');
  console.log('  4. Patient fills and submits → questionnaireAnswers populated');
  console.log('  5. Patient logs in again → Dashboard shows success card (has answers)');

  console.log('\n🐛 IF THERE\'S A BUG, IT WOULD BE:');
  console.log('  - New patient sees success card instead of form (shouldn\'t happen)');
  console.log('  - OR new patient sees nothing at all (if questionnaireEnabled not set)');
  console.log('  - OR new patient can\'t submit (if questionnaireEnabled is false but form shows)');

    console.log('\n✅ DIAGNOSIS COMPLETE\n');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

diagnosticNewPatient();
