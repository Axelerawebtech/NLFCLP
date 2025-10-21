import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';
import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { day, language, burdenLevel, videoUrl } = req.body;

    console.log('🗑️ Delete video request:', { day, language, burdenLevel, videoUrl: videoUrl?.substring(0, 50) + '...' });

    if (day === undefined || !language) {
      return res.status(400).json({ error: 'Day and language are required' });
    }

    const dayNum = parseInt(day);
    if (isNaN(dayNum) || dayNum < 0 || dayNum > 7) {
      return res.status(400).json({ error: 'Day must be between 0 and 7' });
    }

    // For days that require burden level
    if (dayNum >= 1 && !burdenLevel) {
      return res.status(400).json({ error: 'Burden level required for Days 1-7' });
    }

    // Find the global program configuration
    let config = await ProgramConfig.findOne({ 
      configType: 'global', 
      caregiverId: null 
    });

    if (!config) {
      return res.status(404).json({ error: 'Program configuration not found' });
    }

    let videoDeleted = false;
    let cloudinaryPublicId = null;

    // Extract Cloudinary public ID from URL if provided
    if (videoUrl) {
      try {
        const urlParts = videoUrl.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const fileName = fileWithExt.split('.')[0];
        cloudinaryPublicId = `caregiver-program-videos/${fileName}`;
      } catch (error) {
        console.log('Could not extract public ID from URL:', error.message);
      }
    }

    if (dayNum === 0) {
      // Day 0: Core module
      if (config.day0IntroVideo?.videoUrl?.[language]) {
        config.day0IntroVideo.videoUrl[language] = '';
        config.day0IntroVideo.title[language] = '';
        config.day0IntroVideo.description[language] = '';
        videoDeleted = true;
      }
    } else if (dayNum === 1) {
      // Day 1: Burden assessment videos
      if (config.day1?.videos?.[burdenLevel]?.videoUrl?.[language]) {
        config.day1.videos[burdenLevel].videoUrl[language] = '';
        config.day1.videos[burdenLevel].videoTitle[language] = '';
        config.day1.videos[burdenLevel].description[language] = '';
        videoDeleted = true;
      }
    } else {
      // Days 2-7: Dynamic content
      if (config.contentRules?.[burdenLevel]?.days) {
        const dayContent = config.contentRules[burdenLevel].days.get(dayNum.toString());
        if (dayContent?.videoUrl?.[language]) {
          dayContent.videoUrl[language] = '';
          dayContent.videoTitle[language] = '';
          dayContent.content[language] = '';
          config.contentRules[burdenLevel].days.set(dayNum.toString(), dayContent);
          videoDeleted = true;
        }
      }
    }

    if (!videoDeleted) {
      return res.status(404).json({ error: 'Video not found for deletion' });
    }

    // Delete from Cloudinary if public ID is available
    if (cloudinaryPublicId) {
      try {
        console.log('🗑️ Deleting from Cloudinary:', cloudinaryPublicId);
        const result = await cloudinary.v2.uploader.destroy(cloudinaryPublicId, {
          resource_type: 'video'
        });
        console.log('✅ Cloudinary deletion result:', result);
      } catch (cloudinaryError) {
        console.error('⚠️ Failed to delete from Cloudinary:', cloudinaryError.message);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Save the updated configuration
    config.updatedAt = new Date();
    await config.save();

    console.log(`✅ Video deleted successfully for Day ${dayNum}, Language: ${language}, Burden: ${burdenLevel || 'N/A'}`);

    return res.status(200).json({
      success: true,
      message: 'Video deleted successfully',
      deletedFrom: {
        day: dayNum,
        language,
        burdenLevel: burdenLevel || null,
        cloudinaryDeleted: !!cloudinaryPublicId
      }
    });

  } catch (error) {
    console.error('❌ Error deleting video:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
}
