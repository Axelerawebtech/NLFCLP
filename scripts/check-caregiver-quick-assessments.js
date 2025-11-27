const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function findCaregiverQuickAssessments() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected!\n');

    const caregiverName = 'caregiverone';

    // Find the caregiver
    const Caregiver = mongoose.connection.collection('caregivers');
    const caregiver = await Caregiver.findOne({ 
      name: new RegExp(caregiverName, 'i')
    });

    if (!caregiver) {
      console.log(`❌ Caregiver "${caregiverName}" not found\n`);
      return;
    }

    console.log(`✅ Caregiver Found: ${caregiver.name}`);
    console.log(`   ID: ${caregiver._id}\n`);

    // Find the caregiver's program
    const CaregiverProgram = mongoose.connection.collection('caregiverprograms');
    const program = await CaregiverProgram.findOne({ caregiverId: caregiver._id });

    if (!program) {
      console.log('❌ No CaregiverProgram found for this caregiver\n');
      return;
    }

    console.log('=' .repeat(70));
    console.log('📊 CAREGIVER PROGRAM DATA');
    console.log('='.repeat(70) + '\n');

    console.log(`Program ID: ${program._id}`);
    console.log(`Current Day: ${program.currentDay || 0}`);
    console.log(`Burden Level: ${program.burdenLevel || 'N/A'}`);
    console.log(`Created: ${program.createdAt ? new Date(program.createdAt).toLocaleString() : 'N/A'}`);
    console.log(`Updated: ${program.updatedAt ? new Date(program.updatedAt).toLocaleString() : 'N/A'}\n`);

    // Show quick assessments
    console.log('=' .repeat(70));
    console.log('📝 QUICK ASSESSMENT RESPONSES (Day 0)');
    console.log('='.repeat(70) + '\n');

    if (program.quickAssessments && program.quickAssessments.length > 0) {
      console.log(`✅ Found ${program.quickAssessments.length} quick assessment(s)\n`);

      program.quickAssessments.forEach((assessment, idx) => {
        console.log(`\n${'─'.repeat(70)}`);
        console.log(`Quick Assessment #${idx + 1}`);
        console.log('─'.repeat(70));
        console.log(`Day: ${assessment.day}`);
        console.log(`Type: ${assessment.type || 'quick_assessment'}`);
        console.log(`Language: ${assessment.language || 'english'}`);
        console.log(`Total Questions: ${assessment.totalQuestions || assessment.responses?.length || 0}`);
        console.log(`Completed At: ${assessment.completedAt ? new Date(assessment.completedAt).toLocaleString() : 'N/A'}`);

        if (assessment.responses && assessment.responses.length > 0) {
          console.log(`\n📋 Responses (${assessment.responses.length} questions):`);
          console.log('');

          assessment.responses.forEach((response, rIdx) => {
            console.log(`  Q${rIdx + 1}. ${response.questionText}`);
            console.log(`      Question ID: ${response.questionId}`);
            console.log(`      Answer: ${response.responseValue || response.responseText || 'N/A'}`);
            console.log(`      Answered At: ${response.answeredAt ? new Date(response.answeredAt).toLocaleString() : 'N/A'}`);
            console.log('');
          });
        } else {
          console.log('\n⚠️  No responses recorded');
        }
      });

      console.log('\n' + '='.repeat(70));
      console.log('💾 STORAGE DETAILS');
      console.log('='.repeat(70));
      console.log(`
Collection: caregiverprograms
Document ID: ${program._id}
Field: quickAssessments (Array of ${program.quickAssessments.length} item(s))

MongoDB Query to see this data:
  db.caregiverprograms.findOne(
    { caregiverId: ObjectId("${caregiver._id}") },
    { quickAssessments: 1 }
  )

Full document:
  db.caregiverprograms.findOne({ caregiverId: ObjectId("${caregiver._id}") })
`);
    } else {
      console.log('❌ No quick assessments found in the program');
      console.log('\nThis means the caregiver has not completed any Day 0 quick assessments yet.\n');
    }

    // Show one-time assessments if any
    if (program.oneTimeAssessments && program.oneTimeAssessments.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('📊 ONE-TIME ASSESSMENTS (Burden, Stress, etc.)');
      console.log('='.repeat(70) + '\n');
      
      program.oneTimeAssessments.forEach((assessment, idx) => {
        console.log(`${idx + 1}. Type: ${assessment.type}`);
        console.log(`   Score: ${assessment.totalScore || 'N/A'}`);
        console.log(`   Level: ${assessment.scoreLevel || 'N/A'}`);
        console.log(`   Completed: ${assessment.completedAt ? new Date(assessment.completedAt).toLocaleString() : 'N/A'}`);
        console.log(`   Responses: ${assessment.responses?.length || 0} questions\n`);
      });
    }

    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

findCaregiverQuickAssessments();
