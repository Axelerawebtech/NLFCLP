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
      
      // Load wait-time defaults and calculate caregiver-specific overrides
      const now = new Date();
      const DEFAULT_WAIT_TIMES = { day0ToDay1: 24, betweenDays: 24 };
      let globalConfig = null;
      try {
        globalConfig = await ProgramConfig.findOne({ configType: 'global' });
      } catch (configErr) {
        console.log('⚠️ Failed to load global program config for wait times:', configErr.message);
      }

      const globalWaitTimes = {
        day0ToDay1: globalConfig?.waitTimes?.day0ToDay1 ?? DEFAULT_WAIT_TIMES.day0ToDay1,
        betweenDays: globalConfig?.waitTimes?.betweenDays ?? DEFAULT_WAIT_TIMES.betweenDays
      };

      const effectiveWaitTimes = {
        day0ToDay1: program.customWaitTimes?.day0ToDay1 ?? globalWaitTimes.day0ToDay1,
        betweenDays: program.customWaitTimes?.betweenDays ?? globalWaitTimes.betweenDays
      };

      // Ensure scheduled unlocks line up with latest wait time settings
      let programModified = false;
      if (Array.isArray(program.dayModules) && program.dayModules.length > 0) {
        const modulesByDay = new Map();
        program.dayModules.forEach(module => {
          if (module && typeof module.day === 'number') {
            modulesByDay.set(module.day, module);
          }
        });

        let scheduleChanged = false;
        for (const module of program.dayModules) {
          if (!module || module.day === 0 || module.adminPermissionGranted) continue;
          const previousDay = modulesByDay.get(module.day - 1);
          if (!previousDay?.completedAt) continue;

          const waitHours = module.day === 1
            ? effectiveWaitTimes.day0ToDay1
            : effectiveWaitTimes.betweenDays;

          if (waitHours <= 0) {
            module.adminPermissionGranted = true;
            module.scheduledUnlockAt = previousDay.completedAt;
            module.unlockedAt = module.unlockedAt || now;
            scheduleChanged = true;
            continue;
          }

          const expectedUnlockAt = new Date(previousDay.completedAt.getTime() + waitHours * 60 * 60 * 1000);
          const scheduled = module.scheduledUnlockAt ? new Date(module.scheduledUnlockAt) : null;

          if (!scheduled || Math.abs(scheduled.getTime() - expectedUnlockAt.getTime()) > 1000) {
            module.scheduledUnlockAt = expectedUnlockAt;
            scheduleChanged = true;
          }
        }

        if (scheduleChanged) {
          programModified = true;
          program.markModified('dayModules');
        }
      }

      // Check for days that should be auto-unlocked
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
            programModified = true;
            program.markModified('dayModules');
          }
        }
      }

      if (programModified) {
        await program.save();
      }

      // Build countdown metadata for locked days
      const countdownInfo = [];
      const nowMs = now.getTime();
      program.dayModules?.forEach(dm => {
        if (dm.adminPermissionGranted || !dm.scheduledUnlockAt) return;
        const unlockTime = new Date(dm.scheduledUnlockAt).getTime();
        if (Number.isNaN(unlockTime)) return;

        const hoursRemaining = Math.max(0, Math.ceil((unlockTime - nowMs) / (1000 * 60 * 60)));
        const minutesRemaining = Math.max(0, Math.ceil((unlockTime - nowMs) / (1000 * 60)));

        countdownInfo.push({
          day: dm.day,
          scheduledUnlockAt: dm.scheduledUnlockAt,
          hoursRemaining,
          minutesRemaining
        });
      });

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
          oneTimeAssessments: program.oneTimeAssessments, // Include assessment data
          waitTimes: {
            global: globalWaitTimes,
            caregiverOverrides: program.customWaitTimes || null,
            effective: effectiveWaitTimes,
            countdowns: countdownInfo
          }
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
