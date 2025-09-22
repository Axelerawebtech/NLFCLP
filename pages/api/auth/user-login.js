import dbConnect from '../../lib/mongodb';
import Caregiver from '../../models/Caregiver';
import Patient from '../../models/Patient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { userId, userType } = req.body;

    if (!userId || !userType) {
      return res.status(400).json({ message: 'User ID and type are required' });
    }

    let user;
    if (userType === 'caregiver') {
      user = await Caregiver.findOne({ caregiverId: userId });
    } else if (userType === 'patient') {
      user = await Patient.findOne({ patientId: userId }).populate('assignedCaregiver');
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is assigned (patients can only login after assignment)
    if (userType === 'patient' && !user.isAssigned) {
      return res.status(403).json({
        message: 'Account not yet activated. Please wait for admin approval.',
        needsApproval: true
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: userType === 'caregiver' ? user.caregiverId : user.patientId,
        name: user.name,
        email: user.email,
        userType,
        isAssigned: user.isAssigned,
        assignedTo: userType === 'patient' ? user.assignedCaregiver : user.assignedPatient,
        programProgress: userType === 'caregiver' ? user.programProgress : undefined,
        postTestAvailable: userType === 'patient' ? user.postTestAvailable : undefined,
        postTestCompleted: userType === 'patient' ? user.postTestCompleted : undefined,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
}
