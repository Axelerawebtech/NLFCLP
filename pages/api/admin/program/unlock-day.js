import dbConnect from '../../../../lib/mongodb';
import CaregiverProgram from '../../../../models/CaregiverProgram';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { caregiverId, day, method = 'manual-admin' } = req.body;
      
      console.log('Unlock day request:', { caregiverId, day, method });
      
      if (!caregiverId || day === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Caregiver ID and day are required'
        });
      }
      
      const program = await CaregiverProgram.findOne({ caregiverId });
      console.log('Program found:', program ? 'Yes' : 'No');
      
      if (!program) {
        return res.status(404).json({
          success: false,
          message: 'Caregiver program not found. Please initialize the program first.'
        });
      }
      
      // Check if day exists in dayModules
      const dayModule = program.dayModules.find(m => m.day === parseInt(day));
      if (!dayModule) {
        return res.status(400).json({
          success: false,
          message: `Day ${day} not found in program`
        });
      }
      
      // Unlock the specified day
      try {
        const unlocked = program.unlockDay(day, method);
        console.log('Unlock result:', unlocked);
        
        if (!unlocked) {
          return res.status(400).json({
            success: false,
            message: 'Failed to unlock day. Day might already be unlocked.'
          });
        }
        
        // Save without validation to avoid burdenLevel enum error for caregivers who haven't taken test yet
        await program.save({ validateBeforeSave: false });
        console.log('Program saved successfully');
        
        return res.status(200).json({
          success: true,
          message: `Day ${day} unlocked successfully`,
          program
        });
      } catch (unlockError) {
        console.error('Error in unlockDay method:', unlockError);
        return res.status(500).json({
          success: false,
          message: 'Error unlocking day',
          error: unlockError.message
        });
      }
    } catch (error) {
      console.error('Error unlocking day:', error);
      return res.status(500).json({
        success: false,
        message: 'Error unlocking day',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
