import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';
import ProgramConfig from '../../../models/ProgramConfig';
import {
  getStructureForDay,
  getTranslationForDay,
  composeDayConfig
} from '../../../lib/dynamicDayUtils';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { caregiverId, day, videoProgress, videoWatched, videoCompleted, taskResponses, tasksCompleted, taskResponse } = req.body;
      
      if (!caregiverId || day === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Caregiver ID and day are required'
        });
      }
      
      // Enhanced caregiver lookup - try both string caregiverId and ObjectId
    const Caregiver = require('../../../models/Caregiver').default;
    let caregiver;
    
    // First try to find by caregiverId string
    caregiver = await Caregiver.findOne({ caregiverId });
    
    // If not found and the caregiverId looks like an ObjectId, try finding by _id
    if (!caregiver && /^[0-9a-fA-F]{24}$/.test(caregiverId)) {
      console.log('🔍 Video progress - Tried finding caregiver by string, now trying ObjectId...');
      caregiver = await Caregiver.findById(caregiverId);
      if (caregiver) {
        console.log(`✅ Video progress - Found caregiver by ObjectId: ${caregiver.name} (${caregiver.caregiverId})`);
      }
    }
    
    if (!caregiver) {
      return res.status(404).json({ 
        error: 'Caregiver not found',
        searchedFor: caregiverId,
        searchMethods: ['caregiverId string', 'MongoDB ObjectId']
      });
    }

    // Then find the program using the caregiver's ObjectId
    let program = await CaregiverProgram.findOne({ caregiverId: caregiver._id });
      
      if (!program) {
        return res.status(404).json({
          success: false,
          message: 'Program not found'
        });
      }
      
      const dayModule = program.dayModules.find(m => m.day === day);
      
      if (!dayModule) {
        return res.status(400).json({
          success: false,
          message: 'Invalid day'
        });
      }

      const preferredLanguages = buildLanguagePreferenceOrder(program.language || 'english');
      let cachedProgramConfig;
      let cachedDayConfig;

      const loadProgramConfig = async () => {
        if (cachedProgramConfig !== undefined) return cachedProgramConfig;
        const caregiverConfig = await ProgramConfig.findOne({ configType: 'caregiver-specific', caregiverId: caregiver._id });
        cachedProgramConfig = caregiverConfig || await ProgramConfig.findOne({ configType: 'global' });
        return cachedProgramConfig;
      };

      const resolveUnifiedDayConfig = (configDoc) => {
        const structure = getStructureForDay(configDoc, day);
        if (!structure) return null;

        let translation = null;
        let resolvedLanguage = structure.baseLanguage || preferredLanguages[0] || 'english';
        for (const lang of preferredLanguages) {
          const candidate = getTranslationForDay(configDoc, day, lang);
          if (candidate) {
            translation = candidate;
            resolvedLanguage = lang;
            break;
          }
        }

        const merged = composeDayConfig(structure, translation);
        if (!merged) return null;
        return { ...merged, language: resolvedLanguage };
      };

      const resolveLegacyDayConfig = (configDoc) => {
        if (!configDoc?.dynamicDays?.length) return null;
        for (const lang of preferredLanguages) {
          const match = configDoc.dynamicDays.find(entry => entry.dayNumber === day && entry.language === lang);
          if (match) {
            return match;
          }
        }
        return null;
      };

      const getDayConfig = async () => {
        if (cachedDayConfig !== undefined) return cachedDayConfig;
        const config = await loadProgramConfig();
        if (!config) {
          cachedDayConfig = null;
          return cachedDayConfig;
        }

        const hasUnifiedStructures = Array.isArray(config.dynamicDayStructures) && config.dynamicDayStructures.length > 0;
        if (hasUnifiedStructures) {
          cachedDayConfig = resolveUnifiedDayConfig(config);
          return cachedDayConfig;
        }

        cachedDayConfig = resolveLegacyDayConfig(config);
        return cachedDayConfig;
      };

      const doesDayHaveDynamicTest = async () => {
        const localTestExists = Boolean(
          dayModule.dynamicTestCompleted ||
          (dayModule.dynamicTest && (
            dayModule.dynamicTest.testName ||
            dayModule.dynamicTest.assignedLevel ||
            dayModule.dynamicTest.totalScore !== undefined ||
            (Array.isArray(dayModule.dynamicTest.questions) && dayModule.dynamicTest.questions.length > 0) ||
            (Array.isArray(dayModule.dynamicTest.answers) && dayModule.dynamicTest.answers.length > 0)
          ))
        );

        if (localTestExists) {
          return true;
        }

        const dayConfig = await getDayConfig();
        return hasActiveDynamicTestConfig(dayConfig);
      };
      
      // Update video progress
      if (videoProgress !== undefined) {
        dayModule.videoProgress = videoProgress;
      }
      
      if (videoWatched !== undefined) {
        dayModule.videoWatched = videoWatched;
      }
      
      if (videoCompleted !== undefined) {
        dayModule.videoCompleted = videoCompleted;
        if (videoCompleted) {
          dayModule.videoCompletedAt = new Date();
          // Mark as watched when completed
          dayModule.videoWatched = true;
          dayModule.videoProgress = 100;
        }
      }
      
      // Handle individual task response (for feeling check, task checklist, etc.)
      if (taskResponse) {
        if (!taskResponse.taskId) {
          throw new Error('taskResponse.taskId is required');
        }

        // Initialize taskResponses array if it doesn't exist or is not an array
        if (!Array.isArray(dayModule.taskResponses)) {
          dayModule.taskResponses = [];
        }

        const matchedTask = Array.isArray(dayModule.tasks)
          ? dayModule.tasks.find(task => task.taskId === taskResponse.taskId)
          : null;

        const normalizedTaskType = taskResponse.taskType || matchedTask?.taskType || 'task';
        const sanitizedResponseText = typeof taskResponse.responseText === 'string'
          ? taskResponse.responseText.trim()
          : '';
        const payloadData = buildResponseDataPayload(taskResponse);

        // Check if response already exists for this task
        const existingIndex = dayModule.taskResponses.findIndex(
          r => r.taskId === taskResponse.taskId
        );
        
        // Prepare the response object with all data
        const responseObj = {
          taskId: taskResponse.taskId,
          taskType: normalizedTaskType,
          responseText: sanitizedResponseText,
          responseData: payloadData,
          completed: taskResponse.completed !== undefined ? taskResponse.completed : true,
          completedAt: taskResponse.completedAt ? new Date(taskResponse.completedAt) : new Date()
        };
        
        if (existingIndex >= 0) {
          dayModule.taskResponses[existingIndex] = responseObj;
        } else {
          dayModule.taskResponses.push(responseObj);
        }

        const isVideoTask = normalizedTaskType === 'video' || normalizedTaskType === 'calming-video';
        if (isVideoTask) {
          const payloadProgress = typeof taskResponse.videoProgress === 'number'
            ? Math.max(0, Math.min(100, Math.round(taskResponse.videoProgress)))
            : null;

          if (payloadProgress !== null) {
            const previousProgress = dayModule.videoProgress || 0;
            dayModule.videoProgress = Math.max(previousProgress, payloadProgress);
            if (payloadProgress > 0 && !dayModule.videoStartedAt) {
              dayModule.videoStartedAt = responseObj.completedAt || new Date();
            }
            if (payloadProgress >= 100) {
              dayModule.videoWatched = true;
              dayModule.videoCompleted = true;
              dayModule.videoCompletedAt = responseObj.completedAt || dayModule.videoCompletedAt || new Date();
            }
          }

          if (responseObj.completed) {
            dayModule.videoWatched = true;
            dayModule.videoCompleted = true;
            dayModule.videoCompletedAt = responseObj.completedAt || dayModule.videoCompletedAt || new Date();
            dayModule.videoProgress = 100;
          } else if (!dayModule.videoWatched) {
            dayModule.videoWatched = true;
          }
        }

        recordDailyTaskResponse(program, day, {
          taskId: responseObj.taskId,
          taskType: normalizedTaskType,
          responseText: sanitizedResponseText,
          responseData: payloadData,
          completedAt: responseObj.completedAt
        });
        
        console.log(`✅ Saved task response for ${normalizedTaskType} (${taskResponse.taskId})`);
      }
      
      // Update task responses (bulk update)
      if (taskResponses && Array.isArray(taskResponses)) {
        dayModule.taskResponses = taskResponses;
      }
      
      if (tasksCompleted !== undefined) {
        dayModule.tasksCompleted = tasksCompleted;
      }
      
      // Calculate progress percentage based on actual task completion
      let progress = 0;
      
      // Initialize taskResponses array if needed
      if (!Array.isArray(dayModule.taskResponses)) {
        dayModule.taskResponses = [];
      }
      
      // Count unique completed tasks from taskResponses
      const uniqueCompletedTaskIds = [...new Set(dayModule.taskResponses.map(r => r.taskId))];
      
      // Get the day's tasks - they should be stored in dayModule.tasks
      let allTasks = Array.isArray(dayModule.tasks) ? dayModule.tasks : [];

      const backfillTasksFromConfig = async ({ forceReplace = false } = {}) => {
        try {
          const dayConfig = await getDayConfig();
          if (!dayConfig) return [];

          let levelKey = 'default';
          if (hasActiveDynamicTestConfig(dayConfig) && dayConfig.testConfig?.scoreRanges?.length) {
            if (dayModule.contentLevel) {
              levelKey = dayModule.contentLevel;
            } else if (program.burdenLevel) {
              const match = dayConfig.testConfig.scoreRanges.find(range =>
                range.levelKey?.toLowerCase() === program.burdenLevel.toLowerCase()
              );
              levelKey = match?.levelKey || dayConfig.testConfig.scoreRanges[0].levelKey || 'default';
            } else {
              levelKey = dayConfig.testConfig.scoreRanges[0].levelKey || 'default';
            }
          }

          const levelConfig = dayConfig.contentByLevel?.find(l => l.levelKey === levelKey) || dayConfig.contentByLevel?.[0];
          if (!levelConfig?.tasks?.length) return [];

          const mappedTasks = levelConfig.tasks
            .filter(task => task.enabled)
            .map(task => ({
              taskId: task.taskId,
              taskOrder: task.taskOrder,
              taskType: task.taskType,
              title: task.title || '',
              description: task.description || '',
              content: task.content || {}
            }));

          if (mappedTasks.length && (forceReplace || !Array.isArray(dayModule.tasks) || dayModule.tasks.length === 0)) {
            dayModule.tasks = mappedTasks;
            program.markModified('dayModules');
          }

          return mappedTasks;
        } catch (configError) {
          console.error(`❌ Error backfilling tasks for Day ${day}:`, configError);
          return [];
        }
      };

      const deriveActionableTasks = tasks => Array.isArray(tasks)
        ? tasks.filter(task => task.taskType !== 'reminder' && task.taskType !== 'dynamic-test')
        : [];

      let actionableTasks = deriveActionableTasks(allTasks);
      let taskMap = actionableTasks.reduce((acc, task) => {
        if (task?.taskId) acc[task.taskId] = task;
        return acc;
      }, {});

      let totalTasks = actionableTasks.length;

      const needsTaskSync = (totalTasks === 0 && uniqueCompletedTaskIds.length > 0)
        || uniqueCompletedTaskIds.some(taskId => taskId && !taskMap[taskId]);

      if (needsTaskSync) {
        console.log(`⚠️ Day ${day}: Task definitions incomplete. Syncing from ProgramConfig...`);
        const filledTasks = await backfillTasksFromConfig({ forceReplace: true });
        if (filledTasks.length) {
          allTasks = filledTasks;
          actionableTasks = deriveActionableTasks(filledTasks);
          taskMap = actionableTasks.reduce((acc, task) => {
            if (task?.taskId) acc[task.taskId] = task;
            return acc;
          }, {});
          totalTasks = actionableTasks.length;
        }
      }

      let completedTasksCount = uniqueCompletedTaskIds.filter(taskId => taskMap[taskId]).length;

      const hasDynamicTest = await doesDayHaveDynamicTest();
      const dynamicTestCompleted = Boolean(dayModule.dynamicTestCompleted || dayModule.dynamicTest?.completedAt);
      if (hasDynamicTest) {
        totalTasks += 1;
        if (dynamicTestCompleted) {
          completedTasksCount += 1;
        }
      }
      
      if (totalTasks > 0) {
        // Calculate percentage based on completed tasks
        progress = Math.min(100, Math.round((completedTasksCount / totalTasks) * 100));
        console.log(`✅ Day ${day}: Calculated progress as ${progress}% (${completedTasksCount}/${totalTasks} tasks)`);
      } else if (dayModule.videoCompleted || dayModule.videoWatched || dayModule.audioCompleted) {
        // Only use video/audio fallback if NO task system is in use at all (and no task responses)
        if (completedTasksCount === 0) {
          if (dayModule.videoCompleted || dayModule.videoWatched) progress += 50;
          if (dayModule.audioCompleted) progress += 50;
          console.log(`📺 Day ${day}: Using video/audio fallback progress: ${progress}%`);
        } else {
          // Have task responses but can't determine total - keep existing progress
          progress = dayModule.progressPercentage || 0;
          console.log(`⚠️ Day ${day}: Can't calculate progress, keeping existing: ${progress}%`);
        }
      }
      
      dayModule.progressPercentage = progress;
      
      // Mark as completed if all tasks are done
      if (totalTasks > 0 && completedTasksCount >= totalTasks && !dayModule.completedAt) {
        dayModule.completedAt = new Date();
        dayModule.tasksCompleted = true;
        
        console.log(`🎉 Day ${day} completed! All ${totalTasks} tasks done.`);
        
        // Auto-unlock next day if configured
        const nextDay = day + 1;
        if (nextDay <= 7) {
          const config = await ProgramConfig.findOne({
            configType: 'caregiver-specific',
            caregiverId
          }) || await ProgramConfig.findOne({ configType: 'global' });

          const waitTime = (() => {
            if (day === 0) {
              return program.customWaitTimes?.day0ToDay1
                ?? config?.waitTimes?.day0ToDay1
                ?? 24;
            }
            return program.customWaitTimes?.betweenDays
              ?? config?.waitTimes?.betweenDays
              ?? 24;
          })();
          const nextDayModule = program.dayModules.find(m => m.day === nextDay);
          if (nextDayModule && !nextDayModule.adminPermissionGranted) {
            if (waitTime <= 0) {
              program.unlockDay(nextDay, 'automatic');
            } else {
              const baseTime = dayModule.completedAt || new Date();
              const unlockTime = new Date(baseTime.getTime() + waitTime * 60 * 60 * 1000);
              nextDayModule.scheduledUnlockAt = unlockTime;
            }
          }
        }
      }
      
      // Update current day if this day is completed and it's the current day
      if (dayModule.progressPercentage === 100 && day === program.currentDay) {
        program.currentDay = Math.min(day + 1, 7);
      }
      
      // Recalculate overall progress (including partial progress from all days)
      const totalDays = 8; // Day 0-7
      const totalProgress = program.dayModules.reduce((sum, m) => sum + (m.progressPercentage || 0), 0);
      program.overallProgress = Math.round(totalProgress / totalDays);
      
      console.log(`📊 Overall progress updated: ${program.overallProgress}% (${totalProgress} total from ${totalDays} days)`);
      
      program.lastActiveAt = new Date();
      
      // Mark dayModules as modified to ensure save
      program.markModified('dayModules');
      
      await program.save({ validateBeforeSave: false });
      
      console.log(`✅ SAVED to database - Day ${day}:`, {
        progressPercentage: dayModule.progressPercentage,
        taskResponsesCount: dayModule.taskResponses?.length || 0,
        taskResponsesTaskIds: dayModule.taskResponses?.map(r => r.taskId) || [],
        totalTasks,
        completedTasksCount,
        overallProgress: program.overallProgress
      });
      
      return res.status(200).json({
        success: true,
        message: 'Progress updated successfully',
        data: {
          dayModule,
          currentDay: program.currentDay,
          overallProgress: program.overallProgress
        }
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating progress',
        error: error.message
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

function buildResponseDataPayload(taskResponse = {}) {
  if (!taskResponse || typeof taskResponse !== 'object') return null;

  const ignoredKeys = new Set(['taskId', 'taskType', 'completedAt', 'completed', 'responseText', '_id']);
  const payload = {};

  Object.entries(taskResponse).forEach(([key, value]) => {
    if (ignoredKeys.has(key)) return;
    if (value === undefined || value === null) return;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '') return;
      payload[key] = trimmed;
      return;
    }

    payload[key] = value;
  });

  return Object.keys(payload).length ? payload : null;
}

