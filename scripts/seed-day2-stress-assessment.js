const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

const DAY_NUMBER = 2;

// Stress Management Assessment - Standard Options (DASS-21 Stress Scale)
const STANDARD_OPTIONS = {
  english: [
    { optionText: 'Did not apply to me at all', score: 0 },
    { optionText: 'Applied to me to some degree, or some of the time', score: 1 },
    { optionText: 'Applied to me to a considerable degree or a good part of time', score: 2 },
    { optionText: 'Applied to me very much or most of the time', score: 3 }
  ],
  hindi: [
    { optionText: '0 - बिल्कुल लागू नहीं हुआ', score: 0 },
    { optionText: '1 - कुछ हद तक लागू हुआ', score: 1 },
    { optionText: '2 - काफी हद तक लागू हुआ', score: 2 },
    { optionText: '3 - बहुत अधिक या अधिकतर समय लागू हुआ', score: 3 }
  ],
  kannada: [
    { optionText: '0 - ನನಗೆ ಇದು ಸಂಪೂರ್ಣವಾಗಿ ಅನ್ವಯಿಸಲಿಲ್ಲ', score: 0 },
    { optionText: '1 - ಸ್ವಲ್ಪ ಮಟ್ಟಿಗೆ ಅಥವಾ ಕೆಲವು ಸಮಯ ಅನ್ವಯಿಸಿತು', score: 1 },
    { optionText: '2 - ಗಣನೀಯ ಮಟ್ಟಿಗೆ ಅಥವಾ ಹೆಚ್ಚಿನ ಸಮಯ ಅನ್ವಯಿಸಿತು', score: 2 },
    { optionText: '3 - ತುಂಬಾ ಹೆಚ್ಚು ಅಥವಾ ಹೆಚ್ಚಿನ ಸಮಯ ಅನ್ವಯಿಸಿತು', score: 3 }
  ]
};

// Stress Management Assessment Questions (All Languages)
const STRESS_QUESTIONS = {
  english: [
    'I found it hard to wind down',
    'I tended to over-react to situations',
    'I felt that I was using a lot of nervous energy',
    'I found myself getting agitated',
    'I found it difficult to relax',
    'I was intolerant of anything that kept me from getting on with what I was doing',
    'I felt that I was rather touchy'
  ],
  hindi: [
    'मुझे आराम करने में मुश्किल हो रही थी',
    'मैं परिस्थितियों पर अति प्रतिक्रिया करने के लिए प्रवृत्त हुआ',
    'मुझे लगा कि मैं बहुत अधिक नर्वस एनर्जी (तंत्रिका ऊर्जा) का उपयोग कर रहा था',
    'मैंने अपने आप को व्यथित पाया',
    'मुझे आराम करना मुश्किल लगा',
    'मैं जो कुछ कर रहा था उसमें बाध्य रूप कोई भी चीज़ के प्रति मैं असहिष्णु था',
    'मुझे लगा कि मैं यूँही अतिभावुक था'
  ],
  kannada: [
    'ನನಗೆ ನನ್ನನ್ನು ಶಾಂತಗೊಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
    'ನಾನು ಸನ್ನಿವೇಶಗಳಿಗೆ ಅತಿಯಾಗಿ ಸ್ಪಂದಿಸುತ್ತಿದ್ದೆ',
    'ನಾನು ಹೆಚ್ಚು ಆತಂಕಕೊಳಗಾಗಿದ್ದೀನೆ ಎನಿಸುತ್ತಿತ್ತು',
    'ನನಗೆ ಕೋಪ ಉಂಟಾಗುವುದು ಮತ್ತು ಮಾನಸಿಕವಾಗಿ ಅಸ್ವಸ್ಥನಾಗುವುದು ತಿಳಿದುಬಂತು',
    'ನನಗೆ ಆತಂಕರಹಿತವಾಗಿರಲು ಕಷ್ಟವೆನಿಸುತ್ತಿತ್ತು',
    'ನಾನು ಮಾಡುವ ಕೆಲಸಕ್ಕೆ ಅಡ್ಡಬರುವ ಯಾವುದೇ ವಿಷಯದ ಬಗ್ಗೆ ನನಗೆ ಅಸಹಿಷ್ಣುತೆಯಿತ್ತು',
    'ನಾನು ಹೆಚ್ಚು ಸೂಕ್ಷ್ಮ ಮನಸ್ಸಿನವನು ಎನಿಸುತ್ತಿತ್ತು'
  ]
};

