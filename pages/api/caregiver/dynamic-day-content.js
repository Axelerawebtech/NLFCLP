import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';
import {
  getStructureForDay,
  getTranslationForDay,
  composeDayConfig,
  normalizeAnswerValue,
  inferTaskTypeFromContent
} from '../../../lib/dynamicDayUtils';

const buildFollowupTaskId = ({ dayNumber, questionId, optionKey, optionIndex }) => {
  const dayPart = typeof dayNumber === 'number' ? `day${dayNumber}` : 'day';
  const questionPart = (questionId ?? `q${(optionIndex ?? 0) + 1}`).toString().trim().replace(/\s+/g, '-');
  const optionPart = (optionKey ?? `opt${(optionIndex ?? 0) + 1}`).toString().trim().replace(/\s+/g, '-');
  return `${dayPart}_${questionPart}_${optionPart}_followup`;
};

const ensureFollowupTaskMeta = (task, context) => {
  if (!task) return null;
  const normalized = { ...task };
  if (!normalized.taskId) {
    normalized.taskId = buildFollowupTaskId(context);
  }
  if (normalized.taskOrder === undefined) {
    normalized.taskOrder = (context.optionIndex ?? 0) + 1;
  }
  if (!normalized.taskType) {
    normalized.taskType = inferTaskTypeFromContent(normalized) || 'motivation-message';
  }
  return normalized;
};

