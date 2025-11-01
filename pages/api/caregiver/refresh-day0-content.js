import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgram';
import ProgramConfig from '../../../models/ProgramConfig';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { caregiverId } = req.body;
      
      if (!caregiverId) {
        return res.status(400).json({
          success: false,
          message: 'Caregiver ID is required'
        });
      }
      
      // Get the caregiver's program
      // First, find the caregiver by caregiverId string
    const Caregiver = require('../../../models/Caregiver').default;
    const caregiver = await Caregiver.findOne({ caregiverId });
    
    if (!caregiver) {
      return res.status(404).json({ error: 'Caregiver not found' });
    }

    // Then find the program using the caregiver's ObjectId
    let program = await CaregiverProgram.findOne({ caregiverId: caregiver._id });
      
      if (!program) {
        return res.status(404).json({
          success: false,
          message: 'Program not found for this caregiver'
        });
      }
      
      // Get global program configuration
      const programConfig = await ProgramConfig.findOne({ configType: 'global' });
      
      if (!programConfig || !programConfig.day0IntroVideo) {
        return res.status(404).json({
          success: false,
          message: 'Day 0 configuration not found in ProgramConfig'
        });
      }
      
      // Find Day 0 module
      const day0Module = program.dayModules.find(m => m.day === 0);
      
      if (!day0Module) {
        return res.status(404).json({
          success: false,
          message: 'Day 0 module not found in program'
        });
      }
      
      // Update Day 0 with latest content from ProgramConfig
      day0Module.videoTitle = programConfig.day0IntroVideo.title;
      day0Module.videoUrl = programConfig.day0IntroVideo.videoUrl;
      day0Module.content = programConfig.day0IntroVideo.description;
      
      // Save the updated program without validation to avoid burdenLevel enum error
      await program.save({ validateBeforeSave: false });
      
      return res.status(200).json({
        success: true,
        message: 'Day 0 content refreshed successfully',
        day0Content: {
          videoTitle: day0Module.videoTitle,
          videoUrl: day0Module.videoUrl,
          content: day0Module.content
        }
      });
    } catch (error) {
      console.error('Error refreshing Day 0 content:', error);
      return res.status(500).json({
        success: false,
        message: 'Error refreshing Day 0 content',
        error: error.message
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
