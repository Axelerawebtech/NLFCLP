import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';

/**
 * API: /api/admin/save-day1-video
 * Method: POST
 * 
 * DEPRECATED: This endpoint is no longer used
 * Use /api/admin/dynamic-days/tasks instead for video management
 */

export default async function handler(req, res) {
  // Endpoint deprecated - redirect to new system
  return res.status(410).json({ 
    error: 'Endpoint deprecated', 
    message: 'This endpoint has been deprecated. Please use /api/admin/dynamic-days/tasks to manage videos in the unified dynamicDayStructures system.',
    recommendedEndpoint: '/api/admin/dynamic-days/tasks'
  });
}

