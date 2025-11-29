import dbConnect from '../../../lib/mongodb';
import Patient from '../../../models/Patient';
import Questionnaire from '../../../models/Questionnaire';
import mongoose from 'mongoose';
import { ensureAttemptHistory } from '../../../lib/questionnaireAttempts';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { patientId, lang = 'en' } = req.query;

      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required'
        });
      }

      console.log(`[Dashboard API] Received patientId: ${patientId}`);

      // Try to find patient by MongoDB _id first, then by custom patientId
      let patient = null;
      
      // Check if patientId is a valid MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        console.log(`[Dashboard API] Trying to find by MongoDB _id`);
        patient = await Patient.findById(patientId);
      }
      
      // If not found by _id, try to find by custom patientId
      if (!patient) {
        console.log(`[Dashboard API] Trying to find by custom patientId`);
        patient = await Patient.findOne({ patientId });
      }

      if (!patient) {
        console.log(`[Dashboard API] Patient not found with ID: ${patientId}`);
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      console.log(`[Dashboard API] Patient found: ${patient.name}`);

      await ensureAttemptHistory(patient);

      if (
        patient.questionnaireRetakeStatus === 'scheduled' &&
        patient.questionnaireRetakeScheduledFor &&
        patient.questionnaireRetakeScheduledFor <= new Date()
      ) {
        patient.questionnaireRetakeStatus = 'open';
        patient.questionnaireEnabled = true;
        await patient.save();
      }

      // Populate assigned caregiver details if available so we can surface their name/email
      if (patient.assignedCaregiver) {
        try {
          await patient.populate({
            path: 'assignedCaregiver',
            select: 'caregiverId name email phone'
          });
        } catch (populateError) {
          console.warn('[Dashboard API] Failed to populate caregiver info:', populateError.message);
        }
      }

      // Only return questionnaire if enabled for this patient
      let questionnaire = null;
      if (patient.questionnaireEnabled) {
        console.log(`[Dashboard API] Questionnaire enabled, fetching...`);
        // Fetch the most recent active questionnaire
        questionnaire = await Questionnaire.findOne({ isActive: true })
          .sort({ updatedAt: -1 });
        
        // If no active questionnaire, try to find any questionnaire
        if (!questionnaire) {
          console.log(`[Dashboard API] No active questionnaire, finding any`);
          questionnaire = await Questionnaire.findOne()
            .sort({ updatedAt: -1 });
        }

        if (questionnaire) {
          console.log(`[Dashboard API] Questionnaire found: ${questionnaire.title} with ${questionnaire.questions?.length} questions`);
          // Map questions to include translated text/options if available
          const mappedQuestions = (questionnaire.questions || []).map((q, idx) => {
            // use translations stored in question.translations if present, otherwise fallback to DB text
            const qObj = typeof q.toObject === 'function' ? q.toObject() : q;
            const questionText = (qObj.translations && qObj.translations[lang]) || qObj.questionText;
            // Options translations: support qObj.optionTranslations[lang] if present
            let options = qObj.options || [];
            if (qObj.optionTranslations && qObj.optionTranslations[lang] && Array.isArray(qObj.optionTranslations[lang])) {
              options = qObj.optionTranslations[lang];
            }
            return {
              _id: qObj._id,
              order: qObj.order,
              type: qObj.type,
              required: qObj.required,
              questionText,
              options,
            };
          });
          // Replace questions with mappedQuestions for response
          questionnaire = {
            _id: questionnaire._id,
            title: questionnaire.title,
            description: questionnaire.description,
            questions: mappedQuestions,
            isActive: questionnaire.isActive
          };
        } else {
          console.log(`[Dashboard API] No questionnaire found in database`);
        }
      } else {
        console.log(`[Dashboard API] Questionnaire not enabled for this patient`);
      }
      
      res.status(200).json({ 
        success: true, 
        data: {
          patient: {
            id: patient.patientId,
            _id: patient._id,
            name: patient.name,
            age: patient.age,
            email: patient.email,
            phone: patient.phone,
            cancerType: patient.cancerType,
            stage: patient.cancerStage,
            treatmentStatus: patient.treatmentModality?.join(', ') || 'N/A',
            assignedCaregiver: patient.assignedCaregiver ? {
              name: patient.assignedCaregiver.name || 'Unknown',
              email: patient.assignedCaregiver.email || '',
              id: patient.assignedCaregiver.caregiverId || patient.assignedCaregiver._id,
              phone: patient.assignedCaregiver.phone || ''
            } : null,
            questionnaireEnabled: patient.questionnaireEnabled,
            questionnaireAnswers: patient.questionnaireAnswers,
            questionnaireAttempts: patient.questionnaireAttempts,
            questionnaireRetakeStatus: patient.questionnaireRetakeStatus,
            questionnaireRetakeScheduledFor: patient.questionnaireRetakeScheduledFor,
            questionnaireRetakeCompletedAt: patient.questionnaireRetakeCompletedAt,
            lastQuestionnaireSubmission: patient.lastQuestionnaireSubmission
          },
          questionnaire: questionnaire ? {
            _id: questionnaire._id,
            title: questionnaire.title,
            description: questionnaire.description,
            questions: questionnaire.questions || [],
            isActive: questionnaire.isActive
          } : null
        }
      });
    } catch (error) {
      console.error('[Dashboard API] Error fetching patient dashboard:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch dashboard data',
        error: error.message
      });
    }
  }
  else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}