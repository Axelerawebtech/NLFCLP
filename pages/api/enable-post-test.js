import dbConnect from '../../lib/mongodb';
import Patient from '../../models/Patient';
import Caregiver from '../../models/Caregiver';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { caregiverId } = req.body;

    if (!caregiverId) {
      return res.status(400).json({ message: 'Caregiver ID is required' });
    }

    // Find the caregiver and their assigned patient
    const caregiver = await Caregiver.findOne({ caregiverId }).populate('assignedPatient');

    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    if (!caregiver.assignedPatient) {
      return res.status(400).json({ message: 'No patient assigned to this caregiver' });
    }

    // Enable post-test for the assigned patient
    const patient = await Patient.findById(caregiver.assignedPatient._id);
    patient.postTestAvailable = true;
    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Post-test enabled for patient',
      patientId: patient.patientId
    });

  } catch (error) {
    console.error('Enable post-test error:', error);
    res.status(500).json({
      message: 'Failed to enable post-test',
      error: error.message
    });
  }
}
