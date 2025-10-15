import dbConnect from '../../lib/mongodb';
import CaregiverProgram from '../../models/CaregiverProgramEnhanced';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to database
    await dbConnect();
    console.log('Connected to MongoDB for cleanup');

    // Delete all CaregiverProgram records to start fresh
    const deleteResult = await CaregiverProgram.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing CaregiverProgram records`);

    res.status(200).json({ 
      success: true, 
      message: `Successfully deleted ${deleteResult.deletedCount} CaregiverProgram records`,
      deletedCount: deleteResult.deletedCount
    });
    
  } catch (error) {
    console.error('Cleanup failed:', error);
    res.status(500).json({ 
      error: 'Cleanup failed', 
      details: error.message 
    });
  }
}