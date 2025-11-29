const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkPatientAnswers() {
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

    const PatientSchema = new mongoose.Schema({}, { strict: false });
    const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);

    // Find the specific patient
    const patient = await Patient.findOne({ patientId: 'PTMI4RLYMR' });
    
    if (!patient) {
      console.log('❌ Patient not found');
      process.exit(1);
    }

    console.log('PATIENT DETAILS:');
    console.log('='.repeat(80));
    console.log(`Name: ${patient.name}`);
    console.log(`Patient ID: ${patient.patientId}`);
    console.log(`MongoDB ID: ${patient._id}`);
    console.log(`questionnaireEnabled: ${patient.questionnaireEnabled}`);
    console.log(`lastQuestionnaireSubmission: ${patient.lastQuestionnaireSubmission}`);
    console.log('');

    console.log('QUESTIONNAIRE ANSWERS:');
    console.log('='.repeat(80));
    
    if (!patient.questionnaireAnswers) {
      console.log('❌ questionnaireAnswers field is NULL or UNDEFINED');
    } else if (patient.questionnaireAnswers.length === 0) {
      console.log('⚠️  questionnaireAnswers array is EMPTY');
      console.log('   Patient has not submitted any questionnaire responses yet');
    } else {
      console.log(`✅ Found ${patient.questionnaireAnswers.length} answers\n`);
      
      // Show first few answers
      patient.questionnaireAnswers.slice(0, 3).forEach((answer, i) => {
        console.log(`Answer ${i + 1}:`);
        console.log(`  Question ID: ${answer.questionId}`);
        console.log(`  Question Text: ${answer.questionText}`);
        console.log(`  Answer: ${Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}`);
        console.log(`  Submitted: ${answer.submittedAt}`);
        console.log('');
      });

      if (patient.questionnaireAnswers.length > 3) {
        console.log(`... and ${patient.questionnaireAnswers.length - 3} more answers`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('TROUBLESHOOTING:');
    console.log('='.repeat(80));
    
    if (!patient.questionnaireAnswers || patient.questionnaireAnswers.length === 0) {
      console.log('\nPossible issues:');
      console.log('1. Patient has not submitted questionnaire yet');
      console.log('2. Questionnaire submission endpoint not working');
      console.log('3. Answers are being saved to wrong field');
      console.log('\nNext steps:');
      console.log('1. Go to patient dashboard and fill questionnaire');
      console.log('2. Click "Submit Questionnaire" button');
      console.log('3. Check browser console for errors');
      console.log('4. Check server logs for submission errors');
    } else {
      console.log('✅ Answers are being saved correctly');
      console.log('   Issue might be in admin view page or API endpoint');
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

checkPatientAnswers();
