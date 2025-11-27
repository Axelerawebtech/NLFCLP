const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const DAY_NUMBER = 1;

// Zarit Burden Assessment - Standard Options for Questions 1-21
const STANDARD_OPTIONS = {
  english: [
    { optionText: 'Never', score: 0 },
    { optionText: 'Rarely', score: 1 },
    { optionText: 'Sometimes', score: 2 },
    { optionText: 'Quite Frequently', score: 3 },
    { optionText: 'Nearly Always', score: 4 }
  ],
  hindi: [
    { optionText: 'कभी नहीं', score: 0 },
    { optionText: 'बहुत ही कम', score: 1 },
    { optionText: 'कभी-कभी', score: 2 },
    { optionText: 'अक्‍सर ही', score: 3 },
    { optionText: 'लगभग हमेशा', score: 4 }
  ],
  kannada: [
    { optionText: 'ಎಂದಿಗೂ ಇಲ್ಲ', score: 0 },
    { optionText: 'ಅಪರೂಪವಾಗಿ', score: 1 },
    { optionText: 'ಕೆಲವೊಮ್ಮೆ', score: 2 },
    { optionText: 'ಆಗಾಗ', score: 3 },
    { optionText: 'ಹೆಚ್ಚುಕಡಿಮೆ ಯಾವಾಗಲೂ', score: 4 }
  ]
};

// Question 22 has different options
const QUESTION_22_OPTIONS = {
  english: [
    { optionText: 'Not at all', score: 0 },
    { optionText: 'A little', score: 1 },
    { optionText: 'Moderately', score: 2 },
    { optionText: 'Quite a bit', score: 3 },
    { optionText: 'Extremely', score: 4 }
  ],
  hindi: [
    { optionText: 'बिल्‍कुल नहीं', score: 0 },
    { optionText: 'थोड़ा-बहुत', score: 1 },
    { optionText: 'औसत', score: 2 },
    { optionText: 'काफ़ी', score: 3 },
    { optionText: 'बहुत अधिक', score: 4 }
  ],
  kannada: [
    { optionText: 'ಇಲ್ಲವೇ ಇಲ್ಲ', score: 0 },
    { optionText: 'ಸ್ವಲ್ಪ', score: 1 },
    { optionText: 'ಮಧ್ಯಮ', score: 2 },
    { optionText: 'ಸಾಕಷ್ಟು', score: 3 },
    { optionText: 'ತೀವ್ರವಾಗಿ', score: 4 }
  ]
};

