// Test registration directly
const testRegistration = async () => {
  const testData = {
    userType: "caregiver",
    name: "Test Caregiver Direct",
    phone: "9876543210",
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

  try {
    const response = await fetch('http://localhost:3001/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Registration result:', result);

    // Test admin API
    const adminResponse = await fetch('http://localhost:3001/api/admin/manage-users');
    const adminResult = await adminResponse.json();
    console.log('Admin API result:', adminResult);

  } catch (error) {
    console.error('Test error:', error);
  }
};

testRegistration();