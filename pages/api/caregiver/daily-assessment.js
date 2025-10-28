import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { caregiverId, day, assessmentType, responses, totalScore, language = 'english', questionTexts = {} } = req.body;

  // Check for missing fields with detailed logging
  const missingFields = [];
  if (!caregiverId) missingFields.push('caregiverId');
  if (day === undefined || day === null) missingFields.push('day');
  if (!assessmentType) missingFields.push('assessmentType');
  if (!responses) missingFields.push('responses');

  // For quick_assessment, totalScore is not required (we'll record responses only)
  if (assessmentType !== 'quick_assessment' && (totalScore === undefined || totalScore === null)) {
    missingFields.push('totalScore');
  }

  if (missingFields.length > 0) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      missingFields,
      received: { caregiverId, day, assessmentType, responses, totalScore }
    });
  }

  try {
    await dbConnect();

    // Find or create caregiver program
    let program = await CaregiverProgram.findOne({ caregiverId });

    if (!program) {
      return res.status(404).json({ error: 'Caregiver program not found' });
    }

    // Handle Quick Assessment (daily, no scoring)
    if (assessmentType === 'quick_assessment') {
      
      // Format responses with question text and response text
      const formattedResponses = [];
      
      Object.entries(responses).forEach(([questionId, responseValue]) => {
        const questionText = questionTexts[questionId] || `Question ${questionId}`;
        
        // Convert response value to readable text
        let responseText = '';
        if (typeof responseValue === 'number') {
          // For yes/no questions
          if (responseValue === 1) {
            responseText = 'Yes';
          } else if (responseValue === 0) {
            responseText = 'No';
          } else {
            responseText = responseValue.toString();
          }
        } else {
          responseText = responseValue.toString();
        }
        
        formattedResponses.push({
          questionId,
          questionText,
          responseValue,
          responseText,
          answeredAt: new Date()
        });
      });

      // Store the quick assessment responses in a structured format
      const quickAssessmentData = {
        day: parseInt(day),
        type: 'quick_assessment',
        responses: formattedResponses,
        language,
        totalQuestions: formattedResponses.length,
        completedAt: new Date()
      };

      // Use updateOne to store quick assessment
      const updateResult = await CaregiverProgram.updateOne(
        { caregiverId },
        {
          $push: {
            quickAssessments: quickAssessmentData
          },
          $set: {
            lastActiveAt: new Date()
          }
        },
        { runValidators: false }
      );

      return res.status(200).json({
        success: true,
        message: `Day ${day} quick assessment completed successfully`,
        assessment: quickAssessmentData,
        program: {
          currentDay: program.currentDay,
          overallProgress: program.overallProgress
        }
      });
    }

    // Handle One-time Assessments with scoring
    else if (['zarit_burden', 'stress_burden', 'whoqol', 'practical_questions'].includes(assessmentType)) {
      
      // Format responses with question text
      const formattedResponses = [];
      
      Object.entries(responses).forEach(([questionId, responseValue]) => {
        const questionText = questionTexts[questionId] || `Question ${questionId}`;
        
        formattedResponses.push({
          questionId,
          questionText,
          responseValue,
          answeredAt: new Date()
        });
      });

      // Create assessment data with score
      const assessmentData = {
        type: assessmentType,
        responses: formattedResponses,
        totalScore,
        language,
        totalQuestions: formattedResponses.length,
        completedAt: new Date()
      };

      // Determine score level for scored assessments
      if (totalScore !== undefined && totalScore !== null) {
        assessmentData.scoreLevel = program.calculateScoreLevel ? 
          program.calculateScoreLevel(day, totalScore) : 'moderate';
      }

      // Store in oneTimeAssessments array
      const updateResult = await CaregiverProgram.updateOne(
        { caregiverId },
        {
          $push: {
            oneTimeAssessments: assessmentData
          },
          $set: {
            lastActiveAt: new Date()
          }
        },
        { runValidators: false }
      );

      // Special handling for Zarit Burden Assessment (legacy compatibility)
      if (assessmentType === 'zarit_burden') {
        const burdenLevel = program.calculateBurdenLevel ? 
          program.calculateBurdenLevel(responses).burdenLevel : 'moderate';
        
        // Update the legacy zaritBurdenAssessment field and burdenLevel
        await CaregiverProgram.updateOne(
          { caregiverId },
          {
            $set: {
              'zaritBurdenAssessment': {
                ...responses,
                totalScore,
                burdenLevel,
                completedAt: new Date()
              },
              burdenLevel
            }
          }
        );
      }

      return res.status(200).json({
        success: true,
        message: `${assessmentType} assessment completed successfully`,
        assessment: assessmentData,
        program: {
          currentDay: program.currentDay,
          overallProgress: program.overallProgress
        }
      });
    }

    // Handle Daily Module Assessments (Days 1-7 with scoring)
    else {
      // Find the day module
      const dayModule = program.dayModules.find(module => module.day === parseInt(day));
      
      if (!dayModule) {
        return res.status(404).json({ error: `Day ${day} module not found` });
      }

      // Format responses with question text
      const formattedResponses = [];
      
      Object.entries(responses).forEach(([questionId, responseValue]) => {
        const questionText = questionTexts[questionId] || `Question ${questionId}`;
        
        formattedResponses.push({
          questionId,
          questionText,
          responseValue,
          answeredAt: new Date()
        });
      });

      // Create daily assessment data
      const dailyAssessmentData = {
        day: parseInt(day),
        assessmentType,
        responses: formattedResponses,
        totalScore,
        scoreLevel: program.calculateScoreLevel ? 
          program.calculateScoreLevel(day, totalScore) : 'moderate',
        totalQuestions: formattedResponses.length,
        completedAt: new Date()
      };

      // Update the day module with assessment
      dayModule.dailyAssessment = dailyAssessmentData;
      dayModule.contentLevel = dailyAssessmentData.scoreLevel;

      // Update day progress
      program.updateDayProgress(parseInt(day));
      
      await program.save();

      return res.status(200).json({
        success: true,
        message: `Day ${day} ${assessmentType} assessment completed successfully`,
        assessment: dailyAssessmentData,
        program: {
          currentDay: program.currentDay,
          overallProgress: program.overallProgress
        }
      });
    }

  } catch (error) {
    console.error('Daily assessment submission error:', error);
    res.status(500).json({ 
      error: 'Failed to submit daily assessment',
      details: error.message 
    });
  }
}