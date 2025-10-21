import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';

/**
 * API: /api/caregiver/update-audio-progress
 * Method: POST
 * 
 * Purpose: Track audio completion and update day progress
 */

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { caregiverId, day, audioCompleted = true } = req.body;

    if (!caregiverId || day === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: caregiverId and day' 
      });
    }

    // Find caregiver program
    const program = await CaregiverProgram.findOne({ caregiverId });
    
    if (!program) {
      return res.status(404).json({ error: 'Caregiver program not found' });
    }

    // Find the day module
    const dayModule = program.dayModules.find(m => m.day === day);
    
    if (!dayModule) {
      return res.status(404).json({ error: `Day ${day} module not found` });
    }

    // Check if video is completed (required before audio)
    if (!dayModule.videoCompleted && !dayModule.videoWatched) {
      return res.status(400).json({ 
        error: 'Video must be completed before audio can be marked as complete' 
      });
    }

    // Update audio completion
    if (audioCompleted) {
      dayModule.audioCompleted = true;
      dayModule.audioCompletedAt = new Date();
      
      // For Day 0, mark as 100% complete when audio is finished
      if (day === 0) {
        dayModule.progressPercentage = 100;
        dayModule.completedAt = new Date();
      } else {
        // For other days, calculate progress based on video + audio + tasks
        let progress = 0;
        
        // Video completion: 40%
        if (dayModule.videoCompleted || dayModule.videoWatched) progress += 40;
        
        // Audio completion: 30%
        if (dayModule.audioCompleted) progress += 30;
        
        // Tasks completion: 30%
        if (dayModule.tasksCompleted) progress += 30;
        
        dayModule.progressPercentage = Math.min(progress, 100);
        
        // Mark day as completed if 100%
        if (dayModule.progressPercentage === 100) {
          dayModule.completedAt = new Date();
        }
      }
      
      dayModule.lastModifiedAt = new Date();
    }

    // Update overall program progress
    const totalDays = program.dayModules.length;
    const completedDays = program.dayModules.filter(d => d.progressPercentage === 100).length;
    program.overallProgress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
    
    // Mark as modified and save
    program.markModified('dayModules');
    await program.save({ validateBeforeSave: false });

    console.log(`✅ Audio completion tracked for Day ${day}, Caregiver:`, caregiverId);

    res.status(200).json({
      success: true,
      message: `Day ${day} audio completion recorded`,
      data: {
        day,
        audioCompleted: dayModule.audioCompleted,
        progressPercentage: dayModule.progressPercentage,
        overallProgress: program.overallProgress,
        dayCompleted: dayModule.progressPercentage === 100
      }
    });

  } catch (error) {
    console.error('Error updating audio progress:', error);
    res.status(500).json({ 
      error: 'Failed to update audio progress',
      details: error.message 
    });
  }
}