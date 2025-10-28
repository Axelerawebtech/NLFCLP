const axios = require('axios');

// Test patient registration with the new data structure
async function testPatientRegistration() {
  console.log('Testing patient registration with fixed data structure...');
  
  const testPatientData = {
    userType: 'patient',
    consentAccepted: true,
    userData: {
      name: 'Test Patient',
      phone: '+1234567890',
      age: '45',
      gender: 'Male',
      maritalStatus: 'Married',
      educationLevel: 'Bachelor\'s Degree',
      employmentStatus: 'Full-time',
      residentialArea: 'Urban',
      cancerType: 'Breast Cancer',
      cancerStage: 'Stage II',
      treatmentModality: ['Surgery', 'Chemotherapy'],
      illnessDuration: '6 months',
      comorbidities: ['Hypertension'],
      healthInsurance: 'Private',
      patientId: `PT${Date.now().toString(36).toUpperCase()}`
    },
    questionnaireAnswers: {
      name: 'Test Patient',
      phone: '+1234567890',
      age: '45',
      gender: 'Male',
      maritalStatus: 'Married',
      educationLevel: 'Bachelor\'s Degree',
      employmentStatus: 'Full-time',
      residentialArea: 'Urban',
      cancerType: 'Breast Cancer',
      cancerStage: 'Stage II',
      treatmentModality: ['Surgery', 'Chemotherapy'],
      illnessDuration: '6 months',
      comorbidities: ['Hypertension'],
      healthInsurance: 'Private'
    }
  };

  try {
    const response = await axios.post('http://localhost:3001/api/register', testPatientData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Patient registration SUCCESS!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Patient registration FAILED:');
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);
    console.error('Error message:', error.message);
    return null;
  }
}

// Test caregiver registration with the new data structure
async function testCaregiverRegistration() {
  console.log('\nTesting caregiver registration with fixed data structure...');
  
  const testCaregiverData = {
    userType: 'caregiver',
    consentAccepted: true,
    userData: {
      name: 'Test Caregiver Fixed',
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
      mentalHealth: 'Good',
      relationshipToPatient: 'Spouse',
      caregiverId: `CG${Date.now().toString(36).toUpperCase()}`
    },
    questionnaireAnswers: {
      name: 'Test Caregiver Fixed',
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
      mentalHealth: 'Good',
      relationshipToPatient: 'Spouse'
    }
  };

  try {
    const response = await axios.post('http://localhost:3001/api/register', testCaregiverData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Caregiver registration SUCCESS!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Caregiver registration FAILED:');
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);
    console.error('Error message:', error.message);
    return null;
  }
}

// Test admin dashboard API
async function testAdminDashboard() {
  console.log('\n🔍 Testing admin dashboard API...');
  
  try {
    const response = await axios.get('http://localhost:3001/api/admin/manage-users');
    console.log('✅ Admin API SUCCESS!');
    console.log('Response status:', response.status);
    console.log('Total caregivers found:', response.data?.caregivers?.length || 0);
    console.log('Total patients found:', response.data?.patients?.length || 0);
    
    if (response.data?.caregivers?.length > 0) {
      console.log('First caregiver:', {
        name: response.data.caregivers[0].name,
        id: response.data.caregivers[0].caregiverId,
        isAssigned: response.data.caregivers[0].isAssigned
      });
    }
    
    if (response.data?.patients?.length > 0) {
      console.log('First patient:', {
        name: response.data.patients[0].name,
        id: response.data.patients[0].patientId,
        cancerType: response.data.patients[0].cancerType,
        isAssigned: response.data.patients[0].isAssigned
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Admin API FAILED:');
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);
    console.error('Error message:', error.message);
    return null;
  }
}

// Run all tests
async function runRegistrationTests() {
  console.log('🚀 Starting registration fix validation tests...\n');
  
  // Wait for server to be ready
  console.log('⏳ Waiting for server to be ready...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Test caregiver registration
  const caregiverResult = await testCaregiverRegistration();
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test patient registration
  const patientResult = await testPatientRegistration();
  
  // Wait for database to process
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test admin dashboard
  const adminResult = await testAdminDashboard();
  
  console.log('\n📊 TEST SUMMARY');
  console.log('=================');
  console.log('Caregiver registration:', caregiverResult ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Patient registration:', patientResult ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Admin API working:', adminResult ? '✅ SUCCESS' : '❌ FAILED');
  console.log('Total users in database:', 
    (adminResult?.caregivers?.length || 0) + (adminResult?.patients?.length || 0));
}

runRegistrationTests().catch(console.error);