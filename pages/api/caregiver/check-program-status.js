import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgram';
import ProgramConfig from '../../../models/ProgramConfig';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { caregiverId } = req.query;
      
      if (!caregiverId) {
        return res.status(400).json({
          success: false,
          message: 'Caregiver ID is required'
        });
      }
      
      const program = await CaregiverProgram.findOne({ caregiverId });
      
      if (!program) {
        return res.status(404).json({
          success: false,
          message: 'Program not found'
        });
      }
      
      // Check for days that should be auto-unlocked
      const now = new Date();
      let unlockedDays = [];
      
      for (const dayModule of program.dayModules) {
        // Skip if already unlocked
        if (dayModule.adminPermissionGranted) continue;
        
        // Check if scheduled unlock time has passed
        if (dayModule.scheduledUnlockAt && dayModule.scheduledUnlockAt <= now) {
          program.unlockDay(dayModule.day, 'automatic');
          unlockedDays.push(dayModule.day);
        }
      }
      
      // Save if any days were unlocked
      if (unlockedDays.length > 0) {
        await program.save();
      }
      
      // Get available days
      const availableDays = program.dayModules
        .filter(m => m.adminPermissionGranted)
        .map(m => m.day);
      
      return res.status(200).json({
        success: true,
        data: {
          currentDay: program.currentDay,
          availableDays,
          unlockedDays,
          dayModules: program.dayModules,
          burdenLevel: program.burdenLevel,
          burdenTestCompleted: !!program.burdenTestCompletedAt,
          overallProgress: program.overallProgress
        }
      });
    } catch (error) {
      console.error('Error checking program status:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking program status',
        error: error.message
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