/**
 * API Route: /api/caregiver/dynamic-day-content
 * Method: GET
 * 
 * Purpose: Fetch day content for caregiver based on:
 * - Day number
 * - Burden level (if applicable)
 * - Language preference
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  await dbConnect();

  try {
    const { caregiverId, day, language } = req.query;

    if (!caregiverId || day === undefined) {
      return res.status(400).json({ 
        success: false,
        error: 'Caregiver ID and day number are required' 
      });
    }

    const dayNumber = parseInt(day);
    const lang = language || 'english';

    // Get global config
    const config = await ProgramConfig.findOne({ configType: 'global' });
    if (!config) {
      return res.status(404).json({ 
        success: false,
        error: 'Configuration not found' 
      });
    }

    // Find caregiver first (handle both string caregiverId and ObjectId)
    const Caregiver = require('../../../models/Caregiver').default;
    let caregiver = await Caregiver.findOne({ caregiverId });
    
    // If not found and the caregiverId looks like an ObjectId, try finding by _id
    if (!caregiver && /^[0-9a-fA-F]{24}$/.test(caregiverId)) {
      caregiver = await Caregiver.findById(caregiverId);
    }
    
    if (!caregiver) {
      return res.status(404).json({ 
        success: false,
        error: 'Caregiver not found',
        searchedFor: caregiverId
      });
    }

    // Get caregiver program data to determine burden level (use caregiver._id)
    const caregiverProgram = await CaregiverProgram.findOne({ caregiverId: caregiver._id });
    const programBurdenLevel = caregiverProgram?.burdenLevel || 'default';
    const dayModule = caregiverProgram?.dayModules?.find(m => m.day === dayNumber);
    const dynamicTestAssignedLevel = dayModule?.dynamicTest?.assignedLevel;
    const dynamicTestCompleted = Boolean(dayModule?.dynamicTestCompleted || dayModule?.dynamicTest?.completedAt);

    const useUnified = Array.isArray(config.dynamicDayStructures) && config.dynamicDayStructures.length > 0;
    let dayConfig;

    if (useUnified) {
      const structure = getStructureForDay(config, dayNumber);
      if (structure) {
        const translation = getTranslationForDay(config, dayNumber, lang);
        dayConfig = composeDayConfig(structure, translation);
      } else {
        dayConfig = config.dynamicDays?.find(
          d => d.dayNumber === dayNumber && d.language === lang
        );
      }
    } else {
      dayConfig = config.dynamicDays?.find(
        d => d.dayNumber === dayNumber && d.language === lang
      );
    }

    if (!dayConfig) {
      return res.status(404).json({ 
        success: false,
        error: `Day ${dayNumber} (${lang}) not configured`,
        dayNumber,
        language: lang
      });
    }

    // Check if day is enabled
    if (!dayConfig.enabled) {
      return res.status(403).json({ 
        success: false,
        error: `Day ${dayNumber} is currently disabled`,
        dayNumber
      });
    }

    const dayHasDynamicTest = hasActiveDynamicTestConfig(dayConfig);
    const testSettings = dayConfig.testConfig || {};
    const testDisablesLevels = Boolean(testSettings.disableLevels);

    // Determine which level to show content from
    let levelKey;
    if (dayHasDynamicTest) {
      if (testDisablesLevels) {
        levelKey = dayConfig.contentByLevel?.[0]?.levelKey || 'default';
      } else {
        levelKey = dynamicTestAssignedLevel || dayModule?.contentLevel || (programBurdenLevel !== 'default' ? programBurdenLevel : 'default');

        if ((!levelKey || levelKey === 'default') && dayConfig.testConfig?.scoreRanges?.length) {
          levelKey = dayConfig.testConfig.scoreRanges[0].levelKey || 'default';
        }
      }
    } else {
      levelKey = dayConfig.defaultLevelKey || dayConfig.contentByLevel?.[0]?.levelKey || 'default';
    }

    // Get content for the level
    let levelConfig = dayConfig.contentByLevel?.find(l => l.levelKey === levelKey);
    let fallbackLevelUsed = false;

    if (!levelConfig) {
      if (Array.isArray(dayConfig.contentByLevel) && dayConfig.contentByLevel.length > 0) {
        // Fall back to the first configured level so the assessment can still be shown
        levelConfig = dayConfig.contentByLevel[0];
        levelKey = levelConfig?.levelKey || levelKey || 'default';
        fallbackLevelUsed = true;
        console.warn('[dynamic-day-content] Missing content level, using fallback', {
          dayNumber,
          requestedLevel: levelKey,
          fallbackLevel: levelConfig?.levelKey
        });
      } else {
        // No level content configured at all; proceed with empty tasks but keep the test available
        levelConfig = { tasks: [], levelLabel: '' };
        levelKey = levelKey || 'default';
        console.warn('[dynamic-day-content] No content levels configured for day, returning test-only payload', {
          dayNumber
        });
      }
    }

    // Filter enabled tasks and sort by order
    const tasks = (levelConfig.tasks || [])
      .filter(task => task.enabled && task.taskType !== 'dynamic-test')
      .sort((a, b) => a.taskOrder - b.taskOrder)
      .map(task => ({
        taskId: task.taskId,
        taskOrder: task.taskOrder,
        taskType: task.taskType,
        title: task.title || '',
        description: task.description || '',
        content: extractLocalizedContent(task.content)
      }));

    const branchingTasks = buildBranchingTasks({
      dayConfig,
      dayModule,
      includeOnlyCompleted: true
    });

    if (branchingTasks.length > 0) {
      const lastOrder = tasks.reduce((max, task) => Math.max(max, task.taskOrder || 0), 0);
      const startingOrder = lastOrder > 0 ? lastOrder + 1 : 1;
      branchingTasks.forEach((branchTask, idx) => {
        const taskOrder = branchTask.taskOrder ?? startingOrder + idx;
        tasks.push({
          ...branchTask,
          taskOrder
        });
      });
    }

    // Save tasks to the dayModule for progress tracking
    if (caregiverProgram) {
      const dayModule = caregiverProgram.dayModules?.find(m => m.day === dayNumber);
      if (dayModule) {
        console.log(`🔍 Day ${dayNumber} current state:`, {
          existingTasksCount: dayModule.tasks?.length || 0,
          newTasksCount: tasks.length,
          existingTaskIds: dayModule.tasks?.map(t => t.taskId) || [],
          newTaskIds: tasks.map(t => t.taskId)
        });
        
        // Only update if tasks haven't been saved yet or are different
        const tasksChanged = !dayModule.tasks || 
                           dayModule.tasks.length !== tasks.length ||
                           JSON.stringify(dayModule.tasks.map(t => t.taskId).sort()) !== 
                           JSON.stringify(tasks.map(t => t.taskId).sort());
        
        console.log(`🔍 Day ${dayNumber} tasksChanged:`, tasksChanged);
        
        if (tasksChanged) {
          dayModule.tasks = tasks;
          caregiverProgram.markModified('dayModules');
          await caregiverProgram.save({ validateBeforeSave: false });
          console.log(`✅ Saved ${tasks.length} tasks to Day ${dayNumber} module`);
        } else {
          console.log(`ℹ️ Day ${dayNumber} tasks unchanged, skipping save`);
        }
      } else {
        console.log(`⚠️ Day ${dayNumber} module not found in caregiverProgram`);
      }
    } else {
      console.log(`⚠️ caregiverProgram not found`);
    }

    // Prepare response
    const response = {
      success: true,
      dayNumber,
      language: lang,
      dayName: dayConfig.dayName || `Day ${dayNumber}`,
      hasTest: dayHasDynamicTest,
      burdenLevel: levelKey || programBurdenLevel,
      levelLabel: levelConfig.levelLabel || '',
      tasks,
      totalTasks: tasks.length,
      testCompleted: dynamicTestCompleted
    };

    // Include test configuration for both pending and review states
    if (dayHasDynamicTest) {
      response.test = {
        testName: dayConfig.testConfig.testName || '',
        testType: dayConfig.testConfig.testType,
        questions: dayConfig.testConfig.questions?.map(q => ({
          id: q.id,
          questionText: q.questionText || '',
          options: q.options?.map(opt => ({
            optionText: opt.optionText || '',
            score: opt.score
          }))
        })),
        scoreRanges: dayConfig.testConfig.scoreRanges || []
      };
      response.testReadOnly = dynamicTestCompleted;
    }

    if (fallbackLevelUsed) {
      response.fallbackLevelUsed = true;
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching dynamic day content:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch day content',
      details: error.message 
    });
  }
}

/**
 * Extract content from task content object (already in correct language)
 */
