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
      
      // Enhanced caregiver lookup - try both string caregiverId and ObjectId
    const Caregiver = require('../../../models/Caregiver').default;
    let caregiver;
    
    // First try to find by caregiverId string
    caregiver = await Caregiver.findOne({ caregiverId });
    
    // If not found and the caregiverId looks like an ObjectId, try finding by _id
    if (!caregiver && /^[0-9a-fA-F]{24}$/.test(caregiverId)) {
      console.log('🔍 Complete burden - Tried finding caregiver by string, now trying ObjectId...');
      caregiver = await Caregiver.findById(caregiverId);
      if (caregiver) {
        console.log(`✅ Complete burden - Found caregiver by ObjectId: ${caregiver.name} (${caregiver.caregiverId})`);
      }
    }
    
    if (!caregiver) {
      return res.status(404).json({ 
        error: 'Caregiver not found',
        searchedFor: caregiverId,
        searchMethods: ['caregiverId string', 'MongoDB ObjectId']
      });
    }

    // Then find the program using the caregiver's ObjectId
    let program = await CaregiverProgram.findOne({ caregiverId: caregiver._id });
      
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
      
      // Assign dynamic content for days 2-7 based on burden level
      if (config) {
        await program.assignDynamicContent(config);
      }
      
      // For progressive content reveal: only unlock Day 1 immediately
      // Other days will be unlocked when previous day is completed
      const waitTimeHours = program.customWaitTimes?.day0ToDay1 || config?.waitTimes?.day0ToDay1 || 0; // Immediate unlock for Day 1
      program.scheduleDayUnlock(1, waitTimeHours);
      
      // Days 2-7 will be unlocked progressively as previous days are completed
      // (This will be handled in the complete-day-module API)
      console.log('Progressive content reveal: Only Day 1 scheduled for immediate unlock');
      
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
