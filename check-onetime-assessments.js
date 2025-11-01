const { MongoClient, ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function checkOneTimeAssessments() {
  try {
    await client.connect();
    console.log('MongoDB Connected successfully');
    
    const db = client.db('NLFC');
    const CaregiverProgram = db.collection('CaregiverProgram');
    
    // Find the test caregiver
    const caregiverId = new ObjectId('6905ec41e1ef461664242e69');
    const program = await CaregiverProgram.findOne({ caregiverId });
    
    if (!program) {
      console.log('❌ No program found for caregiver');
      return;
    }
    
    console.log('🔍 Program found for caregiver:', program.caregiverName);
    console.log('📊 Program structure check:');
    console.log('  - Has oneTimeAssessments:', !!program.oneTimeAssessments);
    console.log('  - OneTimeAssessments length:', program.oneTimeAssessments ? program.oneTimeAssessments.length : 0);
    
    if (program.oneTimeAssessments && program.oneTimeAssessments.length > 0) {
      console.log('\n📋 One-time assessments found:');
      program.oneTimeAssessments.forEach((assessment, index) => {
        console.log(`\n  Assessment ${index + 1}:`);
        console.log('    Type:', assessment.type);
        console.log('    Date:', assessment.date);
        console.log('    Score:', assessment.totalScore);
        console.log('    Max Score:', assessment.maxScore);
        console.log('    Result:', assessment.result);
        console.log('    Has responses:', !!assessment.responses);
        console.log('    Responses count:', assessment.responses ? assessment.responses.length : 0);
      });
    } else {
      console.log('❌ No one-time assessments found in program');
    }
    
    // Also check dailyAssessments for Day 1 zarit_burden
    console.log('\n🗓️ Daily assessments check:');
    if (program.dailyAssessments && program.dailyAssessments.length > 0) {
      const day1Assessment = program.dailyAssessments.find(da => da.day === 1);
      if (day1Assessment) {
        console.log('  Day 1 assessment found:');
        console.log('    Type:', day1Assessment.type);
        console.log('    Has responses:', !!day1Assessment.responses);
        console.log('    Responses count:', day1Assessment.responses ? day1Assessment.responses.length : 0);
      } else {
        console.log('  No Day 1 assessment found');
      }
    } else {
      console.log('  No daily assessments found');
    }
    
    // Check program burdenLevel
    console.log('\n🎯 Program burden level check:');
    console.log('  Program burdenLevel:', program.burdenLevel);
    console.log('  Program calculateBurdenLevel available:', typeof program.calculateBurdenLevel);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkOneTimeAssessments();