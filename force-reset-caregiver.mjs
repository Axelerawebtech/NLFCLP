import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Define Caregiver schema
const caregiverSchema = new mongoose.Schema({
  caregiverId: String,
  name: String,
  questionnaireAnswers: Array,
  questionnaireAttempts: Array,
  questionnaireRetakeStatus: String,
  questionnaireRetakeScheduledFor: Date,
  questionnaireRetakeCompletedAt: Date,
  lastQuestionnaireSubmission: Date
}, { strict: false });

const Caregiver = mongoose.models.Caregiver || mongoose.model('Caregiver', caregiverSchema);

async function forceResetCaregiver() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // List all caregivers with assessment data
    const caregiversWithData = await Caregiver.find({
      $or: [
        { 'questionnaireAnswers.0': { $exists: true } },
        { 'questionnaireAttempts.0': { $exists: true } }
      ]
    }).select('caregiverId name questionnaireAnswers questionnaireAttempts');

    if (caregiversWithData.length === 0) {
      console.log('✅ No caregivers with assessment data found');
      process.exit(0);
    }

    console.log(`Found ${caregiversWithData.length} caregivers with assessment data:\n`);
    caregiversWithData.forEach((c, idx) => {
      console.log(`${idx + 1}. ${c.name} (${c.caregiverId})`);
      console.log(`   - Answers: ${c.questionnaireAnswers?.length || 0}`);
      console.log(`   - Attempts: ${c.questionnaireAttempts?.length || 0}`);
      console.log('');
    });

    console.log('\n🗑️  Clearing all assessment data for these caregivers...\n');

    for (const caregiver of caregiversWithData) {
      console.log(`Resetting: ${caregiver.name} (${caregiver.caregiverId})`);
      
      caregiver.questionnaireAnswers = [];
      caregiver.questionnaireAttempts = [];
      caregiver.questionnaireRetakeStatus = 'none';
      caregiver.questionnaireRetakeScheduledFor = null;
      caregiver.questionnaireRetakeCompletedAt = null;
      caregiver.lastQuestionnaireSubmission = null;
      
      await caregiver.save();
      
      // Verify the reset
      const verifyCaregiver = await Caregiver.findOne({ caregiverId: caregiver.caregiverId });
      console.log(`  ✅ Verified reset:`, {
        answersCount: verifyCaregiver.questionnaireAnswers?.length || 0,
        attemptsCount: verifyCaregiver.questionnaireAttempts?.length || 0,
        retakeStatus: verifyCaregiver.questionnaireRetakeStatus
      });
      console.log('');
    }

    console.log('\n✅ All caregivers reset successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Caregivers reset: ${caregiversWithData.length}`);
    console.log(`   - All assessment data cleared`);
    console.log(`   - All attempts removed`);
    console.log(`   - Retake status set to 'none'`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

forceResetCaregiver();
