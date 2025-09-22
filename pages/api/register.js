import dbConnect from '../../lib/mongodb';
import Caregiver from '../../models/Caregiver';
import Patient from '../../models/Patient';
import { generateUniqueId } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { userType, ...userData } = req.body;

    if (userType === 'caregiver') {
      const caregiver = new Caregiver({
        ...userData,
        caregiverId: userData.caregiverId || generateUniqueId('CG'),
        isAssigned: false,
        programProgress: {
          currentDay: 1,
          completedDays: [],
          isCompleted: false,
        },
      });

      await caregiver.save();

      res.status(201).json({
        success: true,
        message: 'Caregiver registered successfully',
        userId: caregiver.caregiverId,
        userType: 'caregiver',
      });

    } else if (userType === 'patient') {
      const patient = new Patient({
        ...userData,
        patientId: userData.patientId || generateUniqueId('PT'),
        age: parseInt(userData.age),
        diagnosisDate: new Date(userData.diagnosisDate),
        isAssigned: false,
        postTestAvailable: false,
        postTestCompleted: false,
      });

      await patient.save();

      res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        userId: patient.patientId,
        userType: 'patient',
      });

    } else {
      res.status(400).json({ message: 'Invalid user type' });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
}