// Map questions to proper structure based on language
function getTestQuestions(language) {
  return STRESS_QUESTIONS[language].map((questionText, index) => ({
    id: index + 1,
    questionText,
    options: STANDARD_OPTIONS[language].map(opt => ({ ...opt })),
    enabled: true
  }));
}

// Score ranges based on DASS-21 Stress Scale
// Total possible score: 0-21 (7 questions × 3 points maximum)
const SCORE_RANGES = [
  {
    rangeName: 'stress_normal',
    label: 'Normal Stress',
    minScore: 0,
    maxScore: 7,
    levelKey: 'mild'
  },
  {
    rangeName: 'stress_moderate',
    label: 'Moderate Stress',
    minScore: 8,
    maxScore: 12,
    levelKey: 'moderate'
  },
  {
    rangeName: 'stress_severe',
    label: 'Severe Stress',
    minScore: 13,
    maxScore: 21,
    levelKey: 'severe'
  }
];

// Content translations for different languages
const CONTENT_TRANSLATIONS = {
  english: {
    dayName: 'Day 2 - Stress Management Assessment',
    testName: 'DASS-21 Stress Scale',
    mild: {
      levelLabel: 'Normal Stress Level',
      greeting: {
        title: 'Welcome to Day 2',
        description: 'Understanding your stress levels for better management.',
        text: 'Great job! Your stress levels are within a normal range. Today we will help you maintain this balance and build resilience.'
      }
    },
    moderate: {
      levelLabel: 'Moderate Stress',
      motivation: {
        title: 'Managing Your Stress',
        description: 'Let\'s work on reducing your stress levels.',
        text: 'You are experiencing moderate stress. Together, we will explore practical strategies to help you regain balance and calm.'
      }
    },
    severe: {
      levelLabel: 'Severe Stress',
      urgent: {
        title: 'Immediate Stress Relief',
        description: 'You need urgent stress management support.',
        text: 'Your stress levels are high and need immediate attention. Please know that help is available, and we will guide you through relief strategies.'
      }
    }
  },
  hindi: {
    dayName: 'दिन 2 - तनाव प्रबंधन मूल्यांकन',
    testName: 'DASS-21 तनाव स्केल',
    mild: {
      levelLabel: 'सामान्य तनाव स्तर',
      greeting: {
        title: 'दिन 2 में आपका स्वागत है',
        description: 'बेहतर प्रबंधन के लिए अपने तनाव स्तर को समझें।',
        text: 'बहुत अच्छा! आपका तनाव स्तर सामान्य सीमा के भीतर है। आज हम इस संतुलन को बनाए रखने और लचीलापन बनाने में आपकी मदद करेंगे।'
      }
    },
    moderate: {
      levelLabel: 'मध्यम तनाव',
      motivation: {
        title: 'अपने तनाव का प्रबंधन',
        description: 'आइए अपने तनाव के स्तर को कम करने पर काम करें।',
        text: 'आप मध्यम तनाव का अनुभव कर रहे हैं। साथ मिलकर, हम आपको संतुलन और शांति पुनः प्राप्त करने में मदद करने के लिए व्यावहारिक रणनीतियों का पता लगाएंगे।'
      }
    },
    severe: {
      levelLabel: 'गंभीर तनाव',
      urgent: {
        title: 'तत्काल तनाव राहत',
        description: 'आपको तत्काल तनाव प्रबंधन सहायता की आवश्यकता है।',
        text: 'आपका तनाव स्तर उच्च है और तत्काल ध्यान देने की आवश्यकता है। कृपया जानें कि मदद उपलब्ध है, और हम राहत रणनीतियों के माध्यम से आपका मार्गदर्शन करेंगे।'
      }
    }
  },
  kannada: {
    dayName: 'ದಿನ 2 - ಒತ್ತಡ ನಿರ್ವಹಣೆ ಮೌಲ್ಯಮಾಪನ',
    testName: 'DASS-21 ಒತ್ತಡ ಮಾಪಕ',
    mild: {
      levelLabel: 'ಸಾಮಾನ್ಯ ಒತ್ತಡ ಮಟ್ಟ',
      greeting: {
        title: 'ದಿನ 2 ಗೆ ಸ್ವಾಗತ',
        description: 'ಉತ್ತಮ ನಿರ್ವಹಣೆಗಾಗಿ ನಿಮ್ಮ ಒತ್ತಡ ಮಟ್ಟವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.',
        text: 'ಅದ್ಭುತ! ನಿಮ್ಮ ಒತ್ತಡ ಮಟ್ಟಗಳು ಸಾಮಾನ್ಯ ವ್ಯಾಪ್ತಿಯಲ್ಲಿವೆ. ಇಂದು ನಾವು ಈ ಸಮತೋಲನವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಲು ಮತ್ತು ಸ್ಥಿತಿಸ್ಥಾಪಕತ್ವವನ್ನು ನಿರ್ಮಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತೇವೆ.'
      }
    },
    moderate: {
      levelLabel: 'ಮಧ್ಯಮ ಒತ್ತಡ',
      motivation: {
        title: 'ನಿಮ್ಮ ಒತ್ತಡವನ್ನು ನಿರ್ವಹಿಸುವುದು',
        description: 'ನಿಮ್ಮ ಒತ್ತಡದ ಮಟ್ಟವನ್ನು ಕಡಿಮೆ ಮಾಡುವ ಕುರಿತು ಕೆಲಸ ಮಾಡೋಣ.',
        text: 'ನೀವು ಮಧ್ಯಮ ಒತ್ತಡವನ್ನು ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ. ಒಟ್ಟಾಗಿ, ನೀವು ಸಮತೋಲನ ಮತ್ತು ಶಾಂತತೆಯನ್ನು ಮರಳಿ ಪಡೆಯಲು ಸಹಾಯ ಮಾಡಲು ನಾವು ಪ್ರಾಯೋಗಿಕ ತಂತ್ರಗಳನ್ನು ಅನ್ವೇಷಿಸುತ್ತೇವೆ.'
      }
    },
    severe: {
      levelLabel: 'ತೀವ್ರ ಒತ್ತಡ',
      urgent: {
        title: 'ತಕ್ಷಣದ ಒತ್ತಡ ಪರಿಹಾರ',
        description: 'ನಿಮಗೆ ತುರ್ತು ಒತ್ತಡ ನಿರ್ವಹಣೆ ಬೆಂಬಲ ಅಗತ್ಯವಿದೆ.',
        text: 'ನಿಮ್ಮ ಒತ್ತಡದ ಮಟ್ಟಗಳು ಹೆಚ್ಚಿವೆ ಮತ್ತು ತಕ್ಷಣದ ಗಮನದ ಅಗತ್ಯವಿದೆ. ದಯವಿಟ್ಟು ಸಹಾಯ ಲಭ್ಯವಿದೆ ಎಂದು ತಿಳಿಯಿರಿ, ಮತ್ತು ಪರಿಹಾರ ತಂತ್ರಗಳ ಮೂಲಕ ನಾವು ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇವೆ.'
      }
    }
  }
};