// Zarit Burden Assessment Questions (All Languages)
const ZARIT_QUESTIONS = {
  english: [
    'Do you feel that your relative asks for more help than he or she needs?',
    'Do you feel that, because of the time you spend with your relative, you don\'t have enough time for yourself?',
    'Do you feel stressed between caring for your relative and trying to meet other responsibilities for your family or work?',
    'Do you feel embarrassed about your relative\'s behavior?',
    'Do you feel angry when you are around your relative?',
    'Do you feel that your relative currently affects your relationship with other family members?',
    'Are you afraid about what the future holds for your relative?',
    'Do you feel that your relative is dependent upon you?',
    'Do you feel strained when you are around your relative?',
    'Do you feel that your health has suffered because of your involvement with your relative?',
    'Do you feel that you don\'t have as much privacy as you would like, because of your relative?',
    'Do you feel that your social life has suffered because you are caring for your relative?',
    'Do you feel uncomfortable having your friends over because of your relative?',
    'Do you feel that your relative seems to expect you to take care of him or her, as if you were the only one he or she could depend on?',
    'Do you feel that you don\'t have enough money to care for your relative, in addition to the rest of your expenses?',
    'Do you feel that you will be unable to take care of your relative much longer?',
    'Do you feel that you have lost control of your life since your relative\'s illness?',
    'Do you wish that you could just leave the care of your relative to someone else?',
    'Do you feel uncertain about what to do about your relative?',
    'Do you feel that you should be doing more for your relative?',
    'Do you feel that you could do a better job in caring for your relative?',
    'Overall, how burdened do you feel in caring for your relative?'
  ],
  hindi: [
    'क्‍या आप महसूस करते हैं कि आपके/आपकी रिश्‍तेदार को जितनी मदद की ज़रूरत है वह उससे ज़्यादा मांगता/मांगती है?',
    'क्‍या आप महसूस करते हैं कि अपने/अपनी रिश्‍तेदार के साथ आप जो समय बिताते हैं उसके कारण आपके पास अपने लिए पर्याप्‍त समय नहीं बचता?',
    'क्‍या आप अपने/अपनी रिश्‍तेदार की देखभाल करने और अपने परिवार या कामकाज की दूसरी ज़ि‍म्‍मेदारियों को पूरा करने की कोशिश के कारण अपने आप को तनाव में महसूस करते हैं?',
    'क्‍या आप अपने/अपनी रिश्‍तेदार के व्‍यवहार के कारण शर्मिन्‍दगी महसूस करते हैं?',
    'जब आप अपने/अपनी रिश्‍तेदार के साथ होते हैं तो क्‍या आपको गुस्‍सा आता है?',
    'क्‍या आप महसूस करते हैं कि आपके/आपकी रिश्‍तेदार के कारण इस समय अपने परिवार के अन्‍य सदस्‍यों या दोस्‍तों के साथ आपके संबंधों पर बुरा असर पड़ रहा है?',
    'क्या अपने/अपनी रिश्‍तेदार के भविष्‍य को लेकर आप डरते हैं?',
    'क्‍या आप महसूस करते हैं कि आपका/आपकी रिश्‍तेदार आप पर निर्भर है?',
    'जब आप अपने/अपनी रिश्‍तेदार के साथ होते हैं तो क्‍या आप तनाव महसूस करते हैं?',
    'क्‍या आप महसूस करते हैं कि अपने/अपनी रिश्‍तेदार की देखभाल में लगे होने के कारण आपकी सेहत पर बुरा असर पड़ा है?',
    'क्‍या आप महसूस करते हैं कि अपने/अपनी रिश्‍तेदार के कारण आपको निजी गतिविधियों के लिए उतना समय नहीं मिल पाता है जितना आप चाहते हैं?',
    'क्‍या आप महसूस करते हैं कि अपने/अपनी रिश्‍तेदार की देखभाल के कारण आपके सामाजिक जीवन पर बुरा असर पड़ा है?',
    'क्‍या अपने/अपनी रिश्‍तेदार के कारण अपने दोस्‍तों को घर बुलाने में आप असुविधा महसूस करते हैं?',
    'क्‍या आप महसूस करते हैं कि आपका/आपकी रिश्‍तेदार आपसे इस तरह से देखभाल की उम्‍मीद करता/करती है, जैसे कि केवल आप ही हैं जिस पर वह निर्भर हो सकता/सकती है?',
    'क्‍या आप महसूस करते हैं कि अपने बाकी खर्चों के अलावा अपने/अपनी रिश्‍तेदार की देखभाल के लिए आपके पास पर्याप्‍त पैसे नहीं हैं?',
    'क्‍या आप महसूस करते हैं कि आप अब ज़्यादा दिनों तक अपने/अपनी रिश्‍तेदार की देखभाल नहीं कर पाएंगे?',
    'क्‍या आपको लगता है कि जबसे आपका/आपकी रिश्‍तेदार बीमार है तब से अपने जीवन पर आपका नियंत्रण नहीं रह गया है?',
    'क्‍या आप इच्‍छा करते हैं कि काश आप अपने/अपनी रिश्‍तेदार की देखभाल किसी और को सौंप सकते?',
    'क्‍या आप इस बात को लेकर अनिश्चित महसूस करते हैं कि अपने/अपनी रिश्‍तेदार के बारे में क्‍या करें?',
    'क्‍या आप महसूस करते हैं कि अपने/अपनी रिश्‍तेदार के लिए आपको और अधिक करना चाहिए?',
    'क्‍या आप महसूस करते हैं कि आप अपने/अपनी रिश्‍तेदार की देखभाल और बेहतर ढंग से कर सकते हैं?',
    'कुल मिलाकर, अपने/अपनी रिश्‍तेदार की देखभाल करने में आप कितना बोझ महसूस करते हैं?'
  ],
  kannada: [
    'ನಿಮ್ಮ ಸಂಬಂಧಿಯು ಅವನಿಗೆ/ಅವಳಿಗೆ ಅಗತ್ಯವಿರುವುದಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಸಹಾಯವನ್ನು ಕೇಳುತ್ತಾರೆ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ನಿಮ್ಮ ಸಂಬಂಧಿಯೊಂದಿಗೆ ನೀವು ಸಮಯ ಕಳೆಯುವುದರಿಂದ ನಿಮಗಾಗಿ ನಿಮ್ಮ ಬಳಿ ಸಾಕಷ್ಟು ಸಮಯವಿಲ್ಲವೆಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಳಜಿ ವಹಿಸುವುದು ಹಾಗೂ ನಿಮ್ಮ ಕುಟುಂಬ ಅಥವಾ ಕೆಲಸಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ಇತರ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಪೂರೈಸಲು ಪ್ರಯತ್ನಿಸುವುದರ ಕುರಿತು ನೀವು ಮಾನಸಿಕ ಒತ್ತಡ ಅನುಭವಿಸಿದಿರಾ?',
    'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ವರ್ತನೆಯಿಂದಾಗಿ ನಿಮಗೆ ಮುಜುಗರ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಸಮೀಪದಲ್ಲಿರುವಾಗ ನಿಮಗೆ ಸಿಟ್ಟು ಬರುತ್ತದೆಯೆ?',
    'ಕುಟುಂಬದ ಇತರ ಸದಸ್ಯರು, ಅಥವಾ ಸ್ನೇಹಿತರೊಂದಿಗಿನ ನಿಮ್ಮ ಸಂಬಂಧದ ಮೇಲೆ ಈಗ ನಿಮ್ಮ ಸಂಬಂಧಿಯು ನಕಾರಾತ್ಮಕ ಪರಿಣಾಮವನ್ನು ಮಾಡುತ್ತಿದ್ದಾರೆ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ನಿಮ್ಮ ಸಂಬಂಧಿಗೆ ಭವಿಷ್ಯದಲ್ಲಿ ಏನು ಕಾದಿದೆ ಎಂದು ನಿಮಗೆ ಭಯವಾಗುತ್ತಿದೆಯೆ?',
    'ನಿಮ್ಮ ಸಂಬಂಧಿ ನಿಮ್ಮ ಮೇಲೆ ಅವಲಂಬಿತನಾಗಿದ್ದಾನೆ/ಆಗಿದ್ದಾಳೆ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಸಮೀಪದಲ್ಲಿರುವಾಗ ಮಾನಸಿಕವಾಗಿ ದಣಿದಂತೆ ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ನಿಮ್ಮ ಸಂಬಂಧಿಯೊಂದಿಗಿನ ಒಡನಾಟದಿಂದಾಗಿ ನಿಮ್ಮ ಆರೋಗ್ಯದ ಮೇಲೆ ಕೆಟ್ಟ ಪರಿಣಾಮವಾಗಿದೆ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ನಿಮ್ಮ ಸಂಬಂಧಿಯಿಂದಾಗಿ, ನೀವು ಬಯಸಿದಷ್ಟು ಖಾಸಗಿತನ ನಿಮಗಿಲ್ಲ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ನೀವು ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಳಜಿ ವಹಿಸುತ್ತಿರುವುದರಿಂದ ನಿಮ್ಮ ಸಾಮಾಜಿಕ ಜೀವನಕ್ಕೆ ಧಕ್ಕೆ ಉಂಟಾಗಿದೆ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ನಿಮ್ಮ ಸಂಬಂಧಿಯಿಂದಾಗಿ, ನಿಮ್ಮ ಜೊತೆ ಸ್ನೇಹಿತರಿರುವುದು ನಿಮಗೆ ಅನನುಕೂಲ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ನಿಮ್ಮ ಸಂಬಂಧಿಗೆ, ಅವರು ಅವಲಂಬಿಸಬಹುದಾದವರು ನೀವು ಮಾತ್ರ ಎಂಬಂತೆ ನೀವು ಅವರ ಕಾಳಜಿ ವಹಿಸಬೇಕೆಂದು ನಿರೀಕ್ಷಿಸುವಂತೆ ತೋರುತ್ತದೆ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ನಿಮ್ಮ ಉಳಿದ ಖರ್ಚುಗಳ ಜೊತೆಗೆ, ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಳಜಿ ವಹಿಸಲು ನಿಮ್ಮಲ್ಲಿ ಸಾಕಷ್ಟು ಹಣ ಇಲ್ಲ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ಬಹಳ ಸಮಯದವರೆಗೆ ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಳಜಿ ವಹಿಸಲು ನಿಮ್ಮಿಂದ ಸಾಧ್ಯವಿಲ್ಲ ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಯಿಲೆಯ ಆರಂಭದಿಂದ ತೊಡಗಿ ನಿಮ್ಮ ಜೀವನದ ಮೇಲೆ ನೀವು ಹಿಡಿತವನ್ನು ಕಳೆದುಕೊಂಡಿದ್ದೀರೆಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಳಜಿಯನ್ನು ಬೇರೆ ಯಾರಿಗಾದರೂ ವಹಿಸಿಕೊಡುವಂತಿದ್ದರೆ ಚೆನ್ನಾಗಿತ್ತು ಎಂದು ನೀವು ಬಯಸುವಿರಾ?',
    'ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕುರಿತು ಏನು ಮಾಡಬೇಕು ಎಂದು ನಿಮಗೆ ಗೊಂದಲ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ನಿಮ್ಮ ಸಂಬಂಧಿಗಾಗಿ ಇನ್ನೂ ಹೆಚ್ಚಿನದನ್ನು ಮಾಡಬೇಕು ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ಇನ್ನೂ ಚೆನ್ನಾಗಿ ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಳಜಿ ವಹಿಸಬಹುದು ಎಂದು ನಿಮಗೆ ಅನ್ನಿಸುತ್ತದೆಯೆ?',
    'ಒಟ್ಟಾರೆಯಾಗಿ, ನಿಮ್ಮ ಸಂಬಂಧಿಯ ಕಾಳಜಿ ವಹಿಸುವುದು ನಿಮಗೆ ಎಷ್ಟು ಹೊರೆ ಅನ್ನಿಸಿದೆ?'
  ]
};

