const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const DAY_NUMBER = 3;

// WHOQOL questions (26 items) - source: WHOQOL.txt
// Provided in English, Hindi and Kannada translations
const WHOQOL_QUESTIONS = {
  english: [
    'How would you rate your quality of life?',
    'How satisfied are you with your health?',
    'To what extent do you feel that (physical) pain prevents you from doing what you need to do?',
    'How much do you need any medical treatment to function in your daily life?',
    'How much do you enjoy life?',
    'To what extent do you feel your life to be meaningful?',
    'How well are you able to concentrate?',
    'How safe do you feel in your daily life?',
    'How healthy is your physical environment?',
    'Do you have enough energy for everyday life?',
    'Are you able to accept your bodily appearance?',
    'Have you enough money to meet your needs?',
    'How available to you is the information that you need in your day-to-day life?',
    'To what extent do you have the opportunity for leisure activities?',
    'How well are you able to get around?',
    'How satisfied are you with your sleep?',
    'How satisfied are you with your ability to perform your daily living activities?',
    'How satisfied are you with your capacity for work?',
    'How satisfied are you with yourself?',
    'How satisfied are you with your personal relationships?',
    'How satisfied are you with your sex life?',
    'How satisfied are you with the support you get from your friends?',
    'How satisfied are you with the conditions of your living place?',
    'How satisfied are you with your access to health services?',
    'How satisfied are you with your transport?',
    'How often do you have negative feelings such as blue mood, despair, anxiety, depression?'
  ],
  hindi: [
    'आप अपनी जीवन गुणवत्ता को कैसे आंकेगें?',
    'आप अपने स्वास्थ्य से कितने संतुष्ट हैं?',
    'किस हद तक आपको लगता है कि (शारीरिक) दर्द आपके आवश्यक कार्य करने से रोकता है?',
    'दैनिक जीवन में कार्य करने के लिए आपको कितनी चिकित्सा उपचार की आवश्यकता है?',
    'आप जीवन का कितना आनंद लेते हैं?',
    'आप किस हद तक अपने जीवन को सार्थक महसूस करते हैं?',
    'आप ध्यान (केंद्रित होने) में कितने सक्षम हैं?',
    'आप अपने दैनिक जीवन में कितना सुरक्षित महसूस करते हैं?',
    'आपका भौतिक वातावरण कितना स्वस्थ है?',
    'क्या आपके पास रोजमर्रा के कामों के लिए पर्याप्त ऊर्जा है?',
    'क्या आप अपने शरीरिक स्वरूप को स्वीकार कर पाते हैं?',
    'क्या आपके पास अपनी आवश्यकताओं को पूरा करने के लिए पर्याप्त धन है?',
    'आपके दिन-प्रतिदिन के जीवन में जो जानकारी चाहिए वह आपके लिए कितनी उपलब्ध है?',
    'आपको मनोरंजन गतिविधियों के अवसर किस हद तक मिलते हैं?',
    'क्या आप आसानी से चल फिर सकते हैं?',
    'आप अपनी नींद से कितने संतुष्ट हैं?',
    'आप अपनी दैनिक गतिविधियाँ करने की क्षमता से कितने संतुष्ट हैं?',
    'आप अपने कार्य करने की क्षमता से कितने संतुष्ट हैं?',
    'आप खुद से कितने संतुष्ट हैं?',
    'आप अपने व्यक्तिगत संबंधों से कितने संतुष्ट हैं?',
    'आप अपने यौन जीवन से कितने संतुष्ट हैं?',
    'मित्रों से मिलने वाला समर्थन आपको कितना संतुष्ट करता है?',
    'आपके रहने की स्थिति की शर्तों से आप कितना संतुष्ट हैं?',
    'आपका स्वास्थ्य सेवाओं तक पहुँच कितना संतोषजनक है?',
    'आपके परिवहन (यातायात) के साथ आप कितना संतुष्ट हैं?',
    'आप कितनी बार नकारात्मक भावनाएँ जैसे उदासी, निराशा, चिंता, अवसाद महसूस करते हैं?'
  ],
  kannada: [
    'ನೀವು ನಿಮ್ಮ ಜೀವನದ ಗುಣಮಟ್ಟವನ್ನು ಹೇಗೆ ಅಂದಾಜಿಸುತ್ತೀರಿ?',
    'ನೀವು ನಿಮ್ಮ ಆರೋಗ್ಯದ ಮೇಲೆ ಎಷ್ಟು ತೃಪ್ತರಾಗಿದ್ದೀರಿ?',
    'ಶಾರೀರಿಕ ನೋವು ನಿಮಗೆ ಅಗತ್ಯವಾದ ಕಾರ್ಯಗಳನ್ನು ಮಾಡಲು ತಡೆಯಿದೆಯೆಂದು ನೀವು ಯಾವ ಮಟ್ಟಿಗೆ ಭಾವಿಸುತ್ತೀರಿ?',
    'ದೈನಂದಿನ ಜೀವನ ಕಾರ್ಯಗತಗೊಳಿಸಲು ನಿಮಗೆ ವೈದ್ಯಕೀಯ ಚಿಕಿತ್ಸೆಯ ಅಗತ್ಯ ಎಷ್ಟು ಇದೆ?',
    'ನೀವು ಜೀವನವನ್ನು ಎಷ್ಟು ಆನಂದಿಸುತ್ತೀರಿ?',
    'ನಿಮ್ಮ ಜೀವನದ ಅರ್ಥ ಕುರಿತು ನೀವು ಎಷ್ಟು ಮಟ್ಟಿಗೆ ಒಪ್ಪುತ್ತೀರಿ?',
    'ನೀವು ಎಷ್ಟು ಚೆನ್ನಾಗಿ ಕೇಂದ್ರೀಕರಿಸಬಲ್ಲಿರಿ?',
    'ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ನೀವು ಎಷ್ಟು ಸುರಕ್ಷಿತವಾಗಿದ್ದೀರಿ ಎಂದು ಭಾವಿಸುತ್ತೀರಿ?',
    'ನಿಮ್ಮ ಭೌತಿಕ ಪರಿಸರವು ಎಷ್ಟು ಆರೋಗ್ಯಕರವಾಗಿದೆ?',
    'ದೈನಂದಿನ ಜೀವನಕ್ಕೆ ನಿಮಗೆ բավಯವಾದ ಎನರ್ಜಿ ಇದೆನಾ?',
    'ನೀವು ನಿಮ್ಮ ದೇಹದ ಕಾಣಿಕೆಯನ್ನು ಸ್ವೀಕರಿಸಬಹುದೆ?',
    'ನಿಮ್ಮ ಅಗತ್ಯಗಳನ್ನು ಪೂರೈಸಲು ಸಾಕಷ್ಟು ಹಣವಿದೆಯೇ?',
    'ದಿನದ ಕಾರ್ಯಗಳಲ್ಲಿ ನಿಮಗೆ ಬೇಕಾದ ಮಾಹಿತಿಯು ನಿಮಗೆ 얼마나 ಲಭ್ಯವಿದೆ?',
    'ಆರಾಮದ ಚಟುವಟಿಕೆಗಳ ಅವಕಾಶಗಳನ್ನು ನಿಮಗೆ ಎಷ್ಟು ದೊರಕುತ್ತವೆ?',
    'ನೀವು ಸುತ್ತಲು ಎಷ್ಟು ಸುಲಭವಾಗಬೇಕು?',
    'ನಿಮ್ಮ ನಿದ್ದೆಯಿಂದ ನೀವು ಎಷ್ಟು ತೃಪ್ತರಾಗಿದ್ದೀರಿ?',
    'ದೈನಂದಿನ ಕ್ರಿಯೆಗಳನ್ನು ನಿಭಾಯಿಸುವ ನಿಮ್ಮ ಶಕ್ತಿಯಿಂದ ನೀವು ಎಷ್ಟು ತೃಪ್ತರಾಗಿದ್ದೀರಿ?',
    'ಕೆಲಸ ನಡೆಸುವ ನಿಮ್ಮ ಸಾಮರ್ಥ್ಯದಿಂದ ನೀವು ಎಷ್ಟು ತೃಪ್ತರಾಗಿದ್ದೀರಿ?',
    'ನೀವು ನಿಮ್ಮ ಬಗ್ಗೆ ಎಷ್ಟು ತೃಪ್ತರಾಗಿದ್ದೀರಿ?',
    'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಸಂಬಂಧಗಳಿಂದ ನೀವು ಎಷ್ಟು ತೃಪ್ತರಾಗಿದ್ದೀರಿ?',
    'ನಿಮ್ಮ ಲೈಂಗಿಕ ಜೀವನದಿಂದ ನೀವು ಎಷ್ಟು ತೃಪ್ತರಾಗಿದ್ದೀರಿ?',
    'ನೀವು ಸ್ನೇಹಿತರ ಬಳಿ ಪಡೆಯುವ ಬೆಂಬಲದಿಂದ ಎಷ್ಟು ತೃಪ್ತರಾಗಿದ್ದೀರಿ?',
    'ನಿಮ್ಮ ವಾಸಸ್ಥಳದ ಪರಿಸ್ಥಿತಿ ಬಗ್ಗೆ ನೀವು ಎಷ್ಟು ತೃಪ್ತರಾಗಿದ್ದೀರಿ?',
    'ಆರೋಗ್ಯ ಸೇವೆಗಳ ಪ್ರಾಪಣೆ ಕುರಿತು ನೀವು ಎಷ್ಟು ತೃಪ್ತರಾಗಿದ್ದೀರಿ?',
    'ಸಾರಿಗೆ/ಪ್ರಯಾಣದ ವ್ಯವಸ್ಥೆಯಿಂದ ನೀವು ಎಷ್ಟು ತೃಪ್ತರಾಗಿದ್ದೀರಿ?',
    'ನೀವು ಎಷ್ಟು ಬಾರಿ ನಕಾರಾತ್ಮಕ ಭಾವನೆಗಳನ್ನು ಅನುಭವಿಸುತ್ತೀರಿ (ಉದಾಸಿ, ನಿರಾಶೆ, ಆತಂಕ, ದುಗುಡ)?'
  ]
};

