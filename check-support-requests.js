import mongoose from 'mongoose';
import Caregiver from './models/Caregiver.js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nlf_caregiver';

async function checkSupportRequests() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all caregivers with their support requests
    const caregivers = await Caregiver.find({}, {
      caregiverId: 1,
      name: 1,
      supportRequests: 1
    });

    console.log(`\n📊 Found ${caregivers.length} caregivers\n`);

    caregivers.forEach((caregiver, index) => {
      console.log(`${index + 1}. ${caregiver.name} (ID: ${caregiver._id})`);
      console.log(`   caregiverId: ${caregiver.caregiverId}`);
      
      if (caregiver.supportRequests && caregiver.supportRequests.length > 0) {
        console.log(`   ✅ Support Requests: ${caregiver.supportRequests.length}`);
        caregiver.supportRequests.forEach((req, idx) => {
          console.log(`      ${idx + 1}. Type: ${req.requestType}`);
          console.log(`         Status: ${req.status}`);
          console.log(`         Message: ${req.message || '(no message)'}`);
          console.log(`         Requested: ${req.requestedAt}`);
        });
      } else {
        console.log(`   ❌ No support requests`);
      }
      console.log('');
    });

    await mongoose.connection.close();
    console.log('✅ Connection closed');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSupportRequests();
