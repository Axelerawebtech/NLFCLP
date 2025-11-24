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
      
      // Enhanced caregiver lookup - try both string caregiverId and ObjectId
    const Caregiver = require('../../../models/Caregiver').default;
    let caregiver;
    
    // First try to find by caregiverId string
    caregiver = await Caregiver.findOne({ caregiverId });
    
    // If not found and the caregiverId looks like an ObjectId, try finding by _id
    if (!caregiver && /^[0-9a-fA-F]{24}$/.test(caregiverId)) {
      console.log('🔍 Tried finding caregiver by string, now trying ObjectId...');
      caregiver = await Caregiver.findById(caregiverId);
      if (caregiver) {
        console.log(`✅ Found caregiver by ObjectId: ${caregiver.name} (${caregiver.caregiverId})`);
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
        console.log(`⚠️ No program found for caregiver ${caregiver.caregiverId}, creating new program...`);
        
        // Auto-create program for existing caregiver
        program = new CaregiverProgram({
          caregiverId: caregiver._id,
          currentDay: 0,
          overallProgress: 0,
          dayModules: [],
          dailyTasks: [],
          programStartedAt: new Date(),
          lastActiveAt: new Date(),
          quickAssessments: [],
          oneTimeAssessments: [],
          adminActions: []
        });
        
        // Initialize day modules (0-7)
        if (typeof program.initializeDayModules === 'function') {
          program.initializeDayModules();
        } else {
          // Manual initialization if method doesn't exist
          for (let day = 0; day <= 7; day++) {
            program.dayModules.push({
              day,
              videoCompleted: false,
              videoProgress: 0,
              audioCompleted: false,
              tasksCompleted: false,
              progressPercentage: 0,
              adminPermissionGranted: day === 0 // Only Day 0 unlocked by default
            });
          }
        }
        
        await program.save();
        console.log(`✅ Created new program for caregiver ${caregiver.caregiverId}`);
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
      
      // Debug progress data for each day
      console.log('📊 Day Modules Progress Summary:');
      program.dayModules?.forEach(dm => {
        console.log(`  Day ${dm.day}: ${dm.progressPercentage}% - Tasks: ${dm.taskResponses?.length || 0}, Total: ${dm.tasks?.length || 0}`);
      });
      
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
