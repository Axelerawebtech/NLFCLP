const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function testDashboardAPI() {
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

    // Test 1: Find patient by custom patientId
    console.log('\n🧪 TEST 1: Find patient by custom patientId (PTMI4RLYMR)');
    console.log('='.repeat(60));

    const patientByCustomId = await Patient.findOne({ patientId: 'PTMI4RLYMR' });
    
    if (patientByCustomId) {
      console.log('✅ Found patient by custom ID');
      console.log(`   Name: ${patientByCustomId.name}`);
      console.log(`   MongoDB _id: ${patientByCustomId._id}`);
      console.log(`   Custom ID: ${patientByCustomId.patientId}`);
      console.log(`   Questionnaire Enabled: ${patientByCustomId.questionnaireEnabled}`);
    } else {
      console.log('❌ Patient not found by custom ID');
    }

    // Test 2: Find patient by MongoDB _id
    console.log('\n🧪 TEST 2: Find patient by MongoDB _id');
    console.log('='.repeat(60));

    if (patientByCustomId) {
      const patientById = await Patient.findById(patientByCustomId._id);
      if (patientById) {
        console.log('✅ Found patient by MongoDB _id');
        console.log(`   Name: ${patientById.name}`);
        console.log(`   Custom ID: ${patientById.patientId}`);
      } else {
        console.log('❌ Patient not found by MongoDB _id');
      }
    }

    // Test 3: Fetch questionnaire
    console.log('\n🧪 TEST 3: Fetch questionnaire when patient has it enabled');
    console.log('='.repeat(60));

    if (patientByCustomId && patientByCustomId.questionnaireEnabled) {
      const questionnaire = await Questionnaire.findOne({ isActive: true })
        .sort({ updatedAt: -1 });
      
      if (questionnaire) {
        console.log('✅ Questionnaire found');
        console.log(`   Title: ${questionnaire.title}`);
        console.log(`   Questions: ${questionnaire.questions?.length}`);
        console.log(`   Active: ${questionnaire.isActive}`);
      } else {
        console.log('❌ No active questionnaire found');
      }
    } else {
      console.log('⚠️  Patient questionnaire not enabled');
    }

    // Test 4: Simulate full API response
    console.log('\n🧪 TEST 4: Simulate complete API response');
    console.log('='.repeat(60));

    if (patientByCustomId) {
      const questionnaire = await Questionnaire.findOne({ isActive: true })
        .sort({ updatedAt: -1 });

      const apiResponse = {
        success: true, 
        data: {
          patient: {
            _id: patientByCustomId._id,
            name: patientByCustomId.name,
            age: patientByCustomId.age,
            cancerType: patientByCustomId.cancerType,
            questionnaireEnabled: patientByCustomId.questionnaireEnabled,
          },
          questionnaire: questionnaire ? {
            title: questionnaire.title,
            description: questionnaire.description,
            questions: questionnaire.questions?.length || 0
          } : null
        }
      };

      console.log('API Response structure:');
      console.log(JSON.stringify(apiResponse, null, 2));
      
      if (apiResponse.data.questionnaire && apiResponse.data.questionnaire.questions > 0) {
        console.log('\n✅ API WILL RETURN QUESTIONNAIRE SUCCESSFULLY');
      } else {
        console.log('\n⚠️  Questionnaire missing from response');
      }
    }

    console.log('\n✅ ALL TESTS COMPLETED');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected.');
  }
}

testDashboardAPI();
