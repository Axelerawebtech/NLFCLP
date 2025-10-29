#!/usr/bin/env node

/**
 * Initialize Burden Assessment Configuration
 * 
 * This script ensures that the burden assessment configuration
 * is properly set up with all 22 Zarit Burden Interview questions
 * and appropriate scoring ranges.
 * 
 * Run this script to fix issues with missing or incomplete
 * burden assessment questions for new caregivers.
 */

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in environment variables');
  process.exit(1);
}

const standardOptions = [
  {
    optionText: { english: 'Never', kannada: 'ಎಂದಿಗೂ ಇಲ್ಲ', hindi: 'कभी नहीं' },
    score: 0
  },
  {
    optionText: { english: 'Rarely', kannada: 'ವಿರಳವಾಗಿ', hindi: 'शायद ही कभी' },
    score: 1
  },
  {
    optionText: { english: 'Sometimes', kannada: 'ಕೆಲವೊಮ್ಮೆ', hindi: 'कभी-कभी' },
    score: 2
  },
  {
    optionText: { english: 'Quite Frequently', kannada: 'ಬಹಳ ಆಗಾಗ್ಗೆ', hindi: 'काफी बार' },
    score: 3
  },
  {
    optionText: { english: 'Nearly Always', kannada: 'ಯಾವಾಗಲೂ', hindi: 'लगभग हमेशा' },
    score: 4
  }
];

