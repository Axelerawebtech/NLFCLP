import dbConnect from '../../../../lib/mongodb';
import Caregiver from '../../../../models/Caregiver';
import CaregiverProgram from '../../../../models/CaregiverProgramEnhanced';

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
      
      // Organize assessment data
      let assessmentData = {
        quickAssessments: [],           // Daily assessments organized by day
        oneTimeAssessments: [],         // Scored assessments (zarit, stress, whoqol, etc.)
        dailyModuleAssessments: [],     // Day-specific module assessments
        zaritBurdenAssessment: null     // Legacy Zarit assessment for compatibility
      };

      if (program) {
        // Organize quick assessments by day
        if (program.quickAssessments && program.quickAssessments.length > 0) {
          assessmentData.quickAssessments = program.quickAssessments
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .map(qa => ({
              day: qa.day,
              type: qa.type,
              responses: qa.responses || [],
              language: qa.language || 'english',
              totalQuestions: qa.totalQuestions || 0,
              completedAt: qa.completedAt,
              responseCount: qa.responses ? qa.responses.length : 0
            }));
        }

        // Organize one-time assessments with enhanced validation and logging
        console.log('🔍 DEBUG: One-time assessments check:');
        console.log('  Program has oneTimeAssessments:', !!program.oneTimeAssessments);
        console.log('  OneTimeAssessments length:', program.oneTimeAssessments ? program.oneTimeAssessments.length : 0);
        
        if (program.oneTimeAssessments && program.oneTimeAssessments.length > 0) {
          console.log('  🎯 Found one-time assessments:', program.oneTimeAssessments.length);
          console.log('  Assessment types:', program.oneTimeAssessments.map(a => a.type));
          
          // VALIDATION: Ensure all assessments have required fields
          const validAssessments = program.oneTimeAssessments.filter(ota => {
            const isValid = ota.type && ota.completedAt && ota.totalScore !== undefined;
            if (!isValid) {
              console.warn('⚠️ Invalid assessment found:', {
                hasType: !!ota.type,
                hasCompletedAt: !!ota.completedAt,
                hasTotalScore: ota.totalScore !== undefined,
                assessmentId: ota._id
              });
            }
            return isValid;
          });
          
          console.log('  📊 Valid assessments after filtering:', validAssessments.length);
          
          assessmentData.oneTimeAssessments = validAssessments
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .map(ota => {
              // Ensure consistent data structure for frontend
              const mappedAssessment = {
                type: ota.type,
                responses: ota.responses || [],
                totalScore: Number(ota.totalScore) || 0,
                scoreLevel: ota.scoreLevel || 'unknown',
                language: ota.language || 'english',
                totalQuestions: ota.totalQuestions || 0,
                completedAt: ota.completedAt,
                responseCount: ota.responses ? ota.responses.length : 0,
                // Additional metadata for better tracking
                retakeCount: ota.retakeCount || 0,
                assessmentDetails: ota.assessmentDetails || {}
              };
              
              // Validate essential fields
              if (!mappedAssessment.type || mappedAssessment.totalScore === undefined) {
                console.error('❌ Critical assessment data missing:', mappedAssessment);
              }
              
              return mappedAssessment;
            });
          
          console.log('  📊 Processed assessments:', assessmentData.oneTimeAssessments.length);
          console.log('  📋 Assessment details:', assessmentData.oneTimeAssessments.map(a => ({
            type: a.type,
            score: a.totalScore,
            level: a.scoreLevel,
            date: a.completedAt
          })));
          
        } else {
          console.log('  ❌ No one-time assessments found in program');
          // Ensure empty array instead of undefined
          assessmentData.oneTimeAssessments = [];
        }

        // Extract daily module assessments (from dayModules)
        if (program.dayModules && program.dayModules.length > 0) {
          assessmentData.dailyModuleAssessments = program.dayModules
            .filter(module => module.dailyAssessment)
            .map(module => ({
              day: module.day,
              assessmentType: module.dailyAssessment.assessmentType,
              responses: module.dailyAssessment.responses,
              totalScore: module.dailyAssessment.totalScore,
              scoreLevel: module.dailyAssessment.scoreLevel,
              completedAt: module.dailyAssessment.completedAt
            }))
            .sort((a, b) => a.day - b.day);
        }

        // Legacy Zarit assessment (for backward compatibility)
        if (program.zaritBurdenAssessment) {
          assessmentData.zaritBurdenAssessment = program.zaritBurdenAssessment;
        }
      }
      
      // Calculate detailed statistics
      let statistics = {
        totalDays: 8,
        completedDays: 0,
        currentDay: program?.currentDay || 0,
        overallProgress: program?.overallProgress || 0,
        burdenLevel: program?.burdenLevel || 'Not assessed',
        burdenTestScore: program?.burdenTestScore || null,
        daysProgress: [],
        assessmentCounts: {
          quickAssessments: assessmentData.quickAssessments.length,
          oneTimeAssessments: assessmentData.oneTimeAssessments.length,
          dailyModuleAssessments: assessmentData.dailyModuleAssessments.length
        }
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
            audioCompleted: module.audioCompleted || false, // Add audio completion status
            audioCompletedAt: module.audioCompletedAt,
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
          assessments: assessmentData,
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
