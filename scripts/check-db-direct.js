const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const PatientSchema = new mongoose.Schema({}, { strict: false });
const Patient = mongoose.model('Patient', PatientSchema, 'patients');

async function checkAnswers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const patient = await Patient.findOne({ patientId: 'PTMI4RLYMR' });
    
    if (!patient) {
      console.log('❌ Patient not found');
      process.exit(1);
    }

    console.log('\n📋 CURRENT DATABASE STATE:');
    console.log('='.repeat(80));
    console.log(`Patient: ${patient.name}`);
    console.log(`Questionnaire Enabled: ${patient.questionnaireEnabled}`);
    console.log(`Answers Count: ${patient.questionnaireAnswers?.length || 0}`);
    console.log(`Last Submission: ${patient.lastQuestionnaireSubmission || 'None'}`);
    
    if (patient.questionnaireAnswers && patient.questionnaireAnswers.length > 0) {
      console.log('\n✅ Found responses:');
      patient.questionnaireAnswers.forEach((ans, i) => {
        console.log(`\n[${i + 1}] ${ans.questionText}`);
        console.log(`    Answer: ${ans.answer}`);
        console.log(`    Submitted: ${ans.submittedAt}`);
      });
    } else {
      console.log('\n❌ NO RESPONSES IN DATABASE');
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkAnswers();
