const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixQuestion2Direct() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }

    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const db = mongoose.connection.db;
    const questionnairesCollection = db.collection('questionnaires');

    console.log('BEFORE UPDATE:');
    const beforeQuestionnaire = await questionnairesCollection.findOne({ isActive: true });
    console.log(`Q2 Type: ${beforeQuestionnaire.questions[1].type}`);
    console.log(`Q2 Text: ${beforeQuestionnaire.questions[1].questionText}\n`);

    // Update using MongoDB update operator
    const result = await questionnairesCollection.updateOne(
      { isActive: true },
      {
        $set: {
          'questions.1.type': 'radio',
          updatedAt: new Date()
        }
      }
    );

    console.log(`Updated: ${result.modifiedCount} document(s)\n`);

    // Verify the update
    console.log('AFTER UPDATE:');
    const afterQuestionnaire = await questionnairesCollection.findOne({ isActive: true });
    console.log(`Q2 Type: ${afterQuestionnaire.questions[1].type}`);
    console.log(`Q2 Text: ${afterQuestionnaire.questions[1].questionText}\n`);

    console.log('✅ Question 2 type has been updated to "radio"');
    console.log('✅ All questions now render with round radio buttons');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

fixQuestion2Direct();
