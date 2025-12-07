// Debug script to check caregiver questionnaire loading
import dbConnect from './lib/dbConnect.js';
import Caregiver from './models/Caregiver.js';
import mongoose from 'mongoose';

const CaregiverAssessmentSchema = new mongoose.Schema({
  assessmentType: { type: String, default: 'caregiver-multi-section' },
  sections: [{
    sectionId: String,
    sectionTitle: {
      english: String,
      hindi: String,
      kannada: String
    },
    sectionDescription: {
      english: String,
      hindi: String,
      kannada: String
    },
    questions: [{
      questionText: {
        english: String,
        hindi: String,
        kannada: String
      },
      questionType: String,
      options: [{
        value: Number,
        label: {
          english: String,
          hindi: String,
          kannada: String
        }
      }],
      required: Boolean
    }]
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const CaregiverAssessment = mongoose.models.CaregiverAssessment || 
  mongoose.model('CaregiverAssessment', CaregiverAssessmentSchema);

async function debugQuestionnaireLoading(caregiverId) {
  try {
    await dbConnect();
    
    console.log('\n=== DEBUGGING QUESTIONNAIRE LOADING ===\n');
    console.log('Caregiver ID:', caregiverId);
    
    // 1. Check if caregiver exists and questionnaireEnabled
    const caregiver = await Caregiver.findById(caregiverId);
    if (!caregiver) {
      console.log('❌ Caregiver not found!');
      return;
    }
    
    console.log('\n1. CAREGIVER STATUS:');
    console.log('   - questionnaireEnabled:', caregiver.questionnaireEnabled);
    console.log('   - questionnaireAttempts:', caregiver.questionnaireAttempts?.length || 0);
    console.log('   - questionnaireRetakeStatus:', caregiver.questionnaireRetakeStatus);
    
    // 2. Check if CaregiverAssessment exists
    const assessment = await CaregiverAssessment.findOne({ 
      assessmentType: 'caregiver-multi-section',
      isActive: true 
    });
    
    console.log('\n2. ASSESSMENT CONFIG:');
    if (!assessment) {
      console.log('   ❌ No CaregiverAssessment found!');
      console.log('   → Assessment config needs to be created');
      console.log('   → API endpoint should auto-create it: /api/admin/caregiver-assessment/config');
    } else {
      console.log('   ✅ Assessment found');
      console.log('   - Sections:', assessment.sections?.length || 0);
      if (assessment.sections) {
        assessment.sections.forEach((section, idx) => {
          console.log(`     Section ${idx + 1}: ${section.sectionId} (${section.questions?.length || 0} questions)`);
        });
      }
    }
    
    // 3. Test the dashboard API endpoint
    console.log('\n3. API ENDPOINT TEST:');
    console.log('   Testing: /api/caregiver/questionnaire-dashboard');
    console.log('   → This should return questionnaire data');
    
    // 4. Check browser console
    console.log('\n4. BROWSER DEBUGGING:');
    console.log('   Open browser console and check for:');
    console.log('   - Network tab: /api/caregiver/questionnaire-dashboard?caregiverId=...');
    console.log('   - Console errors related to questionnaire');
    console.log('   - React component state (questionnaireEnabled, questionnaireData)');
    
    console.log('\n=== RESOLUTION STEPS ===\n');
    if (!assessment) {
      console.log('ACTION REQUIRED: Create assessment config');
      console.log('1. Make a GET request to: /api/admin/caregiver-assessment/config');
      console.log('2. This will auto-create the default 3-section assessment');
      console.log('3. Refresh caregiver dashboard');
    } else if (!caregiver.questionnaireEnabled) {
      console.log('ACTION REQUIRED: Enable questionnaire');
      console.log('1. Go to admin panel → Caregiver Profile');
      console.log('2. Click "Questionnaire" tab');
      console.log('3. Toggle "Enable Questionnaire"');
    } else {
      console.log('✅ Configuration looks correct');
      console.log('Check browser console for JavaScript errors');
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

// Get caregiver ID from command line
const caregiverId = process.argv[2];

if (!caregiverId) {
  console.log('Usage: node debug-questionnaire-loading.js <caregiverId>');
  process.exit(1);
}

debugQuestionnaireLoading(caregiverId);
