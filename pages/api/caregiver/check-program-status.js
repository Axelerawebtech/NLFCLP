import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';
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
      
      if (program.dayModules && program.dayModules.length > 0) {
        for (const dayModule of program.dayModules) {
          // Skip if already unlocked
          if (dayModule.adminPermissionGranted) continue;
          
          // Check if scheduled unlock time has passed
          if (dayModule.scheduledUnlockAt && dayModule.scheduledUnlockAt <= now) {
            // Use unlockDay method if available, otherwise set manually
            if (typeof program.unlockDay === 'function') {
              program.unlockDay(dayModule.day, 'automatic');
            } else {
              dayModule.adminPermissionGranted = true;
              dayModule.unlockedAt = now;
            }
            unlockedDays.push(dayModule.day);
          }
        }
        
        // Save if any days were unlocked
        if (unlockedDays.length > 0) {
          await program.save();
        }
      }
      
      // Get available days
      const availableDays = program.dayModules
        ? program.dayModules.filter(m => m.adminPermissionGranted).map(m => m.day)
        : [];
      
      // Debug burden status using enhanced model structure
      const day1Module = program.dayModules?.find(m => m.day === 1);
      const burdenAssessment = program.oneTimeAssessments?.find(
        assessment => assessment.type === 'zarit_burden'
      );
      console.log('🔍 Check Program Status - Burden Debug:', {
        programBurdenLevel: program.burdenLevel,
        day1DailyAssessment: !!day1Module?.dailyAssessment,
        day1AssessmentType: day1Module?.dailyAssessment?.assessmentType,
        burdenAssessmentExists: !!burdenAssessment,
        burdenAssessmentScore: burdenAssessment?.totalScore
      });
      
      return res.status(200).json({
        success: true,
        data: {
          currentDay: program.currentDay,
          availableDays,
          unlockedDays,
          dayModules: program.dayModules,
          burdenLevel: program.burdenLevel,
          burdenTestCompleted: !!burdenAssessment, // Check oneTimeAssessments
          overallProgress: program.overallProgress,
          oneTimeAssessments: program.oneTimeAssessments // Include assessment data
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
