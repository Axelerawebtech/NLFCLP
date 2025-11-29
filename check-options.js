const mongoose = require('mongoose');

async function checkOptions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = require('./models/index');
    
    const questionnaire = await db.Questionnaire.findOne({ isActive: true });
    if (questionnaire) {
      console.log(`\nFound ${questionnaire.questions.length} questions\n`);
      questionnaire.questions.forEach((q, i) => {
        console.log(`=== Question ${i+1} ===`);
        console.log(`Text: ${q.questionText.substring(0, 60)}`);
        console.log(`Type: ${q.type}`);
        if (q.options && q.options.length > 0) {
          console.log(`Options: ${JSON.stringify(q.options)}`);
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
