import dbConnect from '../../../../lib/mongodb';
import Caregiver from '../../../../models/Caregiver';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const { caregiverId, questionnaireEnabled } = req.body;

    if (!caregiverId) {
      return res.status(400).json({
        success: false,
        message: 'Caregiver ID is required'
      });
    }

    // Find caregiver by custom ID or MongoDB ID
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

    caregiver.questionnaireEnabled = questionnaireEnabled;
    
    // If disabling and retake is open, reset it to scheduled
    if (!questionnaireEnabled && caregiver.questionnaireRetakeStatus === 'open') {
      caregiver.questionnaireRetakeStatus = 'scheduled';
    }
    
    await caregiver.save();

    return res.status(200).json({
      success: true,
      message: `Questionnaire ${questionnaireEnabled ? 'enabled' : 'disabled'} for caregiver`,
      data: caregiver
    });

  } catch (error) {
    console.error('Error updating questionnaire status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update questionnaire status',
      error: error.message
    });
  }
}
