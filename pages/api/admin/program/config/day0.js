import dbConnect from '../../../../../lib/mongodb';
import ProgramConfig from '../../../../../models/ProgramConfig';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { day0IntroVideo } = req.body;

    if (!day0IntroVideo) {
      return res.status(400).json({ error: 'Day 0 intro video data required' });
    }

    // Find or create global config
    let config = await ProgramConfig.findOne({ configType: 'global', caregiverId: null });

    if (!config) {
      config = new ProgramConfig({
        configType: 'global',
        caregiverId: null
      });
    }

    // Update Day 0 intro video
    config.day0IntroVideo = day0IntroVideo;
    config.updatedAt = new Date();

    await config.save();

    console.log('✅ Day 0 configuration saved successfully');

    return res.status(200).json({
      success: true,
      message: 'Day 0 configuration saved successfully',
      config
    });

  } catch (error) {
    console.error('Error saving Day 0 config:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
