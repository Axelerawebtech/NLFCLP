// Test script for assessment questions API
const http = require('http');

function testAssessmentAPI() {
  console.log('Testing Assessment Questions API...\n');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/caregiver/assessment-questions?day=0',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`✅ Status Code: ${res.statusCode}`);
      console.log('✅ Headers:', res.headers['content-type']);
      
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ Response is valid JSON');
        console.log('✅ Questions count:', jsonData.questions?.length || 0);
        console.log('\n📋 Sample Question:');
        if (jsonData.questions && jsonData.questions[0]) {
          console.log('   - ID:', jsonData.questions[0].id);
          console.log('   - Question:', jsonData.questions[0].question?.substring(0, 100) + '...');
          console.log('   - Type:', jsonData.questions[0].type);
          console.log('   - Options count:', jsonData.questions[0].options?.length || 0);
        }
      } catch (error) {
        console.log('❌ Response is not valid JSON:', error.message);
        console.log('Raw response:', data.substring(0, 200));
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.setTimeout(5000, () => {
    console.error('❌ Request timeout');
    req.destroy();
  });

  req.end();
}

// Run the test
testAssessmentAPI();