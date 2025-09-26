const axios = require('axios');

// Test caregiver registration
async function testCaregiverRegistration() {
  console.log('Testing caregiver registration...');
  
  const testCaregiverData = {
    userType: 'caregiver',
    consentAccepted: true,
    userData: {
      name: 'Test Caregiver',
      age: '35',
      gender: 'Female',
      maritalStatus: 'Married',
      educationLevel: 'Bachelor\'s Degree',
      employmentStatus: 'Full-time',
      residentialArea: 'Urban',
      hoursPerDay: '6-8 hours',
      durationOfCaregiving: '1-2 years',
      previousExperience: 'Yes',
      supportSystem: 'Family and friends',
      physicalHealth: 'Good',
      mentalHealth: 'Good'
    },
    questionnaireAnswers: {
      name: 'Test Caregiver',
      age: '35',
      gender: 'Female',
      maritalStatus: 'Married',
      educationLevel: 'Bachelor\'s Degree',
      employmentStatus: 'Full-time',
      residentialArea: 'Urban',
      hoursPerDay: '6-8 hours',
      durationOfCaregiving: '1-2 years',
      previousExperience: 'Yes',
      supportSystem: 'Family and friends',
      physicalHealth: 'Good',
      mentalHealth: 'Good'
    }
  };

  try {
    const response = await axios.post('http://localhost:3001/api/register', testCaregiverData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Registration response:', response.status, response.data);
    return response.data;
  } catch (error) {
    console.error('Registration failed:');
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    return null;
  }
}

// Test admin dashboard API
async function testAdminDashboard() {
  console.log('\nTesting admin dashboard API...');
  
  try {
    const response = await axios.get('http://localhost:3001/api/admin/manage-users');
    console.log('Admin API response:', response.status);
    console.log('Users found:', response.data?.users?.length || 0);
    console.log('Caregivers:', response.data?.users?.filter(u => u.userType === 'caregiver')?.length || 0);
    console.log('Patients:', response.data?.users?.filter(u => u.userType === 'patient')?.length || 0);
    
    if (response.data?.users?.length > 0) {
      console.log('Sample user:', response.data.users[0]);
    }
    
    return response.data;
  } catch (error) {
    console.error('Admin API failed:');
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    return null;
  }
}

// Run tests
async function runTests() {
  console.log('Starting registration debug tests...\n');
  
  // Wait for server to be ready
  console.log('Waiting for server to be ready...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Test registration
  const registrationResult = await testCaregiverRegistration();
  
  // Wait a moment for database to process
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test admin dashboard
  const adminResult = await testAdminDashboard();
  
  console.log('\n=== TEST SUMMARY ===');
  console.log('Registration successful:', !!registrationResult);
  console.log('Admin API working:', !!adminResult);
  console.log('Users in database:', adminResult?.users?.length || 0);
}

runTests().catch(console.error);