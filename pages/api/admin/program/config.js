import dbConnect from '../../../../lib/mongodb';
import ProgramConfig from '../../../../models/ProgramConfig';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { caregiverId, day, burdenLevel } = req.query;
      
      let config;
      if (caregiverId) {
        // Try to get caregiver-specific config first
        config = await ProgramConfig.findOne({ 
          configType: 'caregiver-specific',
          caregiverId 
        });
        
        // Fall back to global config if no specific config exists
        if (!config) {
          config = await ProgramConfig.findOne({ configType: 'global' });
        }
      } else {
        // Get global config
        config = await ProgramConfig.findOne({ configType: 'global' });
      }
      
      if (!config) {
        // Return default configuration if none exists
        return res.status(200).json({
          success: true,
          config: {
            waitTimes: {
              day0ToDay1: 24,
              betweenDays: 24
            }
          }
        });
      }
      
      // If day and burdenLevel are provided, return specific day content
      if (day !== undefined) {
        const dayNum = parseInt(day);
        
        if (dayNum === 0) {
          // Return Day 0 content
          const dayContent = config.day0IntroVideo ? {
            videoTitle: config.day0IntroVideo.title || { english: '', kannada: '', hindi: '' },
            videoUrl: config.day0IntroVideo.videoUrl || { english: '', kannada: '', hindi: '' },
            content: config.day0IntroVideo.description || { english: '', kannada: '', hindi: '' },
            tasks: []
          } : null;
          
          return res.status(200).json({
            success: true,
            dayContent
          });
        } else if (burdenLevel && config.contentRules && config.contentRules[burdenLevel]) {
          // Return content for specific day and burden level
          const dayContent = config.contentRules[burdenLevel].days ? 
            config.contentRules[burdenLevel].days.get(day.toString()) : null;
          
          return res.status(200).json({
            success: true,
            dayContent
          });
        } else {
          return res.status(200).json({
            success: true,
            dayContent: null
          });
        }
      }
      
      return res.status(200).json({
        success: true,
        config
      });
    } catch (error) {
      console.error('Error fetching program config:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching program configuration',
        error: error.message
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { configType, caregiverId, waitTimes, contentRules } = req.body;
      
      if (configType === 'global') {
        // Update or create global config
        let config = await ProgramConfig.findOne({ configType: 'global' });
        
        if (config) {
          config.waitTimes = waitTimes || config.waitTimes;
          config.contentRules = contentRules || config.contentRules;
          config.updatedAt = new Date();
          await config.save();
        } else {
          config = await ProgramConfig.create({
            configType: 'global',
            waitTimes,
            contentRules
          });
        }
        
        return res.status(200).json({
          success: true,
          message: 'Global configuration updated successfully',
          config
        });
      } else if (configType === 'caregiver-specific') {
        if (!caregiverId) {
          return res.status(400).json({
            success: false,
            message: 'Caregiver ID is required for caregiver-specific configuration'
          });
        }
        
        // Update or create caregiver-specific config
        let config = await ProgramConfig.findOne({ 
          configType: 'caregiver-specific',
          caregiverId 
        });
        
        if (config) {
          config.waitTimes = waitTimes || config.waitTimes;
          config.updatedAt = new Date();
          await config.save();
        } else {
          config = await ProgramConfig.create({
            configType: 'caregiver-specific',
            caregiverId,
            waitTimes
          });
        }
        
        return res.status(200).json({
          success: true,
          message: 'Caregiver-specific configuration updated successfully',
          config
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid config type'
        });
      }
    } catch (error) {
      console.error('Error updating program config:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating program configuration',
        error: error.message
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { contentRules, burdenLevel, day, content } = req.body;
      
      let config = await ProgramConfig.findOne({ configType: 'global' });
      
      if (!config) {
        config = await ProgramConfig.create({
          configType: 'global',
          waitTimes: { day0ToDay1: 24, betweenDays: 24 },
          contentRules: { mild: { days: new Map() }, moderate: { days: new Map() }, severe: { days: new Map() } }
        });
      }
      
      // Update specific day content for a burden level
      if (burdenLevel && day && content) {
        if (!config.contentRules[burdenLevel]) {
          config.contentRules[burdenLevel] = { days: new Map() };
        }
        
        config.contentRules[burdenLevel].days.set(String(day), content);
        config.markModified('contentRules');
      } else if (contentRules) {
        config.contentRules = contentRules;
      }
      
      config.updatedAt = new Date();
      await config.save();
      
      return res.status(200).json({
        success: true,
        message: 'Content rules updated successfully',
        config
      });
    } catch (error) {
      console.error('Error updating content rules:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating content rules',
        error: error.message
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
