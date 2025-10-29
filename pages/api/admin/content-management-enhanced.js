import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';

/**
 * API: /api/admin/content-management-enhanced
 * 
 * GET - Retrieve content for specific day, content type, and burden level
 * POST - Save content with burden level support
 * DELETE - Delete content for specific burden level
 * 
 * Purpose: Enhanced content management with burden level support
 */

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { day, contentType, burdenLevel, language } = req.query;

      if (!day || !contentType) {
        return res.status(400).json({ error: 'Day and contentType parameters are required' });
      }

      const config = await ProgramConfig.findOne({ 
        configType: 'global', 
        caregiverId: null 
      });

      if (!config) {
        return res.status(200).json({
          success: true,
          content: { english: '', kannada: '', hindi: '' },
          message: 'No configuration found'
        });
      }

      let contentData = { english: '', kannada: '', hindi: '' };

      if (burdenLevel && config.contentManagement) {
        // Burden-specific content
        const burdenContent = config.contentManagement[contentType]?.[burdenLevel];
        if (burdenContent) {
          contentData = burdenContent;
        }
      } else if (config.contentManagement) {
        // Day-specific content (for content types without burden levels)
        const dayKey = `day${day}`;
        const dayContent = config.contentManagement[contentType]?.[dayKey];
        if (dayContent) {
          contentData = dayContent;
        }
      }

      res.status(200).json({
        success: true,
        content: contentData,
        hasContent: language ? !!contentData[language] : Object.values(contentData).some(v => v)
      });

    } catch (error) {
      console.error('Error fetching content:', error);
      res.status(500).json({ 
        error: 'Failed to fetch content',
        details: error.message 
      });
    }

  } else if (req.method === 'POST') {
    try {
      const { day, contentType, burdenLevel, language, content } = req.body;

      if (!day || !contentType || !language || content === undefined) {
        return res.status(400).json({ 
          error: 'Missing required fields: day, contentType, language, content' 
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

      // Initialize contentManagement if needed
      if (!config.contentManagement) {
        config.contentManagement = {
          motivationMessages: {
            mild: { english: '', kannada: '', hindi: '' },
            moderate: { english: '', kannada: '', hindi: '' },
            severe: { english: '', kannada: '', hindi: '' }
          },
          healthcareTips: {
            mild: { english: '', kannada: '', hindi: '' },
            moderate: { english: '', kannada: '', hindi: '' },
            severe: { english: '', kannada: '', hindi: '' }
          },
          reminders: {
            mild: { english: '', kannada: '', hindi: '' },
            moderate: { english: '', kannada: '', hindi: '' },
            severe: { english: '', kannada: '', hindi: '' }
          },
          dailyTaskTemplates: {
            mild: [],
            moderate: [],
            severe: []
          },
          audioContent: new Map(),
          quickAssessmentQuestions: []
        };
      }

      // Initialize content type if needed
      if (!config.contentManagement[contentType]) {
        if (['motivationMessages', 'healthcareTips', 'reminders'].includes(contentType)) {
          config.contentManagement[contentType] = {
            mild: { english: '', kannada: '', hindi: '' },
            moderate: { english: '', kannada: '', hindi: '' },
            severe: { english: '', kannada: '', hindi: '' }
          };
        } else if (contentType === 'dailyTaskTemplates') {
          config.contentManagement[contentType] = {
            mild: [],
            moderate: [],
            severe: []
          };
        } else if (contentType === 'audioContent') {
          config.contentManagement[contentType] = new Map();
        }
      }

      if (burdenLevel) {
        // Burden-specific content
        if (['motivationMessages', 'healthcareTips', 'reminders'].includes(contentType)) {
          if (!config.contentManagement[contentType][burdenLevel]) {
            config.contentManagement[contentType][burdenLevel] = { english: '', kannada: '', hindi: '' };
          }
          config.contentManagement[contentType][burdenLevel][language] = content;
        } else if (contentType === 'audioContent') {
          const key = `${burdenLevel}_${language}`;
          config.contentManagement[contentType].set(key, content);
        }
      } else {
        // Day-specific content
        const dayKey = `day${day}`;
        if (contentType === 'audioContent') {
          const key = `${dayKey}_${language}`;
          config.contentManagement[contentType].set(key, content);
        }
      }

      config.updatedAt = new Date();
      config.markModified('contentManagement');
      
      await config.save();

      console.log(`✅ Content saved: ${contentType} for ${burdenLevel ? `${burdenLevel} burden` : `Day ${day}`} in ${language}`);

      res.status(200).json({
        success: true,
        message: `${contentType} saved successfully for ${burdenLevel ? `${burdenLevel} burden` : `Day ${day}`} in ${language}`,
        data: {
          day,
          contentType,
          burdenLevel,
          language,
          content
        }
      });

    } catch (error) {
      console.error('Error saving content:', error);
      res.status(500).json({ 
        error: 'Failed to save content',
        details: error.message 
      });
    }

  } else if (req.method === 'DELETE') {
    try {
      const { day, contentType, burdenLevel, language } = req.body;

      if (!contentType || !language) {
        return res.status(400).json({ 
          error: 'Missing required fields: contentType, language' 
        });
      }

      const config = await ProgramConfig.findOne({ 
        configType: 'global', 
        caregiverId: null 
      });

      if (!config || !config.contentManagement) {
        return res.status(404).json({ error: 'No configuration found' });
      }

      if (burdenLevel) {
        // Burden-specific content deletion
        if (config.contentManagement[contentType] && config.contentManagement[contentType][burdenLevel]) {
          if (['motivationMessages', 'healthcareTips', 'reminders'].includes(contentType)) {
            config.contentManagement[contentType][burdenLevel][language] = '';
          } else if (contentType === 'audioContent') {
            const key = `${burdenLevel}_${language}`;
            config.contentManagement[contentType].delete(key);
          }
        }
      } else if (day) {
        // Day-specific content deletion
        const dayKey = `day${day}`;
        if (contentType === 'audioContent') {
          const key = `${dayKey}_${language}`;
          config.contentManagement[contentType].delete(key);
        }
      }

      config.updatedAt = new Date();
      config.markModified('contentManagement');
      
      await config.save();

      res.status(200).json({
        success: true,
        message: `${contentType} deleted successfully for ${burdenLevel ? `${burdenLevel} burden` : `Day ${day}`} in ${language}`
      });

    } catch (error) {
      console.error('Error deleting content:', error);
      res.status(500).json({ 
        error: 'Failed to delete content',
        details: error.message 
      });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}