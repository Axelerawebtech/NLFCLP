import dbConnect from '../../../lib/mongodb';
import Patient from '../../../models/Patient';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { patientId } = req.body;

      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required'
        });
      }

      // Find patient by patientId with caregiver details
      const patient = await Patient.findOne({ patientId }).populate('assignedCaregiver');

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found. Please check your ID.'
        });
      }

      // Check if patient is assigned to a caregiver
      if (!patient.isAssigned || !patient.assignedCaregiver) {
        return res.status(403).json({
          success: false,
          message: 'Your account has not been activated yet. Please wait for the administrator to assign you to a caregiver.',
          needsAssignment: true
        });
      }

      // Update last login
      patient.lastLogin = new Date();
      await patient.save();

      // Return patient data (without sensitive info)
      res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
          id: patient.patientId,
          name: patient.name,
          email: patient.email || '',
          phone: patient.phone,
          userType: 'patient',
          isAssigned: patient.isAssigned,
          lastLogin: patient.lastLogin,
          age: patient.age,
          cancerType: patient.cancerType,
          stage: patient.cancerStage,
          treatmentStatus: patient.treatmentModality,
          diagnosisDate: patient.createdAt,
          postTestAvailable: patient.postTestAvailable,
          assignedCaregiver: {
            id: patient.assignedCaregiver.caregiverId,
            name: patient.assignedCaregiver.name,
            email: patient.assignedCaregiver.email
          },
          questionnaireEnabled: patient.questionnaireEnabled,
          lastQuestionnaireSubmission: patient.lastQuestionnaireSubmission
        }
      });
    } catch (error) {
      console.error('Error logging in patient:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to login. Please try again.'
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}