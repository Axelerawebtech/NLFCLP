const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkQuestionTypes() {
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

    console.log('QUESTIONNAIRE: ' + questionnaire.title);
    console.log('='.repeat(80));
    console.log('');

    questionnaire.questions.forEach((q, i) => {
      console.log(`Q${i + 1}: ${q.questionText}`);
      console.log(`   Type: ${q.type}`);
      console.log(`   Options: ${q.options.length}`);
      if (i < 3 || i === 1) {
        console.log(`   Sample options: ${q.options.slice(0, 2).join(', ')}`);
      }
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('\nIssue: If Q2 shows type "radio" but renders as checkboxes,');
    console.log('the problem is in the renderQuestion function or FormGroup/RadioGroup');
    console.log('\nSolution: All questions should use RadioGroup (round buttons)');
    console.log('for consistency, or we need to update the seed data if Q2 should be checkbox');

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

checkQuestionTypes();
