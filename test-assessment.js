const testAssessment = {
  caregiverId: "68ffaf098f62f3bff7cb4b00",
  day: 0,
  assessmentType: "quick_assessment",
  responses: {
    "qa-1": 1,
    "qa-2": 0,
    "qa-3": 1
  },
  questionTexts: {
    "qa-1": "How are you feeling today?",
    "qa-2": "Do you feel prepared for caregiving tasks?",
    "qa-3": "Are you confident in your caregiving abilities?"
  },
  language: "english"
};

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3005/api/caregiver/daily-assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testAssessment)
    });
    
    const result = await response.json();
    console.log('Assessment API Response:');
    console.log(JSON.stringify(result, null, 2));
    
    // Test admin profile API
    const profileResponse = await fetch(`http://localhost:3005/api/admin/caregiver/profile?caregiverId=${testAssessment.caregiverId}`);
    const profileResult = await profileResponse.json();
    
    if (profileResult.success && profileResult.data.assessments) {
      console.log('\nAdmin Profile - Quick Assessments:');
      console.log(JSON.stringify(profileResult.data.assessments.quickAssessments, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run test
testAPI();