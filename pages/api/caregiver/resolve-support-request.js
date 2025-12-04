import dbConnect from '../../../lib/mongodb';
import Caregiver from '../../../models/Caregiver';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { caregiverId, requestId, resolvedBy } = req.body;

    if (!caregiverId || !requestId) {
      return res.status(400).json({ 
        message: 'Missing required fields: caregiverId and requestId are required' 
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
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    // Find the support request and mark as resolved
    const request = caregiver.supportRequests.id(requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Support request not found' });
    }

    request.status = 'resolved';
    request.resolvedAt = new Date();
    request.resolvedBy = resolvedBy || 'admin';

    await caregiver.save();

    return res.status(200).json({ 
      message: 'Support request marked as resolved',
      supportRequest: request
    });

  } catch (error) {
    console.error('Error resolving support request:', error);
    return res.status(500).json({ 
      message: 'Error resolving support request',
      error: error.message 
    });
  }
}
