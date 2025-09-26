// Simple test to check if the API is working
console.log('Testing API endpoints...');

const testAPI = async () => {
  try {
    // Test registration first
    console.log('\n=== Testing Caregiver Registration ===');
    const registrationData = {
      userType: "caregiver",
      name: "API Test Caregiver",
      phone: "5555555555",
      age: "31-40",
      gender: "Male",
      maritalStatus: "Married",
      educationLevel: "Undergraduate degree",
      employmentStatus: "Full-time employed",
      residentialArea: "Urban",
      relationshipToPatient: "Spouse",
      hoursPerDay: "5-8 hours",
      durationOfCaregiving: "1-2 years",
      previousExperience: "Yes",
      supportSystem: ["Family Support"],
      physicalHealth: ["None"],
      mentalHealth: ["None"],
      consentAccepted: true
    };

    const regResponse = await fetch('http://localhost:3001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });

    console.log('Registration response status:', regResponse.status);
    const regResult = await regResponse.text();
    console.log('Registration response:', regResult);

    // Test admin API
    console.log('\n=== Testing Admin API ===');
    const adminResponse = await fetch('http://localhost:3001/api/admin/manage-users');
    console.log('Admin API response status:', adminResponse.status);
    const adminResult = await adminResponse.text();
    console.log('Admin API response:', adminResult);

  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

testAPI();