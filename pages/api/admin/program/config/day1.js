import dbConnect from '../../../../../lib/mongodb';
import ProgramConfig from '../../../../../models/ProgramConfig';

/**
 * API Route: /api/admin/program/config/day1
 * Method: POST - Save Day 1 Configuration (Burden Test + Videos)
 * Method: GET - Get Day 1 Configuration
 * 
 * Purpose: Manages Day 1 configuration including:
 * - Burden test questions (Zarit assessment)
 * - Post-test videos for each burden level (mild/moderate/severe)
 * 
 * Flow:
 * 1. Admin configures 7 MCQ burden test questions
 * 2. Admin uploads 3 videos per language (one for each burden level)
 * 3. Caregiver completes burden test on Day 1
 * 4. Based on score, appropriate video is shown
 * 5. After video watched, Day 1 tasks unlock
 */

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { day1Config, burdenTestQuestions } = req.body;

      // Validation
      if (!day1Config || !burdenTestQuestions) {
        return res.status(400).json({ 
          error: 'Missing required fields: day1Config and burdenTestQuestions' 
        });
      }

      // Validate burden levels exist (create if missing)
      const requiredLevels = ['mild', 'moderate', 'severe'];
      for (const level of requiredLevels) {
        if (!day1Config[level]) {
          // Create empty config for missing level
          day1Config[level] = {
            videoTitle: {},
            videoUrl: {},
            description: {}
          };
        }

        // Ensure all language fields exist (create empty if missing)
        const requiredFields = ['videoTitle', 'videoUrl', 'description'];
        for (const field of requiredFields) {
          if (!day1Config[level][field]) {
            day1Config[level][field] = {};
          }
        }
      }

      // Validate questions format if provided
      let enabledQuestions = [];
      if (burdenTestQuestions && Array.isArray(burdenTestQuestions)) {
        enabledQuestions = burdenTestQuestions.filter(q => q.enabled);
      }
      
      // If no questions provided, use defaults
      const questionsToSave = (burdenTestQuestions && burdenTestQuestions.length > 0) 
        ? burdenTestQuestions 
        : getDefaultBurdenQuestions();

      // Find or create global program configuration
      let config = await ProgramConfig.findOne({ configType: 'global' });
      if (!config) {
        config = new ProgramConfig({ configType: 'global' });
      }

      // Update Day 1 configuration
      config.day1 = {
        burdenTestQuestions: questionsToSave.map(q => ({
          id: q.id,
          questionText: q.questionText || {
            english: q.text || '',
            kannada: '',
            hindi: ''
          },
          enabled: q.enabled !== undefined ? q.enabled : true
        })),
        videos: {
          mild: {
            videoTitle: day1Config.mild.videoTitle,
            videoUrl: day1Config.mild.videoUrl,
            description: day1Config.mild.description
          },
          moderate: {
            videoTitle: day1Config.moderate.videoTitle,
            videoUrl: day1Config.moderate.videoUrl,
            description: day1Config.moderate.description
          },
          severe: {
            videoTitle: day1Config.severe.videoTitle,
            videoUrl: day1Config.severe.videoUrl,
            description: day1Config.severe.description
          }
        }
      };

      await config.save();

      console.log('✅ Day 1 configuration saved:', {
        questionsEnabled: enabledQuestions.length,
        videosConfigured: Object.keys(day1Config).length
      });

      res.status(200).json({ 
        success: true, 
        message: 'Day 1 configuration saved successfully',
        config: config.day1
      });

    } catch (error) {
      console.error('Error saving Day 1 configuration:', error);
      res.status(500).json({ 
        error: 'Failed to save Day 1 configuration',
        details: error.message 
      });
    }

  } else if (req.method === 'GET') {
    try {
      const config = await ProgramConfig.findOne({ configType: 'global' });
      
      if (!config || !config.day1) {
        // Return default configuration
        return res.status(200).json({
          success: true,
          config: {
            burdenTestQuestions: getDefaultBurdenQuestions(),
            videos: getDefaultVideoConfig()
          }
        });
      }

      res.status(200).json({
        success: true,
        config: config.day1
      });

    } catch (error) {
      console.error('Error fetching Day 1 configuration:', error);
      res.status(500).json({ 
        error: 'Failed to fetch Day 1 configuration',
        details: error.message 
      });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

/**
 * Default Zarit Burden Assessment Questions
 * These are standard validated questions from Zarit Burden Interview (short version)
 */
function getDefaultBurdenQuestions() {
  return [
    {
      id: 1,
      questionText: {
        english: 'Do you feel that your relative asks for more help than he/she needs?',
        kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರು ಅಗತ್ಯಕ್ಕಿಂತ ಹೆಚ್ಚು ಸಹಾಯ ಕೇಳುತ್ತಾರೆಯೇ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आपको लगता है कि आपका रिश्तेदार जरूरत से ज्यादा मदद मांगता है?'
      },
      enabled: true
    },
    {
      id: 2,
      questionText: {
        english: 'Do you feel that because of the time you spend with your relative you don\'t have enough time for yourself?',
        kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರೊಂದಿಗೆ ನೀವು ಕಳೆಯುವ ಸಮಯದಿಂದಾಗಿ ನಿಮಗಾಗಿ ಸಾಕಷ್ಟು ಸಮಯವಿಲ್ಲ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आपको लगता है कि आपके रिश्तेदार के साथ बिताए समय के कारण आपके पास अपने लिए पर्याप्त समय नहीं है?'
      },
      enabled: true
    },
    {
      id: 3,
      questionText: {
        english: 'Do you feel stressed between caring for your relative and trying to meet other responsibilities (work/family)?',
        kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ಆರೈಕೆ ಮತ್ತು ಇತರ ಜವಾಬ್ದಾರಿಗಳನ್ನು ಪೂರೈಸಲು ಪ್ರಯತ್ನಿಸುವ ನಡುವೆ ನೀವು ಒತ್ತಡ ಅನುಭವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आप अपने रिश्तेदार की देखभाल और अन्य जिम्मेदारियों को पूरा करने के बीच तनावग्रस्त महसूस करते हैं?'
      },
      enabled: true
    },
    {
      id: 4,
      questionText: {
        english: 'Do you feel embarrassed over your relative\'s behavior?',
        kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ನಡವಳಿಕೆಯಿಂದಾಗಿ ನೀವು ಮುಜುಗರ ಅನುಭವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आप अपने रिश्तेदार के व्यवहार से शर्मिंदा महसूस करते हैं?'
      },
      enabled: true
    },
    {
      id: 5,
      questionText: {
        english: 'Do you feel angry when you are around your relative?',
        kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ಸುತ್ತಲೂ ಇರುವಾಗ ನೀವು ಕೋಪ ಅನುಭವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आप अपने रिश्तेदार के आसपास होने पर गुस्सा महसूस करते हैं?'
      },
      enabled: true
    },
    {
      id: 6,
      questionText: {
        english: 'Do you feel that your social life has suffered because you are caring for your relative?',
        kannada: 'ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ಆರೈಕೆಯಿಂದಾಗಿ ನಿಮ್ಮ ಸಾಮಾಜಿಕ ಜೀವನ ಬಾಧಿತವಾಗಿದೆ ಎಂದು ನೀವು ಭಾವಿಸುತ್ತೀರಾ?',
        hindi: 'क्या आपको लगता है कि आपके रिश्तेदार की देखभाल के कारण आपकी सामाजिक जिंदगी प्रभावित हुई है?'
      },
      enabled: true
    },
    {
      id: 7,
      questionText: {
        english: 'Overall, how burdened do you feel in caring for your relative?',
        kannada: 'ಒಟ್ಟಾರೆಯಾಗಿ, ನಿಮ್ಮ ಸಂಬಂಧಿಕರ ಆರೈಕೆಯಲ್ಲಿ ನೀವು ಎಷ್ಟು ಹೊರೆ ಅನುಭವಿಸುತ್ತೀರಿ?',
        hindi: 'कुल मिलाकर, आप अपने रिश्तेदार की देखभाल में कितना बोझ महसूस करते हैं?'
      },
      enabled: true
    }
  ];
}

/**
 * Default empty video configuration
 */
function getDefaultVideoConfig() {
  return {
    mild: {
      videoTitle: { english: '', kannada: '', hindi: '' },
      videoUrl: { english: '', kannada: '', hindi: '' },
      description: { english: '', kannada: '', hindi: '' }
    },
    moderate: {
      videoTitle: { english: '', kannada: '', hindi: '' },
      videoUrl: { english: '', kannada: '', hindi: '' },
      description: { english: '', kannada: '', hindi: '' }
    },
    severe: {
      videoTitle: { english: '', kannada: '', hindi: '' },
      videoUrl: { english: '', kannada: '', hindi: '' },
      description: { english: '', kannada: '', hindi: '' }
    }
  };
}
