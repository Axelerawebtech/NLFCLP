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
      maxPossibleScore,
      hasAnswerDetails: !!answerDetails,
      answerDetailsLength: answerDetails?.length || 0
    });

    // Log a sample of answerDetails to debug the structure
    if (answerDetails && answerDetails.length > 0) {
      console.log('📋 Sample answerDetails structure (first item):', {
        firstDetail: answerDetails[0],
        questionKeys: answerDetails[0]?.question ? Object.keys(answerDetails[0].question) : 'no question object'
      });
    }

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

    // Enhanced caregiver lookup - try both string caregiverId and ObjectId
    const Caregiver = require('../../../models/Caregiver').default;
    let caregiver;
    
    // First try to find by caregiverId string
    caregiver = await Caregiver.findOne({ caregiverId });
    
    // If not found and the caregiverId looks like an ObjectId, try finding by _id
    if (!caregiver && /^[0-9a-fA-F]{24}$/.test(caregiverId)) {
      console.log('🔍 Burden test - Tried finding caregiver by string, now trying ObjectId...');
      caregiver = await Caregiver.findById(caregiverId);
      if (caregiver) {
        console.log(`✅ Burden test - Found caregiver by ObjectId: ${caregiver.name} (${caregiver.caregiverId})`);
      }
    }
    
    if (!caregiver) {
      return res.status(404).json({ 
        error: 'Caregiver not found',
        searchedFor: caregiverId,
        searchMethods: ['caregiverId string', 'MongoDB ObjectId']
      });
    }

    // Then find the program using the caregiver's ObjectId
    let program = await CaregiverProgram.findOne({ caregiverId: caregiver._id });
    
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

    // Store burden assessment in oneTimeAssessments with enhanced validation
    if (!program.oneTimeAssessments) {
      program.oneTimeAssessments = [];
    }

    // Validation: Check if Zarit burden assessment already exists to prevent duplicates
    const existingZaritAssessment = program.oneTimeAssessments.find(
      assessment => assessment.type === 'zarit_burden'
    );
    
    if (existingZaritAssessment) {
      console.log('⚠️ Zarit burden assessment already exists - updating existing record');
      // Remove the existing assessment to replace with new one
      program.oneTimeAssessments = program.oneTimeAssessments.filter(
        assessment => assessment.type !== 'zarit_burden'
      );
    }

    // Convert answers object to responses array format with detailed information
    const responses = Object.keys(answers).map((questionKey, index) => {
      // Get question details from answerDetails if available
      const questionDetail = answerDetails?.[index];
      const questionData = questionDetail?.question;
      
      console.log(`Processing question ${index + 1}:`, {
        questionKey,
        hasQuestionDetail: !!questionDetail,
        hasQuestionData: !!questionData,
        questionDataStructure: questionData ? {
          hasQuestionText: !!questionData.questionText,
          hasOptions: !!questionData.options,
          optionsCount: questionData.options?.length,
          questionTextKeys: questionData.questionText ? Object.keys(questionData.questionText) : [],
          firstOptionKeys: questionData.options?.[0] ? Object.keys(questionData.options[0]) : []
        } : 'none'
      });
      
      // Extract question text - try multiple possible paths with better error handling
      let questionText = '';
      if (questionData?.questionText?.english) {
        questionText = questionData.questionText.english;
      } else if (typeof questionData?.questionText === 'string') {
        questionText = questionData.questionText;
      } else if (questionData?.text?.english) {
        questionText = questionData.text.english;
      } else if (typeof questionData?.text === 'string') {
        questionText = questionData.text;
      } else {
        // Fallback: try to get from the original question if available
        questionText = `Zarit Question ${index + 1}`;
        console.warn(`Could not find question text for question ${index + 1}`);
      }
      
      // Find the selected option to get the option text
      let selectedOptionText = '';
      const selectedScore = answers[questionKey];
      
      console.log(`Looking for option with score ${selectedScore} in question ${index + 1}`);
      
      if (questionData?.options && Array.isArray(questionData.options)) {
        console.log(`Question ${index + 1} has ${questionData.options.length} options:`, 
          questionData.options.map((opt, idx) => ({ index: idx, score: opt.score, text: opt.optionText?.english }))
        );
        
        const selectedOption = questionData.options.find(opt => opt.score === selectedScore);
        if (selectedOption) {
          if (selectedOption.optionText?.english) {
            selectedOptionText = selectedOption.optionText.english;
          } else if (typeof selectedOption.optionText === 'string') {
            selectedOptionText = selectedOption.optionText;
          } else if (selectedOption.text?.english) {
            selectedOptionText = selectedOption.text.english;
          } else if (typeof selectedOption.text === 'string') {
            selectedOptionText = selectedOption.text;
          }
          console.log(`Found selected option for Q${index + 1}:`, selectedOptionText);
        } else {
          console.warn(`Could not find option with score ${selectedScore} for question ${index + 1}`);
        }
      }
      
      // Fallback for selectedOptionText if not found - use standard Zarit scale
      if (!selectedOptionText) {
        const standardOptions = ['Never', 'Rarely', 'Sometimes', 'Quite Frequently', 'Nearly Always'];
        if (selectedScore >= 0 && selectedScore < standardOptions.length) {
          selectedOptionText = standardOptions[selectedScore];
          console.log(`Using fallback option text for Q${index + 1}: ${selectedOptionText}`);
        } else {
          selectedOptionText = `Score ${selectedScore}`;
          console.warn(`Using generic fallback for Q${index + 1}: ${selectedOptionText}`);
        }
      }

      const result = {
        questionId: questionKey,
        questionNumber: index + 1,
        questionText: questionText,
        responseValue: selectedScore,
        responseText: selectedOptionText,
        answeredAt: new Date()
      };

      console.log(`Final processed Q${index + 1}:`, {
        questionText: questionText.substring(0, 50) + (questionText.length > 50 ? '...' : ''),
        responseValue: selectedScore,
        responseText: selectedOptionText
      });

      return result;
    });

    // Calculate additional statistics for the assessment record
    const assessmentStats = {
      totalQuestions: Object.keys(answers).length,
      completedQuestions: Object.keys(answers).length,
      averageScore: totalScore / Object.keys(answers).length,
      maxPossibleScore: maxPossibleScore || Object.keys(answers).length * 4,
      completionPercentage: Math.round((totalScore / (maxPossibleScore || Object.keys(answers).length * 4)) * 100)
    };

    // ENHANCED VALIDATION: Ensure all required fields are present and valid
    const assessmentRecord = {
      type: 'zarit_burden',
      responses,
      totalScore: Number(totalScore), // Ensure it's a number
      scoreLevel: burdenLevel, // Use original burden level (mild/moderate/severe)
      completedAt: new Date(),
      language: 'english',
      totalQuestions: assessmentStats.totalQuestions,
      // Enhanced assessment details for comprehensive tracking
      assessmentDetails: {
        averageScore: assessmentStats.averageScore,
        maxPossibleScore: assessmentStats.maxPossibleScore,
        completionPercentage: assessmentStats.completionPercentage,
        questionsAnswered: assessmentStats.completedQuestions,
        assessmentDuration: null, // Could be added later if needed
        retakeNumber: existingZaritAssessment ? (existingZaritAssessment.retakeCount || 0) + 1 : 1
      },
      // Metadata for tracking and analysis
      metadata: {
        submissionMethod: 'inline_assessment', // vs 'standalone_assessment'
        deviceInfo: req.headers['user-agent'] || 'unknown',
        ipAddress: req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown',
        submittedFrom: 'caregiver_dashboard',
        timestamp: new Date().toISOString()
      },
      // Assessment locking and retake management
      locked: false,
      canRetakeAssessment: true,
      retakeCount: existingZaritAssessment ? (existingZaritAssessment.retakeCount || 0) + 1 : 1,
      maxRetakes: 3 // Allow up to 3 retakes
    };

    // VALIDATION: Verify all required fields are present
    const requiredFields = ['type', 'responses', 'totalScore', 'scoreLevel', 'completedAt'];
    const missingFields = requiredFields.filter(field => !assessmentRecord[field]);
    
    if (missingFields.length > 0) {
      console.error('❌ Missing required fields in assessment record:', missingFields);
      return res.status(500).json({
        error: 'Assessment validation failed',
        missingFields,
        message: 'Could not save assessment due to missing required data'
      });
    }

    // VALIDATION: Ensure responses array is not empty
    if (!responses || responses.length === 0) {
      console.error('❌ No responses provided for assessment');
      return res.status(400).json({
        error: 'No responses provided',
        message: 'Assessment must include question responses'
      });
    }

    // VALIDATION: Ensure score is within valid range
    const maxValidScore = assessmentStats.maxPossibleScore;
    if (totalScore < 0 || totalScore > maxValidScore) {
      console.error('❌ Invalid total score:', totalScore, 'Max allowed:', maxValidScore);
      return res.status(400).json({
        error: 'Invalid score',
        message: `Score ${totalScore} is outside valid range (0-${maxValidScore})`
      });
    }

    console.log('✅ Assessment record validation passed:', {
      type: assessmentRecord.type,
      totalScore: assessmentRecord.totalScore,
      scoreLevel: assessmentRecord.scoreLevel,
      responsesCount: assessmentRecord.responses.length,
      retakeNumber: assessmentRecord.assessmentDetails.retakeNumber
    });

    program.oneTimeAssessments.push(assessmentRecord);

    // Explicitly mark nested objects as modified to ensure Mongoose saves them
    program.markModified('dayModules');
    program.markModified('oneTimeAssessments');
    program.markModified('burdenLevel');

    // ENHANCED SAVE OPERATION with error handling
    let savedProgram;
    try {
      savedProgram = await program.save();
      console.log('✅ Program saved successfully with assessment record');
    } catch (saveError) {
      console.error('❌ Error saving program:', saveError);
      return res.status(500).json({
        error: 'Database save failed',
        message: 'Could not save assessment to database',
        details: saveError.message
      });
    }

    // VERIFICATION: Double-check that the data was actually saved correctly
    try {
      const updatedProgram = await CaregiverProgram.findOne({ caregiverId });
      const updatedDay1Module = updatedProgram.dayModules.find(m => m.day === 1);
      const savedBurdenAssessment = updatedProgram.oneTimeAssessments?.find(
        assessment => assessment.type === 'zarit_burden'
      );
      
      console.log('🔍 POST-SAVE VERIFICATION:');
      console.log('  Program found after save:', !!updatedProgram);
      console.log('  Day 1 module exists:', !!updatedDay1Module);
      console.log('  Day 1 dailyAssessment exists:', !!updatedDay1Module?.dailyAssessment);
      console.log('  Day 1 dailyAssessment type:', updatedDay1Module?.dailyAssessment?.assessmentType);
      console.log('  Program burdenLevel:', updatedProgram.burdenLevel);
      console.log('  OneTime burden assessment exists:', !!savedBurdenAssessment);
      console.log('  OneTime assessment totalScore:', savedBurdenAssessment?.totalScore);
      console.log('  OneTime assessments total count:', updatedProgram.oneTimeAssessments?.length || 0);
      
      // CRITICAL VALIDATION: Ensure the assessment was actually saved
      if (!savedBurdenAssessment) {
        console.error('❌ CRITICAL ERROR: Assessment was not saved to oneTimeAssessments array');
        return res.status(500).json({
          error: 'Assessment save verification failed',
          message: 'Assessment data was not properly saved to database'
        });
      }
      
      if (savedBurdenAssessment.totalScore !== totalScore) {
        console.error('❌ CRITICAL ERROR: Saved score does not match submitted score');
        console.error('  Submitted:', totalScore, 'Saved:', savedBurdenAssessment.totalScore);
        return res.status(500).json({
          error: 'Assessment data integrity error',
          message: 'Saved assessment data does not match submitted data'
        });
      }
      
      console.log('✅ VERIFICATION PASSED: Assessment properly saved and verified');
      
    } catch (verificationError) {
      console.error('❌ Error during post-save verification:', verificationError);
      // Don't fail the request for verification errors, but log them
    }

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
    console.error('❌ CRITICAL ERROR in burden test submission:', {
      error: error.message,
      stack: error.stack,
      caregiverId,
      burdenLevel,
      totalScore,
      timestamp: new Date().toISOString()
    });
    
    // Determine the type of error for better user feedback
    let errorMessage = 'An unexpected error occurred while processing your assessment';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Assessment data validation failed. Please check your responses and try again.';
      statusCode = 400;
    } else if (error.name === 'CastError') {
      errorMessage = 'Invalid data format provided. Please refresh the page and try again.';
      statusCode = 400;
    } else if (error.message.includes('duplicate')) {
      errorMessage = 'Assessment already exists. Please contact support if you need to retake.';
      statusCode = 409;
    } else if (error.message.includes('connection') || error.message.includes('timeout')) {
      errorMessage = 'Database connection issue. Please try again in a few moments.';
      statusCode = 503;
    }
    
    res.status(statusCode).json({ 
      error: 'Assessment submission failed',
      message: errorMessage,
      timestamp: new Date().toISOString(),
      // Only include details in development
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message,
        caregiverId 
      })
    });
  }
}
