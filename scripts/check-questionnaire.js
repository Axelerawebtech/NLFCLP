const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const QuestionnaireSchema = new mongoose.Schema({}, { strict: false });
const Questionnaire = mongoose.model('Questionnaire', QuestionnaireSchema, 'questionnaires');

async function checkQuestionnaire() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const questionnaire = await Questionnaire.findOne({ isActive: true });
    
    if (!questionnaire) {
      console.log('❌ No active questionnaire found');
      process.exit(1);
    }

    console.log('\n📋 ACTIVE QUESTIONNAIRE:');
    console.log('='.repeat(80));
    console.log(`Name: ${questionnaire.name}`);
    console.log(`Questions: ${questionnaire.questions?.length || 0}`);
    console.log('');
    
    if (questionnaire.questions && questionnaire.questions.length > 0) {
      console.log('First 3 Questions:');
      questionnaire.questions.slice(0, 3).forEach((q, i) => {
        console.log(`\n[${i+1}] ${q.questionText}`);
        console.log(`    _id: ${q._id}`);
        console.log(`    type: ${q.type}`);
        console.log(`    options: ${q.options?.length || 0}`);
        console.log(`    required: ${q.required}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkQuestionnaire();
