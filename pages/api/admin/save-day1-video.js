import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';

/**
 * API: /api/admin/save-day1-video
 * Method: POST
 * 
 * DEPRECATED: This endpoint is no longer used
 * Use /api/admin/dynamic-days/tasks instead for video management
 */

export default async function handler(req, res) {
  // Endpoint deprecated - redirect to new system
  return res.status(410).json({ 
    error: 'Endpoint deprecated', 
    message: 'This endpoint has been deprecated. Please use /api/admin/dynamic-days/tasks to manage videos in the unified dynamicDayStructures system.',
    recommendedEndpoint: '/api/admin/dynamic-days/tasks'
  });

    const { burdenLevel, language, videoUrl, videoTitle, description } = req.body;

    // Validation
    if (!burdenLevel || !language || !videoUrl) {
      return res.status(400).json({ 
        error: 'Missing required fields: burdenLevel, language, videoUrl' 
      });
    }

    if (!['mild', 'moderate', 'severe'].includes(burdenLevel)) {
      return res.status(400).json({ 
        error: 'Invalid burden level. Must be mild, moderate, or severe' 
      });
    }

    if (!['english', 'kannada', 'hindi'].includes(language)) {
      return res.status(400).json({ 
        error: 'Invalid language. Must be english, kannada, or hindi' 
      });
    }

    // Find or create global config
    let config = await ProgramConfig.findOne({ 
      configType: 'global', 
      caregiverId: null 
    });

    if (!config) {
      config = new ProgramConfig({
        configType: 'global',
        caregiverId: null,
        isActive: true
      });
    }

    // Initialize day1 structure if needed
    if (!config.day1) {
      config.day1 = {
        videos: {
          mild: { videoTitle: {}, videoUrl: {}, description: {} },
          moderate: { videoTitle: {}, videoUrl: {}, description: {} },
          severe: { videoTitle: {}, videoUrl: {}, description: {} }
        }
      };
    }

    if (!config.day1.videos) {
      config.day1.videos = {
        mild: { videoTitle: {}, videoUrl: {}, description: {} },
        moderate: { videoTitle: {}, videoUrl: {}, description: {} },
        severe: { videoTitle: {}, videoUrl: {}, description: {} }
      };
    }

    if (!config.day1.videos[burdenLevel]) {
      config.day1.videos[burdenLevel] = {
        videoTitle: {},
        videoUrl: {},
        description: {}
      };
    }

    // Save the video data
    config.day1.videos[burdenLevel].videoUrl[language] = videoUrl;
    
    if (videoTitle) {
      config.day1.videos[burdenLevel].videoTitle[language] = videoTitle;
    }
    
    if (description) {
      config.day1.videos[burdenLevel].description[language] = description;
    }

    config.updatedAt = new Date();
    
    // Mark nested objects as modified
    config.markModified('day1.videos');
    
    await config.save();

    console.log(`✅ Day 1 ${burdenLevel} video saved for ${language}:`, videoUrl);

    res.status(200).json({
      success: true,
      message: `Day 1 ${burdenLevel} video saved successfully for ${language}`,
      data: {
        burdenLevel,
        language,
        videoUrl,
        videoTitle: videoTitle || '',
        description: description || ''
      }
    });

  } catch (error) {
    console.error('Error saving Day 1 video:', error);
    res.status(500).json({ 
      error: 'Failed to save Day 1 video',
      details: error.message 
    });
  }
}