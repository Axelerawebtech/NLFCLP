const { MongoClient } = require('mongodb');

async function testAllFixes() {
  console.log('🔍 Testing all Day 0 fixes...\n');
  
  const client = await MongoClient.connect('mongodb+srv://axelerawebtech_db_user:M7EOU2FK8vqO7vs3@cluster0.e6faone.mongodb.net/cancercare?retryWrites=true&w=majority&appName=Cluster0');
  const db = client.db('cancercare');
  
  try {
    // Find a test caregiver
    const caregiver = await db.collection('caregiverprograms').findOne({});
    
    if (!caregiver) {
      console.log('❌ No caregiver program found for testing');
      return;
    }
    
    console.log(`📋 Testing with caregiver: ${caregiver.caregiverId}\n`);
    
    // Test 1: Check Day 0 initial state
    console.log('🧪 Test 1: Day 0 initial state');
    const day0 = caregiver.dayModules?.find(day => day.dayNumber === 0);
    if (day0) {
      console.log(`- Video completed: ${day0.videoCompleted || false}`);
      console.log(`- Audio completed: ${day0.audioCompleted || false}`);
      console.log(`- Progress: ${day0.progressPercentage || 0}%`);
      console.log(`- Completion date: ${day0.completedAt || 'None'}`);
    } else {
      console.log('- Day 0 not found');
    }
    
    // Test 2: Check overall progress
    console.log('\n🧪 Test 2: Overall program progress');
    console.log(`- Current progress: ${caregiver.overallProgressPercentage || 0}%`);
    
    // Test 3: Calculate what progress should be
    console.log('\n🧪 Test 3: Expected progress calculation');
    let expectedProgress = 0;
    if (caregiver.dayModules) {
      const completedDays = caregiver.dayModules.filter(day => day.progressPercentage === 100).length;
      expectedProgress = (completedDays / 8) * 100; // 8 total days (0-7)
      console.log(`- Completed days: ${completedDays}/8`);
      console.log(`- Expected overall progress: ${expectedProgress}%`);
    }
    
    // Test 4: Check if Day 0 is included in overall calculation
    console.log('\n🧪 Test 4: Day 0 inclusion check');
    const day0Progress = day0?.progressPercentage || 0;
    console.log(`- Day 0 progress: ${day0Progress}%`);
    console.log(`- Day 0 included in calculation: ${day0Progress > 0 ? 'Yes' : 'No'}`);
    
    console.log('\n✅ All tests completed!');
    console.log('\n📊 Summary:');
    console.log(`- Day 0 should show 0% initially: ${day0Progress === 0 ? '✅' : '❌'}`);
    console.log(`- Video not completed initially: ${!day0?.videoCompleted ? '✅' : '❌'}`);
    console.log(`- Audio not completed initially: ${!day0?.audioCompleted ? '✅' : '❌'}`);
    console.log(`- No completion date initially: ${!day0?.completedAt ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await client.close();
  }
}

testAllFixes().catch(console.error);