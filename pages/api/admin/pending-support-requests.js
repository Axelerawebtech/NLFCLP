import dbConnect from '../../../lib/mongodb';
import Caregiver from '../../../models/Caregiver';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Find all caregivers with pending support requests
    const caregivers = await Caregiver.find(
      {
        'supportRequests': { $exists: true, $ne: [] }
      },
      {
        _id: 1,
        caregiverId: 1,
        name: 1,
        supportRequests: 1
      }
    );

    // Filter and format pending requests
    const pendingRequests = [];
    let totalPending = 0;

    caregivers.forEach(caregiver => {
      const pending = caregiver.supportRequests.filter(req => req.status === 'pending');
      
      if (pending.length > 0) {
        totalPending += pending.length;
        pendingRequests.push({
          caregiverId: caregiver._id,
          caregiverName: caregiver.name,
          caregiverCode: caregiver.caregiverId,
          requests: pending.map(req => ({
            id: req._id,
            type: req.requestType,
            message: req.message,
            requestedAt: req.requestedAt
          }))
        });
      }
    });

    // Sort by most recent request
    pendingRequests.sort((a, b) => {
      const aLatest = new Date(Math.max(...a.requests.map(r => new Date(r.requestedAt))));
      const bLatest = new Date(Math.max(...b.requests.map(r => new Date(r.requestedAt))));
      return bLatest - aLatest;
    });

    return res.status(200).json({
      success: true,
      totalPending,
      caregivers: pendingRequests
    });

  } catch (error) {
    console.error('Error fetching pending support requests:', error);
    return res.status(500).json({
      message: 'Error fetching pending support requests',
      error: error.message
    });
  }
}
