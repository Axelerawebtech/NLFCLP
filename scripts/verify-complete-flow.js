const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyCompleteFlow() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }

    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Import models
    const PatientSchema = new mongoose.Schema({}, { strict: false });
    const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);

    const QuestionSchema = new mongoose.Schema({}, { strict: false }, { _id: false });
    const QuestionnaireSchema = new mongoose.Schema({
      title: String,
      questions: [QuestionSchema],
      isActive: Boolean
    });
    const Questionnaire = mongoose.models.Questionnaire || mongoose.model('Questionnaire', QuestionnaireSchema);

    // Step 1: Check patient
    console.log('STEP 1: CHECK PATIENT');
    console.log('='.repeat(70));
    const patient = await Patient.findOne({ patientId: 'PTMI4RLYMR' });
    
    if (!patient) {
      console.log('❌ Patient not found');
      process.exit(1);
    }

    console.log(`✅ Patient found: ${patient.name}`);
    console.log(`   Custom ID: ${patient.patientId}`);
    console.log(`   MongoDB ID: ${patient._id}`);
    console.log(`   questionnaireEnabled: ${patient.questionnaireEnabled}`);
    console.log(`   isAssigned: ${patient.isAssigned}\n`);

    // Step 2: Check questionnaire
    console.log('STEP 2: CHECK QUESTIONNAIRE');
    console.log('='.repeat(70));
    
    if (!patient.questionnaireEnabled) {
      console.log('❌ ERROR: questionnaireEnabled is false!');
      console.log('   The questionnaire will NOT show in the dashboard');
      process.exit(1);
    }

    const questionnaire = await Questionnaire.findOne({ isActive: true }).sort({ updatedAt: -1 });
    
    if (!questionnaire) {
      console.log('❌ No active questionnaire found');
      process.exit(1);
    }

    console.log(`✅ Questionnaire found: ${questionnaire.title}`);
    console.log(`   Questions: ${questionnaire.questions?.length || 0}`);
    console.log(`   IsActive: ${questionnaire.isActive}\n`);

    // Step 3: Simulate login response
    console.log('STEP 3: SIMULATE LOGIN RESPONSE');
    console.log('='.repeat(70));
    
    const loginResponse = {
      id: patient.patientId,
      name: patient.name,
      userType: 'patient',
      isAssigned: patient.isAssigned,
      questionnaireEnabled: patient.questionnaireEnabled,
      mongoDbId: patient._id.toString()
    };

    console.log('Login API will return:');
    console.log(JSON.stringify(loginResponse, null, 2));
    console.log('');

    // Step 4: Simulate dashboard data fetch
    console.log('STEP 4: SIMULATE DASHBOARD DATA FETCH');
    console.log('='.repeat(70));
    
    const dashboardResponse = {
      success: true,
      data: {
        patient: {
          name: patient.name,
          questionnaireEnabled: patient.questionnaireEnabled
        },
        questionnaire: questionnaire ? {
          title: questionnaire.title,
          questions: questionnaire.questions || []
        } : null
      }
    };

    console.log('Dashboard API will return:');
    console.log(JSON.stringify(dashboardResponse, null, 2));
    console.log('');

    // Step 5: Check rendering condition
    console.log('STEP 5: DASHBOARD RENDERING CONDITION');
    console.log('='.repeat(70));
    
    const userData = loginResponse;
    const shouldRender = userData.questionnaireEnabled && dashboardResponse.data.questionnaire;
    
    console.log(`userData.questionnaireEnabled: ${userData.questionnaireEnabled}`);
    console.log(`questionnaire exists: ${!!dashboardResponse.data.questionnaire}`);
    console.log(`Will render questionnaire: ${shouldRender}`);
    console.log('');

    if (shouldRender) {
      console.log('✅ QUESTIONNAIRE SHOULD DISPLAY ON DASHBOARD');
      console.log(`   With ${dashboardResponse.data.questionnaire.questions.length} questions`);
    } else {
      console.log('❌ QUESTIONNAIRE WILL NOT DISPLAY');
      if (!userData.questionnaireEnabled) {
        console.log('   Reason: questionnaireEnabled is false');
      }
      if (!dashboardResponse.data.questionnaire) {
        console.log('   Reason: No questionnaire data');
      }
    }

    console.log('\n✅ VERIFICATION COMPLETE');
    console.log('\nNext steps:');
    console.log('1. Restart the development server (npm run dev)');
    console.log('2. Clear browser cache (Ctrl+Shift+Delete)');
    console.log('3. Login as PTMI4RLYMR');
    console.log('4. URL should update to /patient/dashboard?id=<mongoDbId>');
    console.log('5. Questionnaire should appear with ' + dashboardResponse.data.questionnaire.questions.length + ' questions');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

verifyCompleteFlow();
