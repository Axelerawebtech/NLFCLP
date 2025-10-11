import { connectToDatabase } from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { caregiverId, day, assessmentType, responses, totalScore } = req.body;

  if (!caregiverId || !day || !assessmentType || !responses || totalScore === undefined) {
    return res.status(400).json({ 
      error: 'Missing required fields: caregiverId, day, assessmentType, responses, totalScore' 
    });
  }

  try {
    await connectToDatabase();

    // Find or create caregiver program
    let program = await CaregiverProgram.findOne({ caregiverId });

    if (!program) {
      return res.status(404).json({ error: 'Caregiver program not found' });
    }

    // Calculate score level based on day and score
    const scoreLevel = program.calculateScoreLevel(day, totalScore);

    // Find the day module
    let dayModule = program.dayModules.find(module => module.day === day);
    
    if (!dayModule) {
      // Create new day module if it doesn't exist
      dayModule = {
        day: day,
        adminPermissionGranted: day === 1 ? true : false // Day 1 should be unlocked after Day 0
      };
      program.dayModules.push(dayModule);
      dayModule = program.dayModules[program.dayModules.length - 1];
    }

    // Create the daily assessment
    dayModule.dailyAssessment = {
      day,
      assessmentType,
      responses: new Map(Object.entries(responses)),
      totalScore,
      scoreLevel,
      completedAt: new Date()
    };

    // Set content level based on score
    dayModule.contentLevel = scoreLevel;

    // Update progress for this day module
    program.updateDayProgress(day);

    // For Day 1, also update the legacy Zarit assessment if it's zarit_burden type
    if (day === 1 && assessmentType === 'zarit_burden') {
      const burdenLevel = scoreLevel === 'low' ? 'mild' : 
                         scoreLevel === 'moderate' ? 'moderate' : 'severe';
      
      program.zaritBurdenAssessment = {
        question1: responses.q1 || 0,
        question2: responses.q2 || 0,
        question3: responses.q3 || 0,
        question4: responses.q4 || 0,
        question5: responses.q5 || 0,
        question6: responses.q6 || 0,
        question7: responses.q7 || 0,
        totalScore,
        burdenLevel,
        completedAt: new Date()
      };
      
      program.burdenLevel = burdenLevel;
    }

    // Update last active time
    program.lastActiveAt = new Date();

    // Mark the dayModules array as modified for Mongoose
    program.markModified('dayModules');

    // Save the program
    await program.save();

    res.status(200).json({
      success: true,
      message: `Day ${day} assessment completed successfully`,
      assessment: {
        day,
        assessmentType,
        totalScore,
        scoreLevel,
        contentLevel: scoreLevel
      },
      dayModule: {
        day: dayModule.day,
        contentLevel: dayModule.contentLevel,
        progressPercentage: dayModule.progressPercentage,
        dailyAssessment: dayModule.dailyAssessment
      },
      program: {
        currentDay: program.currentDay,
        overallProgress: program.overallProgress,
        burdenLevel: program.burdenLevel
      }
    });

  } catch (error) {
    console.error('Daily assessment submission error:', error);
    res.status(500).json({ 
      error: 'Failed to submit daily assessment',
      details: error.message 
    });
  }
}