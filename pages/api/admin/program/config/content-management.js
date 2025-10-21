import dbConnect from '../../../../../lib/mongodb';
import ProgramConfig from '../../../../../models/ProgramConfig';

/**
 * API Route: /api/admin/program/config/content-management
 * Method: POST - Save Content Management Configuration
 * Method: GET - Get Content Management Configuration
 *
 * Purpose: Manages content that appears on caregiver dashboard based on burden level:
 * - Motivation messages
 * - Healthcare tips
 * - Reminders
 * - Daily task templates
 */

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { contentManagement } = req.body;

      // Validation
      if (!contentManagement) {
        return res.status(400).json({
          success: false,
          message: 'Content management configuration is required'
        });
      }

      // Find existing config or create new one
      let config = await ProgramConfig.findOne({ configType: 'global' });
      
      if (!config) {
        config = new ProgramConfig({
          configType: 'global',
          contentManagement
        });
      } else {
        config.contentManagement = contentManagement;
        config.lastUpdated = new Date();
      }

      await config.save();

      return res.status(200).json({
        success: true,
        message: 'Content management configuration saved successfully',
        config: config.contentManagement
      });

    } catch (error) {
      console.error('Error saving content management config:', error);
      return res.status(500).json({
        success: false,
        message: 'Error saving content management configuration',
        error: error.message
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const config = await ProgramConfig.findOne({ configType: 'global' });
      
      if (!config || !config.contentManagement) {
        // Return default structure
        return res.status(200).json({
          success: true,
          config: {
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
            }
          }
        });
      }

      return res.status(200).json({
        success: true,
        config: config.contentManagement
      });

    } catch (error) {
      console.error('Error fetching content management config:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching content management configuration',
        error: error.message
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}