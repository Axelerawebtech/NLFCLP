// Test if content-management API returns existing audio content
async function testContentLoad() {
  try {
    console.log('🧪 Testing content loading API...');
    
    const response = await fetch('http://localhost:3001/api/admin/program/content-management?day=0&contentType=audioContent');
    const result = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(result, null, 2));
    
    if (result.content && result.content.english) {
      console.log('✅ Audio content found:', result.content.english);
    } else {
      console.log('❌ No audio content found');
    }
    
  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }
}

testContentLoad();