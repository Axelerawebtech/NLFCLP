import dbConnect from '../../../lib/mongodb';
import CaregiverProgramEnhanced from '../../../models/CaregiverProgramEnhanced';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { caregiverId, day, language, testName, answers, totalScore, burdenLevel } = req.body;

    // Validate required fields
    if (!caregiverId || day === undefined || !language || !testName || !answers || !burdenLevel) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        required: ['caregiverId', 'day', 'language', 'testName', 'answers', 'burdenLevel']
      });
    }

    // Find caregiver's program
    let program = await CaregiverProgramEnhanced.findOne({ caregiverId });

    if (!program) {
      // Create new program if it doesn't exist
      program = new CaregiverProgramEnhanced({
        caregiverId,
        language,
        days: []
      });
    }

    // Find or create day entry
    let dayEntry = program.days.find(d => d.dayNumber === day);
    
    if (!dayEntry) {
      // Create new day entry
      dayEntry = {
        dayNumber: day,
        testCompleted: false,
        burdenLevel: null,
        testScore: null,
        testAnswers: [],
        tasks: []
      };
      program.days.push(dayEntry);
    }

    // Update test results
    dayEntry.testCompleted = true;
    dayEntry.testName = testName;
    dayEntry.testAnswers = answers;
    dayEntry.testScore = totalScore;
    dayEntry.burdenLevel = burdenLevel;
    dayEntry.testCompletedAt = new Date();

    // Update program-level burden level if this is Day 0 or first test
    if (day === 0 || !program.burdenLevel) {
      program.burdenLevel = burdenLevel;
      program.burdenTestCompleted = true;
    }

    // Save the program
    await program.save();

    console.log(`✅ Test submitted for caregiver ${caregiverId}, Day ${day}:`, {
      testName,
      totalScore,
      burdenLevel,
      answersCount: answers.length
    });

    return res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      burdenLevel,
      totalScore,
      dayNumber: day
    });

  } catch (error) {
    console.error('❌ Error submitting dynamic test:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}
