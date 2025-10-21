const mongoose = require('mongoose');

// Reset test caregiver to demonstrate the fix
async function resetForDemonstration() {
  try {
    console.log('🔄 Resetting Test Data to Demonstrate Fix');
    console.log('='.repeat(50));

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster0.0ozaiwj.mongodb.net/cancer_care_db?retryWrites=true&w=majority');

    // Import models
    const CaregiverProgram = require('../models/CaregiverProgramEnhanced').default || require('../models/CaregiverProgramEnhanced');
    const Caregiver = require('../models/Caregiver').default || require('../models/Caregiver');

    // Find test caregiver
    const testCaregiver = await Caregiver.findOne({ caregiverId: 'CGMFVA5AF4' });
    if (!testCaregiver) {
      console.log('❌ Test caregiver not found');
      return;
    }

    // Find their program
    const program = await CaregiverProgram.findOne({ caregiverId: testCaregiver._id });
    if (!program) {
      console.log('❌ Program not found');
      return;
    }

    const day0Module = program.dayModules.find(m => m.day === 0);
    if (!day0Module) {
      console.log('❌ Day 0 module not found');
      return;
    }

    console.log('📋 Setting up demonstration scenario...');
    
    // Set to video completed, audio not completed (50% scenario)
    day0Module.videoCompleted = true;
    day0Module.audioCompleted = false;
    program.updateDayProgress(0);
    
    await program.save();
    
    console.log('✅ Set Day 0 to: Video ✅ Completed, Audio ❌ Not Completed');
    console.log(`📊 Progress should now show: ${day0Module.progressPercentage}% Complete`);
    console.log('🎯 Dashboard should show: "50% Complete" (NOT "Completed")');
    
    console.log('\n🌐 Now refresh your browser and check:');
    console.log('   - Day 0 card should show "50% Complete"');
    console.log('   - Play icon (not check icon)');
    console.log('   - White background (not green)');
    console.log('   - "IN PROGRESS" status');
    
    console.log('\n🎵 To test 100% completion, the audio would need to be played');
    console.log('   - Then it would show "100% Complete"');
    console.log('   - Green check icon');
    console.log('   - Green background');
    console.log('   - "COMPLETED" status');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run reset
resetForDemonstration();