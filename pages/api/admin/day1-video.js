import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';

/**
 * API: /api/admin/day1-video
 * Method: GET - Get Day 1 video configuration
 * Method: POST - Save Day 1 video URL for specific burden level
 * Method: PUT - Update Day 1 video configuration
 * Method: DELETE - Remove Day 1 video for specific burden level
 * 
 * Purpose: Manage Day 1 burden-specific videos
 */

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const config = await ProgramConfig.findOne({ 
        configType: 'global', 
        caregiverId: null 
      });

      if (!config || !config.day1 || !config.day1.videos) {
        return res.status(200).json({
          success: true,
          videos: {
            mild: { videoTitle: {}, videoUrl: {}, description: {} },
            moderate: { videoTitle: {}, videoUrl: {}, description: {} },
            severe: { videoTitle: {}, videoUrl: {}, description: {} }
          }
        });
      }

      res.status(200).json({
        success: true,
        videos: config.day1.videos
      });

    } catch (error) {
      console.error('Error fetching Day 1 videos:', error);
      res.status(500).json({ 
        error: 'Failed to fetch Day 1 videos',
        details: error.message 
      });
    }

  } else if (req.method === 'POST') {
    try {
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

  } else if (req.method === 'PUT') {
    try {
      const { videos } = req.body;

      if (!videos || typeof videos !== 'object') {
        return res.status(400).json({ error: 'Invalid videos data' });
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
        config.day1 = {};
      }

      // Update all videos
      config.day1.videos = videos;
      config.updatedAt = new Date();
      
      // Mark nested objects as modified
      config.markModified('day1.videos');
      
      await config.save();

      console.log('✅ All Day 1 videos updated');

      res.status(200).json({
        success: true,
        message: 'Day 1 videos updated successfully',
        videos: config.day1.videos
      });

    } catch (error) {
      console.error('Error updating Day 1 videos:', error);
      res.status(500).json({ 
        error: 'Failed to update Day 1 videos',
        details: error.message 
      });
    }

  } else if (req.method === 'DELETE') {
    try {
      const { burdenLevel, language } = req.query;

      if (!burdenLevel || !language) {
        return res.status(400).json({ 
          error: 'Missing required query parameters: burdenLevel, language' 
        });
      }

      const config = await ProgramConfig.findOne({ 
        configType: 'global', 
        caregiverId: null 
      });

      if (!config || !config.day1 || !config.day1.videos) {
        return res.status(404).json({ error: 'No Day 1 video configuration found' });
      }

      if (config.day1.videos[burdenLevel] && config.day1.videos[burdenLevel].videoUrl) {
        config.day1.videos[burdenLevel].videoUrl[language] = '';
        config.day1.videos[burdenLevel].videoTitle[language] = '';
        config.day1.videos[burdenLevel].description[language] = '';
      }

      config.updatedAt = new Date();
      config.markModified('day1.videos');
      
      await config.save();

      console.log(`✅ Day 1 ${burdenLevel} video removed for ${language}`);

      res.status(200).json({
        success: true,
        message: `Day 1 ${burdenLevel} video removed for ${language}`
      });

    } catch (error) {
      console.error('Error removing Day 1 video:', error);
      res.status(500).json({ 
        error: 'Failed to remove Day 1 video',
        details: error.message 
      });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}