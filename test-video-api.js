require('dotenv').config({ path: '.env.local' });

async function testVideoManagementAPI() {
  console.log('🧪 Testing video management API...');
  
  try {
    // Test Day 1 Severe English video retrieval
    const response = await fetch('http://localhost:3000/api/admin/video-management?day=1&burdenLevel=severe&language=english');
    
    if (!response.ok) {
      console.log('❌ API request failed:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    
    console.log('\n📊 API Response:');
    console.log('Success:', data.success);
    console.log('Has Video:', data.hasVideo);
    console.log('Videos object:', JSON.stringify(data.videos, null, 2));
    
    // Check if video URL exists for English
    const englishVideoUrl = data.videos?.videoUrl?.english;
    console.log('\n🔍 English Video URL:', englishVideoUrl || 'NOT FOUND');
    
    if (englishVideoUrl) {
      console.log('✅ Video found! Should show Replace/Delete buttons');
    } else {
      console.log('❌ No video found - will show Upload button');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testVideoManagementAPI();