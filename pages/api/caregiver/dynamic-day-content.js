import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';
import CaregiverProgram from '../../../models/CaregiverProgram';

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

    // Get caregiver program data to determine burden level
    const caregiverProgram = await CaregiverProgram.findOne({ caregiverId });
    const burdenLevel = caregiverProgram?.burdenLevel || 'default';

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

    // Determine which level to show content from
    let levelKey = 'default';
    
    if (dayConfig.hasTest && dayConfig.testConfig?.scoreRanges) {
      // If day has test but caregiver hasn't taken it yet, show first level or default
      if (burdenLevel && burdenLevel !== 'default') {
        // Use caregiver's burden level if available
        const matchingRange = dayConfig.testConfig.scoreRanges.find(
          range => range.levelKey === burdenLevel
        );
        
        if (matchingRange) {
          levelKey = matchingRange.levelKey;
        } else {
          // Fallback to first level if burden level doesn't match
          levelKey = dayConfig.testConfig.scoreRanges[0]?.levelKey || 'default';
        }
      } else {
        // No burden level yet, use first level as default for days with tests
        levelKey = dayConfig.testConfig.scoreRanges[0]?.levelKey || 'default';
      }
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

    // Prepare response
    const response = {
      success: true,
      dayNumber,
      language: lang,
      dayName: dayConfig.dayName || `Day ${dayNumber}`,
      hasTest: dayConfig.hasTest,
      burdenLevel,
      levelLabel: levelConfig.levelLabel || '',
      tasks,
      totalTasks: tasks.length
    };

    // Include test configuration if day has test and caregiver hasn't completed it
    if (dayConfig.hasTest && dayConfig.testConfig) {
      const testCompleted = caregiverProgram?.day1?.burdenTestCompleted || false;
      
      if (!testCompleted) {
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
          }))
        };
      }
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
  
  // Interactive field
  if (content.fieldType) {
    result.fieldType = content.fieldType;
    result.placeholder = content.placeholder || '';
  }

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
      activityName: activity.activityName || '',
      activityDescription: activity.activityDescription || ''
    }));
  }

  // Checklist items
  if (content.checklistItems && Array.isArray(content.checklistItems)) {
    result.checklistItems = content.checklistItems.map(item => ({
      itemText: item.itemText || ''
    }));
  }

  return result;
}
