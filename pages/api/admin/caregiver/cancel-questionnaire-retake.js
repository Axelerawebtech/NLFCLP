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
    const { caregiverId } = req.body;

    if (!caregiverId) {
      return res.status(400).json({
        success: false,
        message: 'Caregiver ID is required'
      });
    }

    // Find caregiver
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

    caregiver.questionnaireRetakeStatus = 'none';
    caregiver.questionnaireRetakeScheduledFor = null;
    
    await caregiver.save();

    return res.status(200).json({
      success: true,
      message: 'Scheduled retake cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling questionnaire retake:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel retake',
      error: error.message
    });
  }
}