function ensureMapFromSource(source) {
  if (source instanceof Map) return source;
  if (!source) return new Map();
  if (source instanceof Object) {
    return new Map(Object.entries(source));
  }
  return new Map();
}

function recordDailyTaskResponse(program, day, responseRecord = {}) {
  if (!program || !responseRecord.taskId) return;

  if (!Array.isArray(program.dailyTasks)) {
    program.dailyTasks = [];
  }

  let dayLog = program.dailyTasks.find(entry => entry.day === day);
  if (!dayLog) {
    dayLog = {
      day,
      responses: new Map(),
      completedAt: responseRecord.completedAt || new Date()
    };
    program.dailyTasks.push(dayLog);
  }

  if (!dayLog.responses || typeof dayLog.responses.set !== 'function') {
    dayLog.responses = ensureMapFromSource(dayLog.responses);
  }

  dayLog.responses.set(responseRecord.taskId, {
    taskId: responseRecord.taskId,
    taskType: responseRecord.taskType,
    responseText: responseRecord.responseText || null,
    responseData: responseRecord.responseData || null,
    completedAt: responseRecord.completedAt || new Date(),
    recordedAt: new Date()
  });

  dayLog.completedAt = responseRecord.completedAt || dayLog.completedAt || new Date();

  if (typeof dayLog.markModified === 'function') {
    dayLog.markModified('responses');
  }

  program.markModified('dailyTasks');
}

const LANGUAGE_PRIORITY = ['english', 'kannada', 'hindi'];

function buildLanguagePreferenceOrder(language) {
  const normalized = typeof language === 'string' ? language.toLowerCase() : null;
  if (normalized && LANGUAGE_PRIORITY.includes(normalized)) {
    return [normalized, ...LANGUAGE_PRIORITY.filter(lang => lang !== normalized)];
  }
  return [...LANGUAGE_PRIORITY];
}

function hasActiveDynamicTestConfig(dayConfig) {
  if (!dayConfig?.hasTest) return false;
  const questions = dayConfig?.testConfig?.questions;
  return Array.isArray(questions) && questions.length > 0;
}
