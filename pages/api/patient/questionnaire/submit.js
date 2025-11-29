import dbConnect from '../../../../lib/mongodb';
import Patient from '../../../../models/Patient';
import Questionnaire from '../../../../models/Questionnaire';
import mongoose from 'mongoose';
import { appendAttempt, ensureAttemptHistory } from '../../../../lib/questionnaireAttempts';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { patientId, answers } = req.body;
      
      console.log('[Submit API] Received submission:');
      console.log('[Submit API] patientId:', patientId);
      console.log('[Submit API] answers type:', Array.isArray(answers) ? 'array' : typeof answers);
      console.log('[Submit API] answers length:', answers?.length || Object.keys(answers || {}).length);

      if (!patientId || !answers) {
        console.log('[Submit API] ERROR: Missing patientId or answers');
        return res.status(400).json({
          success: false,
          message: 'Patient ID and answers are required'
        });
      }

      // Try to find patient by MongoDB _id first, then by custom patientId
      let patient = null;
      
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        patient = await Patient.findById(patientId);
        console.log('[Submit API] Searched by MongoDB _id, found:', !!patient);
      }
      
      if (!patient) {
        patient = await Patient.findOne({ patientId });
        console.log('[Submit API] Searched by custom patientId, found:', !!patient);
      }

      if (!patient) {
        console.log('[Submit API] ERROR: Patient not found with patientId:', patientId);
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      await ensureAttemptHistory(patient);

      const existingAttempts = Array.isArray(patient.questionnaireAttempts) ? patient.questionnaireAttempts.length : 0;
      const nextAttemptNumber = existingAttempts + 1;
      const maxAttempts = 2;

      if (nextAttemptNumber > maxAttempts) {
        return res.status(400).json({
          success: false,
          message: 'Maximum number of questionnaire attempts reached'
        });
      }

      if (nextAttemptNumber === 2 && patient.questionnaireRetakeStatus !== 'open') {
        return res.status(403).json({
          success: false,
          message: 'Second attempt not currently available. Please wait for your care team to schedule it.'
        });
      }

      if (!patient.questionnaireEnabled) {
        console.log('[Submit API] ERROR: Questionnaire not enabled for patient');
        return res.status(403).json({
          success: false,
          message: 'Questionnaire is not enabled for this patient'
        });
      }

      // Get current questionnaire to validate answers
      const questionnaire = await Questionnaire.findOne({ isActive: true });
      if (!questionnaire) {
        console.log('[Submit API] ERROR: No active questionnaire found');
        return res.status(404).json({
          success: false,
          message: 'No active questionnaire found'
        });
      }

      // Format answers for storage
      // Answers can come as either an array or an object, handle both
      let formattedAnswers;
      
      if (Array.isArray(answers)) {
        // If answers is an array (from new dashboard format)
        console.log('[Submit API] Processing ARRAY format with', answers.length, 'items');
        formattedAnswers = answers.map(item => ({
          questionId: item.questionId,
          questionText: item.questionText,
          answer: item.answer,
          submittedAt: item.submittedAt ? new Date(item.submittedAt) : new Date()
        }));
      } else {
        // If answers is an object (legacy format)
        console.log('[Submit API] Processing OBJECT format');
        formattedAnswers = Object.entries(answers).map(([questionId, answer]) => {
          const question = questionnaire.questions.id(questionId);
          return {
            questionId,
            questionText: question ? question.questionText : 'Unknown Question',
            answer,
            submittedAt: new Date()
          };
        });
      }
      
      console.log('[Submit API] Formatted', formattedAnswers.length, 'answers for storage');

      // Clear existing answers and add new ones
      const submittedAt = new Date();
      patient.questionnaireAnswers = formattedAnswers;
      patient.lastQuestionnaireSubmission = submittedAt;

      const recordedAttemptNumber = appendAttempt(patient, formattedAnswers, submittedAt);

      if (recordedAttemptNumber === 1) {
        patient.questionnaireEnabled = false;
        patient.questionnaireRetakeStatus = 'none';
      } else if (recordedAttemptNumber === 2) {
        patient.questionnaireEnabled = false;
        patient.questionnaireRetakeStatus = 'completed';
        patient.questionnaireRetakeScheduledFor = null;
        patient.questionnaireRetakeCompletedAt = submittedAt;
      }

      await patient.save();

      console.log(`[Submit API] ✅ SUCCESS: Patient ${patient.patientId} saved attempt #${recordedAttemptNumber} with ${formattedAnswers.length} answers`);

      res.status(200).json({
        success: true,
        message: 'Questionnaire submitted successfully',
        data: {
          submissionDate: patient.lastQuestionnaireSubmission,
          answersCount: formattedAnswers.length,
          attemptNumber: recordedAttemptNumber
        }
      });
    } catch (error) {
      console.error('[Submit API] ❌ ERROR:', error.message);
      console.error(error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to submit questionnaire'
      });
    }
  }
  else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}