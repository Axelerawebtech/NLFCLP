const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function clearBadAnswers() {
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

    // Find the patient
    const patient = await patientsCollection.findOne({ patientId: 'PTMI4RLYMR' });
    
    if (!patient) {
      console.log('❌ Patient not found');
      process.exit(1);
    }

    console.log('BEFORE CLEANUP:');
    console.log('='.repeat(80));
    console.log(`Patient: ${patient.name} (${patient.patientId})`);
    console.log(`Current answers: ${patient.questionnaireAnswers?.length || 0}`);
    
    if (patient.questionnaireAnswers && patient.questionnaireAnswers.length > 0) {
      console.log(`First answer: ${JSON.stringify(patient.questionnaireAnswers[0])}`);
    }
    console.log('');

    // Clear the bad answers
    await patientsCollection.updateOne(
      { patientId: 'PTMI4RLYMR' },
      {
        $set: {
          questionnaireAnswers: [],
          lastQuestionnaireSubmission: null
        }
      }
    );

    // Verify
    const updated = await patientsCollection.findOne({ patientId: 'PTMI4RLYMR' });

    console.log('AFTER CLEANUP:');
    console.log('='.repeat(80));
    console.log(`Patient: ${updated.name} (${updated.patientId})`);
    console.log(`Current answers: ${updated.questionnaireAnswers?.length || 0}`);
    console.log(`Last submission: ${updated.lastQuestionnaireSubmission || 'None'}`);
    console.log('');

    console.log('✅ Bad responses cleared successfully!');
    console.log('\nNEXT STEPS:');
    console.log('1. Restart server: npm run dev');
    console.log('2. Clear browser cache: Ctrl+Shift+Delete');
    console.log('3. Patient submits questionnaire again');
    console.log('4. Admin should now see all 26 responses with correct data');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

clearBadAnswers();
