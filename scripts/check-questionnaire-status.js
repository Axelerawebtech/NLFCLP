const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkQuestionnaireStatus() {
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

    // Define schemas inline
    const QuestionSchema = new mongoose.Schema({
      questionText: String,
      type: { type: String, enum: ['text', 'textarea', 'radio', 'checkbox', 'select', 'scale'], default: 'text' },
      options: [String],
      required: { type: Boolean, default: true },
      order: { type: Number, default: 0 }
    }, { _id: false });

    const QuestionnaireSchema = new mongoose.Schema({
      title: String,
      description: String,
      questions: [QuestionSchema],
      isActive: { type: Boolean, default: true },
      createdBy: mongoose.Schema.Types.ObjectId,
      createdAt: Date,
      updatedAt: Date
    });

    const Questionnaire = mongoose.models.Questionnaire || 
      mongoose.model('Questionnaire', QuestionnaireSchema);

    const PatientSchema = new mongoose.Schema({}, { strict: false });
    const Patient = mongoose.models.Patient || 
      mongoose.model('Patient', PatientSchema);

    // Check questionnaires
    console.log('\n📋 QUESTIONNAIRE STATUS:');
    console.log('='.repeat(60));

    const allQuestionnaires = await Questionnaire.find().sort({ updatedAt: -1 });
    console.log(`Total questionnaires in DB: ${allQuestionnaires.length}\n`);

    if (allQuestionnaires.length === 0) {
      console.log('⚠️  No questionnaires found in database!');
    } else {
      allQuestionnaires.forEach((q, idx) => {
        console.log(`${idx + 1}. ${q.title}`);
        console.log(`   ID: ${q._id}`);
        console.log(`   Status: ${q.isActive ? '✅ Active' : '❌ Inactive'}`);
        console.log(`   Questions: ${q.questions?.length || 0}`);
        console.log(`   Created: ${q.createdAt}`);
        console.log(`   Updated: ${q.updatedAt}`);
        console.log('');
      });
    }

    // Check patient
    console.log('\n👤 PATIENT STATUS:');
    console.log('='.repeat(60));

    const patient = await Patient.findOne({ patientId: 'PTMI4RLYMR' });
    
    if (!patient) {
      console.log('❌ Patient PTMI4RLYMR not found!');
    } else {
      console.log(`Patient Name: ${patient.name}`);
      console.log(`Patient ID: ${patient.patientId}`);
      console.log(`Questionnaire Enabled: ${patient.questionnaireEnabled ? '✅ Yes' : '❌ No'}`);
      console.log(`Assigned Caregiver: ${patient.assignedCaregiver ? '✅ Yes' : '❌ No'}`);
      console.log(`Questionnaire Answers: ${patient.questionnaireAnswers?.length || 0}`);
      console.log(`Last Submission: ${patient.lastQuestionnaireSubmission || 'Never'}`);
    }

    // Test the dashboard API logic
    console.log('\n🧪 DASHBOARD API TEST:');
    console.log('='.repeat(60));

    if (patient) {
      if (patient.questionnaireEnabled) {
        const questionnaire = await Questionnaire.findOne({ isActive: true })
          .sort({ updatedAt: -1 });
        
        if (questionnaire) {
          console.log(`✅ Questionnaire will be displayed!`);
          console.log(`   Title: ${questionnaire.title}`);
          console.log(`   Questions: ${questionnaire.questions?.length || 0}`);
          console.log(`   Sample questions:`);
          questionnaire.questions?.slice(0, 3).forEach((q, i) => {
            console.log(`     ${i + 1}. ${q.questionText}`);
          });
        } else {
          console.log('❌ No active questionnaire found!');
          console.log('   → Patient has questionnaireEnabled=true but no active questionnaire exists');
        }
      } else {
        console.log('❌ Questionnaire not enabled for this patient');
        console.log('   → Need to enable it in Admin Dashboard');
      }
    }

    console.log('\n📌 NEXT STEPS:');
    console.log('='.repeat(60));
    console.log('1. If "Questionnaire Enabled" is ❌: Enable it in Admin Dashboard');
    console.log('2. If "No active questionnaire": Make sure questionnaire is set to Active');
    console.log('3. Clear browser cache and refresh patient dashboard');
    console.log('4. Check browser console for any errors');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack || err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected.');
  }
}

checkQuestionnaireStatus();