// Standard 5-point options (score 1-5) with translations
const STANDARD_OPTIONS = {
  english: [
    { optionText: '1 - Very poor / Very dissatisfied / Never', score: 1 },
    { optionText: '2 - Poor / Dissatisfied / Seldom', score: 2 },
    { optionText: '3 - Neither / Moderately / Quite often', score: 3 },
    { optionText: '4 - Good / Satisfied / Very often', score: 4 },
    { optionText: '5 - Very good / Very satisfied / Always', score: 5 }
  ],
  hindi: [
    { optionText: '1 - बहुत खराब / बहुत असंतुष्ट / कभी नहीं', score: 1 },
    { optionText: '2 - खराब / असंतुष्ट / कभी-कभार', score: 2 },
    { optionText: '3 - न तो / मध्यम / कभी-कभी', score: 3 },
    { optionText: '4 - अच्छा / संतुष्ट / अक्सर', score: 4 },
    { optionText: '5 - बहुत अच्छा / बहुत संतुष्ट / हमेशा', score: 5 }
  ],
  kannada: [
    { optionText: '1 - ಬಹಳ ಕೆಟ್ಟ / ತುಂಬಾ ಅಸಂತೃಪ್ತ / ಎಂದಿಗೂ ಅಲ್ಲ', score: 1 },
    { optionText: '2 - ಕೆಟ್ಟ / ಅಸಂತೃಪ್ತ / ಕೆಲವೊಮ್ಮೆ', score: 2 },
    { optionText: '3 - ಮಧ್ಯಮ / ಸಾಮಾನ್ಯವಾಗಿ', score: 3 },
    { optionText: '4 - ಚೆನ್ನಾಗಿದೆ / ತೃಪ್ತ / ಹೆಚ್ಚಾಗಿ', score: 4 },
    { optionText: '5 - ಅತ್ಯುತ್ತಮ / ತುಂಬಾ ತೃಪ್ತ / ಸದಾ', score: 5 }
  ]
};

