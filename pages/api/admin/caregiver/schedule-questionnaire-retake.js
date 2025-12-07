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
    const { caregiverId, scheduleAt } = req.body;

    if (!caregiverId || !scheduleAt) {
      return res.status(400).json({
        success: false,
        message: 'Caregiver ID and schedule date are required'
      });
    }

    const scheduleDate = new Date(scheduleAt);
    if (Number.isNaN(scheduleDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid schedule date'
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

    // Check if caregiver has completed first attempt
    const attempts = caregiver.questionnaireAttempts || [];
    if (attempts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Caregiver must complete first assessment before scheduling second'
      });
    }

    if (attempts.length >= 2) {
      return res.status(400).json({
        success: false,
        message: 'Caregiver has already completed both assessments'
      });
    }

    caregiver.questionnaireRetakeStatus = 'scheduled';
    caregiver.questionnaireRetakeScheduledFor = scheduleDate;
    
    await caregiver.save();

    return res.status(200).json({
      success: true,
      message: 'Second assessment scheduled successfully',
      data: {
        scheduledFor: scheduleDate
      }
    });

  } catch (error) {
    console.error('Error scheduling questionnaire retake:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to schedule retake',
      error: error.message
    });
  }
}
