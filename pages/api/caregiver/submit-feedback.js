import dbConnect from '../../../lib/mongodb';
import Caregiver from '../../../models/Caregiver';

/**
 * API: /api/caregiver/submit-feedback
 * Method: POST
 * 
 * Purpose: Save caregiver feedback form responses
 * Used for pilot study feedback and program evaluation
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { caregiverId, day, taskId, responses, fieldLabels, language } = req.body;

    if (!caregiverId || day === undefined || !taskId || !responses) {
      return res.status(400).json({ 
        error: 'Missing required fields: caregiverId, day, taskId, responses' 
      });
    }

    // Find caregiver by either MongoDB _id or caregiverId field
    let caregiver;
    
    // Try finding by MongoDB _id first (if it looks like an ObjectId)
    if (caregiverId.match(/^[0-9a-fA-F]{24}$/)) {
      caregiver = await Caregiver.findById(caregiverId);
    }
    
    // If not found, try by caregiverId field
    if (!caregiver) {
      caregiver = await Caregiver.findOne({ caregiverId });
    }
    
    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' });
    }

    // Initialize feedbackSubmissions array if it doesn't exist
    if (!caregiver.feedbackSubmissions) {
      caregiver.feedbackSubmissions = [];
    }

    // Create feedback entry
    const feedbackEntry = {
      taskId,
      day: parseInt(day),
      language: language || 'english',
      responses,
      fieldLabels: fieldLabels || {},
      submittedAt: new Date(),
      participantId: caregiver.caregiverId
    };

    // Check if feedback for this task already exists
    const existingIndex = caregiver.feedbackSubmissions.findIndex(
      f => f.taskId === taskId && f.day === parseInt(day)
    );

    if (existingIndex >= 0) {
      // Update existing feedback
      caregiver.feedbackSubmissions[existingIndex] = feedbackEntry;
    } else {
      // Add new feedback
      caregiver.feedbackSubmissions.push(feedbackEntry);
    }

    await caregiver.save();

    return res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: feedbackEntry
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ 
      error: 'Failed to submit feedback',
      details: error.message 
    });
  }
}
