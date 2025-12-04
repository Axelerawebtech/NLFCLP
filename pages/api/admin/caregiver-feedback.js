import dbConnect from '../../../lib/mongodb';
import Caregiver from '../../../models/Caregiver';

/**
 * API: /api/admin/caregiver-feedback
 * Method: GET
 * 
 * Purpose: Get all feedback submissions for a specific caregiver or all caregivers
 * Query params: ?caregiverId=XXX (optional)
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { caregiverId } = req.query;

    let caregivers;
    if (caregiverId) {
      // Get specific caregiver
      caregivers = await Caregiver.find({ caregiverId }).select('caregiverId name phone feedbackSubmissions');
    } else {
      // Get all caregivers with feedback
      caregivers = await Caregiver.find({ 
        feedbackSubmissions: { $exists: true, $ne: [] } 
      }).select('caregiverId name phone feedbackSubmissions');
    }

    // Format response
    const feedbackData = caregivers.map(cg => ({
      caregiverId: cg.caregiverId,
      name: cg.name,
      phone: cg.phone,
      feedbackSubmissions: cg.feedbackSubmissions || []
    }));

    return res.status(200).json({
      success: true,
      count: feedbackData.length,
      data: feedbackData
    });

  } catch (error) {
    console.error('Error fetching caregiver feedback:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch feedback',
      details: error.message 
    });
  }
}