// Map questions to proper structure based on language
function getTestQuestions(language) {
  return ZARIT_QUESTIONS[language].map((questionText, index) => ({
    id: index + 1,
    questionText,
    options: (index === 21) ? QUESTION_22_OPTIONS[language].map(opt => ({ ...opt })) : STANDARD_OPTIONS[language].map(opt => ({ ...opt })),
    enabled: true
  }));
}

// Score ranges based on Zarit Burden Interview scoring
// Total possible score: 0-88 (22 questions × 4 points maximum)
const SCORE_RANGES = [
  {
    rangeName: 'burden_mild',
    label: 'Low Burden',
    minScore: 0,
    maxScore: 21,
    levelKey: 'mild'
  },
  {
    rangeName: 'burden_moderate',
    label: 'Moderate Burden',
    minScore: 22,
    maxScore: 40,
    levelKey: 'moderate'
  },
  {
    rangeName: 'burden_severe',
    label: 'Severe Burden',
    minScore: 41,
    maxScore: 88,
    levelKey: 'severe'
  }
];

// Content translations for different languages
const CONTENT_TRANSLATIONS = {
  english: {
    dayName: 'Day 1 - Caregiver Burden Assessment',
    testName: 'Zarit Burden Interview',
    mild: {
      levelLabel: 'Low Burden',
      greeting: {
        title: 'Welcome to Day 1',
        description: 'Begin your caregiving journey with awareness and support.',
        text: 'Welcome! Today we will help you understand your current caregiving burden and provide personalized support. Your well-being matters.'
      }
    },
    moderate: {
      levelLabel: 'Moderate Burden',
      motivation: {
        title: 'You Are Not Alone',
        description: 'Acknowledge the challenges you face.',
        text: 'Caregiving can be challenging, and it\'s okay to feel overwhelmed. Today we will work together to lighten your load.'
      }
    },
    severe: {
      levelLabel: 'Severe Burden',
      urgent: {
        title: 'Immediate Support',
        description: 'You need urgent support and care.',
        text: 'We recognize you are experiencing severe caregiver burden. Please know that help is available, and reaching out is a sign of strength.'
      }
    }
  },
  hindi: {
    dayName: 'दिन 1 - देखभालकर्ता बोझ मूल्यांकन',
    testName: 'ज़ारिट बोझ साक्षात्कार',
    mild: {
      levelLabel: 'कम बोझ',
      greeting: {
        title: 'दिन 1 में आपका स्वागत है',
        description: 'जागरूकता और समर्थन के साथ अपनी देखभाल यात्रा शुरू करें।',
        text: 'स्वागत है! आज हम आपकी वर्तमान देखभाल के बोझ को समझने में मदद करेंगे और व्यक्तिगत समर्थन प्रदान करेंगे। आपकी भलाई महत्वपूर्ण है।'
      }
    },
    moderate: {
      levelLabel: 'मध्यम बोझ',
      motivation: {
        title: 'आप अकेले नहीं हैं',
        description: 'अपनी चुनौतियों को स्वीकार करें।',
        text: 'देखभाल करना चुनौतीपूर्ण हो सकता है, और अभिभूत महसूस करना ठीक है। आज हम मिलकर आपका बोझ हल्का करने के लिए काम करेंगे।'
      }
    },
    severe: {
      levelLabel: 'गंभीर बोझ',
      urgent: {
        title: 'तत्काल सहायता',
        description: 'आपको तत्काल सहायता और देखभाल की आवश्यकता है।',
        text: 'हम पहचानते हैं कि आप गंभीर देखभालकर्ता बोझ का अनुभव कर रहे हैं। कृपया जानें कि मदद उपलब्ध है, और सहायता मांगना ताकत का संकेत है।'
      }
    }
  },
  kannada: {
    dayName: 'ದಿನ 1 - ಆರೈಕೆದಾರರ ಹೊರೆ ಮೌಲ್ಯಮಾಪನ',
    testName: 'ಜರಿಟ್ ಹೊರೆ ಸಂದರ್ಶನ',
    mild: {
      levelLabel: 'ಕಡಿಮೆ ಹೊರೆ',
      greeting: {
        title: 'ದಿನ 1 ಗೆ ಸ್ವಾಗತ',
        description: 'ಅರಿವು ಮತ್ತು ಬೆಂಬಲದೊಂದಿಗೆ ನಿಮ್ಮ ಆರೈಕೆ ಪ್ರಯಾಣವನ್ನು ಪ್ರಾರಂಭಿಸಿ.',
        text: 'ಸ್ವಾಗತ! ಇಂದು ನಾವು ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಆರೈಕೆ ಹೊರೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ವೈಯಕ್ತಿಕ ಬೆಂಬಲವನ್ನು ಒದಗಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ. ನಿಮ್ಮ ಯೋಗಕ್ಷೇಮ ಮುಖ್ಯವಾಗಿದೆ.'
      }
    },
    moderate: {
      levelLabel: 'ಮಧ್ಯಮ ಹೊರೆ',
      motivation: {
        title: 'ನೀವು ಏಕಾಂಗಿಯಾಗಿಲ್ಲ',
        description: 'ನೀವು ಎದುರಿಸುತ್ತಿರುವ ಸವಾಲುಗಳನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಿ.',
        text: 'ಆರೈಕೆ ಸವಾಲಾಗಿರಬಹುದು, ಮತ್ತು ಅತಿಯಾಗಿ ಅನಿಸುವುದು ಸರಿಯಾಗಿದೆ. ಇಂದು ನಾವು ನಿಮ್ಮ ಹೊರೆಯನ್ನು ಹಗುರಗೊಳಿಸಲು ಒಟ್ಟಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತೇವೆ.'
      }
    },
    severe: {
      levelLabel: 'ತೀವ್ರ ಹೊರೆ',
      urgent: {
        title: 'ತಕ್ಷಣದ ಬೆಂಬಲ',
        description: 'ನಿಮಗೆ ತುರ್ತು ಬೆಂಬಲ ಮತ್ತು ಆರೈಕೆ ಅಗತ್ಯವಿದೆ.',
        text: 'ನೀವು ತೀವ್ರ ಆರೈಕೆದಾರರ ಹೊರೆಯನ್ನು ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ ಎಂದು ನಾವು ಗುರುತಿಸುತ್ತೇವೆ. ದಯವಿಟ್ಟು ಸಹಾಯ ಲಭ್ಯವಿದೆ ಎಂದು ತಿಳಿಯಿರಿ, ಮತ್ತು ಸಹಾಯವನ್ನು ಕೋರುವುದು ಶಕ್ತಿಯ ಸಂಕೇತವಾಗಿದೆ.'
      }
    }
  }
};

