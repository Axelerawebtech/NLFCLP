const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixQuestion2() {
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

    const questionnaire = await Questionnaire.findOne({ isActive: true }).sort({ updatedAt: -1 });
    
    if (!questionnaire) {
      console.log('❌ No questionnaire found');
      process.exit(1);
    }

    console.log('BEFORE FIX:');
    console.log(`Q2 Type: ${questionnaire.questions[1].type}`);
    console.log(`Q2 Text: ${questionnaire.questions[1].questionText}\n`);

    // Fix: Change question 2 type from checkbox to radio
    questionnaire.questions[1].type = 'radio';
    
    // Save the updated questionnaire
    await questionnaire.save();

    console.log('✅ AFTER FIX:');
    console.log(`Q2 Type: ${questionnaire.questions[1].type}`);
    console.log(`Q2 Text: ${questionnaire.questions[1].questionText}\n`);

    console.log('✅ Question 2 has been updated to type "radio"');
    console.log('   Now all questions will render with consistent round radio buttons');
    console.log('\nRestart the server to see the changes:');
    console.log('  1. Ctrl+C to stop npm run dev');
    console.log('  2. npm run dev to restart');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

fixQuestion2();
