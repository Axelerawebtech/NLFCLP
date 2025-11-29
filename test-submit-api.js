const axios = require('axios');

// Simulate the exact format dashboard sends
const testSubmission = {
  answers: [
    {
      questionId: '63a9b0c1d2e3f4a5b6c7d8e1',
      questionText: 'How would you rate your quality of life?',
      answer: 'Very Good',
      submittedAt: new Date().toISOString()
    },
    {
      questionId: '63a9b0c1d2e3f4a5b6c7d8e2',
      questionText: 'How satisfied are you with your health?',
      answer: 'Good',
      submittedAt: new Date().toISOString()
    }
  ]
};

async function testSubmit() {
  try {
    console.log('📤 Testing questionnaire submission API...\n');
    console.log('Request format:');
    console.log(JSON.stringify(testSubmission, null, 2));
    console.log('\n');

    const response = await axios.post('http://localhost:3000/api/patient/questionnaire/submit', testSubmission, {
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        patientId: 'PTMI4RLYMR'
      }
    });

    console.log('✅ SUCCESS:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data && response.data.data.questionnaireAnswers) {
      const answers = response.data.data.questionnaireAnswers;
      console.log('\n📊 Saved answers:');
      answers.forEach((ans, i) => {
        console.log(`Answer ${i + 1}:`);
        console.log(`  - questionId: ${ans.questionId}`);
        console.log(`  - questionText: ${ans.questionText}`);
        console.log(`  - answer: ${ans.answer}`);
      });
      console.log('\n✅ API IS WORKING CORRECTLY - All fields populated!');
    }

  } catch (err) {
    console.error('❌ ERROR:');
    console.error(err.response?.data || err.message);
  }
}

testSubmit();
