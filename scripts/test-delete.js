// Test delete content API
require('dotenv').config({ path: '.env.local' });

async function testDeleteContent() {
  try {
    console.log('🧪 Testing delete content API...');
    
    const deleteData = {
      day: 0,
      language: 'english',
      contentType: 'audioContent',
      contentUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1761542859/caregiver-program-audio/1761542856281_0_english_audioContent.mp3'
    };
    
    console.log('📤 Sending delete request:', deleteData);
    
    const response = await fetch('http://localhost:3001/api/admin/delete-content', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deleteData)
    });
    
    const result = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Delete test successful!');
    } else {
      console.log('❌ Delete test failed:', result.error);
    }
    
  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }
}

testDeleteContent();