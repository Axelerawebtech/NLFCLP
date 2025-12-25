import dbConnect from '../../../../lib/mongodb';
import Patient from '../../../../models/Patient';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { patientId } = req.query;
      
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required'
        });
      }
      
      // Try to find patient by ObjectId or patientId string
      let patient;
      
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        patient = await Patient.findById(patientId).select('patientId name phone age gender cancerType');
      }
      
      if (!patient) {
        patient = await Patient.findOne({ patientId }).select('patientId name phone age gender cancerType');
      }
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }
      
      res.status(200).json({
        success: true,
        patient: {
          _id: patient._id,
          patientId: patient.patientId,
          name: patient.name,
          phone: patient.phone,
          age: patient.age,
          gender: patient.gender,
          cancerType: patient.cancerType
        }
      });
      
    } catch (error) {
      console.error('Error fetching patient details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch patient details',
        error: error.message
      });
    }
  } else {
    res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}
