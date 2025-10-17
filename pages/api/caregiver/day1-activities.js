import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgram';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { caregiverId, day, burdenLevel, problem, solution, activityType } = req.body;

    if (!caregiverId || !day || !activityType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the caregiver's program
    const caregiverProgram = await CaregiverProgram.findOne({ caregiverId });

    if (!caregiverProgram) {
      return res.status(404).json({ message: 'Caregiver program not found' });
    }

    // Find or create the day module
    let dayModule = caregiverProgram.dayModules.find(module => module.day === day);
    
    if (!dayModule) {
      dayModule = {
        day,
        videoCompleted: false,
        tasksCompleted: false,
        progressPercentage: 0,
        contentLevel: burdenLevel
      };
      caregiverProgram.dayModules.push(dayModule);
    }

    // Initialize activities array if it doesn't exist
    if (!dayModule.activities) {
      dayModule.activities = [];
    }

    // Add the new activity
    const activity = {
      type: activityType,
      data: {
        problem,
        solution,
        burdenLevel
      },
      completedAt: new Date()
    };

    dayModule.activities.push(activity);

    // Update progress
    if (activityType === 'problem-solving') {
      dayModule.progressPercentage = Math.min(dayModule.progressPercentage + 30, 100);
    }

    await caregiverProgram.save();

    res.status(200).json({ 
      message: 'Activity saved successfully',
      progress: dayModule.progressPercentage 
    });

  } catch (error) {
    console.error('Error saving Day 1 activity:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}