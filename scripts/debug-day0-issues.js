const mongoose = require('mongoose');

async function debugCurrentIssues() {
  try {
    console.log('🔍 Debugging Current Day 0 Issues');
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

    console.log('📊 Current Day 0 State (BEFORE FIX):');
    console.log(`  - videoCompleted: ${day0Module.videoCompleted}`);
    console.log(`  - videoProgress: ${day0Module.videoProgress}`);
    console.log(`  - audioCompleted: ${day0Module.audioCompleted}`);
    console.log(`  - progressPercentage: ${day0Module.progressPercentage}%`);
    console.log(`  - completedAt: ${day0Module.completedAt}`);

    // Reset to proper initial state (nothing completed)
    console.log('\n🔄 Resetting to proper initial state...');
    day0Module.videoCompleted = false;
    day0Module.videoProgress = 0;
    day0Module.audioCompleted = false;
    day0Module.completedAt = null;
    
    // Update progress calculation
    program.updateDayProgress(0);
    
    await program.save();
    
    console.log('\n📊 Day 0 State (AFTER RESET):');
    console.log(`  - videoCompleted: ${day0Module.videoCompleted}`);
    console.log(`  - videoProgress: ${day0Module.videoProgress}`);
    console.log(`  - audioCompleted: ${day0Module.audioCompleted}`);
    console.log(`  - progressPercentage: ${day0Module.progressPercentage}%`);
    console.log(`  - completedAt: ${day0Module.completedAt}`);

    console.log('\n✅ Fixed initial state. Now Day 0 should show 0% when nothing is completed.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run debug
debugCurrentIssues();