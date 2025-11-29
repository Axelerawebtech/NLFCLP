const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function testAPIDirectly() {
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

    // Define schemas
    const QuestionSchema = new mongoose.Schema({
      questionText: String,
      type: { type: String, default: 'text' },
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

    const PatientSchema = new mongoose.Schema({}, { strict: false });

    const Questionnaire = mongoose.models.Questionnaire || 
      mongoose.model('Questionnaire', QuestionnaireSchema);
    
    const Patient = mongoose.models.Patient || 
      mongoose.model('Patient', PatientSchema);

    // Simulate the API call
    console.log('\n🧪 SIMULATING API CALL');
    console.log('='.repeat(60));
    
    const patientId = 'PTMI4RLYMR';
    console.log(`Searching for patient: ${patientId}`);

    // Try to find patient
    let patient = null;
    
    if (mongoose.Types.ObjectId.isValid(patientId)) {
      console.log(`✓ Valid MongoDB ObjectId format, trying findById...`);
      patient = await Patient.findById(patientId).populate('assignedCaregiver');
    } else {
      console.log(`✗ Not a valid MongoDB ObjectId format`);
    }
    
    if (!patient) {
      console.log(`Looking up by custom patientId...`);
      patient = await Patient.findOne({ patientId }).populate('assignedCaregiver');
    }

    if (!patient) {
      console.log('❌ Patient not found');
      process.exit(1);
    }

    console.log(`✅ Patient found: ${patient.name}`);
    console.log(`   questionnaireEnabled: ${patient.questionnaireEnabled}`);
    console.log(`   isAssigned: ${patient.isAssigned}`);

    // Fetch questionnaire
    if (patient.questionnaireEnabled) {
      console.log(`\nFetching questionnaire...`);
      const questionnaire = await Questionnaire.findOne({ isActive: true })
        .sort({ updatedAt: -1 });
      
      if (!questionnaire) {
        console.log(`No active questionnaire found, trying any...`);
        const anyQuestionnaire = await Questionnaire.findOne()
          .sort({ updatedAt: -1 });
        
        if (anyQuestionnaire) {
          console.log(`✅ Found questionnaire: ${anyQuestionnaire.title}`);
          console.log(`   Questions: ${anyQuestionnaire.questions?.length}`);
          console.log(`   Active: ${anyQuestionnaire.isActive}`);
          console.log(`   First question: ${anyQuestionnaire.questions[0]?.questionText}`);
        } else {
          console.log(`❌ No questionnaire found at all`);
        }
      } else {
        console.log(`✅ Questionnaire found: ${questionnaire.title}`);
        console.log(`   Questions: ${questionnaire.questions?.length}`);
        console.log(`   Active: ${questionnaire.isActive}`);
        console.log(`   First question: ${questionnaire.questions[0]?.questionText}`);
      }
    } else {
      console.log(`⚠️  Questionnaire not enabled for this patient`);
    }

    // Build response
    console.log('\n📤 API RESPONSE THAT WOULD BE SENT:');
    console.log('='.repeat(60));

    const questionnaire = await Questionnaire.findOne({ isActive: true })
      .sort({ updatedAt: -1 });

    const apiResponse = {
      success: true,
      data: {
        patient: {
          _id: patient._id,
          name: patient.name,
          age: patient.age,
          cancerType: patient.cancerType,
          treatmentStatus: patient.treatmentModality?.join(', ') || 'N/A',
          assignedCaregiver: patient.assignedCaregiver,
          questionnaireEnabled: patient.questionnaireEnabled,
          questionnaireAnswers: patient.questionnaireAnswers,
          lastQuestionnaireSubmission: patient.lastQuestionnaireSubmission
        },
        questionnaire: questionnaire ? {
          _id: questionnaire._id,
          title: questionnaire.title,
          description: questionnaire.description,
          questions: questionnaire.questions || [],
          isActive: questionnaire.isActive
        } : null
      }
    };

    console.log(JSON.stringify(apiResponse, null, 2));

    if (apiResponse.data.questionnaire && apiResponse.data.questionnaire.questions?.length > 0) {
      console.log(`\n✅ SUCCESS: API will return ${apiResponse.data.questionnaire.questions.length} questions`);
    } else {
      console.log(`\n❌ PROBLEM: Questionnaire not in response`);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected.');
  }
}

testAPIDirectly();
