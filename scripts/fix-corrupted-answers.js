/**
 * Fix corrupted questionnaire answers
 * Some patients have patient objects in their questionnaireAnswers instead of actual answers
 * This script detects and clears those corrupted entries
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const PatientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true },
  name: String,
  questionnaireAnswers: [{
    questionId: mongoose.Schema.Types.ObjectId,
    questionText: String,
    answer: mongoose.Schema.Types.Mixed,
    submittedAt: Date,
  }],
});

const Patient = mongoose.model('Patient', PatientSchema);

async function fixCorruptedAnswers() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cancer-care';
    console.log(`Connecting to MongoDB...`);
    
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB\n');

    // Find all patients
    const patients = await Patient.find({}).lean();
    console.log(`Found ${patients.length} patients\n`);

    let fixedCount = 0;
    let corruptedCount = 0;

    for (const patient of patients) {
      if (!patient.questionnaireAnswers || !Array.isArray(patient.questionnaireAnswers) || patient.questionnaireAnswers.length === 0) {
        continue;
      }

      // Check if answers contain corrupted data (patient objects instead of answers)
      const hasCorrupted = patient.questionnaireAnswers.some(answer => {
        // If answer contains patient object properties like 'name', 'phone', 'age'
        if (!answer) return false;
        return answer.name || answer.phone || answer.age || answer.gender || answer.cancerType;
      });

      if (hasCorrupted) {
        corruptedCount++;
        console.log(`❌ [${patient.patientId}] ${patient.name}`);
        console.log(`   Current answers: ${JSON.stringify(patient.questionnaireAnswers[0]).substring(0, 150)}...`);
        
        // Clear corrupted data
        await Patient.updateOne({ _id: patient._id }, { questionnaireAnswers: [] });
        fixedCount++;
        
        console.log(`   ✅ Cleared - answers reset to empty\n`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY:');
    console.log(`  Total patients checked: ${patients.length}`);
    console.log(`  Corrupted entries found: ${corruptedCount}`);
    console.log(`  Fixed: ${fixedCount}`);
    console.log('='.repeat(60));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixCorruptedAnswers();
