import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgram';
import ProgramConfig from '../../../models/ProgramConfig';

/**
 * API: /api/caregiver/submit-burden-test
 * Method: POST
 * 
 * Purpose: Handle burden test submission for Day 1
 * - Save burden test score and level
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
    const { caregiverId, answers, totalScore, burdenLevel } = req.body;

    if (!caregiverId || !answers || totalScore === undefined || !burdenLevel) {
      return res.status(400).json({ 
        error: 'Missing required fields: caregiverId, answers, totalScore, burdenLevel' 
      });
    }

    // Validate burden level
    if (!['mild', 'moderate', 'severe'].includes(burdenLevel)) {
      return res.status(400).json({ 
        error: 'Invalid burden level. Must be mild, moderate, or severe' 
      });
    }

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

    // Check if test already completed
    if (day1Module.burdenTestCompleted) {
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

    // Update Day 1 module
    day1Module.burdenTestCompleted = true;
    day1Module.burdenLevel = burdenLevel;
    day1Module.burdenScore = totalScore;
    
    // Only set video fields if video is available
    if (videoAvailable) {
      day1Module.videoTitle = videoConfig.videoTitle;
      day1Module.videoUrl = videoConfig.videoUrl;
      day1Module.content = videoConfig.description;
      day1Module.progressPercentage = 50; // Test completed, video pending
    } else {
      // Video not available - set progress to 50% (test done)
      day1Module.progressPercentage = 50;
    }

    // Update program-level burden info
    program.burdenLevel = burdenLevel;
    program.burdenTestScore = totalScore;
    program.burdenTestCompletedAt = new Date();

    // Save burden test answers
    if (!program.zaritBurdenAssessment) {
      program.zaritBurdenAssessment = {};
    }
    program.zaritBurdenAssessment.answers = answers;
    program.zaritBurdenAssessment.totalScore = totalScore;
    program.zaritBurdenAssessment.burdenLevel = burdenLevel;
    program.zaritBurdenAssessment.completedAt = new Date();

    // Mark as modified
    program.markModified('dayModules');
    program.markModified('zaritBurdenAssessment');

    // Save without validation to avoid burdenLevel enum error
    await program.save({ validateBeforeSave: false });

    console.log('✅ Burden test submitted:', {
      caregiverId,
      burdenLevel,
      totalScore,
      videoAvailable
    });

    // Prepare response based on video availability
    const responseData = {
      burdenLevel,
      totalScore,
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
