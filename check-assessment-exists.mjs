import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found');
  process.exit(1);
}

const CaregiverAssessmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  sections: Array,
  isActive: Boolean
}, { strict: false });

const CaregiverAssessment = mongoose.models.CaregiverAssessment || 
  mongoose.model('CaregiverAssessment', CaregiverAssessmentSchema);

async function checkAssessment() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const assessments = await CaregiverAssessment.find({});
    
    if (assessments.length === 0) {
      console.log('❌ No assessments found in database!');
      console.log('📝 You need to create the assessment using create-assessment-direct.mjs');
    } else {
      console.log(`Found ${assessments.length} assessment(s):\n`);
      assessments.forEach((a, idx) => {
        console.log(`${idx + 1}. ${a.title}`);
        console.log(`   Active: ${a.isActive}`);
        console.log(`   Sections: ${a.sections?.length || 0}`);
        if (a.sections && a.sections.length > 0) {
          a.sections.forEach((s, si) => {
            console.log(`     - Section ${si + 1}: ${s.sectionTitle?.english || s.sectionId} (${s.questions?.length || 0} questions)`);
          });
        }
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkAssessment();
