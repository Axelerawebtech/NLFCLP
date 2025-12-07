import dbConnect from '../../../../lib/mongodb';
import Caregiver from '../../../../models/Caregiver';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  await dbConnect();

  try {
    const { caregiverId } = req.body;

    if (!caregiverId) {
      return res.status(400).json({ success: false, message: 'Caregiver ID is required' });
    }

    const caregiver = await Caregiver.findOne({ caregiverId });

    if (!caregiver) {
      return res.status(404).json({ success: false, message: 'Caregiver not found' });
    }

    console.log('[Reset Questionnaire API] Before reset:', {
      answersCount: caregiver.questionnaireAnswers?.length || 0,
      attemptsCount: caregiver.questionnaireAttempts?.length || 0,
      retakeStatus: caregiver.questionnaireRetakeStatus
    });

    // Reset all questionnaire data
    caregiver.questionnaireAnswers = [];
    caregiver.questionnaireAttempts = [];
    caregiver.questionnaireRetakeStatus = 'none';
    caregiver.questionnaireRetakeScheduledFor = null;
    caregiver.questionnaireRetakeCompletedAt = null;
    caregiver.lastQuestionnaireSubmission = null;

    await caregiver.save();

    // Verify the save by querying again
    const verifyCaregiver = await Caregiver.findOne({ caregiverId });
    console.log('[Reset Questionnaire API] After reset - verification query:', {
      answersCount: verifyCaregiver.questionnaireAnswers?.length || 0,
      attemptsCount: verifyCaregiver.questionnaireAttempts?.length || 0,
      retakeStatus: verifyCaregiver.questionnaireRetakeStatus
    });

    console.log('[Reset Questionnaire API] ✅ Successfully cleared data for caregiver:', caregiverId);

    return res.status(200).json({
      success: true,
      message: 'Questionnaire data reset successfully',
      data: {
        caregiverId: caregiver.caregiverId,
        questionnaireEnabled: caregiver.questionnaireEnabled,
        verification: {
          answersCleared: verifyCaregiver.questionnaireAnswers?.length === 0,
          attemptsCleared: verifyCaregiver.questionnaireAttempts?.length === 0
        }
      }
    });

  } catch (error) {
    console.error('[Reset Questionnaire API] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset questionnaire',
      error: error.message
    });
  }
}
