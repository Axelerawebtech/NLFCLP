import dbConnect from '../../../../lib/mongodb';
import ProgramConfig from '../../../../models/ProgramConfig';
import {
  getStructureForDay,
  getTranslationForDay,
  composeDayConfig,
  syncLegacyDynamicDay,
  sanitizeDynamicDayStructures
} from '../../../../lib/dynamicDayUtils';

const normalizeLevelKey = (value = '') => {
  if (!value && value !== 0) return '';
  return value.toString().trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const buildKeyVariants = (value = '') => {
  const normalized = normalizeLevelKey(value);
  if (!normalized) return [];
  const variants = new Set([normalized]);
  const stripped = normalized.replace(/-(level|content|tasks?)$/g, '');
  if (stripped && stripped !== normalized) {
    variants.add(stripped);
  }
  return Array.from(variants);
};

const findLevelByKey = (levels = [], requestedKey) => {
  if (!Array.isArray(levels) || !levels.length) return null;
  const targetVariants = buildKeyVariants(requestedKey);
  if (!targetVariants.length) return null;

  return levels.find(level => {
    const levelVariants = new Set([
      ...buildKeyVariants(level?.levelKey),
      ...buildKeyVariants(level?.levelLabel)
    ]);
    return targetVariants.some(variant => levelVariants.has(variant));
  }) || null;
};

const ensureLevelExists = (structure, levelKey, fallbackLabel = '') => {
  if (!structure.contentLevels) {
    structure.contentLevels = [];
  }
  let level = findLevelByKey(structure.contentLevels, levelKey);
  if (!level) {
    level = { levelKey, levelLabel: fallbackLabel || levelKey, tasks: [] };
    structure.contentLevels.push(level);
  }
  return level;
};

const ensureTranslationLevel = (translation, levelKey, fallbackLabel = '') => {
  if (!translation.levelContent) {
    translation.levelContent = [];
  }
  let level = findLevelByKey(translation.levelContent, levelKey);
  if (!level) {
    level = { levelKey, levelLabel: fallbackLabel || levelKey, tasks: [] };
    translation.levelContent.push(level);
  }
  return level;
};

const ensureTranslationEntry = (configDoc, dayNumber, language) => {
  const normalized = language?.toLowerCase() || 'english';
  if (!configDoc.dynamicDayTranslations) {
    configDoc.dynamicDayTranslations = [];
  }
  let entry = configDoc.dynamicDayTranslations.find(
    record => record.dayNumber === dayNumber && record.language === normalized
  );
  if (!entry) {
    entry = {
      dayNumber,
      language: normalized,
      dayName: '',
      testContent: null,
      levelContent: [],
      updatedAt: new Date()
    };
    configDoc.dynamicDayTranslations.push(entry);
  }
  return entry;
};

const generateTaskId = () => `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

/**
 * API Route: /api/admin/dynamic-days/tasks
 * Methods: POST, PUT, DELETE
 * 
 * Purpose: Manage tasks within a day/level
 * - Add new task
 * - Update task (including reorder)
 * - Delete task
 */

export default async function handler(req, res) {
  await dbConnect();

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'POST') {
    // Add new task
    try {
      const { dayNumber, language, levelKey, task } = req.body;

      if (dayNumber === undefined || !language || !levelKey || !task) {
        return res.status(400).json({ 
          success: false,
          error: 'Day number, language, level key, and task data are required' 
        });
      }

      const config = await ProgramConfig.findOne({ configType: 'global' });
      if (!config) {
        return res.status(404).json({ 
          success: false,
          error: 'Configuration not found' 
        });
      }

      const structure = getStructureForDay(config, dayNumber);
      if (!structure) {
        return res.status(404).json({
          success: false,
          error: `Day ${dayNumber} not found`
        });
      }

      const level = ensureLevelExists(structure, levelKey);
      const maxOrder = level.tasks?.length > 0 ? Math.max(...level.tasks.map(t => t.taskOrder)) : 0;
      const taskId = task.taskId || generateTaskId();
      const newTask = {
        taskId,
        taskType: task.taskType,
        taskOrder: maxOrder + 1,
        title: task.title || '',
        description: task.description || '',
        content: task.content || {},
        enabled: task.enabled !== false,
        createdAt: new Date()
      };

      if (!Array.isArray(level.tasks)) {
        level.tasks = [];
      }
      level.tasks.push(newTask);

      const translation = ensureTranslationEntry(config, dayNumber, language);
      const translationLevel = ensureTranslationLevel(translation, levelKey, level.levelLabel || levelKey);
      translationLevel.tasks.push({
        taskId,
        title: task.title || '',
        description: task.description || '',
        contentOverrides: task.content || {}
      });
      translation.updatedAt = new Date();

      config.markModified('dynamicDayStructures');
      config.markModified('dynamicDayTranslations');

      const mergedConfig = composeDayConfig(structure, translation);
      syncLegacyDynamicDay(config, { dayNumber, language, dayConfig: mergedConfig });
      sanitizeDynamicDayStructures(config);
      await config.save();

      res.status(200).json({ 
        success: true, 
        message: 'Task added successfully',
        task: newTask
      });

    } catch (error) {
      console.error('Error adding task:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to add task',
        details: error.message 
      });
    }

  } else if (req.method === 'PUT') {
    // Update task or reorder
    try {
      const { dayNumber, language, levelKey, taskId, updates, reorder } = req.body;

      if (dayNumber === undefined || !language || !levelKey || !taskId) {
        return res.status(400).json({ 
          success: false,
          error: 'Day number, language, level key, and task ID are required' 
        });
      }

      const config = await ProgramConfig.findOne({ configType: 'global' });
      if (!config) {
        return res.status(404).json({ 
          success: false,
          error: 'Configuration not found' 
        });
      }

      const structure = getStructureForDay(config, dayNumber);
      if (!structure) {
        return res.status(404).json({ 
          success: false,
          error: `Day ${dayNumber} not found` 
        });
      }

      const level = findLevelByKey(structure.contentLevels || [], levelKey);
      if (!level) {
        return res.status(404).json({
          success: false,
          error: 'Level not found'
        });
      }
      if (!level.tasks) {
        level.tasks = [];
      }

      const translation = ensureTranslationEntry(config, dayNumber, language);
      const translationLevel = ensureTranslationLevel(translation, level.levelKey || levelKey, level.levelLabel || levelKey);
      if (!translationLevel.tasks) {
        translationLevel.tasks = [];
      }

      const taskIndex = level.tasks.findIndex(t => t.taskId === taskId);
      let taskRecord = taskIndex >= 0 ? level.tasks[taskIndex] : null;
      let translationTask = translationLevel.tasks.find(t => t.taskId === taskId);

      if (taskRecord && !translationTask) {
        translationTask = {
          taskId,
          title: taskRecord.title,
          description: taskRecord.description,
          contentOverrides: taskRecord.content || {}
        };
        translationLevel.tasks.push(translationTask);
      }

      const translationOnly = !taskRecord && Boolean(translationTask);

      if (!taskRecord && !translationTask) {
        console.warn('[DynamicDayTasks] Task lookup failed', {
          dayNumber,
          language,
          levelKey,
          taskId,
          structureTaskIds: level.tasks?.map(t => t.taskId) || [],
          translationTaskIds: translationLevel.tasks?.map(t => t.taskId) || []
        });
        return res.status(404).json({ 
          success: false,
          error: 'Task not found' 
        });
      }

      if (reorder) {
        if (translationOnly) {
          return res.status(400).json({
            success: false,
            error: 'Cannot reorder task that exists only in translation context'
          });
        }

        const { newOrder } = reorder;
        const task = taskRecord;
        const oldOrder = task.taskOrder;
        if (newOrder !== oldOrder) {
          level.tasks.forEach(t => {
            if (newOrder > oldOrder) {
              if (t.taskOrder > oldOrder && t.taskOrder <= newOrder) {
                t.taskOrder--;
              }
            } else if (t.taskOrder >= newOrder && t.taskOrder < oldOrder) {
              t.taskOrder++;
            }
          });
          task.taskOrder = newOrder;
          level.tasks.sort((a, b) => a.taskOrder - b.taskOrder);
        }
      }

      if (updates) {
        if (taskRecord) {
          if (updates.title !== undefined) taskRecord.title = updates.title;
          if (updates.description !== undefined) taskRecord.description = updates.description;
          if (updates.content !== undefined) taskRecord.content = updates.content;
          if (updates.enabled !== undefined) taskRecord.enabled = updates.enabled;
          if (updates.taskType !== undefined) {
            taskRecord.taskType = updates.taskType;
          }
        }

        if (translationTask) {
          if (updates.title !== undefined) translationTask.title = updates.title;
          if (updates.description !== undefined) translationTask.description = updates.description;
          if (updates.content !== undefined) translationTask.contentOverrides = updates.content;
        }
      }

      translation.updatedAt = new Date();

      config.markModified('dynamicDayStructures');
      config.markModified('dynamicDayTranslations');

      const mergedConfig = composeDayConfig(structure, translation);
      syncLegacyDynamicDay(config, { dayNumber, language, dayConfig: mergedConfig });
      sanitizeDynamicDayStructures(config);
      await config.save();

      res.status(200).json({ 
        success: true, 
        message: 'Task updated successfully',
        task: taskRecord || translationTask
      });

    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to update task',
        details: error.message 
      });
    }

  } else if (req.method === 'DELETE') {
    // Delete task
    try {
      const { dayNumber, language, levelKey, taskId } = req.query;

      if (!dayNumber || !language || !levelKey || !taskId) {
        return res.status(400).json({ 
          success: false,
          error: 'Day number, language, level key, and task ID are required' 
        });
      }

      const config = await ProgramConfig.findOne({ configType: 'global' });
      if (!config) {
        return res.status(404).json({ 
          success: false,
          error: 'Configuration not found' 
        });
      }

      const numericDay = parseInt(dayNumber, 10);
      const structure = getStructureForDay(config, numericDay);
      if (!structure) {
        return res.status(404).json({ 
          success: false,
          error: `Day ${dayNumber} not found` 
        });
      }

      const level = findLevelByKey(structure.contentLevels || [], levelKey);
      if (!level) {
        return res.status(404).json({
          success: false,
          error: 'Level not found'
        });
      }
      if (!level.tasks) {
        level.tasks = [];
      }
      const taskIndex = level.tasks.findIndex(t => t.taskId === taskId);
      if (taskIndex === -1) {
        return res.status(404).json({ 
          success: false,
          error: 'Task not found' 
        });
      }

      const deletedOrder = level.tasks[taskIndex].taskOrder;
      level.tasks.splice(taskIndex, 1);
      level.tasks.forEach(t => {
        if (t.taskOrder > deletedOrder) {
          t.taskOrder--;
        }
      });

      // Remove translation entries for this task across languages
      if (Array.isArray(config.dynamicDayTranslations)) {
        config.dynamicDayTranslations.forEach(entry => {
          if (entry.dayNumber === numericDay && Array.isArray(entry.levelContent)) {
            entry.levelContent.forEach(lvl => {
              if (lvl.levelKey === levelKey && Array.isArray(lvl.tasks)) {
                lvl.tasks = lvl.tasks.filter(t => t.taskId !== taskId);
              }
            });
          }
        });
      }

      config.markModified('dynamicDayStructures');
      config.markModified('dynamicDayTranslations');

      const translation = getTranslationForDay(config, numericDay, language);
      const mergedConfig = composeDayConfig(structure, translation);
      syncLegacyDynamicDay(config, { dayNumber: numericDay, language, dayConfig: mergedConfig });
      sanitizeDynamicDayStructures(config);
      await config.save();

      res.status(200).json({ 
        success: true, 
        message: 'Task deleted successfully' 
      });

    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to delete task',
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
