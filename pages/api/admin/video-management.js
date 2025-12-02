import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';
import cloudinary from 'cloudinary';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * API: /api/admin/video-management
 * 
 * DEPRECATED: This endpoint is no longer used
 * Use /api/admin/dynamic-days/tasks and /api/admin/dynamic-days/config instead
 */

export default async function handler(req, res) {
  // Endpoint deprecated - redirect to new system
  return res.status(410).json({ 
    error: 'Endpoint deprecated', 
    message: 'This endpoint has been deprecated. Please use /api/admin/dynamic-days/tasks for video management and /api/admin/dynamic-days/config for day configuration.',
    recommendedEndpoints: {
      tasks: '/api/admin/dynamic-days/tasks',
      config: '/api/admin/dynamic-days/config'
    }
  });

  if (req.method === 'GET') {
    try {
      const { day, burdenLevel, language } = req.query;

      if (!day) {
        return res.status(400).json({ error: 'Day parameter is required' });
      }

      const config = await ProgramConfig.findOne({ 
        configType: 'global', 
        caregiverId: null 
      });

      if (!config) {
        return res.status(200).json({
          success: true,
          videos: {},
          message: 'No configuration found'
        });
      }

      let videoData = {};

      if (parseInt(day) === 1 && burdenLevel) {
        // Day 1 burden-specific videos
        videoData = config.day1?.videos?.[burdenLevel] || {
          videoTitle: {},
          videoUrl: {},
          description: {}
        };
      } else if (parseInt(day) === 0) {
        // Day 0 intro video
        videoData = config.day0IntroVideo || {
          title: {},
          videoUrl: {},
          description: {}
        };
      } else {
        // Other days (2-7) - dynamic content
        const dayKey = `day${day}`;
        videoData = config.contentRules?.[burdenLevel]?.days?.get(dayKey) || {
          videoTitle: {},
          videoUrl: {},
          content: {}
        };
      }

      res.status(200).json({
        success: true,
        videos: videoData,
        hasVideo: language ? !!videoData.videoUrl?.[language] : Object.keys(videoData.videoUrl || {}).length > 0
      });

    } catch (error) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ 
        error: 'Failed to fetch videos',
        details: error.message 
      });
    }

  } else if (req.method === 'POST') {
    try {
      const { day, burdenLevel, language, videoUrl, videoTitle, description } = req.body;

      if (!day || !language || !videoUrl) {
        return res.status(400).json({ 
          error: 'Missing required fields: day, language, videoUrl' 
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

      if (parseInt(day) === 1 && burdenLevel) {
        // Day 1 burden-specific videos
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

        // Initialize language objects if needed
        ['videoTitle', 'videoUrl', 'description'].forEach(field => {
          if (!config.day1.videos[burdenLevel][field]) {
            config.day1.videos[burdenLevel][field] = {};
          }
        });

        // Save the video data
        config.day1.videos[burdenLevel].videoUrl[language] = videoUrl;
        
        if (videoTitle) {
          config.day1.videos[burdenLevel].videoTitle[language] = videoTitle;
        }
        
        if (description) {
          config.day1.videos[burdenLevel].description[language] = description;
        }

        config.markModified('day1.videos');

      } else if (parseInt(day) === 0) {
        // Day 0 intro video
        if (!config.day0IntroVideo) {
          config.day0IntroVideo = {
            title: {},
            videoUrl: {},
            description: {}
          };
        }

        ['title', 'videoUrl', 'description'].forEach(field => {
          if (!config.day0IntroVideo[field]) {
            config.day0IntroVideo[field] = {};
          }
        });

        config.day0IntroVideo.videoUrl[language] = videoUrl;
        
        if (videoTitle) {
          config.day0IntroVideo.title[language] = videoTitle;
        }
        
        if (description) {
          config.day0IntroVideo.description[language] = description;
        }

        config.markModified('day0IntroVideo');
      }

      config.updatedAt = new Date();
      await config.save();

      res.status(200).json({
        success: true,
        message: `Video saved successfully for Day ${day}${burdenLevel ? ` (${burdenLevel} burden)` : ''} in ${language}`,
        data: {
          day,
          burdenLevel,
          language,
          videoUrl,
          videoTitle: videoTitle || '',
          description: description || ''
        }
      });

    } catch (error) {
      console.error('Error saving video:', error);
      res.status(500).json({ 
        error: 'Failed to save video',
        details: error.message 
      });
    }

  } else if (req.method === 'DELETE') {
    try {
      const { day, burdenLevel, language, videoUrl } = req.body;

      if (!day || !language) {
        return res.status(400).json({ 
          error: 'Missing required fields: day, language' 
        });
      }

      // Delete from Cloudinary if URL is provided
      if (videoUrl) {
        try {
          // Extract public ID from Cloudinary URL
          const urlParts = videoUrl.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = `caregiver-program-videos/${publicIdWithExtension.split('.')[0]}`;
          
          console.log('🗑️ Deleting from Cloudinary:', publicId);
          await cloudinary.v2.uploader.destroy(publicId, { resource_type: 'video' });
        } catch (cloudinaryError) {
          console.error('❌ Cloudinary deletion error:', cloudinaryError);
          // Continue with database deletion even if Cloudinary deletion fails
        }
      }

      // Delete from database
      const config = await ProgramConfig.findOne({ 
        configType: 'global', 
        caregiverId: null 
      });

      if (!config) {
        return res.status(404).json({ error: 'No configuration found' });
      }

      if (parseInt(day) === 1 && burdenLevel) {
        // Day 1 burden-specific videos
        if (config.day1?.videos?.[burdenLevel]) {
          if (config.day1.videos[burdenLevel].videoUrl) {
            config.day1.videos[burdenLevel].videoUrl[language] = '';
          }
          if (config.day1.videos[burdenLevel].videoTitle) {
            config.day1.videos[burdenLevel].videoTitle[language] = '';
          }
          if (config.day1.videos[burdenLevel].description) {
            config.day1.videos[burdenLevel].description[language] = '';
          }
          config.markModified('day1.videos');
        }
      } else if (parseInt(day) === 0) {
        // Day 0 intro video
        if (config.day0IntroVideo) {
          if (config.day0IntroVideo.videoUrl) {
            config.day0IntroVideo.videoUrl[language] = '';
          }
          if (config.day0IntroVideo.title) {
            config.day0IntroVideo.title[language] = '';
          }
          if (config.day0IntroVideo.description) {
            config.day0IntroVideo.description[language] = '';
          }
          config.markModified('day0IntroVideo');
        }
      }

      config.updatedAt = new Date();
      await config.save();

      res.status(200).json({
        success: true,
        message: `Video deleted successfully for Day ${day}${burdenLevel ? ` (${burdenLevel} burden)` : ''} in ${language}`
      });

    } catch (error) {
      console.error('Error deleting video:', error);
      res.status(500).json({ 
        error: 'Failed to delete video',
        details: error.message 
      });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}