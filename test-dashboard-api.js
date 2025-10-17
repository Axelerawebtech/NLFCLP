// Test file to debug the dashboard API
async function testDashboardAPI() {
  try {
    // Test with a sample caregiver ID
    const response = await fetch('/api/caregiver/dashboard?caregiverId=CG001');
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Data:', data);
    
    if (!response.ok) {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// To run this test, open browser console and call testDashboardAPI()
console.log('Dashboard API test function loaded. Call testDashboardAPI() to test.');