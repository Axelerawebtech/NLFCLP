import dbConnect from '../../../lib/mongodb';
import Caregiver from '../../../models/Caregiver';
import Patient from '../../../models/Patient';

export default async function handler(req, res) {
  console.log('Admin API: Connecting to database...');
  await dbConnect();
  console.log('Admin API: Database connected');

  if (req.method === 'GET') {
    try {
      console.log('Admin API: Fetching users...');
      
      const caregivers = await Caregiver.find({}).populate('assignedPatient');
      const patients = await Patient.find({}).populate('assignedCaregiver');

      console.log('Admin API - Found caregivers:', caregivers.length);
      console.log('Admin API - Found patients:', patients.length);

      res.status(200).json({
        success: true,
        caregivers,
        patients,
        stats: {
          totalCaregivers: caregivers.length,
          totalPatients: patients.length,
          assignedCaregivers: caregivers.filter(c => c.isAssigned).length,
          assignedPatients: patients.filter(p => p.isAssigned).length,
          consentedCaregivers: caregivers.filter(c => c.consentAccepted).length,
          consentedPatients: patients.filter(p => p.consentAccepted).length,
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
  }

  else if (req.method === 'POST') {
    try {
      console.log('=== ASSIGNMENT API DEBUG ===');
      const { caregiverId, patientId, delayHours } = req.body;
      console.log('Request body:', req.body);
      console.log('Caregiver ID:', caregiverId);
      console.log('Patient ID:', patientId);

      if (!caregiverId || !patientId) {
        console.log('Validation failed: Missing IDs');
        return res.status(400).json({ success: false, message: 'Caregiver ID and Patient ID are required' });
      }

      console.log('Finding caregiver with ID:', caregiverId);
      const caregiver = await Caregiver.findOne({ caregiverId });
      console.log('Found caregiver:', caregiver ? caregiver.name : 'NOT FOUND');
      
      console.log('Finding patient with ID:', patientId);
      const patient = await Patient.findOne({ patientId });
      console.log('Found patient:', patient ? patient.name : 'NOT FOUND');

      if (!caregiver || !patient) {
        console.log('User lookup failed');
        return res.status(404).json({ success: false, message: 'Caregiver or Patient not found' });
      }

      console.log('Checking assignment status...');
      console.log('Caregiver assigned:', caregiver.isAssigned);
      console.log('Patient assigned:', patient.isAssigned);

      if (caregiver.isAssigned || patient.isAssigned) {
        console.log('Assignment blocked: User already assigned');
        return res.status(400).json({ success: false, message: 'User is already assigned' });
      }

      console.log('Updating caregiver assignment...');
      // Assign caregiver to patient
      caregiver.isAssigned = true;
      caregiver.assignedPatient = patient._id;

      // Initialize program scheduling defaults on assignment
      caregiver.programAssignedAt = new Date();
      caregiver.programProgress = {
        currentDay: 1,
        completedDays: [],
        isCompleted: false,
      };
      caregiver.programControl = {
        status: 'active',
        delayHours: typeof delayHours === 'number' && delayHours > 0 ? delayHours : 24,
        pausedAt: null,
        resumedAt: null,
        terminatedAt: null,
      };

      await caregiver.save();
      console.log('Caregiver updated successfully');

      console.log('Updating patient assignment...');
      patient.isAssigned = true;
      patient.assignedCaregiver = caregiver._id;
      await patient.save();
      console.log('Patient updated successfully');

      console.log('Assignment completed successfully');
      res.status(200).json({
        success: true,
        message: 'Assignment successful',
        assignment: {
          caregiver: { id: caregiverId, name: caregiver.name },
          patient: { id: patientId, name: patient.name },
          program: {
            delayHours: caregiver.programControl.delayHours,
            status: caregiver.programControl.status,
            assignedAt: caregiver.programAssignedAt,
          }
        }
      });

    } catch (error) {
      console.error('Assignment API error:', error);
      res.status(500).json({ success: false, message: 'Assignment failed', error: error.message });
    }
  }

  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
