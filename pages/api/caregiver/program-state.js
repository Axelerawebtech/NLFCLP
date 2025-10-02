import dbConnect from '../../../lib/mongodb';
import { ProgramProgress, ProgramControl, DayGating } from '../../../models/Program';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { caregiverId } = req.query;

    if (!caregiverId) {
      return res.status(400).json({ success: false, message: 'Caregiver ID required' });
    }

    // Get or create program progress
    let programProgress = await ProgramProgress.findOne({ caregiverId });
    if (!programProgress) {
      programProgress = new ProgramProgress({ caregiverId, patientId: 'assigned' });
      await programProgress.save();
    }

    // Get or create program control
    let programControl = await ProgramControl.findOne({ caregiverId });
    if (!programControl) {
      programControl = new ProgramControl({ caregiverId });
      await programControl.save();
    }

    // Calculate day gating
    const gating = await calculateDayGating(caregiverId, programProgress, programControl);

    res.status(200).json({
      success: true,
      programProgress,
      programControl,
      gating
    });

  } catch (error) {
    console.error('Program state error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function calculateDayGating(caregiverId, programProgress, programControl) {
  try {
    // Get or create day gating record
    let gating = await DayGating.findOne({ caregiverId });
    if (!gating) {
      gating = new DayGating({ caregiverId });
    }

    const now = new Date();
    const currentDay = programProgress.currentDay;
    const completedDays = programProgress.completedDays || [];
    const lastCompletedDay = completedDays.length > 0 ?
      Math.max(...completedDays.map(d => d.day)) : 0;

    // Check if program is paused or terminated
    if (programControl.status === 'paused' || programControl.status === 'terminated') {
      gating.canStartCurrentDay = false;
      gating.blockedReason = `program_${programControl.status}`;
      await gating.save();
      return gating;
    }

    // If this is day 1 or no previous day completed, allow access
    if (currentDay === 1 || lastCompletedDay === 0) {
      gating.canStartCurrentDay = true;
      gating.currentAvailableDay = 1;
      gating.nextAvailableAt = now;
      gating.blockedReason = null;
      await gating.save();
      return gating;
    }

    // Check if previous day was completed
    const previousDayCompleted = completedDays.find(d => d.day === currentDay - 1);
    if (!previousDayCompleted && currentDay > 1) {
      gating.canStartCurrentDay = false;
      gating.blockedReason = 'previous_day_incomplete';
      await gating.save();
      return gating;
    }

    // Calculate next available time based on delay hours
    if (previousDayCompleted) {
      const delayMs = programControl.delayHours * 60 * 60 * 1000;
      const nextAvailable = new Date(previousDayCompleted.completedAt.getTime() + delayMs);

      // Check weekend restrictions
      if (programControl.customSettings.skipWeekends) {
        const dayOfWeek = nextAvailable.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
          // Move to next Monday
          const daysToAdd = dayOfWeek === 0 ? 1 : 2;
          nextAvailable.setDate(nextAvailable.getDate() + daysToAdd);
          nextAvailable.setHours(programControl.customSettings.allowedStartHours.start, 0, 0, 0);
        }
      }

      // Check allowed hours
      const currentHour = now.getHours();
      const allowedStart = programControl.customSettings.allowedStartHours.start;
      const allowedEnd = programControl.customSettings.allowedStartHours.end;

      if (now >= nextAvailable) {
        if (currentHour >= allowedStart && currentHour <= allowedEnd) {
          gating.canStartCurrentDay = true;
          gating.blockedReason = null;
        } else {
          gating.canStartCurrentDay = false;
          gating.blockedReason = 'outside_allowed_hours';
          // Set next available to next allowed start time
          const nextDay = new Date(now);
          if (currentHour > allowedEnd) {
            nextDay.setDate(nextDay.getDate() + 1);
          }
          nextDay.setHours(allowedStart, 0, 0, 0);
          gating.nextAvailableAt = nextDay;
        }
      } else {
        gating.canStartCurrentDay = false;
        gating.blockedReason = 'time_delay';
        gating.nextAvailableAt = nextAvailable;
      }
    }

    // Check for admin overrides
    const override = gating.overrides.find(o => o.day === currentDay);
    if (override) {
      gating.canStartCurrentDay = true;
      gating.blockedReason = null;
    }

    gating.currentAvailableDay = currentDay;
    gating.lastDayCompletedAt = previousDayCompleted?.completedAt;

    await gating.save();
    return gating;

  } catch (error) {
    console.error('Gating calculation error:', error);
    return { canStartCurrentDay: false, blockedReason: 'calculation_error' };
  }
}
