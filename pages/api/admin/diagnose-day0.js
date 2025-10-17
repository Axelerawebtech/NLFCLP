import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgram';
import ProgramConfig from '../../../models/ProgramConfig';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { caregiverId } = req.query;
      
      // Get ProgramConfig
      const programConfig = await ProgramConfig.findOne({ configType: 'global' });
      
      // Get Caregiver Program
      let caregiverProgram = null;
      if (caregiverId) {
        caregiverProgram = await CaregiverProgram.findOne({ caregiverId });
      }
      
      const diagnosis = {
        programConfigExists: !!programConfig,
        day0VideoInConfig: null,
        caregiverProgramExists: !!caregiverProgram,
        day0VideoInCaregiver: null,
        issue: null,
        solution: null
      };
      
      // Check ProgramConfig Day 0
      if (programConfig && programConfig.day0IntroVideo) {
        diagnosis.day0VideoInConfig = {
          hasTitle: !!programConfig.day0IntroVideo.title,
          hasVideoUrl: !!programConfig.day0IntroVideo.videoUrl,
          kannada: {
            title: programConfig.day0IntroVideo.title?.kannada || 'MISSING',
            videoUrl: programConfig.day0IntroVideo.videoUrl?.kannada || 'MISSING'
          }
        };
      }
      
      // Check Caregiver Program Day 0
      if (caregiverProgram) {
        const day0Module = caregiverProgram.dayModules.find(m => m.day === 0);
        if (day0Module) {
          diagnosis.day0VideoInCaregiver = {
            hasVideoTitle: !!day0Module.videoTitle,
            hasVideoUrl: !!day0Module.videoUrl,
            kannada: {
              title: day0Module.videoTitle?.kannada || 'MISSING',
              videoUrl: day0Module.videoUrl?.kannada || 'MISSING'
            }
          };
        }
      }
      
      // Diagnose issue
      if (!programConfig || !programConfig.day0IntroVideo) {
        diagnosis.issue = 'ProgramConfig does not have Day 0 video configured';
        diagnosis.solution = 'Upload Day 0 videos in Admin Dashboard and save';
      } else if (!caregiverProgram) {
        diagnosis.issue = 'Caregiver program does not exist';
        diagnosis.solution = 'Initialize the caregiver program first';
      } else if (!diagnosis.day0VideoInCaregiver?.hasVideoUrl) {
        diagnosis.issue = 'Caregiver program exists but Day 0 video fields are missing';
        diagnosis.solution = 'Click "Sync Day 0 to All Caregivers" button in Admin Dashboard';
      } else if (diagnosis.day0VideoInCaregiver.kannada.videoUrl === 'MISSING') {
        diagnosis.issue = 'Caregiver Day 0 video fields exist but are EMPTY (not synced)';
        diagnosis.solution = 'Click "Sync Day 0 to All Caregivers" button in Admin Dashboard NOW!';
      } else {
        diagnosis.issue = 'No issue detected';
        diagnosis.solution = 'Everything looks good!';
      }
      
      return res.status(200).json({
        success: true,
        diagnosis
      });
    } catch (error) {
      console.error('Error diagnosing Day 0:', error);
      return res.status(500).json({
        success: false,
        message: 'Error diagnosing',
        error: error.message
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
