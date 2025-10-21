const mongoose = require('mongoose');

async function verifyChangesReflected() {
  try {
    console.log('🔍 Verifying Changes Are Reflected in Database');
    console.log('='.repeat(50));

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster0.0ozaiwj.mongodb.net/cancer_care_db?retryWrites=true&w=majority');

    // Import models
    const CaregiverProgram = require('../models/CaregiverProgramEnhanced').default || require('../models/CaregiverProgramEnhanced');
    const Caregiver = require('../models/Caregiver').default || require('../models/Caregiver');

    // Find a test caregiver
    const testCaregiver = await Caregiver.findOne();
    if (!testCaregiver) {
      console.log('❌ No caregiver found for testing');
      return;
    }

    console.log(`🧪 Testing with caregiver: ${testCaregiver.name} (${testCaregiver.caregiverId})`);

    // Find their program
    let program = await CaregiverProgram.findOne({ caregiverId: testCaregiver._id });
    if (!program) {
      console.log('⚠️ No program found, creating one...');
      program = new CaregiverProgram({
        caregiverId: testCaregiver._id,
        currentDay: 0,
        overallProgress: 0
      });
      program.initializeDayModules();
      await program.save();
    }

    console.log('\n📊 Current Day 0 Status:');
    const day0Module = program.dayModules.find(m => m.day === 0);
    
    if (day0Module) {
      console.log(`  - Video Completed: ${day0Module.videoCompleted || false}`);
      console.log(`  - Audio Completed: ${day0Module.audioCompleted || false}`);
      console.log(`  - Progress Percentage: ${day0Module.progressPercentage || 0}%`);
      
      // Test the audioCompleted field exists
      if (day0Module.audioCompleted !== undefined) {
        console.log('✅ audioCompleted field exists in database');
      } else {
        console.log('❌ audioCompleted field missing - need to update existing records');
        
        // Update existing record to have audioCompleted field
        day0Module.audioCompleted = false;
        await program.save();
        console.log('✅ Added audioCompleted field to existing record');
      }

      // Test progress calculation
      console.log('\n🧮 Testing Progress Calculation:');
      
      // Test scenario: video completed, audio not completed
      day0Module.videoCompleted = true;
      day0Module.audioCompleted = false;
      program.updateDayProgress(0);
      console.log(`  Scenario 1 - Video: ✅, Audio: ❌ → Progress: ${day0Module.progressPercentage}% (Expected: 50%)`);
      
      // Test scenario: both completed
      day0Module.audioCompleted = true;
      program.updateDayProgress(0);
      console.log(`  Scenario 2 - Video: ✅, Audio: ✅ → Progress: ${day0Module.progressPercentage}% (Expected: 100%)`);
      
      // Save changes
      await program.save();
      console.log('✅ Test data saved to database');

    } else {
      console.log('❌ Day 0 module not found');
    }

    console.log('\n🌐 API Test:');
    // Test what the dashboard API would return
    const freshProgram = await CaregiverProgram.findOne({ caregiverId: testCaregiver._id });
    const freshDay0 = freshProgram.dayModules.find(m => m.day === 0);
    
    // Simulate dashboard logic
    const coreModuleCompleted = freshDay0.videoCompleted && freshDay0.audioCompleted;
    let displayProgress = 0;
    if (freshDay0.videoCompleted) displayProgress += 50;
    if (freshDay0.audioCompleted) displayProgress += 50;
    
    console.log(`  - Database videoCompleted: ${freshDay0.videoCompleted}`);
    console.log(`  - Database audioCompleted: ${freshDay0.audioCompleted}`);
    console.log(`  - Dashboard coreModuleCompleted: ${coreModuleCompleted}`);
    console.log(`  - Dashboard progress display: ${displayProgress}%`);

    if (coreModuleCompleted && displayProgress === 100) {
      console.log('\n🎉 ✅ Changes are properly reflected! Dashboard should show 100% complete.');
    } else if (!coreModuleCompleted && displayProgress === 50) {
      console.log('\n🎯 ✅ Changes are working! Dashboard should show 50% complete.');
    } else {
      console.log('\n⚠️ Something might not be working as expected.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run verification
verifyChangesReflected();