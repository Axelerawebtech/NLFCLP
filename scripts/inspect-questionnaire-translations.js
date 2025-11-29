// Inspect questionnaire questions and optionTranslations for debugging
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const dbConnect = require('../lib/mongodb').default || require('../lib/mongodb');
const Questionnaire = require('../models/Questionnaire').default || require('../models/Questionnaire');

(async function(){
  try {
    await dbConnect();
    const q = await Questionnaire.findOne({ isActive: true }).sort({ updatedAt: -1 }).lean();
    if (!q) return console.error('No active questionnaire');
    console.log('Questionnaire:', q.title, 'questions:', q.questions?.length || 0);
    const cliIndices = process.argv.slice(2).map(Number).filter(n => !Number.isNaN(n));
    const indices = cliIndices.length > 0 ? cliIndices : [10,11,12,13,14,26];
    indices.forEach(i => {
      const idx = i - 1;
      const ques = q.questions && q.questions[idx];
      if (!ques) return console.log(`Question ${i} not found`);
      console.log('---');
      console.log(`Question ${i}:`, ques.questionText);
      console.log('  options:', ques.options);
      console.log('  optionTranslations keys present:', !!(ques.optionTranslations));
      if (ques.optionTranslations) {
        console.log('    en:', ques.optionTranslations.en || 'none');
        console.log('    hi:', ques.optionTranslations.hi || 'none');
        console.log('    kn:', ques.optionTranslations.kn || 'none');
      }
    });
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
