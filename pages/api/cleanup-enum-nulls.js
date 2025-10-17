// Database cleanup script to fix existing records with null enum values
import dbConnect from '../../lib/mongodb';
import CaregiverProgram from '../../models/CaregiverProgramEnhanced';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();
    
    // Find all programs with null enum values
    const programs = await CaregiverProgram.find({
      $or: [
        { burdenLevel: null },
        { 'dayModules.contentLevel': null }
      ]
    });

    console.log(`Found ${programs.length} programs with null enum values`);

    let fixedCount = 0;
    for (const program of programs) {
      let needsUpdate = false;

      // Remove burdenLevel if it's null (make it undefined)
      if (program.burdenLevel === null) {
        program.burdenLevel = undefined;
        needsUpdate = true;
      }

      // Remove contentLevel from dayModules if it's null
      if (program.dayModules) {
        program.dayModules.forEach(dayModule => {
          if (dayModule.contentLevel === null) {
            dayModule.contentLevel = undefined;
            needsUpdate = true;
          }
        });
      }

      if (needsUpdate) {
        await program.save();
        fixedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Fixed ${fixedCount} programs with null enum values`,
      totalFound: programs.length
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      error: 'Cleanup failed',
      details: error.message
    });
  }
}