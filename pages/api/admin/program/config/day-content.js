import dbConnect from '../../../../../lib/mongodb';
import ProgramConfig from '../../../../../models/ProgramConfig';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { day, burdenLevel, content } = req.body;

    if (!day || !burdenLevel || !content) {
      return res.status(400).json({ error: 'Day, burden level, and content required' });
    }

    if (day < 2 || day > 9) {
      return res.status(400).json({ error: 'Day must be between 2 and 9' });
    }

    if (!['mild', 'moderate', 'severe'].includes(burdenLevel)) {
      return res.status(400).json({ error: 'Invalid burden level' });
    }

    // Find or create global config
    let config = await ProgramConfig.findOne({ configType: 'global', caregiverId: null });

    if (!config) {
      config = new ProgramConfig({
        configType: 'global',
        caregiverId: null
      });
    }

    // Initialize contentRules if needed
    if (!config.contentRules) {
      config.contentRules = { mild: {}, moderate: {}, severe: {} };
    }

    if (!config.contentRules[burdenLevel]) {
      config.contentRules[burdenLevel] = {};
    }

    if (!config.contentRules[burdenLevel].days) {
      config.contentRules[burdenLevel].days = new Map();
    }

    // Set content for the specific day
    config.contentRules[burdenLevel].days.set(day.toString(), content);
    config.updatedAt = new Date();

    await config.save();

    console.log(`✅ Day ${day} content saved for ${burdenLevel} burden level`);

    return res.status(200).json({
      success: true,
      message: `Day ${day} content saved successfully for ${burdenLevel} burden level`,
      config
    });

  } catch (error) {
    console.error('Error saving day content:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
