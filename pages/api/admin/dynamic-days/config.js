import dbConnect from '../../../../lib/mongodb';
import ProgramConfig from '../../../../models/ProgramConfig';

/**
 * API Route: /api/admin/dynamic-days/config
 * Methods: GET, POST
 * 
 * Purpose: Manage dynamic day configurations
 * - Get all configured days
 * - Save/update day configuration
 */

export default async function handler(req, res) {
  await dbConnect();

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'GET') {
    try {
      const { day, language } = req.query;
      
      const config = await ProgramConfig.findOne({ configType: 'global' });
      
      if (!config) {
        return res.status(404).json({ 
          success: false,
          error: 'Configuration not found' 
        });
      }

      // If specific day and language requested
      if (day !== undefined && language) {
        const dayNumber = parseInt(day);
        const dayConfig = config.dynamicDays?.find(
          d => d.dayNumber === dayNumber && d.language === language
        );
        
        if (!dayConfig) {
          // Return empty template for new day instead of 404
          return res.status(200).json({ 
            success: true,
            dayConfig: null,
            isNew: true,
            message: `Day ${dayNumber} (${language}) not configured yet - ready to create`
          });
        }

        return res.status(200).json({
          success: true,
          dayConfig,
          isNew: false
        });
      }

      // Return all days for specific language
      if (language) {
        const languageDays = config.dynamicDays?.filter(d => d.language === language) || [];
        return res.status(200).json({
          success: true,
          days: languageDays
        });
      }

      // Return all days (all languages)
      res.status(200).json({
        success: true,
        days: config.dynamicDays || []
      });

    } catch (error) {
      console.error('Error fetching dynamic days config:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch configuration',
        details: error.message 
      });
    }

  } else if (req.method === 'POST') {
    try {
      const { dayNumber, language, dayConfig } = req.body;

      if (dayNumber === undefined) {
        return res.status(400).json({ 
          success: false,
          error: 'Day number is required' 
        });
      }

      if (!language) {
        return res.status(400).json({ 
          success: false,
          error: 'Language is required' 
        });
      }

      // Validation
      if (dayConfig.hasTest && (!dayConfig.testConfig || !dayConfig.testConfig.scoreRanges)) {
        return res.status(400).json({ 
          success: false,
          error: 'Test configuration is required when hasTest is true' 
        });
      }

      let config = await ProgramConfig.findOne({ configType: 'global' });
      if (!config) {
        config = new ProgramConfig({ configType: 'global' });
      }

      // Initialize dynamicDays if not exists
      if (!config.dynamicDays) {
        config.dynamicDays = [];
      }

      // Find existing day config for this day number AND language
      const existingIndex = config.dynamicDays.findIndex(
        d => d.dayNumber === dayNumber && d.language === language
      );
      
      if (existingIndex >= 0) {
        // Update existing day
        config.dynamicDays[existingIndex] = {
          ...dayConfig,
          dayNumber,
          language
        };
      } else {
        // Add new day
        config.dynamicDays.push({
          ...dayConfig,
          dayNumber,
          language
        });
      }

      // Sort days by dayNumber, then by language
      config.dynamicDays.sort((a, b) => {
        if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
        return a.language.localeCompare(b.language);
      });

      config.markModified('dynamicDays');
      await config.save();

      console.log(`✅ Day ${dayNumber} (${language}) configuration saved`);

      res.status(200).json({ 
        success: true, 
        message: `Day ${dayNumber} (${language}) configuration saved successfully`,
        dayConfig: config.dynamicDays.find(
          d => d.dayNumber === dayNumber && d.language === language
        )
      });

    } catch (error) {
      console.error('Error saving dynamic day config:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to save configuration',
        details: error.message 
      });
    }

  } else if (req.method === 'DELETE') {
    try {
      const { day, language } = req.query;

      if (day === undefined) {
        return res.status(400).json({ 
          success: false,
          error: 'Day number is required' 
        });
      }

      if (!language) {
        return res.status(400).json({ 
          success: false,
          error: 'Language is required' 
        });
      }

      const dayNumber = parseInt(day);
      const config = await ProgramConfig.findOne({ configType: 'global' });
      
      if (!config || !config.dynamicDays) {
        return res.status(404).json({ 
          success: false,
          error: 'Configuration not found' 
        });
      }

      // Remove day for specific language
      config.dynamicDays = config.dynamicDays.filter(
        d => !(d.dayNumber === dayNumber && d.language === language)
      );
      
      config.markModified('dynamicDays');
      await config.save();

      res.status(200).json({ 
        success: true, 
        message: `Day ${dayNumber} (${language}) deleted successfully` 
      });

    } catch (error) {
      console.error('Error deleting day config:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete day configuration',
        details: error.message 
      });
    }

  } else {
    res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }
}
