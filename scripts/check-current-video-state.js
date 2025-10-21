const dbConnect = require('../lib/mongodb').default;
const CaregiverProgram = require('../models/CaregiverProgramEnhanced').default;

async function testVideoAudioFlow() {
  console.log('🔬 Testing Video→Audio Sequential Flow...\n');
  
  try {
    await dbConnect();
    console.log('✅ Connected to MongoDB');
    
    // Find a caregiver to test with
    const caregiver = await CaregiverProgram.findOne({});
    
    if (!caregiver) {
      console.log('❌ No caregivers found in database');
      return;
    }
    
    console.log(`\n👤 Testing with Caregiver ID: ${caregiver.caregiverId}`);
    
    // Check current Day 0 status
    const day0Module = caregiver.dayModules.find(d => d.day === 0);
    
    if (!day0Module) {
      console.log('❌ No Day 0 module found');
      return;
    }
    
    console.log('\n📊 Current Day 0 Status:');
    console.log(`   videoWatched: ${day0Module.videoWatched || false}`);
    console.log(`   videoCompleted: ${day0Module.videoCompleted || false}`);
    console.log(`   audioCompleted: ${day0Module.audioCompleted || false}`);
    console.log(`   progressPercentage: ${day0Module.progressPercentage || 0}%`);
    
    console.log('\n✅ Flow test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testVideoAudioFlow();