/**
 * Direct database cleanup script
 * Connects directly to MongoDB and fixes corrupted questionnaire answers
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Patient schema
const PatientSchema = new mongoose.Schema({
  patientId: { type: String, unique: true },
  name: String,
  questionnaireAnswers: [mongoose.Schema.Types.Mixed],
});

const Patient = mongoose.model('Patient', PatientSchema);

async function cleanupCorruptedData() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env.local');
      process.exit(1);
    }

    console.log('🧹 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected!\n');

    // Find all patients
    const patients = await Patient.find({});
    console.log(`📊 Found ${patients.length} patients\n`);

    let fixedCount = 0;
    const results = [];

    for (const patient of patients) {
      if (!patient.questionnaireAnswers || !Array.isArray(patient.questionnaireAnswers) || patient.questionnaireAnswers.length === 0) {
        continue;
      }

      // Check if answers contain corrupted data (patient objects instead of answers)
      const hasCorrupted = patient.questionnaireAnswers.some(answer => {
        if (!answer) return false;
        // Corrupted data has patient properties like name, phone, age, gender, cancerType
        return answer.name || answer.phone || answer.age || answer.gender || answer.cancerType;
      });

      if (hasCorrupted) {
        console.log(`❌ [${patient.patientId}] ${patient.name}`);
        console.log(`   Found ${patient.questionnaireAnswers.length} corrupted entries`);
        
        // Show what's in there
        const firstAnswer = patient.questionnaireAnswers[0];
        if (firstAnswer) {
          const keys = Object.keys(firstAnswer).slice(0, 5).join(', ');
          console.log(`   Properties: ${keys}...`);
        }
        
        // Clear corrupted data
        await Patient.updateOne({ _id: patient._id }, { questionnaireAnswers: [] });
        console.log(`   ✅ Cleared!\n`);
        
        fixedCount++;
        results.push({
          patientId: patient.patientId,
          name: patient.name,
          previousLength: patient.questionnaireAnswers.length
        });
      }
    }

    console.log('='.repeat(60));
    console.log('✅ CLEANUP COMPLETE');
    console.log('='.repeat(60));
    console.log(`Total patients processed: ${patients.length}`);
    console.log(`Patients fixed: ${fixedCount}\n`);

    if (results.length > 0) {
      console.log('Fixed patients:');
      results.forEach((r, i) => {
        console.log(`  ${i + 1}. [${r.patientId}] ${r.name} (removed ${r.previousLength} corrupted entries)`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Done! Database cleaned.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupCorruptedData();
