const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugPatientAnswers() {
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

    const db = mongoose.connection.db;
    const patientsCollection = db.collection('patients');

    // Find the patient directly in MongoDB
    const patient = await patientsCollection.findOne({ patientId: 'PTMI4RLYMR' });
    
    if (!patient) {
      console.log('❌ Patient not found');
      process.exit(1);
    }

    console.log('PATIENT DATA IN DATABASE:');
    console.log('='.repeat(80));
    console.log(`Name: ${patient.name}`);
    console.log(`Patient ID: ${patient.patientId}`);
    console.log(`questionnaireEnabled: ${patient.questionnaireEnabled}`);
    console.log(`lastQuestionnaireSubmission: ${patient.lastQuestionnaireSubmission}`);
    console.log('');

    console.log('QUESTIONNAIRE ANSWERS RAW DATA:');
    console.log('='.repeat(80));
    
    if (!patient.questionnaireAnswers) {
      console.log('❌ questionnaireAnswers field is NULL');
    } else if (!Array.isArray(patient.questionnaireAnswers)) {
      console.log('⚠️  questionnaireAnswers is NOT an array, it is:', typeof patient.questionnaireAnswers);
      console.log('   Content:', JSON.stringify(patient.questionnaireAnswers, null, 2));
    } else if (patient.questionnaireAnswers.length === 0) {
      console.log('⚠️  questionnaireAnswers array is EMPTY');
    } else {
      console.log(`✅ Found ${patient.questionnaireAnswers.length} answer(s)\n`);
      
      // Show ALL answers with full details
      patient.questionnaireAnswers.forEach((answer, i) => {
        console.log(`Answer ${i + 1}:`);
        console.log(`  questionId: ${answer.questionId}`);
        console.log(`  questionText: ${answer.questionText}`);
        console.log(`  answer: ${JSON.stringify(answer.answer)}`);
        console.log(`  submittedAt: ${answer.submittedAt}`);
        console.log('');
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('ANALYSIS:');
    console.log('='.repeat(80));
    
    if (patient.questionnaireAnswers && patient.questionnaireAnswers.length > 0) {
      const firstAnswer = patient.questionnaireAnswers[0];
      
      if (!firstAnswer.questionText) {
        console.log('❌ ISSUE: questionText is missing/empty');
        console.log('   This is why admin profile shows empty Question field');
        console.log('\nPossible causes:');
        console.log('1. questionnaire.questions.id(questionId) returned null');
        console.log('2. Question IDs in answers don\'t match actual questionnaire');
        console.log('3. Questionnaire was deleted/reset after submission');
      }
      
      if (firstAnswer.answer === undefined || firstAnswer.answer === null) {
        console.log('❌ ISSUE: answer is undefined/null');
        console.log('   This is why admin profile shows "undefined"');
      }
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

debugPatientAnswers();
