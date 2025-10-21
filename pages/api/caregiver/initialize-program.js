import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgram';
import ProgramConfig from '../../../models/ProgramConfig';
import Caregiver from '../../../models/Caregiver';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { caregiverId } = req.body;
      
      console.log('Initializing program for caregiverId:', caregiverId);
      
      if (!caregiverId) {
        return res.status(400).json({
          success: false,
          message: 'Caregiver ID is required'
        });
      }
      
      // Check if caregiver exists
      const caregiver = await Caregiver.findById(caregiverId);
      if (!caregiver) {
        return res.status(404).json({
          success: false,
          message: 'Caregiver not found'
        });
      }
      
      // Check if program already exists
      let program = await CaregiverProgram.findOne({ caregiverId });
      
      if (program) {
        return res.status(200).json({
          success: true,
          message: 'Program already exists',
          program
        });
      }
      
      // Get global program configuration for Day 0 content
      const programConfig = await ProgramConfig.findOne({ configType: 'global' });
      
      // Create new program
      program = new CaregiverProgram({
        caregiverId,
        currentDay: 0,
        overallProgress: 0,
        dayModules: [],
        dailyTasks: [],
        programStartedAt: new Date(),
        lastActiveAt: new Date()
      });
      
      // Initialize day modules (0-7)
      program.initializeDayModules();
      
      // Populate Day 0 with intro video content from ProgramConfig
      if (programConfig && programConfig.day0IntroVideo) {
        const day0Module = program.dayModules.find(m => m.day === 0);
        if (day0Module) {
          day0Module.videoTitle = programConfig.day0IntroVideo.title;
          day0Module.videoUrl = programConfig.day0IntroVideo.videoUrl;
          day0Module.content = programConfig.day0IntroVideo.description;
          console.log('Day 0 content populated from ProgramConfig');
        }
      } else {
        console.warn('No ProgramConfig found or Day 0 intro video not configured');
      }
      
      await program.save();
      console.log('Program initialized successfully');
      
      return res.status(201).json({
        success: true,
        message: 'Program initialized successfully',
        program
      });
    } catch (error) {
      console.error('Error initializing program:', error);
      return res.status(500).json({
        success: false,
        message: 'Error initializing program',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