function extractLocalizedContent(content) {
  if (!content) return {};

  const result = {};
  if (typeof content !== 'object') return content;

  // Simple string fields - already in correct language
  if (content.videoUrl) result.videoUrl = content.videoUrl;
  if (content.audioUrl) result.audioUrl = content.audioUrl;
  if (content.textContent) result.textContent = content.textContent;
  if (content.reflectionQuestion) result.reflectionQuestion = content.reflectionQuestion;
  if (content.feelingQuestion) result.feelingQuestion = content.feelingQuestion;
  
  if (content.fieldType || content.placeholder || content.problemLabel || content.solutionLabel) {
    result.fieldType = content.fieldType || 'text-input';
    if (content.placeholder !== undefined) result.placeholder = content.placeholder;
    if (content.problemLabel !== undefined) result.problemLabel = content.problemLabel;
    if (content.solutionLabel !== undefined) result.solutionLabel = content.solutionLabel;
  }

  // Reminder fields
  if (content.reminderMessage) result.reminderMessage = content.reminderMessage;
  if (content.frequency) result.frequency = content.frequency;
  if (content.reminderTime) result.reminderTime = content.reminderTime;
  if (content.targetAudience) result.targetAudience = content.targetAudience;
  if (content.targetLevels) result.targetLevels = content.targetLevels;
  if (content.weekDays) result.weekDays = content.weekDays;
  if (content.customInterval) result.customInterval = content.customInterval;

  // Quick assessment questions
  if (content.questions && Array.isArray(content.questions)) {
    result.questions = content.questions.map(q => ({
      questionText: q.questionText || '',
      questionType: q.questionType,
      options: q.options?.map(opt => ({
        optionText: opt.optionText || ''
      }))
    }));
  }

  // Activities
  if (content.activities && Array.isArray(content.activities)) {
    result.activities = content.activities.map(activity => ({
      activityName: activity.activityName || ''
    }));
  }

  // Checklist items (old structure - for backward compatibility)
  if (content.checklistItems && Array.isArray(content.checklistItems)) {
    result.checklistItems = content.checklistItems.map(item => ({
      itemText: item.itemText || ''
    }));
  }

  // Task checklist question (new structure)
  if (content.checklistQuestion) {
    result.checklistQuestion = content.checklistQuestion;
  }

  // Reflection prompt slider labels
  if (content.sliderLeftLabel) result.sliderLeftLabel = content.sliderLeftLabel;
  if (content.sliderRightLabel) result.sliderRightLabel = content.sliderRightLabel;

  // Visual cue
  if (content.imageUrl) result.imageUrl = content.imageUrl;

  if (!Object.keys(result).length) {
    try {
      return JSON.parse(JSON.stringify(content));
    } catch (err) {
      return { ...content };
    }
  }

  return result;
}

