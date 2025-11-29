import dbConnect from '../../../../lib/mongodb';
import Patient from '../../../../models/Patient';
import Questionnaire from '../../../../models/Questionnaire';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await dbConnect();
  
  const { patientId } = req.query;

  if (req.method === 'GET') {
    try {
      // Try to find patient by MongoDB _id first, then by custom patientId
      let patient = null;
      
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        patient = await Patient.findById(patientId)
          .populate('assignedCaregiver', 'name email');
      }
      
      if (!patient) {
        patient = await Patient.findOne({ patientId })
          .populate('assignedCaregiver', 'name email');
      }
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Get current active questionnaire
      const questionnaire = await Questionnaire.findOne({ isActive: true });
      
      res.status(200).json({ 
        success: true, 
        data: {
          patient,
          questionnaire
        }
      });
    } catch (error) {
      console.error('Error fetching patient:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch patient' 
      });
    }
  }

  else if (req.method === 'PUT') {
    try {
      const { questionnaireEnabled } = req.body;

      // Try to find patient by MongoDB _id first, then by custom patientId
      let patient = null;
      
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        patient = await Patient.findByIdAndUpdate(
          patientId,
          { questionnaireEnabled },
          { new: true }
        );
      }
      
      if (!patient) {
        patient = await Patient.findOneAndUpdate(
          { patientId },
          { questionnaireEnabled },
          { new: true }
        );
      }

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.status(200).json({
        success: true,
        message: `Questionnaire ${questionnaireEnabled ? 'enabled' : 'disabled'} for patient`,
        data: patient
      });
    } catch (error) {
      console.error('Error updating patient:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update patient'
      });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}