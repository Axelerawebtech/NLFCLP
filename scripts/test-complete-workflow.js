// Test the complete audio content workflow with Map handling
require('dotenv').config({ path: '.env.local' });

async function testCompleteWorkflow() {
  try {
    console.log('🧪 Testing complete audio content workflow...');
    
    // Test 1: Check current content loading
    console.log('\n📋 Step 1: Testing content loading...');
    const loadResponse = await fetch('http://localhost:3001/api/admin/program/content-management?day=0&contentType=audioContent');
    const loadResult = await loadResponse.json();
    
    console.log('📊 Load Response:', JSON.stringify(loadResult, null, 2));
    
    if (loadResult.content && loadResult.content.english) {
      console.log('✅ Content found - testing delete...');
      
      // Test 2: Test delete functionality
      console.log('\n🗑️ Step 2: Testing delete...');
      const deleteResponse = await fetch('http://localhost:3001/api/admin/delete-content', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day: 0,
          language: 'english',
          contentType: 'audioContent',
          contentUrl: loadResult.content.english
        })
      });
      
      const deleteResult = await deleteResponse.json();
      console.log('📊 Delete Response Status:', deleteResponse.status);
      console.log('📊 Delete Response:', JSON.stringify(deleteResult, null, 2));
      
      if (deleteResponse.ok) {
        console.log('✅ Delete test successful!');
        
        // Test 3: Verify content is gone
        console.log('\n🔍 Step 3: Verifying content is deleted...');
        const verifyResponse = await fetch('http://localhost:3001/api/admin/program/content-management?day=0&contentType=audioContent');
        const verifyResult = await verifyResponse.json();
        
        if (!verifyResult.content.english) {
          console.log('✅ Content successfully deleted from database!');
        } else {
          console.log('❌ Content still exists after delete');
        }
      } else {
        console.log('❌ Delete test failed:', deleteResult.error);
      }
    } else {
      console.log('⚠️ No content found to test delete with');
    }
    
  } catch (error) {
    console.error('🚨 Test error:', error.message);
  }
}

testCompleteWorkflow();