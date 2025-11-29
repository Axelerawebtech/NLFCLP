import dbConnect from '../../../../lib/mongodb';
import ProgramConfig from '../../../../models/ProgramConfig';
import {
  buildStructureFromDayConfig,
  buildTranslationFromDayConfig,
  upsertStructure,
  upsertTranslation,
  composeDayConfig,
  getStructureForDay,
  getTranslationForDay,
  listDayConfigsForLanguage,
  syncLegacyDynamicDay,
  sanitizeDynamicDayStructures
} from '../../../../lib/dynamicDayUtils';

const normalizeLanguage = (language = 'english') => {
  const normalized = (language || '').toString().trim().toLowerCase();
  return ['english', 'kannada', 'hindi'].includes(normalized) ? normalized : 'english';
};

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

      const useUnified = Array.isArray(config.dynamicDayStructures) && config.dynamicDayStructures.length > 0;

      // Handle specific day fetch
      if (day !== undefined && language) {
        const dayNumber = parseInt(day, 10);
        if (Number.isNaN(dayNumber)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid day number'
          });
        }

        if (useUnified) {
          const structure = getStructureForDay(config, dayNumber);
          if (structure) {
            const translation = getTranslationForDay(config, dayNumber, language);
            const dayConfigPayload = composeDayConfig(structure, translation);
            return res.status(200).json({
              success: true,
              dayConfig: { ...dayConfigPayload, language },
              isNew: false
            });
          }
        }

        const legacyDay = config.dynamicDays?.find(
          d => d.dayNumber === dayNumber && d.language === language
        );
        if (!legacyDay) {
          return res.status(200).json({
            success: true,
            dayConfig: null,
            isNew: true,
            message: `Day ${dayNumber} (${language}) not configured yet - ready to create`
          });
        }

        return res.status(200).json({
          success: true,
          dayConfig: legacyDay,
          isNew: false
        });
      }

      // List days for a specific language
      if (language) {
        if (useUnified) {
          const unifiedDays = listDayConfigsForLanguage(config, language)
            .map(dayConfigPayload => ({ ...dayConfigPayload, language }));
          const coveredDayNumbers = new Set(unifiedDays.map(dayEntry => dayEntry.dayNumber));
          const legacyFallback = (config.dynamicDays || [])
            .filter(d => d.language === language && !coveredDayNumbers.has(d.dayNumber));
          return res.status(200).json({ success: true, days: unifiedDays.concat(legacyFallback) });
        }
        const legacyDays = config.dynamicDays?.filter(d => d.language === language) || [];
        return res.status(200).json({ success: true, days: legacyDays });
      }

      // All days
      if (useUnified) {
        const allLanguageDays = ['english', 'kannada', 'hindi'].flatMap(lang => {
          const unifiedDays = listDayConfigsForLanguage(config, lang).map(dayConfigPayload => ({ ...dayConfigPayload, language: lang }));
          const coveredDayNumbers = new Set(unifiedDays.map(dayEntry => dayEntry.dayNumber));
          const legacyFallback = (config.dynamicDays || [])
            .filter(d => d.language === lang && !coveredDayNumbers.has(d.dayNumber));
          return unifiedDays.concat(legacyFallback);
        });
        return res.status(200).json({ success: true, days: allLanguageDays });
      }

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
      const requiresScoreRanges = dayConfig.hasTest && dayConfig.testConfig && dayConfig.testConfig.disableLevels !== true;
      if (dayConfig.hasTest && !dayConfig.testConfig) {
        return res.status(400).json({ 
          success: false,
          error: 'Test configuration is required when hasTest is true' 
        });
      }

      if (requiresScoreRanges && !Array.isArray(dayConfig.testConfig.scoreRanges)) {
        return res.status(400).json({
          success: false,
          error: 'Score ranges are required unless the test disables levels'
        });
      }

      let config = await ProgramConfig.findOne({ configType: 'global' });
      if (!config) {
        config = new ProgramConfig({ configType: 'global' });
      }

      const existingStructure = getStructureForDay(config, dayNumber);
      const normalizedLanguage = normalizeLanguage(language);
      const baseLanguageForDay = existingStructure?.baseLanguage || normalizedLanguage;
      const isBaseLanguageUpdate = !existingStructure || normalizedLanguage === baseLanguageForDay || normalizedLanguage === 'english';
      let structurePayload = existingStructure;

      if (isBaseLanguageUpdate) {
        structurePayload = buildStructureFromDayConfig({
          dayConfig,
          dayNumber,
          language,
          existingStructure
        });
        upsertStructure(config, structurePayload);
      }

      const translationPayload = buildTranslationFromDayConfig({
        dayConfig,
        dayNumber,
        language
      });

      upsertTranslation(config, translationPayload);
      syncLegacyDynamicDay(config, { dayNumber, language, dayConfig });
      sanitizeDynamicDayStructures(config);
      await config.save();

      const mergedResponse = composeDayConfig(structurePayload, translationPayload);

      console.log(
        isBaseLanguageUpdate
          ? `✅ Day ${dayNumber} (${language}) base structure saved`
          : `✅ Day ${dayNumber} (${language}) translation saved`
      );

      res.status(200).json({ 
        success: true, 
        message: `Day ${dayNumber} (${language}) configuration saved successfully`,
        dayConfig: { ...mergedResponse, language }
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
