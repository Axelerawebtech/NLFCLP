import dbConnect from '../../../lib/mongodb';
import { ProgramProgress, ProgramControl, DayGating } from '../../../models/Program';
import Caregiver from '../../../models/Caregiver';
import Admin from '../../../models/Admin';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (!['GET', 'POST', 'PATCH'].includes(req.method)) {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // GET: Fetch all caregivers with their program status
    if (req.method === 'GET') {
      const caregivers = await Caregiver.find({ isAssigned: true }).populate('assignedPatient');

      const programData = await Promise.all(
        caregivers.map(async (caregiver) => {
          const programProgress = await ProgramProgress.findOne({ caregiverId: caregiver.caregiverId });
          const programControl = await ProgramControl.findOne({ caregiverId: caregiver.caregiverId });
          const gating = await DayGating.findOne({ caregiverId: caregiver.caregiverId });

          return {
            caregiverId: caregiver.caregiverId,
            caregiverName: caregiver.name,
            caregiverEmail: caregiver.email,
            assignedPatient: caregiver.assignedPatient ? {
              id: caregiver.assignedPatient.patientId,
              name: caregiver.assignedPatient.name,
              email: caregiver.assignedPatient.email
            } : null,
            programProgress: programProgress || null,
            programControl: programControl || null,
            gating: gating || null,
            assignedAt: caregiver.assignedAt
          };
        })
      );

      return res.status(200).json({
        success: true,
        caregivers: programData
      });
    }

    // POST/PATCH: Control program for specific caregiver
    let { caregiverId, action, adminId, adminName, reason, delayHours, forceUnlockDay } = req.body || {};

    // If adminId wasn't provided in the body, allow Bearer token in Authorization header as fallback
    let decoded = null;
    if (!adminId) {
      const authHeader = req.headers?.authorization || req.headers?.Authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        decoded = verifyToken(token);
        if (decoded && decoded.adminId) {
          adminId = decoded.adminId;
          adminName = adminName || decoded.username || adminName;
        }
      }
    }

    const missing = [];
    if (!caregiverId) missing.push('caregiverId');
    if (!action) missing.push('action');
    if (!adminId && !(decoded && decoded.id)) missing.push('adminId');
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields: missing
      });
    }

    // Verify admin exists (by adminId or by _id from token)
    let admin = null;
    if (adminId) {
      admin = await Admin.findOne({ adminId });
    }
    if (!admin && decoded && decoded.id) {
      admin = await Admin.findById(decoded.id);
      if (admin && !adminId) {
        adminId = admin.adminId || String(admin._id);
      }
    }
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Invalid admin' });
    }

    // Verify caregiver exists
    const caregiver = await Caregiver.findOne({ caregiverId });
    if (!caregiver) {
      return res.status(404).json({ success: false, message: 'Caregiver not found' });
    }

    // Get or create program records
    let programProgress = await ProgramProgress.findOne({ caregiverId });
    let programControl = await ProgramControl.findOne({ caregiverId });
    let gating = await DayGating.findOne({ caregiverId });

    if (!programProgress) {
      programProgress = new ProgramProgress({
        caregiverId,
        patientId: caregiver.assignedPatient || 'pending'
      });
      await programProgress.save();
    }

    if (!programControl) {
      programControl = new ProgramControl({ caregiverId });
      await programControl.save();
    }

    if (!gating) {
      gating = new DayGating({ caregiverId });
      await gating.save();
    }

    const now = new Date();
    const previousStatus = programControl.status;
    const previousDelayHours = programControl.delayHours;

    // Handle different admin actions
    switch (action) {
      case 'pause':
        if (programControl.status === 'active') {
          programControl.status = 'paused';
          gating.canStartCurrentDay = false;
          gating.blockedReason = 'admin_pause';
        } else {
          return res.status(400).json({
            success: false,
            message: `Cannot pause program with status: ${programControl.status}`
          });
        }
        break;

      case 'resume':
        if (programControl.status === 'paused') {
          programControl.status = 'active';
          // Recalculate gating
          await recalculateGating(gating, programProgress, programControl);
        } else {
          return res.status(400).json({
            success: false,
            message: `Cannot resume program with status: ${programControl.status}`
          });
        }
        break;

      case 'terminate':
        programControl.status = 'terminated';
        gating.canStartCurrentDay = false;
        gating.blockedReason = 'admin_terminated';
        break;

      case 'modify_delay':
        if (typeof delayHours !== 'number' || delayHours < 0) {
          return res.status(400).json({
            success: false,
            message: 'Valid delayHours required for modify_delay action'
          });
        }
        programControl.delayHours = delayHours;
        // Recalculate next available time
        await recalculateGating(gating, programProgress, programControl);
        break;

      case 'reset_day':
        // Reset current day progress
        const currentDay = programProgress.currentDay;
        programProgress.completedDays = programProgress.completedDays.filter(d => d.day !== currentDay);
        programProgress.currentDay = Math.max(1, currentDay);
        programProgress.isCompleted = false;
        if (programControl.status === 'completed') {
          programControl.status = 'active';
        }
        await recalculateGating(gating, programProgress, programControl);
        break;

      case 'force_unlock':
        if (typeof forceUnlockDay !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'forceUnlockDay required for force_unlock action'
          });
        }
        // Add override for specific day
        gating.overrides = gating.overrides || [];
        const existingOverride = gating.overrides.find(o => o.day === forceUnlockDay);
        if (!existingOverride) {
          gating.overrides.push({
            day: forceUnlockDay,
            unlockedBy: adminId,
            unlockedAt: now,
            reason: reason || 'Admin force unlock'
          });
        }
        if (forceUnlockDay === programProgress.currentDay) {
          gating.canStartCurrentDay = true;
          gating.blockedReason = null;
        }
        break;

      case 'restart_program':
        // Completely restart the program
        programProgress.currentDay = 1;
        programProgress.completedDays = [];
        programProgress.isCompleted = false;
        programProgress.completedAt = undefined;
        programProgress.startedAt = now;
        programControl.status = 'active';
        gating.currentAvailableDay = 1;
        gating.canStartCurrentDay = true;
        gating.nextAvailableAt = now;
        gating.blockedReason = null;
        gating.overrides = [];
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    // Record admin action
    const adminAction = {
      action,
      adminId,
      adminName: adminName || admin.username,
      timestamp: now,
      reason: reason || '',
      previousValue: {
        status: previousStatus,
        delayHours: previousDelayHours
      },
      newValue: {
        status: programControl.status,
        delayHours: programControl.delayHours
      }
    };

    programControl.adminActions = programControl.adminActions || [];
    programControl.adminActions.push(adminAction);
    programControl.updatedAt = now;

    // Save all changes
    await Promise.all([
      programProgress.save(),
      programControl.save(),
      gating.save()
    ]);

    res.status(200).json({
      success: true,
      message: `Action ${action} completed successfully`,
      programProgress,
      programControl,
      gating,
      adminAction
    });

  } catch (error) {
    console.error('Program control error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function recalculateGating(gating, programProgress, programControl) {
  const now = new Date();
  const currentDay = programProgress.currentDay;
  const completedDays = programProgress.completedDays || [];

  if (programControl.status !== 'active') {
    gating.canStartCurrentDay = false;
    gating.blockedReason = `program_${programControl.status}`;
    return;
  }

  // If day 1 or no previous days completed
  if (currentDay === 1 || completedDays.length === 0) {
    gating.canStartCurrentDay = true;
    gating.nextAvailableAt = now;
    gating.blockedReason = null;
    return;
  }

  // Check if previous day was completed
  const previousDayCompleted = completedDays.find(d => d.day === currentDay - 1);
  if (!previousDayCompleted) {
    gating.canStartCurrentDay = false;
    gating.blockedReason = 'previous_day_incomplete';
    return;
  }

  // Calculate next available time
  const delayMs = programControl.delayHours * 60 * 60 * 1000;
  const nextAvailable = new Date(previousDayCompleted.completedAt.getTime() + delayMs);

  if (now >= nextAvailable) {
    gating.canStartCurrentDay = true;
    gating.blockedReason = null;
  } else {
    gating.canStartCurrentDay = false;
    gating.blockedReason = 'time_delay';
    gating.nextAvailableAt = nextAvailable;
  }

  // Check for admin overrides
  const override = gating.overrides?.find(o => o.day === currentDay);
  if (override) {
    gating.canStartCurrentDay = true;
    gating.blockedReason = null;
  }
}