// Task builders for each stress level
const buildTasks = {
  mild: (lang = 'english') => ([
    {
      taskId: 'day2_mild_greeting',
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
      taskId: 'day2_mild_reflection',
      taskOrder: 2,
      taskType: 'reflection-prompt',
      title: lang === 'english' ? 'Stress Awareness' : lang === 'hindi' ? 'तनाव जागरूकता' : 'ಒತ್ತಡ ಅರಿವು',
      description: lang === 'english' ? 'Reflect on your stress triggers' : lang === 'hindi' ? 'अपने तनाव ट्रिगर्स पर विचार करें' : 'ನಿಮ್ಮ ಒತ್ತಡದ ಪ್ರಚೋದಕಗಳ ಬಗ್ಗೆ ಯೋಚಿಸಿ',
      enabled: true,
      content: {
        reflectionQuestion: lang === 'english' 
          ? 'What helps you feel calm and centered during stressful moments?' 
          : lang === 'hindi' 
          ? 'तनावपूर्ण क्षणों के दौरान आपको शांत और केंद्रित महसूस करने में क्या मदद करता है?'
          : 'ಒತ್ತಡದ ಕ್ಷಣಗಳಲ್ಲಿ ನಿಮಗೆ ಶಾಂತ ಮತ್ತು ಕೇಂದ್ರೀಕೃತವಾಗಿ ಅನಿಸಲು ಏನು ಸಹಾಯ ಮಾಡುತ್ತದೆ?'
      }
    },
    {
      taskId: 'day2_mild_activity',
      taskOrder: 3,
      taskType: 'activity-selector',
      title: lang === 'english' ? 'Stress Prevention' : lang === 'hindi' ? 'तनाव रोकथाम' : 'ಒತ್ತಡ ತಡೆಗಟ್ಟುವಿಕೆ',
      description: lang === 'english' ? 'Choose a preventive practice' : lang === 'hindi' ? 'एक निवारक अभ्यास चुनें' : 'ತಡೆಗಟ್ಟುವ ಅಭ್ಯಾಸವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      enabled: true,
      content: {
        activities: lang === 'english' ? [
          { activityName: 'Practice 5-minute mindful breathing' },
          { activityName: 'Take a short nature walk' },
          { activityName: 'Listen to calming music' }
        ] : lang === 'hindi' ? [
          { activityName: '5 मिनट माइंडफुल श्वास अभ्यास करें' },
          { activityName: 'एक छोटी प्रकृति सैर करें' },
          { activityName: 'शांत संगीत सुनें' }
        ] : [
          { activityName: '5 ನಿಮಿಷ ಮೈಂಡ್‌ಫುಲ್ ಉಸಿರಾಟವನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ' },
          { activityName: 'ಸಣ್ಣ ಪ್ರಕೃತಿ ನಡಿಗೆ ಮಾಡಿ' },
          { activityName: 'ಶಾಂತ ಸಂಗೀತವನ್ನು ಕೇಳಿ' }
        ]
      }
    },
    {
      taskId: 'day2_mild_reminder',
      taskOrder: 4,
      taskType: 'reminder',
      title: lang === 'english' ? 'Relaxation Reminder' : lang === 'hindi' ? 'विश्राम अनुस्मारक' : 'ವಿಶ್ರಾಂತಿ ಜ್ಞಾಪನೆ',
      description: lang === 'english' ? 'Daily stress check' : lang === 'hindi' ? 'दैनिक तनाव जांच' : 'ದೈನಂದಿನ ಒತ್ತಡ ಪರಿಶೀಲನೆ',
      enabled: true,
      content: {
        reminderMessage: lang === 'english' 
          ? 'Take 3 deep breaths and check in with yourself.'
          : lang === 'hindi'
          ? '3 गहरी सांसें लें और अपने साथ जांच करें।'
          : '3 ಆಳವಾದ ಉಸಿರಾಟಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ ಮತ್ತು ನಿಮ್ಮೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.',
        frequency: 'daily',
        reminderTime: '14:00',
        targetAudience: 'caregiver',
        targetLevels: ['mild']
      }
    }
  ]),
  moderate: (lang = 'english') => ([
    {
      taskId: 'day2_mod_motivation',
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
      taskId: 'day2_mod_feelings',
      taskOrder: 2,
      taskType: 'feeling-check',
      title: lang === 'english' ? 'Stress Inventory' : lang === 'hindi' ? 'तनाव सूची' : 'ಒತ್ತಡ ದಾಸ್ತಾನು',
      description: lang === 'english' ? 'Identify your main stressors' : lang === 'hindi' ? 'अपने मुख्य तनाव कारकों की पहचान करें' : 'ನಿಮ್ಮ ಮುಖ್ಯ ಒತ್ತಡಕಾರಕಗಳನ್ನು ಗುರುತಿಸಿ',
      enabled: true,
      content: {
        feelingQuestion: lang === 'english'
          ? 'What is causing you the most stress right now?'
          : lang === 'hindi'
          ? 'अभी आपको सबसे अधिक तनाव किस बात से हो रहा है?'
          : 'ಇದೀಗ ನಿಮಗೆ ಹೆಚ್ಚು ಒತ್ತಡವನ್ನು ಉಂಟುಮಾಡುತ್ತಿರುವುದು ಯಾವುದು?'
      }
    },
    {
      taskId: 'day2_mod_journal',
      taskOrder: 3,
      taskType: 'interactive-field',
      title: lang === 'english' ? 'Stress Journal' : lang === 'hindi' ? 'तनाव पत्रिका' : 'ಒತ್ತಡ ಜರ್ನಲ್',
      description: lang === 'english' ? 'Document stress patterns' : lang === 'hindi' ? 'तनाव पैटर्न दस्तावेज़ करें' : 'ಒತ್ತಡದ ಮಾದರಿಗಳನ್ನು ದಾಖಲಿಸಿ',
      enabled: true,
      content: {
        fieldType: 'textarea',
        placeholder: lang === 'english'
          ? 'Describe a stressful situation today and how you responded...'
          : lang === 'hindi'
          ? 'आज की एक तनावपूर्ण स्थिति का वर्णन करें और आपने कैसे प्रतिक्रिया दी...'
          : 'ಇಂದಿನ ಒತ್ತಡದ ಪರಿಸ್ಥಿತಿಯನ್ನು ಮತ್ತು ನೀವು ಹೇಗೆ ಪ್ರತಿಕ್ರಿಯಿಸಿದ್ದೀರಿ ಎಂಬುದನ್ನು ವಿವರಿಸಿ...'
      }
    },
    {
      taskId: 'day2_mod_activity',
      taskOrder: 4,
      taskType: 'activity-selector',
      title: lang === 'english' ? 'Stress Relief Techniques' : lang === 'hindi' ? 'तनाव राहत तकनीक' : 'ಒತ್ತಡ ಪರಿಹಾರ ತಂತ್ರಗಳು',
      description: lang === 'english' ? 'Choose a stress-relief practice' : lang === 'hindi' ? 'तनाव-राहत अभ्यास चुनें' : 'ಒತ್ತಡ-ಪರಿಹಾರ ಅಭ್ಯಾಸವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      enabled: true,
      content: {
        activities: lang === 'english' ? [
          { activityName: 'Progressive muscle relaxation (15 min)' },
          { activityName: 'Guided meditation session' },
          { activityName: 'Physical exercise or yoga' }
        ] : lang === 'hindi' ? [
          { activityName: 'प्रगतिशील मांसपेशी विश्राम (15 मिनट)' },
          { activityName: 'निर्देशित ध्यान सत्र' },
          { activityName: 'शारीरिक व्यायाम या योग' }
        ] : [
          { activityName: 'ಪ್ರಗತಿಶೀಲ ಸ್ನಾಯು ವಿಶ್ರಾಂತಿ (15 ನಿಮಿಷ)' },
          { activityName: 'ಮಾರ್ಗದರ್ಶಿ ಧ್ಯಾನ ಸತ್ರ' },
          { activityName: 'ದೈಹಿಕ ವ್ಯಾಯಾಮ ಅಥವಾ ಯೋಗ' }
        ]
      }
    },
    {
      taskId: 'day2_mod_reminder',
      taskOrder: 5,
      taskType: 'reminder',
      title: lang === 'english' ? 'Stress Management Reminder' : lang === 'hindi' ? 'तनाव प्रबंधन अनुस्मारक' : 'ಒತ್ತಡ ನಿರ್ವಹಣೆ ಜ್ಞಾಪನೆ',
      description: lang === 'english' ? 'Practice stress relief' : lang === 'hindi' ? 'तनाव राहत का अभ्यास करें' : 'ಒತ್ತಡ ಪರಿಹಾರವನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ',
      enabled: true,
      content: {
        reminderMessage: lang === 'english'
          ? 'Take a 10-minute break for stress relief activities.'
          : lang === 'hindi'
          ? 'तनाव राहत गतिविधियों के लिए 10 मिनट का ब्रेक लें।'
          : 'ಒತ್ತಡ ಪರಿಹಾರ ಚಟುವಟಿಕೆಗಳಿಗಾಗಿ 10 ನಿಮಿಷಗಳ ವಿರಾಮ ತೆಗೆದುಕೊಳ್ಳಿ.',
        frequency: 'daily',
        reminderTime: '16:00',
        targetAudience: 'caregiver',
        targetLevels: ['moderate']
      }
    }
  ]),
  severe: (lang = 'english') => ([
    {
      taskId: 'day2_sev_urgent',
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
      taskId: 'day2_sev_feelings',
      taskOrder: 2,
      taskType: 'feeling-check',
      title: lang === 'english' ? 'Urgent Stress Check' : lang === 'hindi' ? 'तत्काल तनाव जांच' : 'ತುರ್ತು ಒತ್ತಡ ಪರಿಶೀಲನೆ',
      description: lang === 'english' ? 'Assess your immediate needs' : lang === 'hindi' ? 'अपनी तत्काल आवश्यकताओं का आकलन करें' : 'ನಿಮ್ಮ ತತ್ಕ್ಷಣದ ಅಗತ್ಯಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ',
      enabled: true,
      content: {
        feelingQuestion: lang === 'english'
          ? 'What do you need most urgently to feel less stressed right now?'
          : lang === 'hindi'
          ? 'अभी कम तनाव महसूस करने के लिए आपको सबसे अधिक तत्काल क्या चाहिए?'
          : 'ಇದೀಗ ಕಡಿಮೆ ಒತ್ತಡವನ್ನು ಅನುಭವಿಸಲು ನಿಮಗೆ ಅತ್ಯಂತ ತುರ್ತಾಗಿ ಏನು ಬೇಕು?'
      }
    },
    {
      taskId: 'day2_sev_emergency',
      taskOrder: 3,
      taskType: 'interactive-field',
      title: lang === 'english' ? 'Crisis Support Plan' : lang === 'hindi' ? 'संकट सहायता योजना' : 'ಬಿಕ್ಕಟ್ಟು ಬೆಂಬಲ ಯೋಜನೆ',
      description: lang === 'english' ? 'Create an immediate action plan' : lang === 'hindi' ? 'तत्काल कार्य योजना बनाएं' : 'ತಕ್ಷಣದ ಕ್ರಿಯಾ ಯೋಜನೆಯನ್ನು ರಚಿಸಿ',
      enabled: true,
      content: {
        fieldType: 'textarea',
        placeholder: lang === 'english'
          ? 'List 2-3 people you can contact for immediate support or respite...'
          : lang === 'hindi'
          ? 'तत्काल समर्थन या राहत के लिए 2-3 लोगों की सूची बनाएं जिनसे आप संपर्क कर सकते हैं...'
          : 'ತಕ್ಷಣದ ಬೆಂಬಲ ಅಥವಾ ವಿರಾಮಕ್ಕಾಗಿ ನೀವು ಸಂಪರ್ಕಿಸಬಹುದಾದ 2-3 ಜನರನ್ನು ಪಟ್ಟಿ ಮಾಡಿ...'
      }
    },
    {
      taskId: 'day2_sev_checklist',
      taskOrder: 4,
      taskType: 'task-checklist',
      title: lang === 'english' ? 'Immediate Actions' : lang === 'hindi' ? 'तत्काल कार्य' : 'ತಕ್ಷಣದ ಕ್ರಿಯೆಗಳು',
      description: lang === 'english' ? 'Essential stress relief steps' : lang === 'hindi' ? 'आवश्यक तनाव राहत कदम' : 'ಅತ್ಯಗತ್ಯ ಒತ್ತಡ ಪರಿಹಾರ ಹಂತಗಳು',
      enabled: true,
      content: {
        checklistQuestion: lang === 'english'
          ? 'Have you practiced at least one stress-relief technique in the last 2 hours?'
          : lang === 'hindi'
          ? 'क्या आपने पिछले 2 घंटों में कम से कम एक तनाव-राहत तकनीक का अभ्यास किया है?'
          : 'ಕಳೆದ 2 ಗಂಟೆಗಳಲ್ಲಿ ನೀವು ಕನಿಷ್ಠ ಒಂದು ಒತ್ತಡ-ಪರಿಹಾರ ತಂತ್ರವನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿದ್ದೀರಾ?'
      }
    },
    {
      taskId: 'day2_sev_activity',
      taskOrder: 5,
      taskType: 'activity-selector',
      title: lang === 'english' ? 'Immediate Relief Actions' : lang === 'hindi' ? 'तत्काल राहत कार्य' : 'ತಕ್ಷಣದ ಪರಿಹಾರ ಕ್ರಿಯೆಗಳು',
      description: lang === 'english' ? 'Choose urgent stress relief' : lang === 'hindi' ? 'तत्काल तनाव राहत चुनें' : 'ತುರ್ತು ಒತ್ತಡ ಪರಿಹಾರವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      enabled: true,
      content: {
        activities: lang === 'english' ? [
          { activityName: 'Call a mental health crisis helpline' },
          { activityName: 'Practice emergency grounding techniques (5-4-3-2-1)' },
          { activityName: 'Contact your healthcare provider immediately' }
        ] : lang === 'hindi' ? [
          { activityName: 'मानसिक स्वास्थ्य संकट हेल्पलाइन पर कॉल करें' },
          { activityName: 'आपातकालीन ग्राउंडिंग तकनीक का अभ्यास करें (5-4-3-2-1)' },
          { activityName: 'तुरंत अपने स्वास्थ्य सेवा प्रदाता से संपर्क करें' }
        ] : [
          { activityName: 'ಮಾನಸಿಕ ಆರೋಗ್ಯ ಬಿಕ್ಕಟ್ಟು ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ಕರೆ ಮಾಡಿ' },
          { activityName: 'ತುರ್ತು ಗ್ರೌಂಡಿಂಗ್ ತಂತ್ರಗಳನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ (5-4-3-2-1)' },
          { activityName: 'ತಕ್ಷಣವೇ ನಿಮ್ಮ ಆರೋಗ್ಯ ಸೇವಾ ಪೂರೈಕೆದಾರರನ್ನು ಸಂಪರ್ಕಿಸಿ' }
        ]
      }
    },
    {
      taskId: 'day2_sev_reminder',
      taskOrder: 6,
      taskType: 'reminder',
      title: lang === 'english' ? 'Critical Stress Check' : lang === 'hindi' ? 'महत्वपूर्ण तनाव जांच' : 'ನಿರ್ಣಾಯಕ ಒತ್ತಡ ಪರಿಶೀಲನೆ',
      description: lang === 'english' ? 'Frequent stress monitoring' : lang === 'hindi' ? 'बार-बार तनाव निगरानी' : 'ಆಗಾಗ್ಗೆ ಒತ್ತಡ ಮೇಲ್ವಿಚಾರಣೆ',
      enabled: true,
      content: {
        reminderMessage: lang === 'english'
          ? 'URGENT: Practice deep breathing for 2 minutes. Your well-being is critical.'
          : lang === 'hindi'
          ? 'तत्काल: 2 मिनट के लिए गहरी सांस लेने का अभ्यास करें। आपकी भलाई महत्वपूर्ण है।'
          : 'ತುರ್ತು: 2 ನಿಮಿಷಗಳ ಕಾಲ ಆಳವಾದ ಉಸಿರಾಟವನ್ನು ಅಭ್ಯಾಸ ಮಾಡಿ. ನಿಮ್ಮ ಯೋಗಕ್ಷೇಮ ನಿರ್ಣಾಯಕವಾಗಿದೆ.',
        frequency: 'daily',
        reminderTime: '10:00',
        targetAudience: 'caregiver',
        targetLevels: ['severe'],
        customInterval: 1
      }
    }
  ])
};

