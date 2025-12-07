import dbConnect from '../../../../lib/mongodb';
import Caregiver from '../../../../models/Caregiver';
import Questionnaire from '../../../../models/Questionnaire';
import mongoose from 'mongoose';

// Helper function to ensure attempt history exists (simplified - no migration needed)
const ensureAttemptHistory = async (caregiver) => {
  if (!Array.isArray(caregiver.questionnaireAttempts)) {
    caregiver.questionnaireAttempts = [];
  }
};

// Helper function to append new attempt
const appendAttempt = async (caregiver, answers, attemptNumber) => {
  const newAttempt = {
    attemptNumber,
    submittedAt: new Date(),
    answers
  };
  
  caregiver.questionnaireAttempts.push(newAttempt);
  
  if (attemptNumber === 2) {
    caregiver.questionnaireRetakeStatus = 'completed';
    caregiver.questionnaireRetakeCompletedAt = new Date();
  }
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { caregiverId, answers } = req.body;
      
      console.log('[Caregiver Submit API] Received submission:');
      console.log('[Caregiver Submit API] caregiverId:', caregiverId);
      console.log('[Caregiver Submit API] answers type:', Array.isArray(answers) ? 'array' : typeof answers);
      console.log('[Caregiver Submit API] answers length:', answers?.length || Object.keys(answers || {}).length);

      if (!caregiverId || !answers) {
        console.log('[Caregiver Submit API] ERROR: Missing caregiverId or answers');
        return res.status(400).json({
          success: false,
          message: 'Caregiver ID and answers are required'
        });
      }

      // Try to find caregiver by MongoDB _id first, then by custom caregiverId
      let caregiver = null;
      
      if (mongoose.Types.ObjectId.isValid(caregiverId)) {
        caregiver = await Caregiver.findById(caregiverId);
        console.log('[Caregiver Submit API] Searched by MongoDB _id, found:', !!caregiver);
      }
      
      if (!caregiver) {
        caregiver = await Caregiver.findOne({ caregiverId });
        console.log('[Caregiver Submit API] Searched by custom caregiverId, found:', !!caregiver);
      }

      if (!caregiver) {
        console.log('[Caregiver Submit API] ERROR: Caregiver not found with caregiverId:', caregiverId);
        return res.status(404).json({
          success: false,
          message: 'Caregiver not found'
        });
      }

      // Initialize questionnaireAttempts if not exists
      if (!Array.isArray(caregiver.questionnaireAttempts)) {
        caregiver.questionnaireAttempts = [];
      }

      const existingAttempts = caregiver.questionnaireAttempts.length;
      const maxAttempts = 2;
      
      // Determine if this is an edit or new attempt
      let attemptNumber;
      let isEditingExisting = false;
      
      if (existingAttempts === 0) {
        // First submission
        attemptNumber = 1;
      } else if (existingAttempts === 1) {
        // Could be editing attempt 1 OR creating attempt 2
        // Check retake status to determine
        if (caregiver.questionnaireRetakeStatus === 'open') {
          // Creating second attempt
          attemptNumber = 2;
        } else {
          // Editing first attempt
          attemptNumber = 1;
          isEditingExisting = true;
        }
      } else {
        // Already have 2 attempts - determine which one to edit based on retake status
        if (caregiver.questionnaireRetakeStatus === 'completed') {
          // Editing second attempt
          attemptNumber = 2;
          isEditingExisting = true;
        } else {
          // Editing first attempt
          attemptNumber = 1;
          isEditingExisting = true;
        }
      }

      console.log('[Caregiver Submit API] Attempt info:', {
        existingAttempts,
        attemptNumber,
        isEditingExisting,
        retakeStatus: caregiver.questionnaireRetakeStatus
      });

      // Only block if trying to create a third attempt
      if (!isEditingExisting && attemptNumber > maxAttempts) {
        return res.status(400).json({
          success: false,
          message: 'Maximum number of questionnaire attempts reached'
        });
      }

      if (!caregiver.questionnaireEnabled) {
        console.log('[Caregiver Submit API] ERROR: Questionnaire not enabled for caregiver');
        return res.status(403).json({
          success: false,
          message: 'Questionnaire is not enabled for this caregiver'
        });
      }

      // Get current questionnaire to validate answers
      const questionnaire = await Questionnaire.findOne({ isActive: true });
      if (!questionnaire) {
        console.log('[Caregiver Submit API] ERROR: No active questionnaire found');
        return res.status(404).json({
          success: false,
          message: 'No active questionnaire found'
        });
      }

      // Format answers for storage
      let formattedAnswers;
      
      if (Array.isArray(answers)) {
        console.log('[Caregiver Submit API] Processing ARRAY format with', answers.length, 'items');
        formattedAnswers = answers.map(item => ({
          sectionId: item.sectionId,
          sectionTitle: item.sectionTitle,
          questionIndex: item.questionIndex,
          questionId: item.questionId,
          questionText: item.questionText,
          answer: item.answer,
          language: item.language || 'en',
          submittedAt: item.submittedAt ? new Date(item.submittedAt) : new Date()
        }));
      } else {
        console.log('[Caregiver Submit API] Processing OBJECT format');
        formattedAnswers = Object.keys(answers).map((key) => ({
          questionId: answers[key].questionId,
          questionText: answers[key].questionText || '',
          answer: answers[key].answer,
          language: answers[key].language || 'en',
          submittedAt: new Date()
        }));
      }

      console.log('[Caregiver Submit API] Formatted', formattedAnswers.length, 'answers for storage');

      // Check if we're editing an existing attempt or creating a new one
      const existingAttempt = caregiver.questionnaireAttempts.find(a => a.attemptNumber === attemptNumber);
      
      if (isEditingExisting && existingAttempt) {
        // Update existing attempt (editing)
        console.log('[Caregiver Submit API] Updating existing attempt', attemptNumber);
        existingAttempt.answers = formattedAnswers;
        existingAttempt.submittedAt = new Date();
      } else {
        // Create new attempt
        console.log('[Caregiver Submit API] Creating new attempt', attemptNumber);
        await appendAttempt(caregiver, formattedAnswers, attemptNumber);
        
        // Update retake status if this is the second attempt
        if (attemptNumber === 2) {
          caregiver.questionnaireRetakeStatus = 'completed';
          caregiver.questionnaireRetakeCompletedAt = new Date();
        }
      }

      // Update current answers (for backward compatibility)
      caregiver.questionnaireAnswers = formattedAnswers;
      caregiver.lastQuestionnaireSubmission = new Date();

      await caregiver.save();

      console.log('[Caregiver Submit API] SUCCESS: Saved attempt', attemptNumber, 'with', formattedAnswers.length, 'answers');

      return res.status(200).json({
        success: true,
        message: isEditingExisting ? 'Questionnaire updated successfully' : 'Questionnaire submitted successfully',
        data: {
          attemptNumber,
          isEdit: isEditingExisting,
          totalAttempts: caregiver.questionnaireAttempts.length,
          submittedAt: new Date()
        }
      });

    } catch (error) {
      console.error('[Caregiver Submit API] ERROR:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit questionnaire',
        error: error.message
      });
    }
  }

  else if (req.method === 'GET') {
    try {
      const { caregiverId } = req.query;

      if (!caregiverId) {
        return res.status(400).json({
          success: false,
          message: 'Caregiver ID is required'
        });
      }

      let caregiver = null;
      
      if (mongoose.Types.ObjectId.isValid(caregiverId)) {
        caregiver = await Caregiver.findById(caregiverId);
      }
      
      if (!caregiver) {
        caregiver = await Caregiver.findOne({ caregiverId });
      }

      if (!caregiver) {
        return res.status(404).json({
          success: false,
          message: 'Caregiver not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          questionnaireAnswers: caregiver.questionnaireAnswers || [],
          questionnaireAttempts: caregiver.questionnaireAttempts || [],
          lastQuestionnaireSubmission: caregiver.lastQuestionnaireSubmission,
          questionnaireRetakeStatus: caregiver.questionnaireRetakeStatus || 'none'
        }
      });

    } catch (error) {
      console.error('[Caregiver Submit API GET] ERROR:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch questionnaire data',
        error: error.message
      });
    }
  }

  else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}
