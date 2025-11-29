/**
 * Enable questionnaire for cleaned patients
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function enableQuestionnaires() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const PatientSchema = new mongoose.Schema({}, { strict: false });
    const Patient = mongoose.model('Patient', PatientSchema, 'patients');

    // List of patients we just cleaned
    const patientIds = [
      'PTMHBWVF18',
      'PTMHC4PENF',
      'PTMHC7PIC7',
      'PTMHC91NVN',
      'PTMICQ5XUK'
    ];

    console.log('🔄 Enabling questionnaire for cleaned patients:\n');

    for (const patientId of patientIds) {
      const result = await Patient.findOneAndUpdate(
        { patientId },
        { questionnaireEnabled: true },
        { new: true }
      );

      if (result) {
        console.log(`✅ [${patientId}] ${result.name}`);
        console.log(`   questionnaireEnabled: ${result.questionnaireEnabled}`);
      } else {
        console.log(`❌ [${patientId}] Not found`);
      }
    }

    console.log('\n✅ All questionnaires enabled!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

enableQuestionnaires();
