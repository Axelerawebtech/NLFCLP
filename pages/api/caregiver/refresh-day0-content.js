import dbConnect from '../../../lib/mongodb';
import CaregiverProgram from '../../../models/CaregiverProgram';
import ProgramConfig from '../../../models/ProgramConfig';

export default async function handler(req, res) {
  // Endpoint deprecated - content now managed through dynamicDayStructures
  return res.status(410).json({ 
    error: 'Endpoint deprecated', 
    message: 'This endpoint has been deprecated. Day 0 content is now dynamically loaded via /api/caregiver/dynamic-day-content which reads from the unified dynamicDayStructures system.',
    recommendedEndpoint: '/api/caregiver/dynamic-day-content',
    parameters: {
      caregiverId: 'required',
      day: 0,
      language: 'english|kannada|hindi'
    }
  });
}
