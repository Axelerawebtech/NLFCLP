import dbConnect from '../../../lib/mongodb';
import Caregiver from '../../../models/Caregiver';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { caregiverId } = req.query;

    if (!caregiverId) {
      return res.status(400).json({ error: 'Caregiver ID is required' });
    }

    // Fetch caregiver data using caregiverId (not MongoDB _id)
    const caregiver = await Caregiver.findOne({ caregiverId: caregiverId });
    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' });
    }

    // Find or create caregiver program using the MongoDB _id
    let caregiverProgram = await CaregiverProgram.findOne({ caregiverId: caregiver._id });
    
    if (!caregiverProgram) {
      // Create new program without enum fields to avoid validation errors
      const programData = { 
        caregiverId: caregiver._id,
        currentDay: 0,
        overallProgress: 0,
        supportTriggered: false,
        consecutiveNoCount: 0,
        programStartedAt: new Date(),
        lastActiveAt: new Date(),
        notifications: [],
        dailyTasks: []
      };

      caregiverProgram = new CaregiverProgram(programData);
      
      // Initialize day modules without setting null enum values
      caregiverProgram.initializeDayModules();
      
      console.log('Created new caregiver program:', caregiverProgram.toObject());
      await caregiverProgram.save();
    }

    res.status(200).json({
      success: true,
      caregiver,
      program: caregiverProgram
    });

  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error';
    
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      errorMessage = 'Database connection error';
    } else if (error.message.includes('Cast to ObjectId failed')) {
      errorMessage = 'Invalid caregiver ID format';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}