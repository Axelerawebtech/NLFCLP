/**
 * Diagnostic script to check questionnaire status
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function diagnose() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Define models
    const PatientSchema = new mongoose.Schema({}, { strict: false });
    const Patient = mongoose.model('Patient', PatientSchema, 'patients');
    
    const QuestionnaireSchema = new mongoose.Schema({}, { strict: false });
    const Questionnaire = mongoose.model('Questionnaire', QuestionnaireSchema, 'questionnaires');

    // Check patient
    console.log('📋 Checking patient PTMHC91NVN:');
    const patient = await Patient.findOne({ patientId: 'PTMHC91NVN' });
    
    if (patient) {
      console.log(`  ✅ Found: ${patient.name}`);
      console.log(`  questionnaireEnabled: ${patient.questionnaireEnabled}`);
      console.log(`  questionnaireAnswers length: ${patient.questionnaireAnswers?.length || 0}`);
    } else {
      console.log('  ❌ Patient not found');
    }

    // Check questionnaires
    console.log('\n📋 Checking questionnaires:');
    const allQuestionnaires = await Questionnaire.find({});
    console.log(`  Total questionnaires: ${allQuestionnaires.length}`);

    const activeQ = await Questionnaire.findOne({ isActive: true });
    if (activeQ) {
      console.log(`  ✅ Active questionnaire found: ${activeQ.title}`);
      console.log(`     Questions: ${activeQ.questions?.length || 0}`);
    } else {
      console.log('  ❌ No active questionnaire found');
    }

    // List all questionnaires
    console.log('\n  All questionnaires:');
    allQuestionnaires.forEach((q, i) => {
      console.log(`    ${i + 1}. ${q.title} (isActive: ${q.isActive})`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

diagnose();
