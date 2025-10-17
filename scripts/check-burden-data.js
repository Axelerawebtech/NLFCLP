// Quick test to check zaritBurdenAssessment data structure
import dbConnect from '../lib/mongodb.js';
import CaregiverProgram from '../models/CaregiverProgram.js';

async function checkBurdenData() {
  await dbConnect();
  
  // Find a caregiver with burden test
  const program = await CaregiverProgram.findOne({ 
    burdenTestScore: { $exists: true } 
  });
  
  if (!program) {
    console.log('No caregiver with burden test found');
    process.exit(0);
  }
  
  console.log('\n=== Caregiver Program ===');
  console.log('Caregiver ID:', program.caregiverId);
  console.log('Burden Level:', program.burdenLevel);
  console.log('Burden Score:', program.burdenTestScore);
  
  console.log('\n=== zaritBurdenAssessment Object ===');
  console.log(JSON.stringify(program.zaritBurdenAssessment, null, 2));
  
  console.log('\n=== Checking for answers array ===');
  console.log('Has answers array?', Array.isArray(program.zaritBurdenAssessment?.answers));
  console.log('Answers:', program.zaritBurdenAssessment?.answers);
  
  console.log('\n=== Checking for old format ===');
  for (let i = 1; i <= 7; i++) {
    const key = `question${i}`;
    const value = program.zaritBurdenAssessment?.[key];
    console.log(`${key}:`, value);
  }
  
  process.exit(0);
}

checkBurdenData().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
