import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgram';
import ProgramConfig from '../../../models/ProgramConfig';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { caregiverId, responses } = req.body;
      
      if (!caregiverId || !responses) {
        return res.status(400).json({
          success: false,
          message: 'Caregiver ID and responses are required'
        });
      }
      
      // Find or create caregiver program
      let program = await CaregiverProgram.findOne({ caregiverId });
      
      if (!program) {
        program = new CaregiverProgram({ caregiverId });
        program.initializeDayModules();
      }
      
      // Calculate burden level and score
      const { burdenLevel, percentage } = program.calculateBurdenLevel(responses);
      
      // Get program configuration
      let config = await ProgramConfig.findOne({
        configType: 'caregiver-specific',
        caregiverId
      });
      
      if (!config) {
        config = await ProgramConfig.findOne({ configType: 'global' });
      }
      
      // Assign dynamic content for days 2-9 based on burden level
      if (config) {
        await program.assignDynamicContent(config);
      }
      
      // Schedule Day 1 unlock based on wait time
      const waitTimeHours = program.customWaitTimes?.day0ToDay1 || config?.waitTimes?.day0ToDay1 || 24;
      program.scheduleDayUnlock(1, waitTimeHours);
      
      // Schedule remaining days (2-9) based on between-days wait time
      const betweenDaysWaitTime = program.customWaitTimes?.betweenDays || config?.waitTimes?.betweenDays || 24;
      for (let day = 2; day <= 9; day++) {
        program.scheduleDayUnlock(day, betweenDaysWaitTime);
      }
      
      await program.save();
      
      return res.status(200).json({
        success: true,
        message: 'Burden assessment completed successfully',
        data: {
          burdenLevel,
          percentage,
          totalScore: program.zaritBurdenAssessment.totalScore,
          contentAssigned: program.contentAssignedDynamically,
          dayUnlockSchedule: program.dayUnlockSchedule
        }
      });
    } catch (error) {
      console.error('Error completing burden assessment:', error);
      return res.status(500).json({
        success: false,
        message: 'Error completing burden assessment',
        error: error.message
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
