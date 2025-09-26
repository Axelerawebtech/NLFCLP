import dbConnect from '../../lib/mongodb';
import Caregiver from '../../models/Caregiver';
import Patient from '../../models/Patient';
import { generateUniqueId } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Attempting to connect to database...');
    await dbConnect();
    console.log('Database connection successful');

    console.log('Registration API received:', req.body);
    const { userType, consentAccepted, questionnaireAnswers, ...userData } = req.body;

    if (userType === 'caregiver') {
      console.log('Creating caregiver with data:', userData);
      
      const caregiverData = {
        ...userData,
        caregiverId: userData.caregiverId || generateUniqueId('CG'),
        isAssigned: false,
        consentAccepted: consentAccepted || false,
        consentAcceptedAt: consentAccepted ? new Date() : null,
        questionnaireAnswers: questionnaireAnswers || {},
        programProgress: {
          currentDay: 1,
          completedDays: [],
          isCompleted: false,
        },
      };
      
      console.log('Final caregiver data before save:', caregiverData);
      const caregiver = new Caregiver(caregiverData);
      
      // Validate the caregiver data before saving
      try {
        await caregiver.validate();
        console.log('Caregiver validation successful');
      } catch (validationError) {
        console.error('Caregiver validation failed:', validationError.message);
        console.error('Validation errors:', validationError.errors);
        throw validationError;
      }
      
      console.log('Attempting to save caregiver...');
      const savedCaregiver = await caregiver.save();
      console.log('Caregiver saved successfully:', savedCaregiver._id, savedCaregiver.caregiverId);

      res.status(201).json({
        success: true,
        message: 'Caregiver registered successfully',
        userId: caregiver.caregiverId,
        userType: 'caregiver',
      });

    } else if (userType === 'patient') {
      console.log('Creating patient with data:', userData);
      
      const patientData = {
        ...userData,
        patientId: userData.patientId || generateUniqueId('PT'),
        isAssigned: false,
        consentAccepted: consentAccepted || false,
        consentAcceptedAt: consentAccepted ? new Date() : null,
        questionnaireAnswers: questionnaireAnswers || {},
        postTestAvailable: false,
        postTestCompleted: false,
      };
      
      console.log('Final patient data before save:', patientData);
      const patient = new Patient(patientData);
      
      // Validate the patient data before saving
      try {
        await patient.validate();
        console.log('Patient validation successful');
      } catch (validationError) {
        console.error('Patient validation failed:', validationError.message);
        console.error('Validation errors:', validationError.errors);
        throw validationError;
      }
      
      console.log('Attempting to save patient...');
      const savedPatient = await patient.save();
      console.log('Patient saved successfully:', savedPatient._id, savedPatient.patientId);

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
    console.error('Error details:', error.stack);
    res.status(500).json({
      message: 'Registration failed',
      error: error.message,
      details: error.stack
    });
  }
}
