import dbConnect from '../../../../lib/mongodb';
import Caregiver from '../../../../models/Caregiver';
import CaregiverProgram from '../../../../models/CaregiverProgram';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { caregiverId } = req.query;
      
      console.log('Fetching profile for caregiverId:', caregiverId);
      
      if (!caregiverId) {
        return res.status(400).json({
          success: false,
          message: 'Caregiver ID is required'
        });
      }
      
      // Fetch caregiver details
      const caregiver = await Caregiver.findById(caregiverId).populate('assignedPatient');
      console.log('Caregiver found:', caregiver ? 'Yes' : 'No');
      
      if (!caregiver) {
        return res.status(404).json({
          success: false,
          message: 'Caregiver not found'
        });
      }
      
      // Fetch program progress
      const program = await CaregiverProgram.findOne({ caregiverId });
      console.log('Program found:', program ? 'Yes' : 'No');
      
      if (program && program.zaritBurdenAssessment) {
        console.log('zaritBurdenAssessment data:', JSON.stringify(program.zaritBurdenAssessment, null, 2));
      }
      
      // Try to fetch caregiver-specific config if ProgramConfig exists
      let customConfig = null;
      try {
        const ProgramConfig = require('../../../../models/ProgramConfig').default;
        if (ProgramConfig) {
          customConfig = await ProgramConfig.findOne({
            configType: 'caregiver-specific',
            caregiverId
          });
          console.log('Custom config found:', customConfig ? 'Yes' : 'No');
        }
      } catch (configError) {
        console.log('ProgramConfig not available:', configError.message);
      }
      
      // Calculate detailed statistics
      let statistics = {
        totalDays: 10,
        completedDays: 0,
        currentDay: program?.currentDay || 0,
        overallProgress: program?.overallProgress || 0,
        burdenLevel: program?.burdenLevel || 'Not assessed',
        burdenTestScore: program?.burdenTestScore || null,
        daysProgress: []
      };
      
      if (program && program.dayModules) {
        statistics.completedDays = program.dayModules.filter(m => m.progressPercentage === 100).length;
        
        // Detailed progress for each day
        statistics.daysProgress = program.dayModules.map(module => {
          // Handle multi-language videoTitle
          let videoTitleDisplay = 'Not assigned';
          if (module.videoTitle) {
            if (typeof module.videoTitle === 'string') {
              videoTitleDisplay = module.videoTitle;
            } else if (typeof module.videoTitle === 'object') {
              // Try to get any available language
              videoTitleDisplay = module.videoTitle.english || 
                                 module.videoTitle.kannada || 
                                 module.videoTitle.hindi || 
                                 'Not assigned';
            }
          }
          
          return {
            day: module.day,
            progressPercentage: module.progressPercentage,
            videoProgress: module.videoProgress || 0, // Add video progress percentage
            videoWatched: module.videoWatched,
            tasksCompleted: module.tasksCompleted,
            completedAt: module.completedAt,
            unlockedAt: module.unlockedAt,
            scheduledUnlockAt: module.scheduledUnlockAt,
            isUnlocked: module.adminPermissionGranted,
            videoTitle: videoTitleDisplay,
            videoTitleMultiLang: module.videoTitle, // Keep full object for detailed view
            taskCount: module.taskResponses ? module.taskResponses.length : 0
          };
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {
          caregiver: {
            id: caregiver._id,
            caregiverId: caregiver.caregiverId,
            name: caregiver.name,
            phone: caregiver.phone,
            age: caregiver.age,
            gender: caregiver.gender,
            maritalStatus: caregiver.maritalStatus,
            educationLevel: caregiver.educationLevel,
            employmentStatus: caregiver.employmentStatus,
            residentialArea: caregiver.residentialArea,
            relationshipToPatient: caregiver.relationshipToPatient,
            hoursPerDay: caregiver.hoursPerDay,
            durationOfCaregiving: caregiver.durationOfCaregiving,
            previousExperience: caregiver.previousExperience,
            supportSystem: caregiver.supportSystem,
            physicalHealth: caregiver.physicalHealth,
            mentalHealth: caregiver.mentalHealth,
            isAssigned: caregiver.isAssigned,
            assignedPatient: caregiver.assignedPatient,
            createdAt: caregiver.createdAt,
            lastLogin: caregiver.lastLogin
          },
          program: program ? {
            currentDay: program.currentDay,
            overallProgress: program.overallProgress,
            burdenLevel: program.burdenLevel,
            burdenTestScore: program.burdenTestScore,
            burdenTestCompletedAt: program.burdenTestCompletedAt,
            zaritBurdenAssessment: program.zaritBurdenAssessment,
            dayModules: program.dayModules,
            dailyTasks: program.dailyTasks,
            programStartedAt: program.programStartedAt,
            lastActiveAt: program.lastActiveAt,
            dayUnlockSchedule: program.dayUnlockSchedule,
            contentAssignedDynamically: program.contentAssignedDynamically,
            customWaitTimes: program.customWaitTimes,
            notifications: program.notifications,
            supportTriggered: program.supportTriggered,
            adminNotes: program.adminNotes
          } : null,
          customConfig,
          statistics
        }
      });
    } catch (error) {
      console.error('Error fetching caregiver profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching caregiver profile',
        error: error.message
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
