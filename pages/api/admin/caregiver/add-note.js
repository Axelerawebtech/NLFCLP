import dbConnect from '../../../../lib/mongodb';
import CaregiverProgram from '../../../../models/CaregiverProgram';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { caregiverId, note, addedBy } = req.body;
      
      if (!caregiverId || !note) {
        return res.status(400).json({
          success: false,
          message: 'Caregiver ID and note are required'
        });
      }
      
      const program = await CaregiverProgram.findOne({ caregiverId });
      
      if (!program) {
        return res.status(404).json({
          success: false,
          message: 'Caregiver program not found'
        });
      }
      
      program.adminNotes.push({
        note,
        addedBy,
        addedAt: new Date()
      });
      
      await program.save();
      
      return res.status(200).json({
        success: true,
        message: 'Note added successfully',
        adminNotes: program.adminNotes
      });
    } catch (error) {
      console.error('Error adding admin note:', error);
      return res.status(500).json({
        success: false,
        message: 'Error adding admin note',
        error: error.message
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
