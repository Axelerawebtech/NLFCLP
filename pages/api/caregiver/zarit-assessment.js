import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgram';
import Caregiver from '../../../models/Caregiver';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { caregiverId, responses } = req.body;

    if (!caregiverId || !responses) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify caregiver exists
    const caregiver = await Caregiver.findById(caregiverId);
    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' });
    }

    // Then find the program using the caregiver's ObjectId
    let caregiverProgram = await CaregiverProgram.findOne({ caregiverId: caregiver._id });
    
    if (!caregiverProgram) {
      caregiverProgram = new CaregiverProgram({ caregiverId: caregiver._id });
      caregiverProgram.initializeDayModules();
    }

    // Calculate burden level and save assessment
    const burdenLevel = caregiverProgram.calculateBurdenLevel(responses);
    
    // Save the program with assessment
    await caregiverProgram.save();

    // Return the results
    res.status(200).json({
      success: true,
      burdenLevel,
      totalScore: caregiverProgram.zaritBurdenAssessment.totalScore,
      message: `Assessment completed. Burden level: ${burdenLevel}`
    });

  } catch (error) {
    console.error('Zarit assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}