function hasActiveDynamicTestConfig(dayConfig) {
  if (!dayConfig?.hasTest) return false;
  const questions = dayConfig?.testConfig?.questions;
  return Array.isArray(questions) && questions.length > 0;
}

function buildBranchingTasks({ dayConfig, dayModule, includeOnlyCompleted = true }) {
  if (!dayConfig?.testConfig?.questions?.length) return [];

  const followupToggle = dayConfig?.testConfig?.enableFollowupTasks;
  const hasDefinedFollowups = dayConfig.testConfig.questions.some(question =>
    Array.isArray(question?.options) && question.options.some(option => option?.followupTask)
  );
  const followupsEnabled = followupToggle === undefined ? hasDefinedFollowups : Boolean(followupToggle);
  if (!followupsEnabled) return [];

  if (includeOnlyCompleted) {
    const completed = Boolean(dayModule?.dynamicTestCompleted || dayModule?.dynamicTest?.completedAt);
    if (!completed) return [];
  }

  const answers = Array.isArray(dayModule?.dynamicTest?.answers) ? dayModule.dynamicTest.answers : [];
  const answerDetails = Array.isArray(dayModule?.dynamicTest?.answerDetails)
    ? dayModule.dynamicTest.answerDetails
    : null;

  const tasks = [];

  dayConfig.testConfig.questions.forEach((question, questionIdx) => {
    const detail = answerDetails && answerDetails[questionIdx] ? answerDetails[questionIdx] : null;
    const fallbackScore = answers[questionIdx];
    const selectedOption = resolveSelectedOption(question, detail, fallbackScore);
    if (!selectedOption || !selectedOption.followupTask || selectedOption.followupTask.enabled === false) {
      return;
    }

    const selectedOptionIndex = Array.isArray(question.options)
      ? question.options.indexOf(selectedOption)
      : -1;

    const taskBase = ensureFollowupTaskMeta(selectedOption.followupTask, {
      dayNumber: dayConfig?.dayNumber,
      questionId: question.id || question.questionId || questionIdx + 1,
      optionKey: selectedOption.optionKey,
      optionIndex: selectedOptionIndex >= 0 ? selectedOptionIndex : questionIdx
    });
    if (!taskBase) {
      return;
    }
    tasks.push({
      taskId: taskBase.taskId,
      taskType: taskBase.taskType,
      title: taskBase.title || question.questionText || 'Follow-up Task',
      description: taskBase.description || '',
      content: extractLocalizedContent(taskBase.content),
      branchingSource: {
        questionId: question.id || question.questionId || questionIdx + 1,
        optionKey: selectedOption.optionKey,
        answerValue: selectedOption.answerValue || selectedOption.optionText || ''
      },
      taskOrder: taskBase.taskOrder
    });
  });

  return tasks;
}

function resolveSelectedOption(question, answerDetail, fallbackScore) {
  if (!question?.options?.length) return null;

  const tryMatchByOptionKey = (key) => {
    if (!key) return null;
    return question.options.find(opt => opt.optionKey === key) || null;
  };

  const tryMatchByAnswerValue = (value) => {
    if (!value) return null;
    const normalized = normalizeAnswerValue(value);
    if (!normalized) return null;
    return question.options.find(opt => normalizeAnswerValue(opt.answerValue || opt.optionText) === normalized) || null;
  };

  const tryMatchByScore = (score) => {
    if (score === undefined || score === null) return null;
    return question.options.find(opt => opt.score === score) || null;
  };

  return (
    tryMatchByOptionKey(answerDetail?.optionKey) ||
    tryMatchByAnswerValue(answerDetail?.answerValue) ||
    tryMatchByScore(answerDetail?.score) ||
    tryMatchByScore(fallbackScore)
  );
}
