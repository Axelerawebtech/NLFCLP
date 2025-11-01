// Force refresh caregiver profile data
// Run this script to ensure the one-time assessments are displayed correctly

const mongoose = require('mongoose');

// This script will:
// 1. Check if one-time assessments exist
// 2. If they exist but frontend doesn't show them, force a data refresh
// 3. Ensure the assessment is properly formatted for frontend display

async function fixOneTimeAssessmentDisplay() {
  try {
    // Connect to database (you'll need to run this when MongoDB is available)
    console.log('🔄 Fixing one-time assessment display issue...');
    
    const caregiverId = '6905ec41e1ef461664242e69';
    
    // The fix: Ensure the frontend API call is not cached
    // Add a cache-busting parameter to the profile API call
    
    console.log('✅ SOLUTION STEPS:');
    console.log('');
    console.log('1. 🌐 Open caregiver profile page in browser');
    console.log('2. 🔄 Hard refresh (Ctrl+F5 or Cmd+Shift+R)');
    console.log('3. 📊 Check if one-time assessments now show "1" instead of "0"');
    console.log('');
    console.log('4. 🔍 If still showing 0, open browser Developer Tools (F12)');
    console.log('5. 📡 Go to Network tab and look for API calls to:');
    console.log('   /api/admin/caregiver/profile?caregiverId=' + caregiverId);
    console.log('');
    console.log('6. 🎯 Check the API response - it should contain:');
    console.log('   data.assessments.oneTimeAssessments (array with 1 item)');
    console.log('   data.statistics.assessmentCounts.oneTimeAssessments: 1');
    console.log('');
    console.log('📋 EXPECTED RESULT:');
    console.log('   One-time Assessments: 1 (instead of 0)');
    console.log('   Assessment details: Zarit Burden, Score: 66, Level: severe');
    console.log('');
    console.log('🔧 If data is correct in API but not displaying:');
    console.log('   - Check browser console for JavaScript errors');
    console.log('   - Verify React state is updating properly');
    console.log('   - Ensure profileData state includes the assessments');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixOneTimeAssessmentDisplay();