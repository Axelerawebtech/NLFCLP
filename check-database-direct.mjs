// Direct database check using the same setup as the API
import dbConnect from '../lib/mongodb.js';
import CaregiverProgram from '../models/CaregiverProgramEnhanced.js';

async function checkDatabase() {
  try {
    await dbConnect();
    console.log('✅ Database connected');
    
    const caregiverId = '6905ec41e1ef461664242e69';
    const program = await CaregiverProgram.findOne({ caregiverId });
    
    if (!program) {
      console.log('❌ No program found');
      return;
    }
    
    console.log('🔍 Program found for:', program.caregiverName);
    console.log('📊 OneTimeAssessments array:');
    console.log('  Length:', program.oneTimeAssessments?.length || 0);
    
    if (program.oneTimeAssessments && program.oneTimeAssessments.length > 0) {
      program.oneTimeAssessments.forEach((assessment, index) => {
        console.log(`\n  Assessment ${index + 1}:`);
        console.log('    Type:', assessment.type);
        console.log('    Score Level:', assessment.scoreLevel);
        console.log('    Total Score:', assessment.totalScore);
        console.log('    Date:', assessment.completedAt);
        console.log('    Language:', assessment.language);
        console.log('    Responses count:', assessment.responses?.length || 0);
        console.log('    Has assessmentDetails:', !!assessment.assessmentDetails);
      });
    } else {
      console.log('  ❌ No one-time assessments found');
    }
    
    // Check daily assessments for comparison
    console.log('\n🗓️ Daily assessments:');
    if (program.dailyAssessments && program.dailyAssessments.length > 0) {
      program.dailyAssessments.forEach((da, index) => {
        console.log(`  Daily Assessment ${index + 1}:`);
        console.log('    Day:', da.day);
        console.log('    Type:', da.type);
        console.log('    Date:', da.completedAt);
      });
    } else {
      console.log('  No daily assessments found');
    }
    
    console.log('\n🎯 Program burden level:', program.burdenLevel);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkDatabase();