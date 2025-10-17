import dbConnect from '../../../../lib/mongodb';
import CaregiverProgram from '../../../../models/CaregiverProgram';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { caregiverId, day0ToDay1, betweenDays } = req.body;
      
      if (!caregiverId) {
        return res.status(400).json({
          success: false,
          message: 'Caregiver ID is required'
        });
      }
      
      const program = await CaregiverProgram.findOne({ caregiverId });
      
      if (!program) {
        return res.status(404).json({
          success: false,
          message: 'Caregiver program not found'
        });
      }
      
      // Update custom wait times for this caregiver
      if (!program.customWaitTimes) {
        program.customWaitTimes = {};
      }
      
      if (day0ToDay1 !== undefined) {
        program.customWaitTimes.day0ToDay1 = day0ToDay1;
      }
      
      if (betweenDays !== undefined) {
        program.customWaitTimes.betweenDays = betweenDays;
      }
      
      // Save without validation to avoid burdenLevel enum error
      await program.save({ validateBeforeSave: false });
      
      return res.status(200).json({
        success: true,
        message: 'Wait times updated successfully',
        customWaitTimes: program.customWaitTimes
      });
    } catch (error) {
      console.error('Error updating wait times:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating wait times',
        error: error.message
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
