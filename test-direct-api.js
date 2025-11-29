const axios = require('axios');

async function testDirectSubmit() {
  try {
    console.log('\n🚀 TESTING DIRECT API SUBMISSION\n');
    
    // Build the same format dashboard would send
    const testPayload = {
      patientId: 'PTMI4RLYMR',
      answers: [
        {
          questionId: 'q1',
          questionText: 'Q1: How would you rate your quality of life?',
          answer: 'Very Good',
          submittedAt: new Date().toISOString()
        },
        {
          questionId: 'q2',
          questionText: 'Q2: How satisfied are you with your health?',
          answer: 'Good',
          submittedAt: new Date().toISOString()
        },
        {
          questionId: 'q3',
          questionText: 'Q3: How much do physical health problems affect your quality of life?',
          answer: 'Moderately',
          submittedAt: new Date().toISOString()
        }
      ]
    };
    
    console.log('📤 Sending to http://localhost:3000/api/patient/questionnaire/submit');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));
    console.log('');
    
    const response = await axios.post('http://localhost:3000/api/patient/questionnaire/submit', testPayload);
    
    console.log('✅ RESPONSE:', response.status, response.data);
    
  } catch (error) {
    console.error('❌ ERROR:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }
}

// Wait for server
setTimeout(testDirectSubmit, 2000);
