import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

const caregiverSchema = new mongoose.Schema({
  caregiverId: String,
  name: String,
  questionnaireAnswers: Array,
  questionnaireAttempts: Array,
  questionnaireEnabled: Boolean
}, { strict: false });

const Caregiver = mongoose.models.Caregiver || mongoose.model('Caregiver', caregiverSchema);

async function checkQuestionnaireData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const caregivers = await Caregiver.find({ questionnaireEnabled: true });
    
    console.log(`Found ${caregivers.length} caregivers with questionnaire enabled:\n`);
    
    caregivers.forEach((cg, idx) => {
      console.log(`${idx + 1}. ${cg.name} (${cg.caregiverId})`);
      console.log(`   MongoDB _id: ${cg._id}`);
      console.log(`   Answers: ${cg.questionnaireAnswers?.length || 0}`);
      console.log(`   Attempts: ${cg.questionnaireAttempts?.length || 0}`);
      
      if (cg.questionnaireAttempts && cg.questionnaireAttempts.length > 0) {
        cg.questionnaireAttempts.forEach(attempt => {
          console.log(`     - Attempt ${attempt.attemptNumber}: ${attempt.answers?.length || 0} answers at ${attempt.submittedAt}`);
        });
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkQuestionnaireData();
