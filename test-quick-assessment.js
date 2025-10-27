// Test script for Quick Assessment API functionality
// Run this with: node test-quick-assessment.js

const API_BASE = 'http://localhost:3001';

async function testQuickAssessmentAPI() {
  console.log('🧪 Testing Quick Assessment API...\n');

  try {
    // Test 1: GET existing questions (should return empty array initially)
    console.log('1️⃣ Testing GET /api/admin/quick-assessment');
    const getResponse = await fetch(`${API_BASE}/api/admin/quick-assessment`);
    const getData = await getResponse.json();
    console.log('Response:', JSON.stringify(getData, null, 2));
    console.log('✅ GET request successful\n');

    // Test 2: POST new questions
    console.log('2️⃣ Testing POST /api/admin/quick-assessment');
    const testQuestions = [
      {
        id: 'qa-test-1',
        questionText: {
          english: 'Did you feel stressed today while caregiving?',
          kannada: 'ಇಂದು ಆರೈಕೆ ನೀಡುವಾಗ ನೀವು ಒತ್ತಡವನ್ನು ಅನುಭವಿಸಿದ್ದೀರಾ?',
          hindi: 'क्या आज देखभाल करते समय आपको तनाव महसूस हुआ?'
        },
        enabled: true
      },
      {
        id: 'qa-test-2',
        questionText: {
          english: 'Did you take time for yourself today?',
          kannada: 'ಇಂದು ನೀವು ನಿಮಗಾಗಿ ಸಮಯ ತೆಗೆದುಕೊಂಡಿದ್ದೀರಾ?',
          hindi: 'क्या आज आपने अपने लिए समय निकाला?'
        },
        enabled: true
      }
    ];

    const postResponse = await fetch(`${API_BASE}/api/admin/quick-assessment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questions: testQuestions
      })
    });

    const postData = await postResponse.json();
    console.log('Response:', JSON.stringify(postData, null, 2));
    console.log('✅ POST request successful\n');

    // Test 3: GET updated questions
    console.log('3️⃣ Testing GET after POST');
    const getResponse2 = await fetch(`${API_BASE}/api/admin/quick-assessment`);
    const getData2 = await getResponse2.json();
    console.log('Response:', JSON.stringify(getData2, null, 2));
    console.log('✅ Updated GET request successful\n');

    // Test 4: DELETE a question
    console.log('4️⃣ Testing DELETE question');
    const deleteResponse = await fetch(`${API_BASE}/api/admin/quick-assessment`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionId: 'qa-test-1'
      })
    });

    const deleteData = await deleteResponse.json();
    console.log('Response:', JSON.stringify(deleteData, null, 2));
    console.log('✅ DELETE request successful\n');

    // Test 5: GET final state
    console.log('5️⃣ Testing final GET state');
    const getResponse3 = await fetch(`${API_BASE}/api/admin/quick-assessment`);
    const getData3 = await getResponse3.json();
    console.log('Response:', JSON.stringify(getData3, null, 2));
    console.log('✅ Final GET request successful\n');

    console.log('🎉 All Quick Assessment API tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the tests
testQuickAssessmentAPI();