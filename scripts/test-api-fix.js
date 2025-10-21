const mongoose = require('mongoose');

async function testAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb+srv://axelerawebtech_db_user:M7EOU2FK8vqO7vs3@cluster0.e6faone.mongodb.net/cancercare?retryWrites=true&w=majority&appName=Cluster0');
    console.log('✅ Connected to MongoDB');
    
    // Import the enhanced model (simulate API behavior)
    const CaregiverProgramEnhanced = mongoose.model('CaregiverProgram');
    
    // Find a test caregiver
    const caregiverId = '68ee51492d97086cc432aa26';
    console.log(`🔍 Looking for caregiver: ${caregiverId}`);
    
    const program = await CaregiverProgramEnhanced.findOne({ caregiverId });
    
    if (!program) {
      console.log('❌ Program not found');
      return;
    }
    
    console.log('✅ Program found');
    console.log('📋 Program data:');
    console.log(`- Current day: ${program.currentDay}`);
    console.log(`- Overall progress: ${program.overallProgress}%`);
    console.log(`- Day modules count: ${program.dayModules?.length || 0}`);
    
    // Check if unlockDay method exists
    if (typeof program.unlockDay === 'function') {
      console.log('✅ unlockDay method exists');
    } else {
      console.log('❌ unlockDay method missing');
    }
    
    // Test available days
    const availableDays = program.dayModules
      ?.filter(m => m.adminPermissionGranted)
      .map(m => m.day) || [];
    
    console.log(`- Available days: [${availableDays.join(', ')}]`);
    
    // Simulate the API response
    const apiResponse = {
      success: true,
      data: {
        currentDay: program.currentDay,
        availableDays,
        dayModules: program.dayModules,
        burdenLevel: program.burdenLevel,
        burdenTestCompleted: !!program.burdenTestCompletedAt,
        overallProgress: program.overallProgress,
        zaritBurdenAssessment: program.zaritBurdenAssessment
      }
    };
    
    console.log('🎯 API Response would be:');
    console.log(JSON.stringify(apiResponse, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testAPI();