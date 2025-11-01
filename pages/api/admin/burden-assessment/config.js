import dbConnect from '../../../../lib/mongodb';
import ProgramConfig from '../../../../models/ProgramConfig';

/**
 * API Route: /api/admin/burden-assessment/config
 * Methods: GET, POST
 * 
 * Purpose: Manage burden assessment configuration
 * - Questions with multi-language support
 * - Options with scores (0-3)
 * - Customizable score ranges for burden levels
 */

export default async function handler(req, res) {
  await dbConnect();

  // Set cache control headers to prevent caching issues
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'GET') {
    try {
      const config = await ProgramConfig.findOne({ configType: 'global' });
      
      // Check if configuration exists and has the full question set
      const hasValidConfig = config && 
                           config.day1 && 
                           config.day1.burdenTestQuestions && 
                           config.day1.burdenTestQuestions.length === 22;
      
      if (!hasValidConfig) {
        console.log('⚠️ Burden assessment config missing or incomplete - initializing with default 22 questions');
        
        // Auto-initialize with complete configuration
        const defaultConfig = getDefaultBurdenAssessmentConfig();
        
        let configDoc = config || new ProgramConfig({ configType: 'global' });
        
        // Ensure day1 exists
        if (!configDoc.day1) {
          configDoc.day1 = {};
        }
        
        // Set the complete configuration
        configDoc.day1.burdenTestQuestions = defaultConfig.questions;
        configDoc.day1.scoreRanges = defaultConfig.scoreRanges;
        configDoc.markModified('day1');
        
        await configDoc.save();
        
        console.log('✅ Auto-initialized burden assessment with 22 questions');
        
        return res.status(200).json({
          success: true,
          config: defaultConfig,
          message: 'Configuration auto-initialized with complete question set'
        });
      }

      // Return existing valid configuration
      res.status(200).json({
        success: true,
        config: {
          questions: config.day1.burdenTestQuestions || [],
          scoreRanges: config.day1.scoreRanges || getDefaultScoreRanges()
        }
      });

    } catch (error) {
      console.error('Error fetching burden assessment config:', error);
      
      // Return default configuration as fallback
      const defaultConfig = getDefaultBurdenAssessmentConfig();
      
      res.status(200).json({ 
        success: true,
        config: defaultConfig,
        message: 'Returned default configuration due to database error',
        error: 'Database error - using default configuration'
      });
    }

  } else if (req.method === 'POST') {
    try {
      const { questions, scoreRanges } = req.body;

      // Validation
      if (!questions || !Array.isArray(questions)) {
        return res.status(400).json({ 
          error: 'Questions array is required' 
        });
      }

      // Validate questions structure
      for (const question of questions) {
        if (!question.questionText || !question.questionText.english) {
          return res.status(400).json({ 
            error: 'Each question must have English text' 
          });
        }

        if (!question.options || question.options.length !== 5) {
          return res.status(400).json({ 
            error: 'Each question must have exactly 5 options' 
          });
        }

        // Validate each option has required fields
        for (let i = 0; i < question.options.length; i++) {
          const option = question.options[i];
          if (!option.optionText || !option.optionText.english) {
            return res.status(400).json({ 
              error: `Option ${i + 1} in a question must have English text` 
            });
          }
          if (typeof option.score !== 'number') {
            return res.status(400).json({ 
              error: `Option ${i + 1} must have a valid score` 
            });
          }
        }
      }

      // Validate score ranges if provided
      if (scoreRanges) {
        const ranges = ['littleOrNoBurden', 'mildToModerate', 'moderateToSevere', 'severe'];
        for (const rangeName of ranges) {
          if (scoreRanges[rangeName]) {
            const range = scoreRanges[rangeName];
            if (range.min === undefined || range.max === undefined) {
              return res.status(400).json({ 
                error: `Invalid score range for ${rangeName}` 
              });
            }
            if (range.min > range.max) {
              return res.status(400).json({ 
                error: `Min score cannot be greater than max score for ${rangeName}` 
              });
            }
          }
        }
      }

      // Find or create global config
      let config = await ProgramConfig.findOne({ configType: 'global' });
      if (!config) {
        config = new ProgramConfig({ configType: 'global' });
      }

      // Ensure day1 exists
      if (!config.day1) {
        config.day1 = {};
      }

      // Update burden test questions - ensure proper structure
      config.day1.burdenTestQuestions = questions.map((q, index) => {
        const question = {
          id: q.id || (index + 1),
          questionText: {
            english: q.questionText.english || '',
            kannada: q.questionText.kannada || '',
            hindi: q.questionText.hindi || ''
          },
          options: (q.options || []).map(opt => ({
            optionText: {
              english: opt.optionText.english || '',
              kannada: opt.optionText.kannada || '',
              hindi: opt.optionText.hindi || ''
            },
            score: typeof opt.score === 'number' ? opt.score : 0
          })),
          enabled: q.enabled !== undefined ? q.enabled : true
        };
        
        // Remove any old 'text' field if it exists
        delete question.text;
        
        return question;
      });

      // Update score ranges if provided
      if (scoreRanges) {
        config.day1.scoreRanges = scoreRanges;
      } else if (!config.day1.scoreRanges) {
        config.day1.scoreRanges = getDefaultScoreRanges();
      }

      // Mark as modified
      config.markModified('day1');
      await config.save();

      console.log('✅ Burden assessment config saved:', {
        questionsCount: questions.length,
        scoreRangesConfigured: !!scoreRanges
      });

      res.status(200).json({ 
        success: true, 
        message: 'Burden assessment configuration saved successfully',
        config: {
          questions: config.day1.burdenTestQuestions,
          scoreRanges: config.day1.scoreRanges
        }
      });

    } catch (error) {
      console.error('Error saving burden assessment config:', error);
      res.status(500).json({ 
        error: 'Failed to save configuration',
        details: error.message 
      });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Default burden assessment configuration
 */
function getDefaultBurdenAssessmentConfig() {
  return {
    questions: getDefaultQuestions(),
    scoreRanges: getDefaultScoreRanges()
  };
}

/**
 * Default Zarit Burden questions with 5 options each
 * Complete 22-question Zarit Burden Interview Scale
 * 0=Never, 1=Rarely, 2=Sometimes, 3=Quite Frequently, 4=Nearly Always
 */
function getDefaultQuestions() {
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

  return [
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
}

/**
 * Default score ranges for burden levels
 * Based on standard 22-question Zarit Burden Interview scoring
 * Maximum possible score: 22 questions × 4 points = 88 points
 */
function getDefaultScoreRanges() {
  return {
    mild: {
      min: 0,
      max: 40,
      label: {
        english: 'Mild burden',
        kannada: 'ಕಡಿಮೆ ಹೊರೆ',
        hindi: 'हल्का बोझ'
      },
      burdenLevel: 'mild'
    },
    moderate: {
      min: 41,
      max: 60,
      label: {
        english: 'Moderate burden',
        kannada: 'ಮಧ್ಯಮ ಹೊರೆ',
        hindi: 'मध्यम बोझ'
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
}
