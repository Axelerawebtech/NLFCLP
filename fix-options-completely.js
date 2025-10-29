require('dotenv').config({ path: '.env.local' });
const dbConnect = require('./lib/mongodb.js').default;
const ProgramConfig = require('./models/ProgramConfig.js').default;

async function fixOptionsCompletely() {
  try {
    console.log('🔧 Fixing burden assessment options completely...');
    await dbConnect();
    console.log('✅ Database connected');

    // Define the complete standard options that should exist for every question
    const standardOptions = [
      {
        optionText: { 
          english: 'Never', 
          kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', 
          hindi: 'कभी नहीं' 
        },
        score: 0
      },
      {
        optionText: { 
          english: 'Rarely', 
          kannada: 'ವಿರಳವಾಗಿ', 
          hindi: 'शायद ही कभी' 
        },
        score: 1
      },
      {
        optionText: { 
          english: 'Sometimes', 
          kannada: 'ಕೆಲವೊಮ್ಮೆ', 
          hindi: 'कभी-कभी' 
        },
        score: 2
      },
      {
        optionText: { 
          english: 'Quite Frequently', 
          kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', 
          hindi: 'काफी बार' 
        },
        score: 3
      },
      {
        optionText: { 
          english: 'Nearly Always', 
          kannada: 'ಯಾವಾಗಲೂ', 
          hindi: 'लगभग हमेशा' 
        },
        score: 4
      }
    ];

    const config = await ProgramConfig.findOne({ configType: 'global' });
    
    if (!config) {
      console.log('❌ No global config found');
      return;
    }

    if (!config.day1 || !config.day1.burdenTestQuestions) {
      console.log('❌ No burden test questions found');
      return;
    }

    console.log(`🔄 Updating ${config.day1.burdenTestQuestions.length} questions with options...`);
    
    // Update each question's options directly in the array
    for (let i = 0; i < config.day1.burdenTestQuestions.length; i++) {
      const question = config.day1.burdenTestQuestions[i];
      console.log(`🔧 Fixing question ${i + 1}: "${question.questionText.english.substring(0, 50)}..."`);
      
      // Directly assign the options
      config.day1.burdenTestQuestions[i].options = standardOptions;
      
      console.log(`✅ Question ${i + 1} now has ${standardOptions.length} options`);
    }

    // Force mark the entire nested document as modified
    config.markModified('day1');
    config.markModified('day1.burdenTestQuestions');

    // Save the document
    console.log('💾 Saving updated configuration...');
    await config.save();

    console.log('✅ Configuration saved successfully!');

    // Verify the fix by re-fetching
    console.log('🔍 Verifying the fix...');
    const verifyConfig = await ProgramConfig.findOne({ configType: 'global' });
    const firstQuestion = verifyConfig.day1.burdenTestQuestions[0];
    
    console.log('📊 Verification results:');
    console.log(`✓ Total questions: ${verifyConfig.day1.burdenTestQuestions.length}`);
    console.log(`✓ First question options count: ${firstQuestion.options.length}`);
    console.log(`✓ First option text: ${firstQuestion.options[0]?.optionText?.english}`);
    console.log(`✓ All options scores: [${firstQuestion.options.map(o => o.score).join(', ')}]`);

    if (firstQuestion.options.length === 5) {
      console.log('🎉 SUCCESS: Options are now properly saved!');
    } else {
      console.log('❌ FAILED: Options still not saved correctly');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixOptionsCompletely();