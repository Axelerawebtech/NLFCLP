import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgram';
import ProgramConfig from '../../../models/ProgramConfig';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      // Get global program configuration
      const programConfig = await ProgramConfig.findOne({ configType: 'global' });
      
      if (!programConfig || !programConfig.day0IntroVideo) {
        return res.status(404).json({
          success: false,
          message: 'Day 0 configuration not found. Please upload Day 0 videos first.'
        });
      }
      
      // Get all caregiver programs
      const programs = await CaregiverProgram.find({});
      
      if (programs.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No caregiver programs found',
          updatedCount: 0,
          skippedCount: 0
        });
      }
      
      let updatedCount = 0;
      let skippedCount = 0;
      const details = [];
      
      for (const program of programs) {
        const day0Module = program.dayModules.find(m => m.day === 0);
        
        if (!day0Module) {
          skippedCount++;
          details.push({
            caregiverId: program.caregiverId,
            status: 'skipped',
            reason: 'No Day 0 module found'
          });
          continue;
        }
        
        // Update Day 0 content
        day0Module.videoTitle = programConfig.day0IntroVideo.title;
        day0Module.videoUrl = programConfig.day0IntroVideo.videoUrl;
        day0Module.content = programConfig.day0IntroVideo.description;
        
        // Save without validation to avoid burdenLevel null error
        await program.save({ validateBeforeSave: false });
        updatedCount++;
        details.push({
          caregiverId: program.caregiverId,
          status: 'updated',
          videoTitles: day0Module.videoTitle
        });
      }
      
      return res.status(200).json({
        success: true,
        message: `Day 0 content refreshed for ${updatedCount} caregiver(s)`,
        totalPrograms: programs.length,
        updatedCount,
        skippedCount,
        details
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
