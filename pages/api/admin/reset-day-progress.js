import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';

/**
 * API: /api/admin/reset-day-progress
 * Method: POST
 * 
 * Purpose: Reset a specific day's progress for a caregiver
 * - Clears video progress
 * - Clears task completion
 * - For Day 1: Optionally clears burden test results
 * - Resets progress percentage to 0
 * - Maintains day unlock status
 */

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      caregiverId,
      day,
      resetBurdenTest = false,
      resetDynamicTest = false
    } = req.body;

    if (!caregiverId || day === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: caregiverId and day' 
      });
    }

    // Validate day
    if (day < 0 || day > 7) {
      return res.status(400).json({ 
        error: 'Invalid day. Must be between 0 and 9' 
      });
    }

    // Get caregiver program
    const program = await CaregiverProgram.findOne({ caregiverId });
    
    if (!program) {
      return res.status(404).json({ error: 'Caregiver program not found' });
    }

    // Find the day module
    const dayModule = program.dayModules.find(m => m.day === day);
    
    if (!dayModule) {
      return res.status(404).json({ error: `Day ${day} module not found` });
    }

    let dailyTasksChanged = false;

    // Reset video progress
    dayModule.videoWatched = false;
    dayModule.videoCompleted = false;
    dayModule.videoProgress = 0;
    dayModule.videoStartedAt = null;
    dayModule.videoCompletedAt = null;

    // Reset audio progress
    dayModule.audioCompleted = false;
    dayModule.audioCompletedAt = null;

    // Reset task responses (new structure)
    dayModule.taskResponses = [];
    dayModule.tasksCompleted = false;
    dayModule.completedAt = null;
    
    // Reset task completion (old structure - for compatibility)
    if (dayModule.tasks && dayModule.tasks.length > 0) {
      dayModule.tasks.forEach(task => {
        task.completed = false;
        task.completedAt = null;
      });
    }

    // Remove consolidated daily task logs for this day
    if (Array.isArray(program.dailyTasks) && program.dailyTasks.length > 0) {
      const filteredDailyTasks = program.dailyTasks.filter(entry => entry?.day !== day);
      if (filteredDailyTasks.length !== program.dailyTasks.length) {
        program.dailyTasks = filteredDailyTasks;
        dailyTasksChanged = true;
      }
    } else if (program.dailyTasks) {
      program.dailyTasks = [];
      dailyTasksChanged = true;
    }

    const shouldResetDynamicAssessment = Boolean(resetDynamicTest || (day === 1 && resetBurdenTest));

    // ALWAYS reset dynamic test fields to ensure clean state
    // This fixes the issue where "Review Assessment" shows after reset
    dayModule.dynamicTestCompleted = false;
    dayModule.dynamicTest = null;
    dayModule.contentLevel = null;

    // Also clear any cached test results in taskResponses
    if (Array.isArray(dayModule.taskResponses)) {
      dayModule.taskResponses = dayModule.taskResponses.filter(resp => resp?.taskType !== 'dynamic-test');
    }

    // Additional Day 1 specific reset (only if explicitly requested)
    if (shouldResetDynamicAssessment && day === 1) {
      dayModule.burdenTestCompleted = false;
    }

    // Special handling for Day 1 - burden test reset
    if (day === 1 && shouldResetDynamicAssessment) {
      dayModule.burdenTestCompleted = false;
      dayModule.burdenLevel = null;
      dayModule.burdenScore = null;
      dayModule.videoTitle = null;
      dayModule.videoUrl = null;
      dayModule.content = null;

      // Also clear program-level burden data
      program.burdenLevel = null;
      program.burdenTestScore = null;
      program.burdenTestCompletedAt = null;
      
      if (program.zaritBurdenAssessment) {
        program.zaritBurdenAssessment = {
          answers: [],
          totalScore: null,
          burdenLevel: null,
          completedAt: null
        };
      }
    }

    // Reset progress percentage
    dayModule.progressPercentage = 0;

    // Update last modified timestamp
    dayModule.lastModifiedAt = new Date();

    // Mark as modified
    program.markModified('dayModules');
    if (dailyTasksChanged) {
      program.markModified('dailyTasks');
    }
    if (resetBurdenTest && day === 1) {
      program.markModified('zaritBurdenAssessment');
    }

    // Save without validation
    await program.save({ validateBeforeSave: false });

    console.log(`✅ Day ${day} progress reset for caregiver:`, caregiverId, {
      resetAssessment: shouldResetDynamicAssessment
    });

    res.status(200).json({
      success: true,
      message: `Day ${day} progress has been reset successfully (including any assessments)`,
      data: {
        day,
        resetDynamicTest: true, // Always reset dynamic tests
        progressPercentage: 0,
        videoWatched: false,
        audioCompleted: false,
        dynamicTestCompleted: false,
        burdenTestCompleted: day === 1 ? false : undefined
      }
    });

  } catch (error) {
    console.error('Error resetting day progress:', error);
    res.status(500).json({ 
      error: 'Failed to reset day progress',
      details: error.message 
    });
  }
}
