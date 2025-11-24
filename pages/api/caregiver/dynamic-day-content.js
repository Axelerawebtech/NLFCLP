import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';

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

    // Find day configuration for specific language
    const dayConfig = config.dynamicDays?.find(
      d => d.dayNumber === dayNumber && d.language === lang
    );
    
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

    const dayHasDynamicTest = Boolean(dayConfig.hasTest && dayConfig.testConfig);

    // Determine which level to show content from
    let levelKey;
    if (dayHasDynamicTest) {
      levelKey = dynamicTestAssignedLevel || dayModule?.contentLevel || (programBurdenLevel !== 'default' ? programBurdenLevel : 'default');

      if ((!levelKey || levelKey === 'default') && dayConfig.testConfig?.scoreRanges?.length) {
        levelKey = dayConfig.testConfig.scoreRanges[0].levelKey || 'default';
      }
    } else {
      levelKey = dayConfig.defaultLevelKey || dayConfig.contentByLevel?.[0]?.levelKey || 'default';
    }

    // Get content for the level
    const levelConfig = dayConfig.contentByLevel?.find(l => l.levelKey === levelKey);
    
    if (!levelConfig) {
      return res.status(404).json({ 
        success: false,
        error: `Content for level ${levelKey} not found`,
        dayNumber,
        levelKey,
        availableLevels: dayConfig.contentByLevel?.map(l => l.levelKey)
      });
    }

    // Filter enabled tasks and sort by order
    const tasks = (levelConfig.tasks || [])
      .filter(task => task.enabled)
      .sort((a, b) => a.taskOrder - b.taskOrder)
      .map(task => ({
        taskId: task.taskId,
        taskOrder: task.taskOrder,
        taskType: task.taskType,
        title: task.title || '',
        description: task.description || '',
        content: extractLocalizedContent(task.content)
      }));

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

  // Simple string fields - already in correct language
  if (content.videoUrl) result.videoUrl = content.videoUrl;
  if (content.audioUrl) result.audioUrl = content.audioUrl;
  if (content.textContent) result.textContent = content.textContent;
  if (content.reflectionQuestion) result.reflectionQuestion = content.reflectionQuestion;
  if (content.feelingQuestion) result.feelingQuestion = content.feelingQuestion;
  
  // Interactive field
  if (content.fieldType) {
    result.fieldType = content.fieldType;
    result.placeholder = content.placeholder || '';
    result.problemLabel = content.problemLabel || '';
    result.solutionLabel = content.solutionLabel || '';
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

  return result;
}
