// Quick test script to seed feedback template
// Run this in browser console on admin page or via API test

async function testFeedbackSystem() {
  console.log('🧪 Testing Feedback System...\n');
  
  // Test 1: Seed feedback template
  console.log('Test 1: Seeding feedback template...');
  try {
    const seedResponse = await fetch('/api/admin/seed-feedback-template', {
      method: 'POST'
    });
    const seedData = await seedResponse.json();
    
    if (seedData.success) {
      console.log('✅ Template seeded successfully');
      console.log(`   - Template Name: ${seedData.template.templateName}`);
      console.log(`   - Total Fields: ${seedData.template.feedbackFields.length}`);
    } else {
      console.error('❌ Failed to seed template:', seedData.error);
    }
  } catch (err) {
    console.error('❌ Error seeding template:', err);
  }
  
  console.log('\n');
  
  // Test 2: Get feedback template
  console.log('Test 2: Retrieving feedback template...');
  try {
    const getResponse = await fetch('/api/admin/get-feedback-template');
    const getData = await getResponse.json();
    
    if (getData.success) {
      console.log('✅ Template retrieved successfully');
      console.log(`   - Fields: ${getData.template.feedbackFields.length}`);
      console.log('\n   Questions:');
      getData.template.feedbackFields.forEach((field, idx) => {
        console.log(`   ${idx + 1}. ${field.label} (${field.fieldType})`);
      });
    } else {
      console.error('❌ Failed to retrieve template:', getData.error);
    }
  } catch (err) {
    console.error('❌ Error retrieving template:', err);
  }
  
  console.log('\n');
  
  // Test 3: Check feedback submissions (will be empty initially)
  console.log('Test 3: Checking feedback submissions...');
  try {
    const feedbackResponse = await fetch('/api/admin/caregiver-feedback');
    const feedbackData = await feedbackResponse.json();
    
    if (feedbackData.success) {
      console.log('✅ Feedback data retrieved');
      console.log(`   - Total caregivers with feedback: ${feedbackData.count}`);
      if (feedbackData.count > 0) {
        console.log('\n   Caregivers:');
        feedbackData.data.forEach(cg => {
          console.log(`   - ${cg.name} (${cg.caregiverId}): ${cg.feedbackSubmissions.length} submissions`);
        });
      }
    } else {
      console.error('❌ Failed to retrieve feedback:', feedbackData.error);
    }
  } catch (err) {
    console.error('❌ Error retrieving feedback:', err);
  }
  
  console.log('\n✨ Testing complete!');
}

// Run the test
testFeedbackSystem();