function getWhoqolQuestions(language) {
  const lang = WHOQOL_QUESTIONS[language] ? language : 'english';
  return WHOQOL_QUESTIONS[lang].map((q, idx) => ({
    id: idx + 1,
    questionText: q,
    options: STANDARD_OPTIONS[lang].map(opt => ({ ...opt })),
    enabled: true
  }));
}

function buildDay3Config(language) {
  const translations = {
    english: {
      dayName: 'Day 3 - Quality of Life Assessment (WHOQOL)',
      testName: 'WHOQOL (Quality of Life)'
    },
    hindi: {
      dayName: 'दिन 3 - जीवन की गुणवत्ता मूल्यांकन (WHOQOL)',
      testName: 'WHOQOL (जीवन की गुणवत्ता)'
    },
    kannada: {
      dayName: 'ದಿನ 3 - ಜೀವನ ಗುಣಮಟ್ಟ ಮೌಲ್ಯಮಾಪನ (WHOQOL)',
      testName: 'WHOQOL (ಜೀವನ ಗುಣಮಟ್ಟ)'
    }
  };

  return {
    dayName: translations[language]?.dayName || translations.english.dayName,
    enabled: true,
    hasTest: true,
    defaultLevelKey: 'mild',
    testConfig: {
      testName: translations[language]?.testName || translations.english.testName,
      testType: 'custom', // use 'custom' to avoid enum validation issues
      questions: getWhoqolQuestions(language)
      // No scoreRanges - Day 3 is assessment only, results saved but don't determine content
    },
    // Universal content - duplicate across all levels since Day 3 has no burden-specific tasks
    // This ensures the API can find content regardless of caregiver's burden level
    contentByLevel: [
      {
        levelKey: 'mild',
        levelLabel: language === 'hindi' ? 'हल्का' : language === 'kannada' ? 'ಸೌಮ್ಯ' : 'Mild',
        tasks: []
      },
      {
        levelKey: 'moderate',
        levelLabel: language === 'hindi' ? 'मध्यम' : language === 'kannada' ? 'ಮಧ್ಯಮ' : 'Moderate',
        tasks: []
      },
      {
        levelKey: 'severe',
        levelLabel: language === 'hindi' ? 'गंभीर' : language === 'kannada' ? 'ತೀವ್ರ' : 'Severe',
        tasks: []
      }
    ]
  };
}

