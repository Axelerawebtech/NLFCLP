import { connectToDatabase } from '../../lib/mongodb';
import CaregiverProgram from '../../models/CaregiverProgramEnhanced';
import Caregiver from '../../models/Caregiver';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    // Fetch all caregivers with their programs
    const caregivers = await Caregiver.find({})
      .select('name email phone caregiverId')
      .lean();

    // Fetch all caregiver programs
    const programs = await CaregiverProgram.find({})
      .lean();

    // Create a map of programs by caregiver ID
    const programMap = {};
    programs.forEach(program => {
      programMap[program.caregiverId.toString()] = program;
    });

    // Combine caregiver data with program data
    const caregiversWithPrograms = caregivers.map(caregiver => ({
      ...caregiver,
      program: programMap[caregiver._id.toString()] || null
    }));

    res.status(200).json({
      success: true,
      caregivers: caregiversWithPrograms
    });

  } catch (error) {
    console.error('Admin caregivers overview error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch caregivers overview',
      details: error.message 
    });
  }
}