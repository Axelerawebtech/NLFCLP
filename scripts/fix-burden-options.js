// Script to fix missing options in burden assessment questions
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const ProgramConfigSchema = new mongoose.Schema({}, { strict: false });

async function fixBurdenOptions() {
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

    console.log('📊 Current state:');
    console.log('- Questions count:', config.day1?.burdenTestQuestions?.length || 0);
    console.log('- First question options:', config.day1?.burdenTestQuestions?.[0]?.options?.length || 0);

    // Standard options for questions 1-22
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

    // Update each question to add options
    if (config.day1?.burdenTestQuestions) {
      console.log('\n🔧 Fixing options for all questions...');
      
      config.day1.burdenTestQuestions.forEach((question, index) => {
        question.options = standardOptions;
        console.log(`✅ Added 5 options to Question ${index + 1}`);
      });

      config.markModified('day1');
      await config.save();

      console.log('\n✅ Successfully updated all questions with options!');
      
      // Verify
      const updatedConfig = await ProgramConfig.findOne({ configType: 'global' });
      console.log('\n📊 Verification:');
      console.log('- First question options:', updatedConfig.day1?.burdenTestQuestions?.[0]?.options?.length);
      console.log('- Last question options:', updatedConfig.day1?.burdenTestQuestions?.[21]?.options?.length);
      
      if (updatedConfig.day1?.burdenTestQuestions?.[0]?.options?.length > 0) {
        console.log('\n✅ SUCCESS! Options are now present.');
        console.log('Sample option:', updatedConfig.day1.burdenTestQuestions[0].options[0]);
      }
    } else {
      console.log('❌ No questions found to fix!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

fixBurdenOptions();
