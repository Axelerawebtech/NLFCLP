const fetch = require('node-fetch');

async function testCaregiverProfileAPI() {
  try {
    const caregiverId = '6905ec41e1ef461664242e69';
    const url = `http://localhost:3002/api/admin/caregiver/profile?caregiverId=${caregiverId}`;
    
    console.log('🔍 Testing caregiver profile API...');
    console.log('URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.log('❌ API Error:', data);
      return;
    }
    
    console.log('✅ API Response successful');
    console.log('\n📊 Assessment Counts:');
    console.log('  Quick Assessments:', data.data.statistics.assessmentCounts.quickAssessments);
    console.log('  One-time Assessments:', data.data.statistics.assessmentCounts.oneTimeAssessments);
    console.log('  Daily Module Assessments:', data.data.statistics.assessmentCounts.dailyModuleAssessments);
    
    console.log('\n📋 One-time Assessments Detail:');
    if (data.data.assessments.oneTimeAssessments.length > 0) {
      data.data.assessments.oneTimeAssessments.forEach((assessment, index) => {
        console.log(`  Assessment ${index + 1}:`);
        console.log('    Type:', assessment.type);
        console.log('    Score Level:', assessment.scoreLevel);
        console.log('    Total Score:', assessment.totalScore);
        console.log('    Completed At:', assessment.completedAt);
        console.log('    Response Count:', assessment.responseCount);
      });
    } else {
      console.log('  ❌ No one-time assessments found in API response');
    }
    
    console.log('\n🎯 Program Details:');
    console.log('  Burden Level:', data.data.program?.burdenLevel);
    console.log('  Burden Test Score:', data.data.program?.burdenTestScore);
    console.log('  Current Day:', data.data.program?.currentDay);
    
    console.log('\n🗂️ Raw oneTimeAssessments array from API:');
    console.log(JSON.stringify(data.data.assessments.oneTimeAssessments, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
}

testCaregiverProfileAPI();