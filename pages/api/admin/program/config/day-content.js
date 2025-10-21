import dbConnect from '../../../../../lib/mongodb';
import ProgramConfig from '../../../../../models/ProgramConfig';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { day, burdenLevel, content } = req.body;

    if (day === undefined || day === null || !content) {
      return res.status(400).json({ error: 'Day and content required' });
    }

    if (day < 0 || day > 7) {
      return res.status(400).json({ error: 'Day must be between 0 and 7' });
    }

    // For Day 0, burden level is not required (core module)
    if (day !== 0 && !burdenLevel) {
      return res.status(400).json({ error: 'Burden level required for days 1-7' });
    }

    // Validate burden level for days that require it
    if (day === 1 && !['mild', 'moderate', 'severe'].includes(burdenLevel)) {
      return res.status(400).json({ error: 'Invalid burden level for Day 1' });
    }
    if (day === 2 && !['low', 'moderate', 'high'].includes(burdenLevel)) {
      return res.status(400).json({ error: 'Invalid stress level for Day 2' });
    }
    if (day === 3 && !['physical', 'psychological', 'social', 'environment'].includes(burdenLevel)) {
      return res.status(400).json({ error: 'Invalid domain for Day 3' });
    }
    if (day === 4 && !['wound-care', 'drain-care', 'stoma-care', 'feeding-tube', 'urinary-catheter', 'oral-anticancer', 'bedbound-patient'].includes(burdenLevel)) {
      return res.status(400).json({ error: 'Invalid care type for Day 4' });
    }

    // Find or create global config
    let config = await ProgramConfig.findOne({ configType: 'global', caregiverId: null });

    if (!config) {
      config = new ProgramConfig({
        configType: 'global',
        caregiverId: null
      });
    }

    if (day === 0) {
      // Handle Day 0 (Core module) - no burden level needed
      if (!config.day0IntroVideo) {
        config.day0IntroVideo = {
          title: { english: '', kannada: '', hindi: '' },
          videoUrl: { english: '', kannada: '', hindi: '' },
          description: { english: '', kannada: '', hindi: '' }
        };
      }
      
      // Update Day 0 content
      config.day0IntroVideo.title = content.videoTitle || config.day0IntroVideo.title;
      config.day0IntroVideo.videoUrl = content.videoUrl || config.day0IntroVideo.videoUrl;
      config.day0IntroVideo.description = content.content || config.day0IntroVideo.description;
      
    } else {
      // Handle Days 1-7 with burden levels
      // Initialize contentRules if needed
      if (!config.contentRules) {
        config.contentRules = {};
      }

      if (!config.contentRules[burdenLevel]) {
        config.contentRules[burdenLevel] = {};
      }

      if (!config.contentRules[burdenLevel].days) {
        config.contentRules[burdenLevel].days = new Map();
      }

      // Set content for the specific day
      config.contentRules[burdenLevel].days.set(day.toString(), content);
    }
    
    config.updatedAt = new Date();

    await config.save();

    if (day === 0) {
      console.log(`✅ Day ${day} content saved (Core Module)`);
    } else {
      console.log(`✅ Day ${day} content saved for ${burdenLevel} level`);
    }

    return res.status(200).json({
      success: true,
      message: day === 0 ? `Day ${day} content saved successfully (Core Module)` : `Day ${day} content saved successfully for ${burdenLevel} level`,
      config
    });

  } catch (error) {
    console.error('Error saving day content:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
