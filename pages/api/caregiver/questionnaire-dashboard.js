import dbConnect from '../../../lib/mongodb';
import Caregiver from '../../../models/Caregiver';
import Patient from '../../../models/Patient';
import Questionnaire from '../../../models/Questionnaire';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { caregiverId } = req.query;

    console.log('[Caregiver Dashboard API] caregiverId:', caregiverId);

    if (!caregiverId) {
      return res.status(400).json({
        success: false,
        message: 'Caregiver ID is required'
      });
    }

    // Try to find caregiver by MongoDB _id first, then by custom caregiverId
    let caregiver = null;
    
    if (mongoose.Types.ObjectId.isValid(caregiverId)) {
      caregiver = await Caregiver.findById(caregiverId).populate('assignedPatient');
      console.log('[Caregiver Dashboard API] Searched by MongoDB _id, found:', !!caregiver);
    }
    
    if (!caregiver) {
      caregiver = await Caregiver.findOne({ caregiverId }).populate('assignedPatient');
      console.log('[Caregiver Dashboard API] Searched by custom caregiverId, found:', !!caregiver);
    }

    if (!caregiver) {
      console.log('[Caregiver Dashboard API] ERROR: Caregiver not found');
      return res.status(404).json({
        success: false,
        message: 'Caregiver not found'
      });
    }

    // Only return questionnaire if enabled for this caregiver
    let questionnaire = null;
    if (caregiver.questionnaireEnabled) {
      console.log('[Caregiver Dashboard API] Questionnaire enabled, fetching...');
      // Fetch the most recent active questionnaire
      questionnaire = await Questionnaire.findOne({ isActive: true })
        .sort({ updatedAt: -1 });
      
      // If no active questionnaire, try to find any questionnaire
      if (!questionnaire) {
        console.log('[Caregiver Dashboard API] No active questionnaire, finding any');
        questionnaire = await Questionnaire.findOne()
          .sort({ updatedAt: -1 });
      }

      if (questionnaire) {
        console.log('[Caregiver Dashboard API] Questionnaire found: ${questionnaire.title} with ${questionnaire.questions?.length} questions');
        // Map questions to include translated text/options if available
        const mappedQuestions = (questionnaire.questions || []).map((q, idx) => {
          const qObj = typeof q.toObject === 'function' ? q.toObject() : q;
          return {
            ...qObj,
            _id: qObj._id || `question-${idx}`,
            questionText: qObj.questionText || '',
            type: qObj.type || 'text',
            options: qObj.options || [],
            required: qObj.required !== false
          };
        });

        questionnaire = {
          _id: questionnaire._id,
          title: questionnaire.title || 'Caregiver Assessment',
          description: questionnaire.description || '',
          questions: mappedQuestions,
          isActive: questionnaire.isActive
        };
      } else {
        console.log('[Caregiver Dashboard API] No questionnaire found in database');
      }
    } else {
      console.log('[Caregiver Dashboard API] Questionnaire not enabled for this caregiver');
    }

    // Check retake status and auto-open if scheduled time has passed
    if (caregiver.questionnaireRetakeStatus === 'scheduled' && caregiver.questionnaireRetakeScheduledFor) {
      const now = new Date();
      const scheduledDate = new Date(caregiver.questionnaireRetakeScheduledFor);
      
      if (now >= scheduledDate) {
        console.log('[Caregiver Dashboard API] Auto-opening scheduled retake');
        caregiver.questionnaireRetakeStatus = 'open';
        await caregiver.save();
      }
    }
    
    res.status(200).json({ 
      success: true, 
      data: {
        caregiver: {
          id: caregiver.caregiverId,
          _id: caregiver._id,
          name: caregiver.name,
          age: caregiver.age,
          phone: caregiver.phone,
          gender: caregiver.gender,
          relationshipToPatient: caregiver.relationshipToPatient,
          assignedPatient: caregiver.assignedPatient ? {
            name: caregiver.assignedPatient.name || 'Unknown',
            patientId: caregiver.assignedPatient.patientId || caregiver.assignedPatient._id
          } : null,
          questionnaireEnabled: caregiver.questionnaireEnabled,
          questionnaireAnswers: caregiver.questionnaireAnswers,
          questionnaireAttempts: caregiver.questionnaireAttempts,
          questionnaireRetakeStatus: caregiver.questionnaireRetakeStatus || 'none',
          questionnaireRetakeScheduledFor: caregiver.questionnaireRetakeScheduledFor,
          questionnaireRetakeCompletedAt: caregiver.questionnaireRetakeCompletedAt,
          lastQuestionnaireSubmission: caregiver.lastQuestionnaireSubmission,
          programProgress: caregiver.programProgress
        },
        questionnaire
      }
    });

  } catch (error) {
    console.error('[Caregiver Dashboard API] ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch caregiver dashboard data',
      error: error.message
    });
  }
}
