import dbConnect from '../../../lib/mongodb';
import { ProgramProgress, ProgramControl, DayGating } from '../../../models/Program';
import Caregiver from '../../../models/Caregiver';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { caregiverId, notes, timeSpent } = req.body;

    if (!caregiverId) {
      return res.status(400).json({ success: false, message: 'Caregiver ID required' });
    }

    // Check if caregiver exists and has assigned patient
    const caregiver = await Caregiver.findOne({ caregiverId });
    if (!caregiver) {
      return res.status(404).json({ success: false, message: 'Caregiver not found' });
    }

    if (!caregiver.isAssigned) {
      return res.status(400).json({ success: false, message: 'No patient assigned to caregiver' });
    }

    // Get program state
    let programProgress = await ProgramProgress.findOne({ caregiverId });
    let programControl = await ProgramControl.findOne({ caregiverId });
    let gating = await DayGating.findOne({ caregiverId });

    if (!programProgress) {
      return res.status(400).json({ success: false, message: 'Program not initialized' });
    }

    // Check if program is active
    if (programControl?.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Program is currently ${programControl?.status || 'inactive'}`
      });
    }

    // Check day gating - recalculate to ensure current state
    const now = new Date();
    const currentDay = programProgress.currentDay;

    // Verify this day can be completed
    if (!gating || !gating.canStartCurrentDay) {
      return res.status(403).json({
        success: false,
        message: 'Day not available for completion',
        reason: gating?.blockedReason || 'unknown'
      });
    }

    // Check if day already completed
    const alreadyCompleted = programProgress.completedDays.find(d => d.day === currentDay);
    if (alreadyCompleted) {
      return res.status(400).json({
        success: false,
        message: `Day ${currentDay} already completed`
      });
    }

    // Complete the day
    const completionEntry = {
      day: currentDay,
      completedAt: now,
      notes: notes || '',
      timeSpent: timeSpent || 0
    };

    programProgress.completedDays.push(completionEntry);
    programProgress.lastActivityAt = now;
    programProgress.totalTimeSpent += (timeSpent || 0);

    // Check if program is completed
    if (currentDay >= 10) {
      programProgress.isCompleted = true;
      programProgress.completedAt = now;
      programControl.status = 'completed';
    } else {
      // Move to next day
      programProgress.currentDay = currentDay + 1;
    }

    // Update gating for next day
    if (gating && currentDay < 10) {
      const delayMs = programControl.delayHours * 60 * 60 * 1000;
      gating.nextAvailableAt = new Date(now.getTime() + delayMs);
      gating.canStartCurrentDay = false;
      gating.blockedReason = 'time_delay';
      gating.currentAvailableDay = currentDay + 1;
      gating.lastDayCompletedAt = now;
    }

    // Save all updates
    await Promise.all([
      programProgress.save(),
      programControl.save(),
      gating?.save()
    ]);

    res.status(200).json({
      success: true,
      message: `Day ${currentDay} completed successfully`,
      programProgress,
      nextDayAvailableAt: gating?.nextAvailableAt,
      isCompleted: programProgress.isCompleted
    });

  } catch (error) {
    console.error('Complete day error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
