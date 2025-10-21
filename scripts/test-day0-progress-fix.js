const mongoose = require('mongoose');

// Test Day 0 progress calculation fix
async function testDay0ProgressFix() {
  try {
    console.log('🧪 Testing Day 0 Progress Calculation Fix');
    console.log('='.repeat(50));

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster0.0ozaiwj.mongodb.net/cancer_care_db?retryWrites=true&w=majority');

    // Import models
    const CaregiverProgram = require('../models/CaregiverProgramEnhanced').default || require('../models/CaregiverProgramEnhanced');

    // Test 1: Video completed but no audio
    console.log('\n📹 Test 1: Video completed, Audio not completed');
    const testProgram1 = new CaregiverProgram({
      caregiverId: new mongoose.Types.ObjectId(),
      currentDay: 0,
      dayModules: [{
        day: 0,
        videoCompleted: true,
        videoProgress: 100,
        audioCompleted: false, // Audio not completed
        tasksCompleted: false,
        progressPercentage: 0
      }]
    });

    // Update progress
    testProgram1.updateDayProgress(0);
    
    console.log('  - Video completed: ✅');
    console.log('  - Audio completed: ❌');
    console.log(`  - Progress: ${testProgram1.dayModules[0].progressPercentage}% (Expected: 50%)`);
    console.log(`  - Is Complete: ${testProgram1.dayModules[0].progressPercentage === 100 ? '✅' : '❌'} (Expected: ❌)`);

    // Test 2: Both video and audio completed
    console.log('\n🎵 Test 2: Both Video and Audio completed');
    const testProgram2 = new CaregiverProgram({
      caregiverId: new mongoose.Types.ObjectId(),
      currentDay: 0,
      dayModules: [{
        day: 0,
        videoCompleted: true,
        videoProgress: 100,
        audioCompleted: true, // Audio completed
        tasksCompleted: false,
        progressPercentage: 0
      }]
    });

    // Update progress
    testProgram2.updateDayProgress(0);
    
    console.log('  - Video completed: ✅');
    console.log('  - Audio completed: ✅');
    console.log(`  - Progress: ${testProgram2.dayModules[0].progressPercentage}% (Expected: 100%)`);
    console.log(`  - Is Complete: ${testProgram2.dayModules[0].progressPercentage === 100 ? '✅' : '❌'} (Expected: ✅)`);

    // Test 3: No video, no audio
    console.log('\n❌ Test 3: Neither Video nor Audio completed');
    const testProgram3 = new CaregiverProgram({
      caregiverId: new mongoose.Types.ObjectId(),
      currentDay: 0,
      dayModules: [{
        day: 0,
        videoCompleted: false,
        videoProgress: 0,
        audioCompleted: false,
        tasksCompleted: false,
        progressPercentage: 0
      }]
    });

    // Update progress
    testProgram3.updateDayProgress(0);
    
    console.log('  - Video completed: ❌');
    console.log('  - Audio completed: ❌');
    console.log(`  - Progress: ${testProgram3.dayModules[0].progressPercentage}% (Expected: 0%)`);
    console.log(`  - Is Complete: ${testProgram3.dayModules[0].progressPercentage === 100 ? '✅' : '❌'} (Expected: ❌)`);

    // Test 4: Audio completed but no video
    console.log('\n🎵 Test 4: Audio completed, Video not completed');
    const testProgram4 = new CaregiverProgram({
      caregiverId: new mongoose.Types.ObjectId(),
      currentDay: 0,
      dayModules: [{
        day: 0,
        videoCompleted: false,
        videoProgress: 50,
        audioCompleted: true, // Audio completed
        tasksCompleted: false,
        progressPercentage: 0
      }]
    });

    // Update progress
    testProgram4.updateDayProgress(0);
    
    console.log('  - Video completed: ❌');
    console.log('  - Audio completed: ✅');
    console.log(`  - Progress: ${testProgram4.dayModules[0].progressPercentage}% (Expected: 50%)`);
    console.log(`  - Is Complete: ${testProgram4.dayModules[0].progressPercentage === 100 ? '✅' : '❌'} (Expected: ❌)`);

    // Summary
    console.log('\n' + '='.repeat(50));
    const test1Pass = testProgram1.dayModules[0].progressPercentage === 50;
    const test2Pass = testProgram2.dayModules[0].progressPercentage === 100;
    const test3Pass = testProgram3.dayModules[0].progressPercentage === 0;
    const test4Pass = testProgram4.dayModules[0].progressPercentage === 50;

    const allTestsPass = test1Pass && test2Pass && test3Pass && test4Pass;

    console.log('📊 Test Results:');
    console.log(`  ✅ Test 1 (Video only): ${test1Pass ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ Test 2 (Video + Audio): ${test2Pass ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ Test 3 (None): ${test3Pass ? 'PASS' : 'FAIL'}`);
    console.log(`  ✅ Test 4 (Audio only): ${test4Pass ? 'PASS' : 'FAIL'}`);
    console.log(`\n🎉 Overall: ${allTestsPass ? 'ALL TESTS PASS! ✅' : 'SOME TESTS FAILED ❌'}`);
    
    if (allTestsPass) {
      console.log('\n✅ Day 0 progress calculation fix is working correctly!');
      console.log('   - Video completion contributes 50%');
      console.log('   - Audio completion contributes 50%');
      console.log('   - Only 100% progress marks Day 0 as complete');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run the test
testDay0ProgressFix();