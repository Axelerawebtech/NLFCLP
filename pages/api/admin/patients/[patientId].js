import dbConnect from '../../../../lib/mongodb';
import Patient from '../../../../models/Patient';
import Questionnaire from '../../../../models/Questionnaire';
import mongoose from 'mongoose';
import { ensureAttemptHistory } from '../../../../lib/questionnaireAttempts';

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

      await ensureAttemptHistory(patient);

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
      const { questionnaireEnabled, action, scheduleAt } = req.body;

      let patient = null;
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        patient = await Patient.findById(patientId);
      }
      if (!patient) {
        patient = await Patient.findOne({ patientId });
      }

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      if (action === 'scheduleRetake') {
        await ensureAttemptHistory(patient);

        if (!Array.isArray(patient.questionnaireAttempts) || patient.questionnaireAttempts.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Patient must complete the questionnaire once before scheduling a retake'
          });
        }

        if (patient.questionnaireAttempts.length >= 2) {
          return res.status(400).json({
            success: false,
            message: 'Patient already completed the second assessment'
          });
        }

        if (!scheduleAt) {
          return res.status(400).json({
            success: false,
            message: 'Schedule date/time is required'
          });
        }

        const scheduledDate = new Date(scheduleAt);
        if (Number.isNaN(scheduledDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid schedule date'
          });
        }

        if (scheduledDate <= new Date()) {
          return res.status(400).json({
            success: false,
            message: 'Schedule date must be in the future'
          });
        }

        patient.questionnaireRetakeStatus = 'scheduled';
        patient.questionnaireRetakeScheduledFor = scheduledDate;
        patient.questionnaireEnabled = false;

        await patient.save();

        return res.status(200).json({
          success: true,
          message: 'Second assessment scheduled successfully',
          data: patient
        });
      }

      if (action === 'cancelRetake') {
        patient.questionnaireRetakeStatus = 'none';
        patient.questionnaireRetakeScheduledFor = null;
        patient.questionnaireEnabled = false;
        await patient.save();

        return res.status(200).json({
          success: true,
          message: 'Scheduled retake has been cancelled',
          data: patient
        });
      }

      if (typeof questionnaireEnabled === 'boolean') {
        patient.questionnaireEnabled = questionnaireEnabled;

        if (!questionnaireEnabled && patient.questionnaireRetakeStatus === 'open') {
          patient.questionnaireRetakeStatus = 'scheduled';
        }

        await patient.save();

        return res.status(200).json({
          success: true,
          message: `Questionnaire ${questionnaireEnabled ? 'enabled' : 'disabled'} for patient`,
          data: patient
        });
      }

      return res.status(400).json({
        success: false,
        message: 'No valid updates provided'
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