function buildDay2Config(language) {
  const translations = CONTENT_TRANSLATIONS[language];
  return {
    dayName: translations.dayName,
    enabled: true,
    hasTest: true,
    defaultLevelKey: 'mild',
    testConfig: {
      testName: translations.testName,
      testType: 'stress-assessment',
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

async function seedDay2StressAssessment() {
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
      const newDayConfig = buildDay2Config(language);
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

    console.log('\n✅ Day 2 Stress Management Assessment saved successfully!');
    console.log(`   • Languages: English, Hindi, Kannada`);
    console.log(`   • Inserted: ${insertedCount} | Updated: ${updatedCount}`);
    console.log(`   • Total questions per language: 7 (DASS-21 Stress Scale)`);
    console.log(`   • Maximum score: 21 points`);
    console.log('   • Score ranges configured:');
    SCORE_RANGES.forEach(range => {
      console.log(`     - ${range.label}: ${range.minScore}-${range.maxScore} points (${range.levelKey})`);
    });
    console.log('\n📋 Next Steps:');
    console.log('   1. Run this script: node scripts/seed-day2-stress-assessment.js');
    console.log('   2. Navigate to the caregiver dashboard');
    console.log('   3. Select your preferred language (English/Hindi/Kannada)');
    console.log('   4. Start Day 2 to see the Stress Management Assessment');
    console.log('   5. Complete the assessment to receive personalized stress management tasks\n');
  } catch (error) {
    console.error('❌ Failed to seed Day 2 Stress Assessment:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed.');
  }
}

// Run the seeding function
seedDay2StressAssessment();