async function seedDay3Whoqol() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI is not defined in .env.local');

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

    const ProgramConfig = mongoose.models.ProgramConfig || mongoose.model(
      'ProgramConfig',
      new mongoose.Schema({}, { strict: false }),
      'programconfigs'
    );

    let config = await ProgramConfig.findOne({ configType: 'global' });
    if (!config) {
      console.log('⚠️ Global ProgramConfig not found. Creating new global config.');
      config = new ProgramConfig({ configType: 'global', dynamicDays: [] });
    }

    if (!Array.isArray(config.dynamicDays)) config.dynamicDays = [];

    const languages = ['english', 'hindi', 'kannada'];
    let inserted = 0, updated = 0;

    for (const lang of languages) {
      const dayConfig = buildDay3Config(lang);
      const idx = config.dynamicDays.findIndex(d => d.dayNumber === DAY_NUMBER && d.language === lang);

      if (idx >= 0) {
        console.log(`♻️ Updating Day ${DAY_NUMBER} (${lang})`);
        config.dynamicDays[idx] = { ...dayConfig, dayNumber: DAY_NUMBER, language: lang };
        updated++;
      } else {
        console.log(`➕ Inserting Day ${DAY_NUMBER} (${lang})`);
        config.dynamicDays.push({ ...dayConfig, dayNumber: DAY_NUMBER, language: lang });
        inserted++;
      }
    }

    // Sort entries
    config.dynamicDays.sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
      return (a.language || '').localeCompare(b.language || '');
    });

    config.markModified('dynamicDays');
    await config.save();

    console.log('\n✅ Day 3 WHOQOL assessment seeded successfully!');
    console.log(`   Inserted: ${inserted} | Updated: ${updated}`);
    // Number of questions per language (expected same for all languages)
    const questionCount = WHOQOL_QUESTIONS.english.length;
    console.log(`   Questions per language: ${questionCount}`);
    console.log('\nNext: run `node scripts/seed-day3-whoqol-assessment.js` to seed the DB.');
  } catch (err) {
    console.error('❌ Failed to seed Day 3 WHOQOL assessment:', err.message);
    console.error(err.stack || err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected.');
  }
}

seedDay3Whoqol();
