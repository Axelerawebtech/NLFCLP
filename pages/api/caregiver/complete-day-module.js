import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgram';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { caregiverId, day, taskData } = req.body;

    if (!caregiverId || day === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find caregiver program
    // First, find the caregiver by caregiverId string
    const Caregiver = require('../../../models/Caregiver').default;
    const caregiver = await Caregiver.findOne({ caregiverId });
    
    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' });
    }

    // Then find the program using the caregiver's ObjectId
    let program = await CaregiverProgram.findOne({ caregiverId: caregiver._id });
    
    if (!caregiverProgram) {
      return res.status(404).json({ error: 'Caregiver program not found' });
    }

    // Complete the day module
    caregiverProgram.completeDayModule(day);
    
    // Add daily task responses if provided
    if (taskData) {
      caregiverProgram.addDailyTaskResponse(day, taskData);
    }

    // Update current day
    if (day === caregiverProgram.currentDay) {
      caregiverProgram.currentDay = Math.min(day + 1, 7);
    }

    // Progressive content reveal: unlock next day when current day is completed
    const nextDay = day + 1;
    if (nextDay <= 7) {
      const nextDayModule = caregiverProgram.dayModules.find(module => module.day === nextDay);
      if (nextDayModule && !nextDayModule.adminPermissionGranted) {
        // Unlock the next day immediately for progressive reveal
        caregiverProgram.unlockDay(nextDay, 'automatic-progressive');
        console.log(`Progressive unlock: Day ${nextDay} unlocked after Day ${day} completion`);
      }
    }

    await caregiverProgram.save();

    res.status(200).json({
      success: true,
      message: `Day ${day} module completed`,
      overallProgress: caregiverProgram.overallProgress,
      currentDay: caregiverProgram.currentDay
    });

  } catch (error) {
    console.error('Day module completion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}