import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';

/**
 * API: /api/admin/assessment-management
 * 
 * GET - Get assessment status for a caregiver
 * POST - Lock/unlock assessments, allow retakes
 * PUT - Update assessment settings
 * 
 * Purpose: Manage assessment locking and retake permissions
 */

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { caregiverId, assessmentType } = req.query;

      if (!caregiverId) {
        return res.status(400).json({ error: 'Caregiver ID is required' });
      }

      const caregiverProgram = await CaregiverProgram.findOne({ caregiverId });

      if (!caregiverProgram) {
        return res.status(404).json({ error: 'Caregiver program not found' });
      }

      if (assessmentType) {
        // Get specific assessment status
        const assessment = caregiverProgram.oneTimeAssessments.find(a => a.type === assessmentType);
        const canTakeResult = caregiverProgram.canTakeAssessment(assessmentType);

        res.status(200).json({
          success: true,
          assessmentType,
          assessment: assessment || null,
          canTake: canTakeResult.canTake,
          reason: canTakeResult.reason,
          retakeCount: canTakeResult.retakeCount || 0,
          locked: assessment?.locked || false,
          lockedAt: assessment?.lockedAt || null,
          lockedBy: assessment?.lockedBy || null
        });
      } else {
        // Get all assessments status
        const assessmentStatuses = {};
        const assessmentTypes = ['zarit_burden', 'stress_burden', 'whoqol', 'practical_questions'];

        assessmentTypes.forEach(type => {
          const assessment = caregiverProgram.oneTimeAssessments.find(a => a.type === type);
          const canTakeResult = caregiverProgram.canTakeAssessment(type);

          assessmentStatuses[type] = {
            exists: !!assessment,
            assessment: assessment || null,
            canTake: canTakeResult.canTake,
            reason: canTakeResult.reason,
            retakeCount: canTakeResult.retakeCount || 0,
            locked: assessment?.locked || false,
            lockedAt: assessment?.lockedAt || null,
            lockedBy: assessment?.lockedBy || null
          };
        });

        res.status(200).json({
          success: true,
          caregiverId,
          assessments: assessmentStatuses,
          adminActions: caregiverProgram.adminActions || []
        });
      }

    } catch (error) {
      console.error('Error fetching assessment status:', error);
      res.status(500).json({ 
        error: 'Failed to fetch assessment status',
        details: error.message 
      });
    }

  } else if (req.method === 'POST') {
    try {
      const { caregiverId, assessmentType, action, adminId, adminUsername } = req.body;

      if (!caregiverId || !assessmentType || !action) {
        return res.status(400).json({ 
          error: 'Missing required fields: caregiverId, assessmentType, action' 
        });
      }

      const caregiverProgram = await CaregiverProgram.findOne({ caregiverId });

      if (!caregiverProgram) {
        return res.status(404).json({ error: 'Caregiver program not found' });
      }

      let result = {};

      switch (action) {
        case 'allow_retake':
          const success = caregiverProgram.allowAssessmentRetake(assessmentType, adminId || adminUsername);
          if (success) {
            result = {
              action: 'retake_allowed',
              assessmentType,
              message: `Assessment retake allowed for ${assessmentType}`
            };
          } else {
            return res.status(400).json({ error: 'Failed to allow assessment retake' });
          }
          break;

        case 'lock_assessment':
          const lockSuccess = caregiverProgram.lockAssessment(assessmentType, 'admin');
          if (lockSuccess) {
            result = {
              action: 'assessment_locked',
              assessmentType,
              message: `Assessment ${assessmentType} locked successfully`
            };
          } else {
            return res.status(400).json({ error: 'Failed to lock assessment or already locked' });
          }
          break;

        default:
          return res.status(400).json({ error: 'Invalid action. Supported: allow_retake, lock_assessment' });
      }

      await caregiverProgram.save();

      res.status(200).json({
        success: true,
        ...result,
        performedBy: adminId || adminUsername,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error managing assessment:', error);
      res.status(500).json({ 
        error: 'Failed to manage assessment',
        details: error.message 
      });
    }

  } else if (req.method === 'PUT') {
    try {
      const { caregiverId, assessmentType, maxRetakes, adminId } = req.body;

      if (!caregiverId || !assessmentType || maxRetakes === undefined) {
        return res.status(400).json({ 
          error: 'Missing required fields: caregiverId, assessmentType, maxRetakes' 
        });
      }

      const caregiverProgram = await CaregiverProgram.findOne({ caregiverId });

      if (!caregiverProgram) {
        return res.status(404).json({ error: 'Caregiver program not found' });
      }

      const assessment = caregiverProgram.oneTimeAssessments.find(a => a.type === assessmentType);

      if (assessment) {
        const oldMaxRetakes = assessment.maxRetakes;
        assessment.maxRetakes = parseInt(maxRetakes);

        // Log admin action
        if (!caregiverProgram.adminActions) caregiverProgram.adminActions = [];
        caregiverProgram.adminActions.push({
          action: 'assessment_settings_updated',
          assessmentType: assessmentType,
          performedBy: adminId || 'admin',
          performedAt: new Date(),
          details: `Updated max retakes from ${oldMaxRetakes} to ${maxRetakes}`,
          oldValue: oldMaxRetakes,
          newValue: maxRetakes
        });

        await caregiverProgram.save();

        res.status(200).json({
          success: true,
          message: `Max retakes updated for ${assessmentType}`,
          assessmentType,
          oldMaxRetakes,
          newMaxRetakes: maxRetakes
        });
      } else {
        return res.status(404).json({ error: 'Assessment not found' });
      }

    } catch (error) {
      console.error('Error updating assessment settings:', error);
      res.status(500).json({ 
        error: 'Failed to update assessment settings',
        details: error.message 
      });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}