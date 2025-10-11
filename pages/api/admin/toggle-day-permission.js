import { connectToDatabase } from '../../lib/mongodb';
import CaregiverProgram from '../../models/CaregiverProgramEnhanced';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { caregiverId, day, permission } = req.body;

  if (!caregiverId || day === undefined || permission === undefined) {
    return res.status(400).json({ 
      error: 'Missing required fields: caregiverId, day, permission' 
    });
  }

  // Don't allow changing Day 0 permissions (always unlocked)
  if (day === 0) {
    return res.status(400).json({ 
      error: 'Day 0 permissions cannot be modified' 
    });
  }

  try {
    await connectToDatabase();

    // Find the caregiver program
    const program = await CaregiverProgram.findOne({ caregiverId });

    if (!program) {
      return res.status(404).json({ error: 'Caregiver program not found' });
    }

    // Find the specific day module
    const dayModule = program.dayModules.find(module => module.day === day);

    if (!dayModule) {
      return res.status(404).json({ error: `Day ${day} module not found` });
    }

    // Update the permission
    dayModule.adminPermissionGranted = permission;

    // Mark the dayModules array as modified
    program.markModified('dayModules');

    // Save the updated program
    await program.save();

    res.status(200).json({
      success: true,
      message: `Day ${day} permission ${permission ? 'granted' : 'revoked'} for caregiver`,
      dayModule: {
        day: dayModule.day,
        adminPermissionGranted: dayModule.adminPermissionGranted,
        progressPercentage: dayModule.progressPercentage
      }
    });

  } catch (error) {
    console.error('Toggle day permission error:', error);
    res.status(500).json({ 
      error: 'Failed to update day permission',
      details: error.message 
    });
  }
}