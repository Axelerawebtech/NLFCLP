const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const PatientSchema = new mongoose.Schema({}, { strict: false });
const Patient = mongoose.model('Patient', PatientSchema, 'patients');

async function checkStatus() {
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

    const patient = await Patient.findOne({ patientId: 'PTMI4RLYMR' });
    
    if (!patient) {
      console.log('❌ Patient not found');
      process.exit(1);
    }

    console.log('📊 CURRENT DATABASE STATUS:');
    console.log('='.repeat(80));
    console.log(`Patient Name: ${patient.name}`);
    console.log(`Patient ID: ${patient.patientId}`);
    console.log(`MongoDB _id: ${patient._id}`);
    console.log(`Questionnaire Enabled: ${patient.questionnaireEnabled}`);
    console.log(`\nQuestionnaire Answers Count: ${patient.questionnaireAnswers?.length || 0}`);
    
    if (patient.questionnaireAnswers && patient.questionnaireAnswers.length > 0) {
      console.log('\nResponses in Database:');
      console.log('-'.repeat(80));
      patient.questionnaireAnswers.forEach((ans, i) => {
        console.log(`\nResponse ${i + 1}:`);
        console.log(`  questionId: ${ans.questionId || '(missing)'}`);
        console.log(`  questionText: ${ans.questionText || '(missing)'}`);
        console.log(`  answer: ${ans.answer || '(missing)'}`);
        console.log(`  submittedAt: ${ans.submittedAt || '(missing)'}`);
      });
    } else {
      console.log('✅ No responses recorded yet (clean slate)');
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ STATUS CHECK COMPLETE');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

checkStatus();
