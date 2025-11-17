// Debug script to check burden assessment configuration in database
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const ProgramConfigSchema = new mongoose.Schema({
  configType: String,
  day1: {
    burdenTestQuestions: [{
      id: Number,
      questionText: {
        english: String,
        kannada: String,
        hindi: String
      },
      options: [{
        optionText: {
          english: String,
          kannada: String,
          hindi: String
        },
        score: Number
      }],
      enabled: Boolean
    }],
    scoreRanges: mongoose.Schema.Types.Mixed
  }
}, { strict: false });

async function debugBurdenConfig() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const ProgramConfig = mongoose.models.ProgramConfig || mongoose.model('ProgramConfig', ProgramConfigSchema);
    
    const config = await ProgramConfig.findOne({ configType: 'global' });
    
    if (!config) {
      console.log('❌ No global config found!');
      return;
    }

    console.log('📊 Config Summary:');
    console.log('- Config Type:', config.configType);
    console.log('- Has day1:', !!config.day1);
    console.log('- Has burdenTestQuestions:', !!config.day1?.burdenTestQuestions);
    console.log('- Questions Count:', config.day1?.burdenTestQuestions?.length || 0);
    console.log('');

    if (config.day1?.burdenTestQuestions) {
      console.log('📋 Question Details:');
      config.day1.burdenTestQuestions.forEach((q, index) => {
        console.log(`\nQuestion ${index + 1}:`);
        console.log('  ID:', q.id);
        console.log('  English Text:', q.questionText?.english?.substring(0, 60) + '...');
        console.log('  Has options:', !!q.options);
        console.log('  Options is array:', Array.isArray(q.options));
        console.log('  Options length:', q.options?.length || 0);
        
        if (q.options && q.options.length > 0) {
          console.log('  First option:', {
            text: q.options[0].optionText?.english,
            score: q.options[0].score
          });
        } else {
          console.log('  ⚠️ NO OPTIONS FOUND!');
          console.log('  Raw question data:', JSON.stringify(q, null, 2));
        }
      });
    }

    console.log('\n📊 Score Ranges:');
    console.log(JSON.stringify(config.day1?.scoreRanges, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugBurdenConfig();
