import dbConnect from '../../../../lib/mongodb';
import Caregiver from '../../../../models/Caregiver';
import Questionnaire from '../../../../models/Questionnaire';
import mongoose from 'mongoose';

// Helper function to ensure attempt history exists
const ensureAttemptHistory = async (caregiver) => {
  if (!Array.isArray(caregiver.questionnaireAttempts)) {
    caregiver.questionnaireAttempts = [];
  }
  
  if (caregiver.questionnaireAnswers && caregiver.questionnaireAnswers.length > 0) {
    const hasAttempt1 = caregiver.questionnaireAttempts.some(a => a.attemptNumber === 1);
    
    if (!hasAttempt1) {
      const oldestSubmission = caregiver.questionnaireAnswers.reduce((oldest, answer) => {
        const answerDate = new Date(answer.submittedAt);
        const oldestDate = new Date(oldest.submittedAt);
        return answerDate < oldestDate ? answer : oldest;
      }, caregiver.questionnaireAnswers[0]);
      
      caregiver.questionnaireAttempts.push({
        attemptNumber: 1,
        submittedAt: oldestSubmission.submittedAt,
        answers: caregiver.questionnaireAnswers
      });
    }
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

      await ensureAttemptHistory(caregiver);

      const existingAttempts = Array.isArray(caregiver.questionnaireAttempts) ? caregiver.questionnaireAttempts.length : 0;
      const nextAttemptNumber = existingAttempts + 1;
      const maxAttempts = 2;

      if (nextAttemptNumber > maxAttempts) {
        return res.status(400).json({
          success: false,
          message: 'Maximum number of questionnaire attempts reached'
        });
      }

      if (nextAttemptNumber === 2 && caregiver.questionnaireRetakeStatus !== 'open') {
        return res.status(403).json({
          success: false,
          message: 'Second attempt not currently available. Please wait for your care team to schedule it.'
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

      // Append this attempt to history
      await appendAttempt(caregiver, formattedAnswers, nextAttemptNumber);

      // Update current answers (for backward compatibility)
      caregiver.questionnaireAnswers = formattedAnswers;
      caregiver.lastQuestionnaireSubmission = new Date();

      await caregiver.save();

      console.log('[Caregiver Submit API] SUCCESS: Saved attempt', nextAttemptNumber, 'with', formattedAnswers.length, 'answers');

      return res.status(200).json({
        success: true,
        message: 'Questionnaire submitted successfully',
        data: {
          attemptNumber: nextAttemptNumber,
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
