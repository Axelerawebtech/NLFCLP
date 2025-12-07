import dbConnect from '../../../lib/mongodb';
import Caregiver from '../../../models/Caregiver';
import Patient from '../../../models/Patient';
import mongoose from 'mongoose';

// Import CaregiverAssessment model
const CaregiverAssessmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  sections: [{
    sectionId: String,
    sectionTitle: {
      english: String,
      hindi: String,
      kannada: String
    },
    sectionDescription: {
      english: String,
      hindi: String,
      kannada: String
    },
    questions: [{
      questionText: {
        english: String,
        hindi: String,
        kannada: String
      },
      type: String,
      options: [{
        value: Number,
        label: {
          english: String,
          hindi: String,
          kannada: String
        }
      }],
      required: Boolean
    }]
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
});

const CaregiverAssessment = mongoose.models.CaregiverAssessment || 
  mongoose.model('CaregiverAssessment', CaregiverAssessmentSchema);

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

    // Only return assessment if enabled for this caregiver
    let assessment = null;
    if (caregiver.questionnaireEnabled) {
      console.log('[Caregiver Dashboard API] Questionnaire enabled, fetching multi-section assessment...');
      // Fetch the active multi-section caregiver assessment
      assessment = await CaregiverAssessment.findOne({ isActive: true })
        .sort({ updatedAt: -1 });
      
      if (assessment) {
        console.log('[Caregiver Dashboard API] Assessment found with ${assessment.sections?.length} sections');
        // Convert to plain object to ensure all data is serializable
        assessment = assessment.toObject ? assessment.toObject() : assessment;
      } else {
        console.log('[Caregiver Dashboard API] No active assessment found - will be created on first config access');
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
        assessment,  // Changed from 'questionnaire' to 'assessment' for multi-section
        questionnaire: assessment  // Keep backward compatibility
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