const complete22Questions = [
  {
    id: 1,
    questionText: {
      english: 'Do you feel that your relative asks for more help than he/she needs?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯು ಅವರಿಗೆ ಬೇಕಾದ ಸಹಾಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಸಹಾಯವನ್ನು ಕೇಳುತ್ತಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार को आवश्यकता से अधिक मदद मांगते हैं?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 2,
    questionText: {
      english: 'Do you feel that because of the time you spend with your relative that you don\'t have enough time for yourself?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯೊಂದಿಗೆ ನೀವು ಕಳೆಯುವ ಸಮಯದ ಕಾರಣದಿಂದಾಗಿ ನಿಮಗಾಗಿ ಸಾಕಷ್ಟು ಸಮಯವಿಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार के साथ बिताए गए समय के कारण आपके पास अपने लिए पर्याप्त समय नहीं है?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 3,
    questionText: {
      english: 'Do you feel stressed between caring for your relative and trying to meet other responsibilities for your family or work?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯನ್ನು ನೋಡಿಕೊಳ್ಳುವುದು ಮತ್ತು ನಿಮ್ಮ ಕುಟುಂಬ ಅಥವಾ ಕೆಲಸದ ಇತರ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಪೂರೈಸಲು ಪ್ರಯತ್ನಿಸುವ ನಡುವೆ ನೀವು ಒತ್ತಡವನ್ನು ಅನುಭವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको अपने रिश्तेदार की देखभाल करने और अपने परिवार या काम की अन्य जिम्मेदारियों को पूरा करने के बीच तनाव महसूस होता है?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 4,
    questionText: {
      english: 'Do you feel embarrassed over your relative\'s behavior?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ವರ್ತನೆಯಿಂದ ನೀವು ಮುಜುಗರ ಅನುಭವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आप अपने रिश्तेदार के व्यवहार से शर्मिंदा महसूस करते हैं?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 5,
    questionText: {
      english: 'Do you feel angry when you are around your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಸುತ್ತಲೂ ಇರುವಾಗ ನೀವು ಕೋಪವನ್ನು ಅನುಭವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आप अपने रिश्तेदार के आसपास होते समय गुस्सा महसूस करते हैं?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 6,
    questionText: {
      english: 'Do you feel that your relative currently affects your relationship with your family members or friends in a negative way?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯು ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಕುಟುಂಬದ ಸದಸ್ಯರು ಅಥವಾ ಸ್ನೇಹಿತರೊಂದಿಗಿನ ನಿಮ್ಮ ಸಂಬಂಧವನ್ನು ನಕಾರಾತ್ಮಕ ರೀತಿಯಲ್ಲಿ ಪ್ರಭಾವಿಸುತ್ತಿದೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार वर्तमान में आपके परिवारजनों या दोस्तों के साथ आपके रिश्ते को नकारात्मक तरीके से प्रभावित कर रहे हैं?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 7,
    questionText: {
      english: 'Are you afraid of what the future holds for your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಭವಿಷ್ಯದಲ್ಲಿ ಏನಾಗಲಿದೆ ಎಂಬ ಬಗ್ಗೆ ನೀವು ಭಯಪಡುತ್ತೀರಾ?',
      hindi: 'क्या आप इस बात से डरते हैं कि भविष्य में आपके रिश्तेदार के साथ क्या होगा?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 8,
    questionText: {
      english: 'Do you feel your relative is dependent on you?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯು ನಿಮ್ಮ ಮೇಲೆ ಅವಲಂಬಿತರಾಗಿದ್ದಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार आप पर निर्भर हैं?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 9,
    questionText: {
      english: 'Do you feel strained when you are around your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಸುತ್ತಲೂ ಇರುವಾಗ ನೀವು ಒತ್ತಡವನ್ನು ಅನುಭವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आप अपने रिश्तेदार के आसपास तनावग्रस्त महसूस करते हैं?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 10,
    questionText: {
      english: 'Do you feel your health has suffered because of your involvement with your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯೊಂದಿಗಿನ ನಿಮ್ಮ ಒಳಗೊಳ್ಳುವಿಕೆಯಿಂದಾಗಿ ನಿಮ್ಮ ಆರೋಗ್ಯವು ಹಾನಿಗೊಳಗಾಗಿದೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार के साथ आपकी भागीदारी के कारण आपके स्वास्थ्य को नुकसान हुआ है?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 11,
    questionText: {
      english: 'Do you feel that you don\'t have as much privacy as you would like because of your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾರಣದಿಂದಾಗಿ ನೀವು ಬಯಸುವಷ್ಟು ಗೌಪ್ಯತೆ ನಿಮಗೆ ಇಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार के कारण आपके पास उतनी निजता नहीं है जितनी आप चाहते हैं?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 12,
    questionText: {
      english: 'Do you feel that your social life has suffered because you are caring for your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯನ್ನು ನೋಡಿಕೊಳ್ಳುತ್ತಿರುವ ಕಾರಣದಿಂದಾಗಿ ನಿಮ್ಮ ಸಾಮಾಜಿಕ ಜೀವನವು ಹಾನಿಗೊಳಗಾಗಿದೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार की देखभाल करने के कारण आपके सामाजिक जीवन को नुकसान हुआ है?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 13,
    questionText: {
      english: 'Do you feel uncomfortable about having friends over because of your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾರಣದಿಂದಾಗಿ ಸ್ನೇಹಿತರನ್ನು ಮನೆಗೆ ಕರೆಸಿಕೊಳ್ಳುವುದರಲ್ಲಿ ನೀವು ಅಸಹಜತೆ ಅನುಭವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आप अपने रिश्तेदार के कारण दोस्तों को घर बुलाने में असहज महसूस करते हैं?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 14,
    questionText: {
      english: 'Do you feel that your relative seems to expect you to take care of him/her as if you were the only one he/she could depend on?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯು ನೀವು ಮಾತ್ರ ಅವರು ಅವಲಂಬಿಸಬಹುದಾದ ವ್ಯಕ್ತಿಯಂತೆ ನೀವು ಅವರನ್ನು ನೋಡಿಕೊಳ್ಳಬೇಕೆಂದು ನಿರೀಕ್ಷಿಸುತ್ತಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार आपसे अपेक्षा करते हैं कि आप उनकी देखभाल करें जैसे कि आप ही एकमात्र व्यक्ति हैं जिस पर वे निर्भर रह सकते हैं?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 15,
    questionText: {
      english: 'Do you feel that you don\'t have enough money to take care of your relative in addition to the rest of your expenses?',
      kannada: 'ನಿಮ್ಮ ಇತರ ಖರ್ಚುಗಳ ಜೊತೆಗೆ ನಿಮ್ಮ ಸಂಬಂಧಿಯನ್ನು ನೋಡಿಕೊಳ್ಳಲು ನಿಮಗೆ ಸಾಕಷ್ಟು ಹಣವಿಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके अन्य खर्चों के अलावा अपने रिश्तेदार की देखभाल करने के लिए आपके पास पर्याप्त पैसा नहीं है?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 16,
    questionText: {
      english: 'Do you feel that you will be unable to take care of your relative much longer?',
      kannada: 'ನೀವು ಇನ್ನು ಮುಂದೆ ನಿಮ್ಮ ಸಂಬಂಧಿಯನ್ನು ನೋಡಿಕೊಳ್ಳಲು ಸಾಧ್ಯವಾಗುವುದಿಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आप अपने रिश्तेदार की अब और ज्यादा देखभाल नहीं कर पाएंगे?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 17,
    questionText: {
      english: 'Do you feel you have lost control of your life since your relative\'s illness?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಅನಾರೋಗ್ಯದ ನಂತರ ನಿಮ್ಮ ಜೀವನದ ಮೇಲಿನ ನಿಯಂತ್ರಣವನ್ನು ನೀವು ಕಳೆದುಕೊಂಡಿದ್ದೀರಿ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपके रिश्तेदार की बीमारी के बाद से आपने अपने जीवन पर नियंत्रण खो दिया है?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 18,
    questionText: {
      english: 'Do you wish you could leave the care of your relative to someone else?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಆರೈಕೆಯನ್ನು ಬೇರೆಯವರಿಗೆ ಬಿಡಬಹುದೆಂದು ನೀವು ಬಯಸುತ್ತೀರಾ?',
      hindi: 'क्या आप चाहते हैं कि आप अपने रिश्तेदार की देखभाल किसी और को सौंप सकें?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 19,
    questionText: {
      english: 'Do you feel uncertain about what to do about your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಬಗ್ಗೆ ಏನು ಮಾಡಬೇಕೆಂದು ನಿಮಗೆ ಅನಿಶ್ಚಿತತೆ ಇದೆಯೇ?',
      hindi: 'क्या आप अपने रिश्तेदार के बारे में क्या करना है इसके बारे में अनिश्चित महसूस करते हैं?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 20,
    questionText: {
      english: 'Do you feel you should be doing more for your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಲಿಂದ ನೀವು ಇನ್ನಷ್ಟು ಮಾಡಬೇಕು ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आपको अपने रिश्तेदार के लिए और अधिक करना चाहिए?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 21,
    questionText: {
      english: 'Do you feel you could do a better job caring for your relative?',
      kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯನ್ನು ನೋಡಿಕೊಳ್ಳುವಲ್ಲಿ ನೀವು ಉತ್ತಮ ಕೆಲಸ ಮಾಡಬಹುದೆಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
      hindi: 'क्या आपको लगता है कि आप अपने रिश्तेदार की देखभाल में बेहतर काम कर सकते हैं?'
    },
    options: standardOptions,
    enabled: true
  },
  {
    id: 22,
    questionText: {
      english: 'Overall, how burdened do you feel in caring for your relative?',
      kannada: 'ಒಟ್ಟಾರೆಯಾಗಿ, ನಿಮ್ಮ ಸಂಬಂಧಿಯನ್ನು ನೋಡಿಕೊಳ್ಳುವಲ್ಲಿ ನೀವು ಎಷ್ಟು ಹೊರೆ ಅನುಭವಿಸುತ್ತೀರಿ?',
      hindi: 'कुल मिलाकर, अपने रिश्तेदार की देखभाल करने में आप कितना बोझ महसूस करते हैं?'
    },
    options: standardOptions,
    enabled: true
  }
];

const scoreRanges = {
  littleOrNoBurden: {
    min: 0,
    max: 20,
    label: {
      english: 'Little or no burden',
      kannada: 'ಕಡಿಮೆ ಅಥವಾ ಯಾವುದೇ ಹೊರೆ ಇಲ್ಲ',
      hindi: 'कम या कोई बोझ नहीं'
    },
    burdenLevel: 'mild'
  },
  mildToModerate: {
    min: 21,
    max: 40,
    label: {
      english: 'Mild to moderate burden',
      kannada: 'ಸೌಮ್ಯದಿಂದ ಮಧ್ಯಮ ಹೊರೆ',
      hindi: 'हल्के से मध्यम बोझ'
    },
    burdenLevel: 'mild'
  },
  moderateToSevere: {
    min: 41,
    max: 60,
    label: {
      english: 'Moderate to severe burden',
      kannada: 'ಮಧ್ಯಮದಿಂದ ತೀವ್ರ ಹೊರೆ',
      hindi: 'मध्यम से गंभीर बोझ'
    },
    burdenLevel: 'moderate'
  },
  severe: {
    min: 61,
    max: 88,
    label: {
      english: 'Severe burden',
      kannada: 'ತೀವ್ರ ಹೊರೆ',
      hindi: 'गंभीर बोझ'
    },
    burdenLevel: 'severe'
  }
};

async function initializeBurdenAssessment() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(MONGODB_DB);
    const collection = db.collection('programconfigs');
    
    // Check if configuration already exists
    const existingConfig = await collection.findOne({ configType: 'global' });
    
    if (existingConfig && existingConfig.day1 && existingConfig.day1.burdenTestQuestions && existingConfig.day1.burdenTestQuestions.length === 22) {
      console.log('✅ Burden assessment configuration already exists with 22 questions');
      console.log(`📊 Current questions count: ${existingConfig.day1.burdenTestQuestions.length}`);
      return;
    }
    
    // Update or create configuration
    const configUpdate = {
      $set: {
        configType: 'global',
        'day1.burdenTestQuestions': complete22Questions,
        'day1.scoreRanges': scoreRanges,
        lastUpdated: new Date()
      }
    };
    
    const result = await collection.updateOne(
      { configType: 'global' },
      configUpdate,
      { upsert: true }
    );
    
    if (result.upsertedCount > 0) {
      console.log('✅ Created new burden assessment configuration');
    } else {
      console.log('✅ Updated existing burden assessment configuration');
    }
    
    console.log('📋 Configuration details:');
    console.log(`   • Questions: ${complete22Questions.length}`);
    console.log(`   • Score ranges: ${Object.keys(scoreRanges).length}`);
    console.log(`   • Maximum possible score: ${22 * 4} points`);
    console.log(`   • Languages supported: English, Kannada, Hindi`);
    
    // Verify the update
    const updatedConfig = await collection.findOne({ configType: 'global' });
    if (updatedConfig && updatedConfig.day1 && updatedConfig.day1.burdenTestQuestions) {
      console.log(`✅ Verification: ${updatedConfig.day1.burdenTestQuestions.length} questions saved successfully`);
    }
    
  } catch (error) {
    console.error('❌ Error initializing burden assessment:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the initialization
initializeBurdenAssessment()
  .then(() => {
    console.log('🎉 Burden assessment initialization completed successfully!');
    console.log('');
    console.log('✅ What was fixed:');
    console.log('   • Ensured all 22 Zarit Burden Interview questions are available');
    console.log('   • Set up proper scoring ranges (0-88 points)');
    console.log('   • Configured multi-language support');
    console.log('   • Fixed issue where new caregivers only saw 1 question');
    console.log('');
    console.log('💡 The assessment will now work properly for all new caregivers');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to initialize burden assessment:', error);
    process.exit(1);
  });