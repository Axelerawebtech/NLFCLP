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
    const caregiverProgram = await CaregiverProgram.findOne({ caregiverId });
    
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