import dbConnect from '../../../../lib/mongodb';
import Patient from '../../../../models/Patient';
import Caregiver from '../../../../models/Caregiver';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const patients = await Patient.find({})
        .populate('assignedCaregiver', 'name email')
        .sort({ createdAt: -1 });
      
      res.status(200).json({ 
        success: true, 
        data: patients 
      });
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch patients' 
      });
    }
  }
  else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}