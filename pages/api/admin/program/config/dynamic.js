import dbConnect from '../../../../../lib/mongodb';
import ProgramConfig from '../../../../../models/ProgramConfig';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { day, dayContent } = req.body;

    if (!day || !dayContent) {
      return res.status(400).json({ error: 'Day and day content data required' });
    }

    // Validate day is between 2-7
    const dayNum = parseInt(day);
    if (isNaN(dayNum) || dayNum < 2 || dayNum > 7) {
      return res.status(400).json({ error: 'Day must be between 2 and 7' });
    }

    // Find or create global config
    let config = await ProgramConfig.findOne({ configType: 'global', caregiverId: null });

    if (!config) {
      config = new ProgramConfig({
        configType: 'global',
        caregiverId: null
      });
    }

    // Initialize contentRules if it doesn't exist
    if (!config.contentRules) {
      config.contentRules = {};
    }

    // Update the day content for all burden levels
    // Since we don't know the specific burden level, we'll update all of them
    const burdenLevels = ['low', 'moderate', 'high'];
    
    for (const burdenLevel of burdenLevels) {
      if (!config.contentRules[burdenLevel]) {
        config.contentRules[burdenLevel] = { days: new Map() };
      }
      
      if (!config.contentRules[burdenLevel].days) {
        config.contentRules[burdenLevel].days = new Map();
      }

      // Get existing day data or create new
      const existingDayData = config.contentRules[burdenLevel].days.get(day.toString()) || {};
      
      // Merge with new day content
      const updatedDayData = {
        ...existingDayData,
        videoTitle: dayContent.title || existingDayData.videoTitle,
        videoUrl: dayContent.videoUrl || existingDayData.videoUrl,
        content: dayContent.description || existingDayData.content,
        tasks: dayContent.tasks || existingDayData.tasks || []
      };

      config.contentRules[burdenLevel].days.set(day.toString(), updatedDayData);
    }

    config.updatedAt = new Date();
    await config.save();

    console.log(`✅ Day ${day} configuration saved successfully for all burden levels`);

    return res.status(200).json({
      success: true,
      message: `Day ${day} configuration saved successfully`,
      config
    });

  } catch (error) {
    console.error(`Error saving Day ${req.body.day} config:`, error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}