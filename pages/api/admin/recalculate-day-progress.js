import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';

/**
 * API: /api/admin/recalculate-day-progress
 * Method: POST
 * 
 * Purpose: Recalculate progress for a specific day based on existing task responses
 * Useful when task definitions were missing during initial progress calculation
 */

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { caregiverId, day } = req.body;

    if (!caregiverId || day === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: caregiverId and day' 
      });
    }

    // Validate day
    if (day < 0 || day > 7) {
      return res.status(400).json({ 
        error: 'Invalid day. Must be between 0 and 7' 
      });
    }

    // Get caregiver program
    const Caregiver = require('../../../models/Caregiver').default;
    let caregiver = await Caregiver.findOne({ caregiverId });
    
    if (!caregiver && /^[0-9a-fA-F]{24}$/.test(caregiverId)) {
      caregiver = await Caregiver.findById(caregiverId);
    }
    
    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' });
    }

    const program = await CaregiverProgram.findOne({ caregiverId: caregiver._id });
    
    if (!program) {
      return res.status(404).json({ error: 'Caregiver program not found' });
    }

    // Find the day module
    const dayModule = program.dayModules.find(m => m.day === day);
    
    if (!dayModule) {
      return res.status(404).json({ error: `Day ${day} module not found` });
    }

    // Count unique completed tasks
    const uniqueCompletedTaskIds = [...new Set((dayModule.taskResponses || []).map(r => r.taskId))];
    const completedTasksCount = uniqueCompletedTaskIds.length;
    
    // Get total tasks
    let totalTasks = (dayModule.tasks || []).filter(t => t.taskType !== 'reminder').length;
    
    // If no tasks in DB, fetch from videoConfig
    if (totalTasks === 0 && completedTasksCount > 0) {
      try {
        console.log(`⚠️ Day ${day}: No tasks in DB. Fetching from videoConfig...`);
        
        const videoConfig = require('../../../config/videoConfig').default;
        console.log(`✅ Loaded videoConfig, found ${videoConfig.days?.length || 0} days`);
        
        const dayConfig = videoConfig.days?.find(d => d.dayNumber === day);
        console.log(`✅ Found dayConfig for Day ${day}:`, !!dayConfig);
        
        if (dayConfig) {
          let levelKey = 'default';
          if (dayConfig.hasTest && program.burdenLevel) {
            const matchingRange = dayConfig.testConfig?.scoreRanges?.find(
              range => range.levelKey.toLowerCase() === program.burdenLevel.toLowerCase()
            );
            levelKey = matchingRange?.levelKey || dayConfig.testConfig?.scoreRanges?.[0]?.levelKey || 'default';
          }
          
          console.log(`✅ Using levelKey: ${levelKey}`);
          
          const levelConfig = dayConfig.contentByLevel?.find(l => l.levelKey === levelKey);
          console.log(`✅ Found levelConfig:`, !!levelConfig, `with ${levelConfig?.tasks?.length || 0} tasks`);
          
          if (levelConfig && levelConfig.tasks) {
            const configTasks = levelConfig.tasks.filter(task => task.enabled && task.taskType !== 'reminder');
            totalTasks = configTasks.length;
            
            console.log(`✅ Filtered to ${totalTasks} enabled non-reminder tasks`);
            
            // Save tasks to dayModule
            dayModule.tasks = configTasks.map(task => ({
              taskId: task.taskId,
              taskOrder: task.taskOrder,
              taskType: task.taskType,
              title: task.title || '',
              description: task.description || ''
            }));
            
            console.log(`✅ Saved ${totalTasks} tasks to Day ${day} module`);
          }
        }
      } catch (err) {
        console.error(`❌ Error fetching tasks from config:`, err.message);
        console.error(err.stack);
      }
    }

    // Recalculate progress
    let progress = 0;
    if (totalTasks > 0) {
      progress = Math.round((completedTasksCount / totalTasks) * 100);
    }
    
    dayModule.progressPercentage = progress;
    
    // Mark as completed if all tasks done
    if (totalTasks > 0 && completedTasksCount >= totalTasks && !dayModule.completedAt) {
      dayModule.completedAt = new Date();
      dayModule.tasksCompleted = true;
    }
    
    // Recalculate overall progress
    const totalDays = 8;
    const totalProgress = program.dayModules.reduce((sum, m) => sum + (m.progressPercentage || 0), 0);
    program.overallProgress = Math.round(totalProgress / totalDays);
    
    // Mark as modified and save
    program.markModified('dayModules');
    await program.save({ validateBeforeSave: false });

    console.log(`✅ Recalculated Day ${day} progress for caregiver ${caregiverId}:`, {
      completedTasks: completedTasksCount,
      totalTasks,
      progressPercentage: progress,
      overallProgress: program.overallProgress
    });

    res.status(200).json({
      success: true,
      message: `Day ${day} progress recalculated successfully`,
      data: {
        day,
        completedTasks: completedTasksCount,
        totalTasks,
        progressPercentage: progress,
        overallProgress: program.overallProgress
      }
    });

  } catch (error) {
    console.error('Error recalculating day progress:', error);
    res.status(500).json({ 
      error: 'Failed to recalculate day progress',
      details: error.message 
    });
  }
}
