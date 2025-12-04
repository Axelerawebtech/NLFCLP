const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const caregiverSchema = new mongoose.Schema({}, { strict: false });
const Caregiver = mongoose.models.Caregiver || mongoose.model('Caregiver', caregiverSchema, 'caregivers');

async function checkFeedback() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const caregivers = await Caregiver.find({}).select('name caregiverId feedbackSubmissions');
    
    console.log(`\n📊 Total caregivers: ${caregivers.length}\n`);

    caregivers.forEach((cg, idx) => {
      console.log(`${idx + 1}. ${cg.name} (ID: ${cg.caregiverId})`);
      
      if (cg.feedbackSubmissions && cg.feedbackSubmissions.length > 0) {
        console.log(`   ✅ Has ${cg.feedbackSubmissions.length} feedback submission(s):`);
        cg.feedbackSubmissions.forEach((submission, i) => {
          console.log(`      ${i + 1}. Day ${submission.day} | ${submission.language} | ${new Date(submission.submittedAt).toLocaleString()}`);
          console.log(`         Responses: ${Object.keys(submission.responses || {}).length} questions answered`);
          console.log(`         Participant ID: ${submission.participantId || 'N/A'}`);
        });
      } else {
        console.log(`   ❌ No feedback submissions`);
      }
      console.log('');
    });

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkFeedback();