// Task builders for each burden level
const buildTasks = {
  mild: (lang = 'english') => ([
    {
      taskId: 'day1_mild_greeting',
      taskOrder: 1,
      taskType: 'greeting-message',
      title: CONTENT_TRANSLATIONS[lang].mild.greeting.title,
      description: CONTENT_TRANSLATIONS[lang].mild.greeting.description,
      enabled: true,
      content: {
        textContent: CONTENT_TRANSLATIONS[lang].mild.greeting.text
      }
    },
    {
      taskId: 'day1_mild_reflection',
      taskOrder: 2,
      taskType: 'reflection-prompt',
      title: 'Daily Reflection',
      description: 'Take a moment to check in with yourself.',
      enabled: true,
      content: {
        reflectionQuestion: 'What is one small thing you did for yourself today?'
      }
    },
    {
      taskId: 'day1_mild_activity',
      taskOrder: 3,
      taskType: 'activity-selector',
      title: 'Self-Care Activity',
      description: 'Choose an activity to nurture yourself today.',
      enabled: true,
      content: {
        activities: [
          { activityName: 'Take a 10-minute walk' },
          { activityName: 'Practice deep breathing for 5 minutes' },
          { activityName: 'Call a friend for support' }
        ]
      }
    },
    {
      taskId: 'day1_mild_reminder',
      taskOrder: 4,
      taskType: 'reminder',
      title: 'Daily Check-in',
      description: 'Remember to take care of yourself.',
      enabled: true,
      content: {
        reminderMessage: 'Take a few moments for yourself today.',
        frequency: 'daily',
        reminderTime: '09:00',
        targetAudience: 'caregiver',
        targetLevels: ['mild']
      }
    }
  ]),
  moderate: (lang = 'english') => ([
    {
      taskId: 'day1_mod_motivation',
      taskOrder: 1,
      taskType: 'motivation-message',
      title: CONTENT_TRANSLATIONS[lang].moderate.motivation.title,
      description: CONTENT_TRANSLATIONS[lang].moderate.motivation.description,
      enabled: true,
      content: {
        textContent: CONTENT_TRANSLATIONS[lang].moderate.motivation.text
      }
    },
    {
      taskId: 'day1_mod_feelings',
      taskOrder: 2,
      taskType: 'feeling-check',
      title: 'Emotional Check-in',
      description: 'How are you feeling today?',
      enabled: true,
      content: {
        feelingQuestion: 'What emotion is most present for you right now?'
      }
    },
    {
      taskId: 'day1_mod_journal',
      taskOrder: 3,
      taskType: 'interactive-field',
      title: 'Stress Journal',
      description: 'Write about what is weighing on you.',
      enabled: true,
      content: {
        fieldType: 'textarea',
        placeholder: 'Describe one challenge you faced today and how you handled it...'
      }
    },
    {
      taskId: 'day1_mod_activity',
      taskOrder: 4,
      taskType: 'activity-selector',
      title: 'Coping Strategy',
      description: 'Choose a coping mechanism to practice.',
      enabled: true,
      content: {
        activities: [
          { activityName: 'Journal your feelings for 15 minutes' },
          { activityName: 'Practice progressive muscle relaxation' },
          { activityName: 'Reach out to a support group' }
        ]
      }
    },
    {
      taskId: 'day1_mod_reminder',
      taskOrder: 5,
      taskType: 'reminder',
      title: 'Self-Care Reminder',
      description: 'Don\'t forget to prioritize yourself.',
      enabled: true,
      content: {
        reminderMessage: 'Remember: You cannot pour from an empty cup. Take time for self-care.',
        frequency: 'daily',
        reminderTime: '18:00',
        targetAudience: 'caregiver',
        targetLevels: ['moderate']
      }
    }
  ]),
  severe: (lang = 'english') => ([
    {
      taskId: 'day1_sev_urgent',
      taskOrder: 1,
      taskType: 'motivation-message',
      title: CONTENT_TRANSLATIONS[lang].severe.urgent.title,
      description: CONTENT_TRANSLATIONS[lang].severe.urgent.description,
      enabled: true,
      content: {
        textContent: CONTENT_TRANSLATIONS[lang].severe.urgent.text
      }
    },
    {
      taskId: 'day1_sev_feelings',
      taskOrder: 2,
      taskType: 'feeling-check',
      title: 'Crisis Check',
      description: 'Identify your immediate needs.',
      enabled: true,
      content: {
        feelingQuestion: 'What do you need most urgently right now? (Support, rest, someone to talk to, medical help, etc.)'
      }
    },
    {
      taskId: 'day1_sev_emergency',
      taskOrder: 3,
      taskType: 'interactive-field',
      title: 'Emergency Contact Plan',
      description: 'List people who can help you immediately.',
      enabled: true,
      content: {
        fieldType: 'textarea',
        placeholder: 'Name and phone number of 2-3 people who can provide immediate support or respite care...'
      }
    },
    {
      taskId: 'day1_sev_checklist',
      taskOrder: 4,
      taskType: 'task-checklist',
      title: 'Urgent Actions',
      description: 'Essential steps to take today.',
      enabled: true,
      content: {
        checklistQuestion: 'Have you reached out to at least one support person or resource today?'
      }
    },
    {
      taskId: 'day1_sev_activity',
      taskOrder: 5,
      taskType: 'activity-selector',
      title: 'Immediate Relief',
      description: 'Choose one action for immediate relief.',
      enabled: true,
      content: {
        activities: [
          { activityName: 'Call a crisis helpline for caregivers' },
          { activityName: 'Arrange respite care for the next 24 hours' },
          { activityName: 'Contact your healthcare provider about caregiver burnout' }
        ]
      }
    },
    {
      taskId: 'day1_sev_reminder',
      taskOrder: 6,
      taskType: 'reminder',
      title: 'Critical Care Reminder',
      description: 'Your well-being is critical.',
      enabled: true,
      content: {
        reminderMessage: 'URGENT: Check in with your support system. You deserve help and rest.',
        frequency: 'daily',
        reminderTime: '10:00',
        targetAudience: 'caregiver',
        targetLevels: ['severe'],
        customInterval: 1
      }
    }
  ])
};

