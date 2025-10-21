// Test current dashboard state and check if changes are reflected
const mongoose = require('mongoose');

async function testCurrentDashboardState() {
  try {
    console.log('🔍 Checking Current Dashboard State');
    console.log('='.repeat(50));

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster0.0ozaiwj.mongodb.net/cancer_care_db?retryWrites=true&w=majority');

    // Import models
    const CaregiverProgram = require('../models/CaregiverProgramEnhanced').default || require('../models/CaregiverProgramEnhanced');
    const Caregiver = require('../models/Caregiver').default || require('../models/Caregiver');

    // Find the test caregiver we've been using
    const testCaregiver = await Caregiver.findOne({ caregiverId: 'CGMFVA5AF4' });
    if (!testCaregiver) {
      console.log('❌ Test caregiver not found');
      return;
    }

    console.log(`🧪 Checking caregiver: ${testCaregiver.name} (${testCaregiver.caregiverId})`);

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

    console.log('\n📊 Current Database State:');
    console.log(`  - videoCompleted: ${day0Module.videoCompleted}`);
    console.log(`  - audioCompleted: ${day0Module.audioCompleted}`);
    console.log(`  - progressPercentage: ${day0Module.progressPercentage}%`);

    // Test what the dashboard should show
    const coreModuleCompleted = day0Module.videoCompleted && day0Module.audioCompleted;
    let displayProgress = 0;
    if (day0Module.videoCompleted) displayProgress += 50;
    if (day0Module.audioCompleted) displayProgress += 50;

    console.log('\n🎯 Dashboard Should Show:');
    console.log(`  - Completion Status: ${coreModuleCompleted ? 'COMPLETED' : 'IN PROGRESS'}`);
    console.log(`  - Progress Text: "${displayProgress}% Complete"`);
    console.log(`  - Icon: ${coreModuleCompleted ? '✅ FaCheckCircle' : '▶️ FaPlayCircle'}`);
    console.log(`  - Card Background: ${coreModuleCompleted ? '🟢 Green (success.light)' : '⚪ White (background.paper)'}`);

    // Reset to test state (video completed, audio not completed) to see the issue
    console.log('\n🔄 Testing Different States:');
    
    // State 1: Video only
    day0Module.videoCompleted = true;
    day0Module.audioCompleted = false;
    program.updateDayProgress(0);
    
    const state1CoreComplete = day0Module.videoCompleted && day0Module.audioCompleted;
    let state1Progress = 0;
    if (day0Module.videoCompleted) state1Progress += 50;
    if (day0Module.audioCompleted) state1Progress += 50;
    
    console.log(`  📹 Video Only: Progress ${state1Progress}%, Complete: ${state1CoreComplete}`);
    
    // State 2: Both completed
    day0Module.audioCompleted = true;
    program.updateDayProgress(0);
    
    const state2CoreComplete = day0Module.videoCompleted && day0Module.audioCompleted;
    let state2Progress = 0;
    if (day0Module.videoCompleted) state2Progress += 50;
    if (day0Module.audioCompleted) state2Progress += 50;
    
    console.log(`  🎵 Both Done: Progress ${state2Progress}%, Complete: ${state2CoreComplete}`);

    // Save current state
    await program.save();

    console.log('\n' + '='.repeat(50));
    console.log('✅ If dashboard still shows wrong data, try:');
    console.log('   1. Hard refresh browser (Ctrl+F5)');
    console.log('   2. Clear browser cache');
    console.log('   3. Open incognito/private window');
    console.log('   4. Check browser dev tools for errors');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run test
testCurrentDashboardState();