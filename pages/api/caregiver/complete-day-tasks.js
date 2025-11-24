import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';
import ProgramConfig from '../../../models/ProgramConfig';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { caregiverId, day, contentLevel, taskResponses } = req.body;

  if (!caregiverId || !day || !contentLevel || !taskResponses) {
    return res.status(400).json({ 
      error: 'Missing required fields: caregiverId, day, contentLevel, taskResponses' 
    });
  }

  try {
    await dbConnect();

    // Find the caregiver program
    // First, find the caregiver by caregiverId string
    const Caregiver = require('../../../models/Caregiver').default;
    const caregiver = await Caregiver.findOne({ caregiverId });
    
    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' });
    }

    // Then find the program using the caregiver's ObjectId
    let program = await CaregiverProgram.findOne({ caregiverId: caregiver._id });

    if (!program) {
      return res.status(404).json({ error: 'Caregiver program not found' });
    }

    // Find the day module
    const dayModule = program.dayModules.find(module => module.day === day);

    if (!dayModule) {
      return res.status(404).json({ error: `Day ${day} module not found` });
    }

    // Update task responses and mark as completed
    dayModule.taskResponses = new Map(Object.entries(taskResponses));
    dayModule.tasksCompleted = true;

    // Update progress for this day module
    program.updateDayProgress(day);

    let scheduledUnlockAt = null;
    let autoUnlockedDay = null;

    if (dayModule.progressPercentage === 100) {
      const nextDay = day + 1;
      if (nextDay <= 7) {
        const config = await ProgramConfig.findOne({
          configType: 'caregiver-specific',
          caregiverId: caregiver._id
        }) || await ProgramConfig.findOne({ configType: 'global' });

        const resolveWaitTime = () => {
          if (day === 0) {
            return program.customWaitTimes?.day0ToDay1
              ?? config?.waitTimes?.day0ToDay1
              ?? 24;
          }
          return program.customWaitTimes?.betweenDays
            ?? config?.waitTimes?.betweenDays
            ?? 24;
        };

        const waitTimeHours = resolveWaitTime();
        const nextDayModule = program.dayModules.find(module => module.day === nextDay);

        if (nextDayModule && !nextDayModule.adminPermissionGranted) {
          if (waitTimeHours <= 0) {
            program.unlockDay(nextDay, 'automatic');
            autoUnlockedDay = nextDay;
          } else {
            const baseTime = dayModule.completedAt || new Date();
            const unlockTime = new Date(baseTime.getTime() + waitTimeHours * 60 * 60 * 1000);
            nextDayModule.scheduledUnlockAt = unlockTime;
            scheduledUnlockAt = unlockTime;
          }
        }
      }
    }

    // Update current day if this day is completed
    if (dayModule.progressPercentage === 100) {
      program.currentDay = Math.min(program.currentDay + 1, 7);
    }

    // Add to daily tasks history
    program.dailyTasks.push({
      day,
      responses: new Map(Object.entries(taskResponses)),
      completedAt: new Date()
    });

    // Update last active time
    program.lastActiveAt = new Date();

    // Mark arrays as modified for Mongoose
    program.markModified('dayModules');
    program.markModified('dailyTasks');

    // Save the program
    await program.save();

    res.status(200).json({
      success: true,
      message: `Day ${day} tasks completed successfully`,
      dayModule: {
        day: dayModule.day,
        progressPercentage: dayModule.progressPercentage,
        tasksCompleted: dayModule.tasksCompleted,
        completedAt: dayModule.completedAt,
        scheduledUnlockAt
      },
      program: {
        currentDay: program.currentDay,
        overallProgress: program.overallProgress,
        autoUnlockedDay
      }
    });

  } catch (error) {
    console.error('Daily tasks completion error:', error);
    res.status(500).json({ 
      error: 'Failed to complete daily tasks',
      details: error.message 
    });
  }
}