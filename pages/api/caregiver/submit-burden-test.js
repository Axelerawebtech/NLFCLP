import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';
import ProgramConfig from '../../../models/ProgramConfig';

/**
 * API: /api/caregiver/submit-burden-test
 * Method: POST
 * 
 * Purpose: Handle burden test submission for Day 1
 * - Save burden test score and level (using admin-defined scoring)
 * - Fetch appropriate video from ProgramConfig based on burden level
 * - Update Day 1 module with video
 * - Mark burden test as completed
 */

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      caregiverId, 
      answers, 
      answerDetails, 
      totalScore, 
      burdenLevel,
      maxPossibleScore,
      questionsCompleted
    } = req.body;

    console.log('📊 Burden test submission:', {
      caregiverId,
      totalScore,
      burdenLevel,
      questionsCompleted,
      maxPossibleScore
    });

    if (!caregiverId || !answers || totalScore === undefined || !burdenLevel) {
      return res.status(400).json({ 
        error: 'Missing required fields: caregiverId, answers, totalScore, burdenLevel' 
      });
    }

    // Validate burden level - support both legacy and new format
    const validBurdenLevels = ['mild', 'moderate', 'severe', 'low', 'high'];
    if (!validBurdenLevels.includes(burdenLevel)) {
      return res.status(400).json({ 
        error: 'Invalid burden level. Must be mild, moderate, severe, low, or high' 
      });
    }

    // For the enhanced model, we'll store the original burden level directly
    // The frontend and video system expect mild/moderate/severe format

    // Get caregiver program
    const program = await CaregiverProgram.findOne({ caregiverId });
    
    if (!program) {
      return res.status(404).json({ error: 'Caregiver program not found' });
    }

    // Get Day 1 module
    const day1Module = program.dayModules.find(m => m.day === 1);
    
    if (!day1Module) {
      return res.status(404).json({ error: 'Day 1 module not found' });
    }

    // Check if test already completed by looking at oneTimeAssessments
    const existingBurdenAssessment = program.oneTimeAssessments?.find(
      assessment => assessment.type === 'zarit_burden'
    );
    
    if (existingBurdenAssessment) {
      return res.status(400).json({ 
        error: 'Burden test already completed',
        message: 'You have already taken the burden assessment.'
      });
    }

    // Get global program configuration
    const config = await ProgramConfig.findOne({ configType: 'global' });
    
    let videoConfig = null;
    let videoAvailable = false;
    
    // Check if video is configured for this burden level
    if (config && config.day1 && config.day1.videos && config.day1.videos[burdenLevel]) {
      videoConfig = config.day1.videos[burdenLevel];
      // Check if video URLs are actually present (not empty objects)
      if (videoConfig.videoUrl && 
          (videoConfig.videoUrl.english || videoConfig.videoUrl.kannada || videoConfig.videoUrl.hindi)) {
        videoAvailable = true;
      }
    }

    // Update Day 1 module - use enhanced model structure
    day1Module.dailyAssessment = {
      day: 1,
      assessmentType: 'zarit_burden',
      responses: new Map(Object.entries(answerDetails || {})),
      totalScore,
      scoreLevel: burdenLevel, // Use original burden level (mild/moderate/severe)
      completedAt: new Date()
    };
    
    // Only set video fields if video is available
    if (videoAvailable) {
      // Video content will be fetched dynamically by the frontend
      day1Module.progressPercentage = 50; // Test completed, video pending
    } else {
      // Video not available - set progress to 50% (test done)
      day1Module.progressPercentage = 50;
    }

    // Update program-level burden info - keep original burden level for frontend
    program.burdenLevel = burdenLevel; // Keep original (mild/moderate/severe) for video fetching

    // Store burden assessment in oneTimeAssessments
    if (!program.oneTimeAssessments) {
      program.oneTimeAssessments = [];
    }

    // Convert answers object to responses array format
    const responses = Object.keys(answers).map((questionKey, index) => ({
      questionId: questionKey,
      questionText: answerDetails?.[index]?.question?.question || `Question ${index + 1}`,
      responseValue: answers[questionKey],
      answeredAt: new Date()
    }));

    program.oneTimeAssessments.push({
      type: 'zarit_burden',
      responses,
      totalScore,
      scoreLevel: burdenLevel, // Use original burden level (mild/moderate/severe)
      completedAt: new Date(),
      language: 'english'
    });

    // Explicitly mark nested objects as modified to ensure Mongoose saves them
    program.markModified('dayModules');
    program.markModified('oneTimeAssessments');
    program.markModified('burdenLevel');

    // Save the program
    await program.save();

    // Double-check: Verify the data was actually saved
    const updatedProgram = await CaregiverProgram.findOne({ caregiverId });
    const updatedDay1Module = updatedProgram.dayModules.find(m => m.day === 1);
    const savedBurdenAssessment = updatedProgram.oneTimeAssessments?.find(
      assessment => assessment.type === 'zarit_burden'
    );
    
    console.log('🔍 Verification after save:');
    console.log('  Day 1 dailyAssessment exists:', !!updatedDay1Module.dailyAssessment);
    console.log('  Day 1 dailyAssessment type:', updatedDay1Module.dailyAssessment?.assessmentType);
    console.log('  Program burdenLevel:', updatedProgram.burdenLevel);
    console.log('  OneTime burden assessment exists:', !!savedBurdenAssessment);
    console.log('  OneTime assessment totalScore:', savedBurdenAssessment?.totalScore);

    console.log('✅ Burden test submitted:', {
      caregiverId,
      burdenLevel,
      totalScore,
      maxPossibleScore,
      questionsCompleted,
      videoAvailable
    });

    // Prepare response based on video availability
    const responseData = {
      burdenLevel,
      totalScore,
      maxPossibleScore,
      questionsCompleted,
      videoAvailable
    };

    if (videoAvailable) {
      responseData.videoTitle = videoConfig.videoTitle;
      responseData.videoUrl = videoConfig.videoUrl;
      responseData.description = videoConfig.description;
      responseData.message = 'Burden test submitted successfully. Your personalized video is ready.';
    } else {
      responseData.message = 'Burden test submitted successfully. Your personalized video will appear once the administrator uploads it.';
    }

    res.status(200).json({
      success: true,
      message: responseData.message,
      data: responseData
    });

  } catch (error) {
    console.error('Error submitting burden test:', error);
    res.status(500).json({ 
      error: 'Failed to submit burden test',
      details: error.message 
    });
  }
}
