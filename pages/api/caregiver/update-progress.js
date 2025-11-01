import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';
import ProgramConfig from '../../../models/ProgramConfig';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { caregiverId, day, videoProgress, videoWatched, videoCompleted, taskResponses, tasksCompleted } = req.body;
      
      if (!caregiverId || day === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Caregiver ID and day are required'
        });
      }
      
      // Enhanced caregiver lookup - try both string caregiverId and ObjectId
    const Caregiver = require('../../../models/Caregiver').default;
    let caregiver;
    
    // First try to find by caregiverId string
    caregiver = await Caregiver.findOne({ caregiverId });
    
    // If not found and the caregiverId looks like an ObjectId, try finding by _id
    if (!caregiver && /^[0-9a-fA-F]{24}$/.test(caregiverId)) {
      console.log('🔍 Video progress - Tried finding caregiver by string, now trying ObjectId...');
      caregiver = await Caregiver.findById(caregiverId);
      if (caregiver) {
        console.log(`✅ Video progress - Found caregiver by ObjectId: ${caregiver.name} (${caregiver.caregiverId})`);
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
        return res.status(404).json({
          success: false,
          message: 'Program not found'
        });
      }
      
      const dayModule = program.dayModules.find(m => m.day === day);
      
      if (!dayModule) {
        return res.status(400).json({
          success: false,
          message: 'Invalid day'
        });
      }
      
      // Update video progress
      if (videoProgress !== undefined) {
        dayModule.videoProgress = videoProgress;
      }
      
      if (videoWatched !== undefined) {
        dayModule.videoWatched = videoWatched;
      }
      
      if (videoCompleted !== undefined) {
        dayModule.videoCompleted = videoCompleted;
        if (videoCompleted) {
          dayModule.videoCompletedAt = new Date();
          // Mark as watched when completed
          dayModule.videoWatched = true;
          dayModule.videoProgress = 100;
        }
      }
      
      // Update task responses
      if (taskResponses && Array.isArray(taskResponses)) {
        dayModule.taskResponses = taskResponses;
      }
      
      if (tasksCompleted !== undefined) {
        dayModule.tasksCompleted = tasksCompleted;
      }
      
      // Calculate progress percentage
      let progress = 0;
      if (dayModule.videoCompleted || dayModule.videoWatched) progress += 50;
      if (dayModule.tasksCompleted) progress += 50;
      dayModule.progressPercentage = progress;
      
      // Mark as completed if both video and tasks are done
      if ((dayModule.videoCompleted || dayModule.videoWatched) && dayModule.tasksCompleted && !dayModule.completedAt) {
        dayModule.completedAt = new Date();
        
        // Auto-unlock next day if configured
        const nextDay = day + 1;
        if (nextDay <= 7) {
          const config = await ProgramConfig.findOne({
            configType: 'caregiver-specific',
            caregiverId
          }) || await ProgramConfig.findOne({ configType: 'global' });
          
          const waitTime = program.customWaitTimes?.betweenDays || config?.waitTimes?.betweenDays || 24;
          const unlockTime = new Date(Date.now() + waitTime * 60 * 60 * 1000);
          
          const nextDayModule = program.dayModules.find(m => m.day === nextDay);
          if (nextDayModule && !nextDayModule.scheduledUnlockAt) {
            nextDayModule.scheduledUnlockAt = unlockTime;
          }
        }
      }
      
      // Update current day if this day is completed and it's the current day
      if (dayModule.progressPercentage === 100 && day === program.currentDay) {
        program.currentDay = Math.min(day + 1, 7);
      }
      
      // Recalculate overall progress
      const completedModules = program.dayModules.filter(m => m.progressPercentage === 100).length;
      program.overallProgress = (completedModules / 10) * 100;
      
      program.lastActiveAt = new Date();
      await program.save({ validateBeforeSave: false });
      
      return res.status(200).json({
        success: true,
        message: 'Progress updated successfully',
        data: {
          dayModule,
          currentDay: program.currentDay,
          overallProgress: program.overallProgress
        }
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating progress',
        error: error.message
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
