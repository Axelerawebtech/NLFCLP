import dbConnect from '../../../lib/mongodb';
import Caregiver from '../../../models/Caregiver';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { caregiverId, requestType, message } = req.body;

    // Validate required fields
    if (!caregiverId || !requestType) {
      return res.status(400).json({ 
        message: 'Missing required fields: caregiverId and requestType are required' 
      });
    }

    // Validate requestType
    if (!['admin-call', 'nurse-pi'].includes(requestType)) {
      return res.status(400).json({ 
        message: 'Invalid requestType. Must be either "admin-call" or "nurse-pi"' 
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

    // Create support request object
    const supportRequest = {
      requestType,
      message: message || '',
      requestedAt: new Date(),
      status: 'pending',
      resolvedAt: null,
      resolvedBy: null
    };

    // Add to caregiver's supportRequests array
    if (!caregiver.supportRequests) {
      caregiver.supportRequests = [];
    }
    
    caregiver.supportRequests.push(supportRequest);
    await caregiver.save();

    return res.status(200).json({ 
      message: 'Support request submitted successfully',
      supportRequest
    });

  } catch (error) {
    console.error('Error submitting support request:', error);
    return res.status(500).json({ 
      message: 'Error submitting support request',
      error: error.message 
    });
  }
}
