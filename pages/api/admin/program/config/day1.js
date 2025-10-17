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

      // Validate burden levels exist
      const requiredLevels = ['mild', 'moderate', 'severe'];
      for (const level of requiredLevels) {
        if (!day1Config[level]) {
          return res.status(400).json({ 
            error: `Missing configuration for burden level: ${level}` 
          });
        }

        // Validate each level has all language fields
        const requiredFields = ['videoTitle', 'videoUrl', 'description'];
        for (const field of requiredFields) {
          if (!day1Config[level][field]) {
            return res.status(400).json({ 
              error: `Missing ${field} for burden level: ${level}` 
            });
          }
        }
      }

      // Validate at least one question is enabled
      const enabledQuestions = burdenTestQuestions.filter(q => q.enabled);
      if (enabledQuestions.length === 0) {
        return res.status(400).json({ 
          error: 'At least one burden test question must be enabled' 
        });
      }

      // Find or create global program configuration
      let config = await ProgramConfig.findOne({ configType: 'global' });
      if (!config) {
        config = new ProgramConfig({ configType: 'global' });
      }

      // Update Day 1 configuration
      config.day1 = {
        burdenTestQuestions: burdenTestQuestions.map(q => ({
          id: q.id,
          text: q.text,
          enabled: q.enabled
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
      text: 'Do you feel that your relative asks for more help than he/she needs?',
      enabled: true
    },
    {
      id: 2,
      text: 'Do you feel that because of the time you spend with your relative you don\'t have enough time for yourself?',
      enabled: true
    },
    {
      id: 3,
      text: 'Do you feel stressed between caring for your relative and trying to meet other responsibilities (work/family)?',
      enabled: true
    },
    {
      id: 4,
      text: 'Do you feel embarrassed over your relative\'s behavior?',
      enabled: true
    },
    {
      id: 5,
      text: 'Do you feel angry when you are around your relative?',
      enabled: true
    },
    {
      id: 6,
      text: 'Do you feel that your social life has suffered because you are caring for your relative?',
      enabled: true
    },
    {
      id: 7,
      text: 'Overall, how burdened do you feel in caring for your relative?',
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
