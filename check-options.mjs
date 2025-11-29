import 'dotenv/config.js';
import mongoose from 'mongoose';
import { Questionnaire } from './models/index.js';

async function checkOptions() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const questionnaire = await Questionnaire.findOne({ isActive: true });
    if (questionnaire) {
      console.log(`\nFound ${questionnaire.questions.length} questions\n`);
      questionnaire.questions.forEach((q, i) => {
        console.log(`=== Question ${i+1} ===`);
        console.log(`Text: ${q.questionText.substring(0, 60)}`);
        console.log(`Type: ${q.type}`);
        if (q.options && q.options.length > 0) {
          console.log(`Options: ${q.options.join(', ')}`);
        }
        console.log('');
      });
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkOptions();