function buildDay1Config(language) {
  const translations = CONTENT_TRANSLATIONS[language];
  return {
    dayName: translations.dayName,
    enabled: true,
    hasTest: true,
    defaultLevelKey: 'mild',
    testConfig: {
      testName: translations.testName,
      testType: 'burden-assessment',
      questions: getTestQuestions(language),
      scoreRanges: SCORE_RANGES
    },
    contentByLevel: [
      {
        levelKey: 'mild',
        levelLabel: translations.mild.levelLabel,
        tasks: buildTasks.mild(language)
      },
      {
        levelKey: 'moderate',
        levelLabel: translations.moderate.levelLabel,
        tasks: buildTasks.moderate(language)
      },
      {
        levelKey: 'severe',
        levelLabel: translations.severe.levelLabel,
        tasks: buildTasks.severe(language)
      }
    ]
  };
}

async function seedDay1BurdenAssessment() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined. Add it to .env.local');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    const ProgramConfig = mongoose.models.ProgramConfig || mongoose.model(
      'ProgramConfig',
      new mongoose.Schema({}, { strict: false }),
      'programconfigs'
    );

    let config = await ProgramConfig.findOne({ configType: 'global' });
    if (!config) {
      console.log('⚠️  Global ProgramConfig not found. Creating a new one.');
      config = new ProgramConfig({ configType: 'global', dynamicDays: [] });
    }

    if (!Array.isArray(config.dynamicDays)) {
      config.dynamicDays = [];
    }

    const languages = ['english', 'hindi', 'kannada'];
    let insertedCount = 0;
    let updatedCount = 0;

    for (const language of languages) {
      const newDayConfig = buildDay1Config(language);
      const existingIndex = config.dynamicDays.findIndex(
        (entry) => entry.dayNumber === DAY_NUMBER && entry.language === language
      );

      if (existingIndex >= 0) {
        console.log(`♻️  Updating existing Day ${DAY_NUMBER} (${language}) configuration...`);
        config.dynamicDays[existingIndex] = {
          ...newDayConfig,
          dayNumber: DAY_NUMBER,
          language: language
        };
        updatedCount++;
      } else {
        console.log(`➕ Inserting new Day ${DAY_NUMBER} (${language}) configuration...`);
        config.dynamicDays.push({
          ...newDayConfig,
          dayNumber: DAY_NUMBER,
          language: language
        });
        insertedCount++;
      }
    }

    config.dynamicDays.sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
      return a.language.localeCompare(b.language);
    });

    config.markModified('dynamicDays');
    await config.save();

    console.log('\n✅ Day 1 Zarit Burden Assessment saved successfully!');
    console.log(`   • Languages: English, Hindi, Kannada`);
    console.log(`   • Inserted: ${insertedCount} | Updated: ${updatedCount}`);
    console.log(`   • Total questions per language: 22`);
    console.log(`   • Maximum score: 88 points`);
    console.log('   • Score ranges configured:');
    SCORE_RANGES.forEach(range => {
      console.log(`     - ${range.label}: ${range.minScore}-${range.maxScore} points (${range.levelKey})`);
    });
    console.log('\n📋 Next Steps:');
    console.log('   1. Run this script: node scripts/seed-day1-burden-assessment.js');
    console.log('   2. Navigate to the caregiver dashboard');
    console.log('   3. Select your preferred language (English/Hindi/Kannada)');
    console.log('   4. Start Day 1 to see the Zarit Burden Assessment');
    console.log('   5. Complete the assessment to receive personalized tasks\n');
  } catch (error) {
    console.error('❌ Failed to seed Day 1 Burden Assessment:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed.');
  }
}

// Run the seeding function
seedDay1BurdenAssessment();
