import dbConnect from '../../../lib/mongodb';
import Content from '../../../models/Content';
import CaregiverProgram from '../../../models/CaregiverProgram';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handleUpdateProgress(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// GET: Fetch ordered content for caregiver with completion status
async function handleGet(req, res) {
  try {
    await dbConnect();

    const { caregiverId, day, language } = req.query;

    if (!caregiverId || day === undefined) {
      return res.status(400).json({ error: 'caregiverId and day parameters are required' });
    }

    const dayNum = parseInt(day);
    
    if (isNaN(dayNum) || dayNum < 0 || dayNum > 7) {
      return res.status(400).json({ error: 'Day must be between 0 and 7' });
    }

    // Get caregiver program to determine category and completion status
    const caregiverProgram = await CaregiverProgram.findOne({ caregiverId });
    
    if (!caregiverProgram) {
      return res.status(404).json({ error: 'Caregiver program not found' });
    }

    // Determine category based on day and caregiver's assessment results
    let category = 'all';
    
    if (dayNum === 1 && caregiverProgram.burdenLevel) {
      category = caregiverProgram.burdenLevel; // mild, moderate, severe
    } else if (dayNum === 2 && caregiverProgram.stressLevel) {
      category = caregiverProgram.stressLevel; // low, moderate, high
    } else if (dayNum === 3 && caregiverProgram.whoqolDomain) {
      category = caregiverProgram.whoqolDomain; // physical, psychological, social, environment
    } else if (dayNum === 4 && caregiverProgram.careType) {
      category = caregiverProgram.careType; // wound-care, drain-care, etc.
    }

    // Get ordered content for the day and category
    const orderedContent = await Content.getOrderedContentForDay(
      dayNum, 
      category, 
      language || 'english'
    );

    if (orderedContent.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: 'No content found for this day and category'
      });
    }

    // Get day module to check completion status
    const dayModule = caregiverProgram.dayModules.find(m => m.day === dayNum);
    
    // If no day module or no content completions, initialize them manually
    if (!dayModule || !dayModule.contentCompletions || dayModule.contentCompletions.length === 0) {
      // Initialize content completions for this day
      const contentCompletions = orderedContent.map((content, index) => ({
        contentId: content._id,
        orderNumber: content.orderNumber,
        isCompleted: false,
        isUnlocked: index === 0, // First content is always unlocked
        completedAt: null,
        progress: 0,
        metadata: {}
      }));

      // Update or create day module with content completions
      if (dayModule) {
        dayModule.contentCompletions = contentCompletions;
      } else {
        caregiverProgram.dayModules.push({
          day: dayNum,
          contentCompletions: contentCompletions,
          adminPermissionGranted: true,
          unlockedAt: new Date(),
          scheduledUnlockAt: new Date()
        });
      }
      
      await caregiverProgram.save();
      
      // Refresh day module
      const updatedProgram = await CaregiverProgram.findOne({ caregiverId });
      const updatedDayModule = updatedProgram.dayModules.find(m => m.day === dayNum);
      
      // Merge content with completion status
      const contentWithStatus = orderedContent.map((content, index) => ({
        ...content,
        completion: updatedDayModule.contentCompletions[index] || {
          isCompleted: false,
          isUnlocked: index === 0,
          progress: 0
        }
      }));

      return res.status(200).json({
        success: true,
        data: contentWithStatus,
        dayProgress: updatedDayModule.progressPercentage || 0,
        currentContentIndex: updatedDayModule.currentContentIndex || 0
      });
    }

    // Merge content with completion status
    const contentWithStatus = orderedContent.map(content => {
      const completion = dayModule.contentCompletions.find(
        cc => cc.contentId.toString() === content._id.toString()
      );
      
      return {
        ...content,
        completion: completion || {
          isCompleted: false,
          isUnlocked: false,
          progress: 0
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: contentWithStatus,
      dayProgress: dayModule.progressPercentage || 0,
      currentContentIndex: dayModule.currentContentIndex || 0,
      category
    });

  } catch (error) {
    console.error('Error fetching ordered content for caregiver:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}

// POST: Update content progress or mark as completed
async function handleUpdateProgress(req, res) {
  try {
    await dbConnect();

    const { 
      caregiverId, 
      day, 
      contentId, 
      action, // 'progress' or 'complete'
      progress, 
      completionData 
    } = req.body;

    if (!caregiverId || day === undefined || !contentId || !action) {
      return res.status(400).json({ 
        error: 'caregiverId, day, contentId, and action are required' 
      });
    }

    const dayNum = parseInt(day);
    if (isNaN(dayNum) || dayNum < 0 || dayNum > 7) {
      return res.status(400).json({ error: 'Day must be between 0 and 7' });
    }

    // Get caregiver program
    const caregiverProgram = await CaregiverProgram.findOne({ caregiverId });
    if (!caregiverProgram) {
      return res.status(404).json({ error: 'Caregiver program not found' });
    }

    let result = false;
    let message = '';

    if (action === 'progress') {
      if (progress === undefined || progress < 0 || progress > 100) {
        return res.status(400).json({ error: 'Progress must be between 0 and 100' });
      }
      
      result = caregiverProgram.updateContentProgress(
        dayNum, 
        contentId, 
        progress, 
        completionData
      );
      message = 'Progress updated successfully';
      
    } else if (action === 'complete') {
      result = caregiverProgram.completeContent(
        dayNum, 
        contentId, 
        completionData
      );
      message = 'Content marked as completed';
    } else {
      return res.status(400).json({ error: 'Action must be either "progress" or "complete"' });
    }

    if (!result) {
      return res.status(400).json({ error: 'Failed to update content status' });
    }

    // Save the updated program
    await caregiverProgram.save();

    // Get updated day module for response
    const dayModule = caregiverProgram.dayModules.find(m => m.day === dayNum);
    const nextUnlocked = caregiverProgram.getNextUnlockedContent(dayNum);

    console.log(`✅ Content ${action} updated for caregiver ${caregiverId}, Day ${dayNum}, Content ${contentId}`);

    return res.status(200).json({
      success: true,
      message,
      data: {
        dayProgress: dayModule.progressPercentage || 0,
        currentContentIndex: dayModule.currentContentIndex || 0,
        nextUnlockedContent: nextUnlocked,
        overallProgress: caregiverProgram.overallProgress
      }
    });

  } catch (error) {
    console.error('Error updating content progress:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}