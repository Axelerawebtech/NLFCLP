import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';

/**
 * API: /api/admin/get-feedback-template
 * Method: GET
 * 
 * Purpose: Get default feedback form template
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const programConfig = await ProgramConfig.findOne();
    if (!programConfig) {
      return res.status(404).json({ error: 'Program configuration not found' });
    }

    if (!programConfig.feedbackFormTemplate) {
      return res.status(404).json({ 
        error: 'Feedback template not found',
        message: 'Please seed the template first by calling /api/admin/seed-feedback-template'
      });
    }

    return res.status(200).json({
      success: true,
      template: programConfig.feedbackFormTemplate
    });

  } catch (error) {
    console.error('Error getting feedback template:', error);
    return res.status(500).json({ 
      error: 'Failed to get feedback template',
      details: error.message 
    });
  }
}
