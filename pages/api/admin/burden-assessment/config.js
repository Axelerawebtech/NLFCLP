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

  if (req.method === 'GET') {
    try {
      const config = await ProgramConfig.findOne({ configType: 'global' });
      
      if (!config || !config.day1) {
        // Return default configuration
        return res.status(200).json({
          success: true,
          config: getDefaultBurdenAssessmentConfig()
        });
      }

      res.status(200).json({
        success: true,
        config: {
          questions: config.day1.burdenTestQuestions || [],
          scoreRanges: config.day1.scoreRanges || getDefaultScoreRanges()
        }
      });

    } catch (error) {
      console.error('Error fetching burden assessment config:', error);
      res.status(500).json({ 
        error: 'Failed to fetch configuration',
        details: error.message 
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
 * 0=Never, 1=Rarely, 2=Sometimes, 3=Quite Frequently, 4=Nearly Always
 */
function getDefaultQuestions() {
  return [
    {
      id: 1,
      questionText: {
        english: 'Do you feel that your relative asks for more help than he/she needs?',
        kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಯು ಅವರಿಗೆ ಬೇಕಾದ ಸಹಾಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಸಹಾಯವನ್ನು ಕೇಳುತ್ತಾರೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आपको लगता है कि आपके रिश्तेदार को आवश्यकता से अधिक मदद मांगते हैं?'
      },
      options: [
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
      ],
      enabled: true
    }
  ];
}

/**
 * Default score ranges for burden levels
 */
function getDefaultScoreRanges() {
  return {
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
}
