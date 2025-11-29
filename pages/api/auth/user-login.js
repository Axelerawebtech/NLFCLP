import dbConnect from '../../../lib/mongodb';
import Caregiver from '../../../models/Caregiver';
import Patient from '../../../models/Patient';

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
      // Find caregiver and populate assigned patient details
      user = await Caregiver.findOne({ caregiverId: userId }).populate('assignedPatient');

      if (!user) {
        return res.status(404).json({ message: 'Caregiver not found' });
      }

      // Check if caregiver is assigned to a patient
      if (!user.isAssigned || !user.assignedPatient) {
        return res.status(403).json({
          message: 'Access denied. You have not been assigned to a patient yet. Please contact the administrator.',
          needsAssignment: true,
          caregiverStatus: 'unassigned'
        });
      }

    } else if (userType === 'patient') {
      user = await Patient.findOne({ patientId: userId }).populate('assignedCaregiver');

      if (!user) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      // Check if patient is assigned (patients can only login after assignment)
      if (!user.isAssigned) {
        return res.status(403).json({
          message: 'Account not yet activated. Please wait for admin approval.',
          needsApproval: true
        });
      }

    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Prepare response data
    const responseData = {
      success: true,
      message: 'Login successful',
      user: {
        id: userType === 'caregiver' ? user.caregiverId : user.patientId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType,
        isAssigned: user.isAssigned,
        lastLogin: user.lastLogin,
        programProgress: user.programProgress
      }
    };

    // Add specific data based on user type
    if (userType === 'caregiver') {
      responseData.user.assignedPatient = {
        id: user.assignedPatient.patientId,
        name: user.assignedPatient.name,
        email: user.assignedPatient.email,
        age: user.assignedPatient.age,
        cancerType: user.assignedPatient.cancerType,
        stage: user.assignedPatient.stage,
        treatmentStatus: user.assignedPatient.treatmentStatus,
        diagnosisDate: user.assignedPatient.diagnosisDate
      };
      responseData.user.experience = user.experience;
      responseData.user.specialization = user.specialization;
      responseData.user.relationshipToPatient = user.relationshipToPatient;
    } else if (userType === 'patient') {
      if (user.assignedCaregiver) {
        responseData.user.assignedCaregiver = {
          id: user.assignedCaregiver.caregiverId,
          name: user.assignedCaregiver.name,
          email: user.assignedCaregiver.email
        };
      }
      responseData.user.age = user.age;
      responseData.user.cancerType = user.cancerType;
      responseData.user.stage = user.stage;
      responseData.user.treatmentStatus = user.treatmentStatus;
      responseData.user.diagnosisDate = user.diagnosisDate;
      responseData.user.postTestAvailable = user.postTestAvailable;
      responseData.user.questionnaireEnabled = user.questionnaireEnabled || false;
      responseData.user.mongoDbId = user._id.toString();
    }

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}
