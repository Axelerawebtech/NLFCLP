import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgram';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { caregiverId, answers, totalScore, burdenLevel, day, assessmentType } = req.body;

    if (!caregiverId || !answers || totalScore === undefined || !burdenLevel) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the caregiver's program
    // First, find the caregiver by caregiverId string
    const Caregiver = require('../../../models/Caregiver').default;
    const caregiver = await Caregiver.findOne({ caregiverId });
    
    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' });
    }

    // Then find the program using the caregiver's ObjectId
    let program = await CaregiverProgram.findOne({ caregiverId: caregiver._id });

    if (!caregiverProgram) {
      return res.status(404).json({ message: 'Caregiver program not found' });
    }

    // Update the Day 1 module with the pre-test results
    const dayModule = caregiverProgram.dayModules.find(module => module.day === day);
    
    if (dayModule) {
      // Update existing day module
      dayModule.preTestAssessment = {
        answers,
        totalScore,
        burdenLevel,
        assessmentType,
        completedAt: new Date()
      };
      dayModule.contentLevel = burdenLevel; // Set content level based on burden
    } else {
      // Create new day module if it doesn't exist
      caregiverProgram.dayModules.push({
        day,
        preTestAssessment: {
          answers,
          totalScore,
          burdenLevel,
          assessmentType,
          completedAt: new Date()
        },
        contentLevel: burdenLevel,
        videoCompleted: false,
        tasksCompleted: false,
        progressPercentage: 10 // 10% for completing pre-test
      });
    }

    await caregiverProgram.save();

    res.status(200).json({ 
      message: 'Pre-test assessment saved successfully',
      burdenLevel,
      totalScore 
    });

  } catch (error) {
    console.error('Error saving pre-test assessment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}