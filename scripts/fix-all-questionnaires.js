const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkAndFixAllQuestionnaires() {
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

    const QuestionSchema = new mongoose.Schema({}, { strict: false }, { _id: false });
    const QuestionnaireSchema = new mongoose.Schema({
      title: String,
      questions: [QuestionSchema],
      isActive: Boolean
    });
    const Questionnaire = mongoose.models.Questionnaire || mongoose.model('Questionnaire', QuestionnaireSchema);

    // Find ALL questionnaires
    const allQuestionnaires = await Questionnaire.find();
    
    console.log(`Found ${allQuestionnaires.length} questionnaire(s)\n`);

    for (const q of allQuestionnaires) {
      console.log(`Questionnaire: ${q.title}`);
      console.log(`  ID: ${q._id}`);
      console.log(`  Active: ${q.isActive}`);
      console.log(`  Q2 Current Type: ${q.questions[1]?.type}`);
      
      // Fix Q2
      if (q.questions[1]) {
        q.questions[1].type = 'radio';
        await q.save();
        console.log(`  ✅ Q2 Fixed to: ${q.questions[1].type}`);
      }
      console.log('');
    }

    console.log('✅ All questionnaires updated');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

checkAndFixAllQuestionnaires();
