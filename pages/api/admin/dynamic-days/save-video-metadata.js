import dbConnect from '../../../../lib/mongodb';
import ProgramConfig from '../../../../models/ProgramConfig';

/**
 * Save video metadata to dynamicDayStructures after direct Cloudinary upload
 * POST /api/admin/dynamic-days/save-video-metadata
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { videoUrl, day, level, language, title, description } = req.body;

    // Validate required fields
    if (!videoUrl || day === undefined || day === null) {
      return res.status(400).json({ 
        error: 'Missing required fields: videoUrl and day are required' 
      });
    }

    // Get program config
    const programConfig = await ProgramConfig.findOne();
    if (!programConfig) {
      return res.status(404).json({ error: 'Program configuration not found' });
    }

    // Initialize structures if needed
    if (!programConfig.dynamicDayStructures) {
      programConfig.dynamicDayStructures = [];
    }
    if (!programConfig.dynamicDayTranslations) {
      programConfig.dynamicDayTranslations = [];
    }

    const burdenLevel = level || 'default';
    const videoLanguage = language || 'en';
    const videoTitle = title || '';
    const videoDescription = description || '';

    // Find or create day structure
    let dayStructure = programConfig.dynamicDayStructures.find(
      d => d.dayNumber === parseInt(day) && d.burdenLevel === burdenLevel
    );

    if (!dayStructure) {
      // Create new day structure
      dayStructure = {
        dayNumber: parseInt(day),
        burdenLevel: burdenLevel,
        tasks: []
      };
      programConfig.dynamicDayStructures.push(dayStructure);
    }

    // Check if intro video task exists
    let introTask = dayStructure.tasks.find(t => t.type === 'intro_video');

    if (!introTask) {
      // Create new intro video task
      const newTaskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      introTask = {
        taskId: newTaskId,
        type: 'intro_video',
        content: {
          videoUrl: videoUrl
        },
        optional: false,
        order: 0
      };
      dayStructure.tasks.push(introTask);
    } else {
      // Update existing task
      introTask.content.videoUrl = videoUrl;
    }

    // Handle translations if title or description provided
    if (videoTitle || videoDescription) {
      let translation = programConfig.dynamicDayTranslations.find(
        t => t.dayNumber === parseInt(day) && 
            t.burdenLevel === burdenLevel && 
            t.language === videoLanguage
      );

      if (!translation) {
        translation = {
          dayNumber: parseInt(day),
          burdenLevel: burdenLevel,
          language: videoLanguage,
          tasks: []
        };
        programConfig.dynamicDayTranslations.push(translation);
      }

      // Find or create translation for this task
      let taskTranslation = translation.tasks.find(t => t.taskId === introTask.taskId);
      
      if (!taskTranslation) {
        taskTranslation = {
          taskId: introTask.taskId,
          title: videoTitle,
          description: videoDescription
        };
        translation.tasks.push(taskTranslation);
      } else {
        taskTranslation.title = videoTitle;
        taskTranslation.description = videoDescription;
      }
    }

    // Save to database
    await programConfig.save();

    return res.status(200).json({
      success: true,
      message: 'Video metadata saved successfully',
      saved: {
        dayNumber: parseInt(day),
        burdenLevel: burdenLevel,
        language: videoLanguage,
        videoUrl: videoUrl,
        taskId: introTask.taskId
      }
    });

  } catch (error) {
    console.error('Error saving video metadata:', error);
    return res.status(500).json({ 
      error: 'Failed to save video metadata',
      details: error.message 
    });
  }
}
