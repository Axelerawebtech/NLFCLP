// Test Day 1 video fix when server is running
const http = require('http');

console.log('🧪 Testing Day 1 Video Configuration...\n');

// Test 1: Configure Day 1 video
function configureDay1Video() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      burdenLevel: 'mild',
      language: 'english',
      videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1730127012/caregiver-program-videos/mild_burden_video.mp4',
      videoTitle: 'Day 1 Support Video for Mild Burden Level',
      description: 'Personalized support and guidance for caregivers experiencing mild burden levels.'
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/day1-video',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Day 1 Video Configuration Response:');
          console.log('Status:', res.statusCode);
          console.log('Response:', JSON.stringify(result, null, 2));
          resolve(result);
        } catch (error) {
          console.log('❌ Configuration failed - Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Configuration request error:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test 2: Check video content API
function testVideoContentAPI() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/caregiver/get-video-content?day=1&language=english&burdenLevel=mild',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('\n✅ Video Content API Response:');
          console.log('Status:', res.statusCode);
          console.log('Response:', JSON.stringify(result, null, 2));
          
          if (result.videoContent && result.videoContent.videoUrl) {
            console.log('\n🎉 SUCCESS! Video is now configured properly for Day 1 mild burden level');
            console.log('Video URL:', result.videoContent.videoUrl);
          } else {
            console.log('\n❌ Video content not found or not properly configured');
          }
          
          resolve(result);
        } catch (error) {
          console.log('❌ API test failed - Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ API test request error:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run the tests
async function runTests() {
  try {
    console.log('1️⃣ Configuring Day 1 video...');
    await configureDay1Video();
    
    console.log('\n2️⃣ Testing video content API...');
    await testVideoContentAPI();
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Go to your caregiver dashboard');
    console.log('2. Start Day 1 and complete the Zarit burden assessment');
    console.log('3. Answer questions to get a "mild" burden level result');
    console.log('4. The video should now appear after assessment completion');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Make sure the server is running on port 3000');
    console.log('2. Check if there are any console errors');
    console.log('3. Verify MongoDB connection is working');
  }
}

runTests();