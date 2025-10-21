// Test the API endpoint directly
const fetch = require('node-fetch'); // Note: You may need to install this

async function testDashboardAPI() {
  try {
    console.log('🌐 Testing Dashboard API Response');
    console.log('='.repeat(50));

    const response = await fetch('http://localhost:3007/api/caregiver/dashboard?caregiverId=CGMFVA5AF4');
    const data = await response.json();

    console.log('📊 API Response Status:', response.status);
    
    if (data.success && data.program) {
      const day0Module = data.program.dayModules?.find(m => m.day === 0);
      
      if (day0Module) {
        console.log('\n📋 Day 0 Module Data from API:');
        console.log(`  - videoCompleted: ${day0Module.videoCompleted}`);
        console.log(`  - audioCompleted: ${day0Module.audioCompleted}`);
        console.log(`  - progressPercentage: ${day0Module.progressPercentage}%`);
        
        // Simulate dashboard logic
        const coreModuleCompleted = day0Module.videoCompleted && day0Module.audioCompleted;
        let displayProgress = 0;
        if (day0Module.videoCompleted) displayProgress += 50;
        if (day0Module.audioCompleted) displayProgress += 50;
        
        console.log('\n🎯 Dashboard Display Logic:');
        console.log(`  - coreModuleCompleted: ${coreModuleCompleted}`);
        console.log(`  - Display Progress: ${displayProgress}%`);
        console.log(`  - Icon: ${coreModuleCompleted ? 'FaCheckCircle (green)' : 'FaPlayCircle'}`);
        console.log(`  - Text: "${displayProgress}% Complete"`);
        console.log(`  - Card Color: ${coreModuleCompleted ? 'success.light' : 'background.paper'}`);
        
        if (coreModuleCompleted && displayProgress === 100) {
          console.log('\n✅ API returns data for 100% complete dashboard!');
        } else if (!coreModuleCompleted && displayProgress < 100) {
          console.log(`\n🎯 API returns data for ${displayProgress}% complete dashboard.`);
        }
      } else {
        console.log('❌ No Day 0 module found in API response');
      }
    } else {
      console.log('❌ API response unsuccessful or missing program data');
      console.log('Response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('💡 Make sure the development server is running on localhost:3007');
  }
}

testDashboardAPI();