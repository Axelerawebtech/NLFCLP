const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugPatient() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const PatientSchema = new mongoose.Schema({}, { strict: false });
    const Patient = mongoose.models.Patient || 
      mongoose.model('Patient', PatientSchema);

    // Get patient by custom ID
    console.log('\n📋 FETCHING PATIENT: PTMI4RLYMR');
    console.log('='.repeat(60));

    const patient = await Patient.findOne({ patientId: 'PTMI4RLYMR' });
    
    if (!patient) {
      console.log('❌ Patient not found!');
      process.exit(1);
    }

    console.log('Patient Details:');
    console.log(`  Name: ${patient.name}`);
    console.log(`  PatientId: ${patient.patientId}`);
    console.log(`  MongoDB _id: ${patient._id}`);
    console.log(`  questionnaireEnabled: ${patient.questionnaireEnabled}`);
    console.log(`  isAssigned: ${patient.isAssigned}`);
    console.log(`  assignedCaregiver: ${patient.assignedCaregiver}`);
    console.log(`  Type of questionnaireEnabled: ${typeof patient.questionnaireEnabled}`);
    
    // Check raw document
    console.log('\n📄 RAW DOCUMENT (checking for hidden issues):');
    console.log('='.repeat(60));
    const rawPatient = await Patient.collection.findOne({ patientId: 'PTMI4RLYMR' });
    console.log(JSON.stringify(rawPatient, null, 2));

    console.log('\n✅ PATIENT DATA RETRIEVED');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected.');
  }
}

debugPatient();
