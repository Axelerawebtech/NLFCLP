import dbConnect from '../../../lib/mongodb';
import CaregiverProgramEnhanced from '../../../models/CaregiverProgramEnhanced';

const CaregiverModel = require('../../../models/Caregiver').default;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { caregiverId, day, testName, answers, totalScore, burdenLevel } = req.body;

    if (caregiverId === undefined || day === undefined || !testName || totalScore === undefined || !burdenLevel) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['caregiverId', 'day', 'testName', 'answers', 'totalScore', 'burdenLevel']
      });
    }

    const dayNumber = Number(day);
    if (Number.isNaN(dayNumber)) {
      return res.status(400).json({ error: 'Day must be a valid number' });
    }

    const normalizedAnswers = Array.isArray(answers)
      ? answers
      : Object.values(answers || {});

    if (normalizedAnswers.length === 0) {
      return res.status(400).json({ error: 'Answers are required' });
    }

    // Resolve caregiver (supports caregiverId string or ObjectId)
    let caregiver = await CaregiverModel.findOne({ caregiverId });
    if (!caregiver && /^[0-9a-fA-F]{24}$/.test(caregiverId)) {
      caregiver = await CaregiverModel.findById(caregiverId);
    }

    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' });
    }

    let program = await CaregiverProgramEnhanced.findOne({ caregiverId: caregiver._id });
    if (!program) {
      return res.status(404).json({ error: 'Caregiver program not found' });
    }

    if (!Array.isArray(program.dayModules)) {
      program.dayModules = [];
    }

    let dayModule = program.dayModules.find(module => module.day === dayNumber);
    if (!dayModule) {
      program.dayModules.push({
        day: dayNumber,
        taskResponses: [],
        tasks: [],
        adminPermissionGranted: dayNumber === 0,
        progressPercentage: 0
      });
      dayModule = program.dayModules[program.dayModules.length - 1];
    }

    dayModule.dynamicTest = {
      testName,
      totalScore,
      assignedLevel: burdenLevel,
      burdenLevel,
      answers: normalizedAnswers,
      completedAt: new Date()
    };
    dayModule.dynamicTestCompleted = true;

    const ALLOWED_GLOBAL_LEVELS = new Set(['mild', 'moderate', 'severe']);
    if (ALLOWED_GLOBAL_LEVELS.has(burdenLevel)) {
      program.burdenLevel = burdenLevel;
      program.burdenTestScore = totalScore;
      program.burdenTestCompletedAt = new Date();
    }

    program.lastActiveAt = new Date();
    program.markModified('dayModules');

    await program.save({ validateBeforeSave: false });

    console.log(`✅ Dynamic test submitted for caregiver ${caregiverId}, Day ${dayNumber}`, {
      testName,
      totalScore,
      burdenLevel,
      answersCount: normalizedAnswers.length
    });

    return res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      burdenLevel,
      totalScore,
      dayNumber
    });
  } catch (error) {
    console.error('❌ Error submitting dynamic test:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
