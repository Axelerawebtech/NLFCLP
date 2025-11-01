const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/NLFC';

// Define the schema (simplified version)
const caregiverProgramSchema = new mongoose.Schema({
  caregiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Caregiver' },
  caregiverName: String,
  oneTimeAssessments: [{
    type: String,
    responses: Array,
    totalScore: Number,
    scoreLevel: String,
    completedAt: Date,
    language: String,
    totalQuestions: Number,
    assessmentDetails: Object,
    metadata: Object
  }],
  dailyAssessments: [{
    day: Number,
    type: String,
    responses: Array,
    completedAt: Date
  }],
  burdenLevel: String,
  burdenTestScore: Number
}, { collection: 'CaregiverProgram' });

const CaregiverProgram = mongoose.model('CaregiverProgram', caregiverProgramSchema);

async function checkAndFixOneTimeAssessments() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    const caregiverId = '6905ec41e1ef461664242e69';
    const program = await CaregiverProgram.findOne({ caregiverId });
    
    if (!program) {
      console.log('❌ No program found for caregiver');
      return;
    }
    
    console.log('🔍 Program found for:', program.caregiverName);
    console.log('📊 Current state:');
    console.log('  Burden Level:', program.burdenLevel);
    console.log('  Burden Test Score:', program.burdenTestScore);
    console.log('  OneTimeAssessments array length:', program.oneTimeAssessments?.length || 0);
    console.log('  DailyAssessments array length:', program.dailyAssessments?.length || 0);
    
    // Check oneTimeAssessments
    if (program.oneTimeAssessments && program.oneTimeAssessments.length > 0) {
      console.log('\n✅ One-time assessments found:');
      program.oneTimeAssessments.forEach((assessment, index) => {
        console.log(`  Assessment ${index + 1}:`);
        console.log('    Type:', assessment.type);
        console.log('    Score Level:', assessment.scoreLevel);
        console.log('    Total Score:', assessment.totalScore);
        console.log('    Completed At:', assessment.completedAt);
        console.log('    Responses count:', assessment.responses?.length || 0);
        
        if (assessment.type === 'zarit_burden') {
          console.log('    🎯 This is the Zarit burden assessment!');
        }
      });
    } else {
      console.log('\n❌ No one-time assessments found');
      
      // Check if there's a Zarit assessment in dailyAssessments that should be moved
      if (program.dailyAssessments && program.dailyAssessments.length > 0) {
        const zaritDaily = program.dailyAssessments.find(da => da.type === 'zarit_burden');
        if (zaritDaily) {
          console.log('\n🔄 Found Zarit assessment in dailyAssessments - this might need to be copied to oneTimeAssessments');
          console.log('  Zarit daily assessment:', {
            day: zaritDaily.day,
            type: zaritDaily.type,
            responsesCount: zaritDaily.responses?.length || 0,
            completedAt: zaritDaily.completedAt
          });
        }
      }
    }
    
    // Check daily assessments
    console.log('\n📅 Daily assessments:');
    if (program.dailyAssessments && program.dailyAssessments.length > 0) {
      program.dailyAssessments.forEach((da, index) => {
        console.log(`  Daily Assessment ${index + 1}:`);
        console.log('    Day:', da.day);
        console.log('    Type:', da.type);
        console.log('    Completed At:', da.completedAt);
        console.log('    Responses count:', da.responses?.length || 0);
      });
    } else {
      console.log('  No daily assessments found');
    }
    
    console.log('\n🎯 Summary:');
    console.log('  Program has burden level set:', !!program.burdenLevel);
    console.log('  Program has burden test score:', !!program.burdenTestScore);
    console.log('  One-time assessments properly recorded:', program.oneTimeAssessments?.length > 0);
    
    if (program.oneTimeAssessments?.length > 0) {
      console.log('  ✅ One-time assessments should display correctly in frontend');
    } else {
      console.log('  ❌ No one-time assessments - frontend will show 0');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

checkAndFixOneTimeAssessments();