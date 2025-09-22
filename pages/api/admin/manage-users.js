import dbConnect from '../../../lib/mongodb';
import Caregiver from '../../../models/Caregiver';
import Patient from '../../../models/Patient';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const caregivers = await Caregiver.find({}).populate('assignedPatient');
      const patients = await Patient.find({}).populate('assignedCaregiver');

      res.status(200).json({
        success: true,
        caregivers,
        patients,
        stats: {
          totalCaregivers: caregivers.length,
          totalPatients: patients.length,
          assignedCaregivers: caregivers.filter(c => c.isAssigned).length,
          assignedPatients: patients.filter(p => p.isAssigned).length,
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
  }

  else if (req.method === 'POST') {
    try {
      const { caregiverId, patientId } = req.body;

      if (!caregiverId || !patientId) {
        return res.status(400).json({ message: 'Caregiver ID and Patient ID are required' });
      }

      const caregiver = await Caregiver.findOne({ caregiverId });
      const patient = await Patient.findOne({ patientId });

      if (!caregiver || !patient) {
        return res.status(404).json({ message: 'Caregiver or Patient not found' });
      }

      if (caregiver.isAssigned || patient.isAssigned) {
        return res.status(400).json({ message: 'User is already assigned' });
      }

      // Assign caregiver to patient
      caregiver.isAssigned = true;
      caregiver.assignedPatient = patient._id;
      await caregiver.save();

      patient.isAssigned = true;
      patient.assignedCaregiver = caregiver._id;
      await patient.save();

      res.status(200).json({
        success: true,
        message: 'Assignment successful',
        assignment: {
          caregiver: { id: caregiverId, name: caregiver.name },
          patient: { id: patientId, name: patient.name }
        }
      });

    } catch (error) {
      res.status(500).json({ message: 'Assignment failed', error: error.message });
    }
  }

  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
