import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';

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

    // Check if next day should be unlocked
    program.checkDayUnlock();

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
        completedAt: dayModule.completedAt
      },
      program: {
        currentDay: program.currentDay,
        overallProgress: program.overallProgress
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