const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function fulDiagnostic() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const PatientSchema = new mongoose.Schema({}, { strict: false });
    const Patient = mongoose.models.Patient || 
      mongoose.model('Patient', PatientSchema);

    const QuestionSchema = new mongoose.Schema({
      questionText: String,
      type: { type: String, default: 'text' },
      options: [String],
      required: { type: Boolean, default: true },
      order: { type: Number, default: 0 }
    }, { _id: false });

    const QuestionnaireSchema = new mongoose.Schema({
      title: String,
      description: String,
      questions: [QuestionSchema],
      isActive: { type: Boolean, default: true },
      createdBy: mongoose.Schema.Types.ObjectId,
      createdAt: Date,
      updatedAt: Date
    });

    const Questionnaire = mongoose.models.Questionnaire || 
      mongoose.model('Questionnaire', QuestionnaireSchema);

    // ============ TEST 1: Patient Lookup ============
    console.log('TEST 1: PATIENT LOOKUP');
    console.log('='.repeat(70));

    const patientId = 'PTMI4RLYMR';
    console.log(`Looking for patient: ${patientId}\n`);

    const patient = await Patient.findOne({ patientId });
    
    if (!patient) {
      console.log('❌ Patient NOT found in database!');
      process.exit(1);
    }

    console.log('✅ Patient found');
    console.log(`   Name: ${patient.name}`);
    console.log(`   Custom ID: ${patient.patientId}`);
    console.log(`   questionnaireEnabled: ${patient.questionnaireEnabled}`);
    console.log(`   isAssigned: ${patient.isAssigned}`);

    // ============ TEST 2: Questionnaire Lookup ============
    console.log('\nTEST 2: QUESTIONNAIRE LOOKUP');
    console.log('='.repeat(70));

    if (!patient.questionnaireEnabled) {
      console.log('❌ Patient questionnaire is NOT enabled!');
      console.log('   This is why questionnaire is not showing');
      process.exit(1);
    }

    console.log('✅ Patient questionnaire is enabled\n');

    console.log('Searching for active questionnaire...');
    const questionnaire = await Questionnaire.findOne({ isActive: true })
      .sort({ updatedAt: -1 });

    if (!questionnaire) {
      console.log('❌ No active questionnaire found!');
      const anyQuestionnaire = await Questionnaire.findOne()
        .sort({ updatedAt: -1 });
      
      if (anyQuestionnaire) {
        console.log(`   Found inactive questionnaire: ${anyQuestionnaire.title}`);
        console.log(`   isActive: ${anyQuestionnaire.isActive}`);
      } else {
        console.log('   No questionnaire in database at all!');
      }
      process.exit(1);
    }

    console.log('✅ Active questionnaire found');
    console.log(`   Title: ${questionnaire.title}`);
    console.log(`   Questions: ${questionnaire.questions?.length || 0}`);
    console.log(`   isActive: ${questionnaire.isActive}`);

    if (!questionnaire.questions || questionnaire.questions.length === 0) {
      console.log('❌ Questionnaire has NO questions!');
      process.exit(1);
    }

    // ============ TEST 3: Simulate API Response ============
    console.log('\nTEST 3: SIMULATED API RESPONSE');
    console.log('='.repeat(70));

    const apiResponse = {
      success: true,
      data: {
        patient: {
          _id: patient._id,
          name: patient.name,
          age: patient.age,
          cancerType: patient.cancerType,
          treatmentStatus: patient.treatmentModality?.join(', ') || 'N/A',
          assignedCaregiver: patient.assignedCaregiver,
          questionnaireEnabled: patient.questionnaireEnabled,
          questionnaireAnswers: patient.questionnaireAnswers,
          lastQuestionnaireSubmission: patient.lastQuestionnaireSubmission
        },
        questionnaire: questionnaire ? {
          _id: questionnaire._id,
          title: questionnaire.title,
          description: questionnaire.description,
          questions: questionnaire.questions || [],
          isActive: questionnaire.isActive
        } : null
      }
    };

    console.log('\nAPI Response structure:');
    console.log(`  success: ${apiResponse.success}`);
    console.log(`  data.patient.name: ${apiResponse.data.patient.name}`);
    console.log(`  data.patient.questionnaireEnabled: ${apiResponse.data.patient.questionnaireEnabled}`);
    console.log(`  data.questionnaire.title: ${apiResponse.data.questionnaire.title}`);
    console.log(`  data.questionnaire.questions: ${apiResponse.data.questionnaire.questions.length}`);

    if (!apiResponse.data.questionnaire) {
      console.log('\n❌ Problem: questionnaire is null in response');
      process.exit(1);
    }

    if (apiResponse.data.questionnaire.questions.length === 0) {
      console.log('\n❌ Problem: questionnaire has 0 questions');
      process.exit(1);
    }

    // ============ TEST 4: First Few Questions ============
    console.log('\nTEST 4: SAMPLE QUESTIONS');
    console.log('='.repeat(70));

    questionnaire.questions.slice(0, 3).forEach((q, i) => {
      console.log(`\nQuestion ${q.order || i + 1}:`);
      console.log(`  Text: ${q.questionText}`);
      console.log(`  Type: ${q.type}`);
      console.log(`  Options: ${q.options?.length || 0}`);
      if (q.options && q.options.length > 0) {
        console.log(`  Sample options: ${q.options.slice(0, 2).join(', ')}`);
      }
    });

    // ============ TEST 5: Dashboard Component Logic ============
    console.log('\n\nTEST 5: DASHBOARD COMPONENT LOGIC');
    console.log('='.repeat(70));

    const userData = {
      id: patient.patientId,
      name: patient.name,
      userType: 'patient',
      questionnaireEnabled: patient.questionnaireEnabled,
      isAssigned: patient.isAssigned
    };

    console.log('\nComponent will receive:');
    console.log(`  userData.questionnaireEnabled: ${userData.questionnaireEnabled}`);
    console.log(`  questionnaire object exists: ${!!questionnaire}`);
    console.log(`  questionnaire.questions.length: ${questionnaire.questions?.length || 0}`);

    console.log('\nComponent render condition:');
    console.log(`  {userData.questionnaireEnabled && questionnaire ? (`);
    console.log(`  = ${userData.questionnaireEnabled} && ${!!questionnaire}`);
    console.log(`  = ${userData.questionnaireEnabled && !!questionnaire}`);

    if (userData.questionnaireEnabled && questionnaire) {
      console.log('\n✅ WILL SHOW QUESTIONNAIRE');
      console.log(`   Title: ${questionnaire.title}`);
      console.log(`   Questions: ${questionnaire.questions.length}`);
    } else {
      console.log('\n❌ WILL NOT SHOW QUESTIONNAIRE');
      if (!userData.questionnaireEnabled) {
        console.log('   Reason: userData.questionnaireEnabled is false');
      }
      if (!questionnaire) {
        console.log('   Reason: questionnaire is not set');
      }
    }

    console.log('\n✅ ALL TESTS PASSED');
    console.log('\nIf questionnaire still doesn\'t show on dashboard:');
    console.log('1. Check browser console for [Dashboard] logs');
    console.log('2. Check Network tab for /api/patient/dashboard?patientId=...');
    console.log('3. Verify API Response has questionnaire with 26 questions');
    console.log('4. Restart server if API code was changed');

  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected.');
  }
}

fulDiagnostic();
