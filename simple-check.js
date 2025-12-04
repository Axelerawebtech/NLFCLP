const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkFeedback() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const Caregiver = mongoose.connection.collection('caregivers');
    const caregivers = await Caregiver.find({}).toArray();
    
    console.log(`Total caregivers: ${caregivers.length}\n`);

    for (const cg of caregivers) {
      console.log(`${cg.name} (${cg.caregiverId}):`);
      
      if (cg.feedbackSubmissions && cg.feedbackSubmissions.length > 0) {
        console.log(`  ✅ ${cg.feedbackSubmissions.length} feedback(s)`);
        cg.feedbackSubmissions.forEach((s, i) => {
          console.log(`    ${i+1}. Day ${s.day}, ${Object.keys(s.responses || {}).length} responses`);
        });
      } else {
        console.log(`  ❌ No feedback`);
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkFeedback();
