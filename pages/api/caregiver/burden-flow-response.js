import dbConnect from '../../../lib/mongodb';
import CaregiverProgramEnhanced from '../../../models/CaregiverProgramEnhanced';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { 
      caregiverId, 
      day, 
      burdenLevel, 
      responses, 
      flowType,
      submittedAt 
    } = req.body;

    // Validate required fields
    if (!caregiverId || !day || !burdenLevel || !responses) {
      return res.status(400).json({ 
        message: 'Missing required fields: caregiverId, day, burdenLevel, responses' 
      });
    }

    // Find caregiver
    let caregiver = await CaregiverProgramEnhanced.findOne({ caregiverId });
    if (!caregiver) {
      return res.status(404).json({ message: 'Caregiver not found' });
    }

    // Initialize flow responses structure if it doesn't exist
    if (!caregiver.flowResponses) {
      caregiver.flowResponses = {};
    }

    const dayKey = `day${day}`;
    if (!caregiver.flowResponses[dayKey]) {
      caregiver.flowResponses[dayKey] = {};
    }

    // Store the response
    const responseData = {
      burdenLevel,
      flowType,
      responses,
      submittedAt: submittedAt || new Date().toISOString(),
      consecutiveNoCount: 0 // Initialize counter
    };

    // Check for consecutive "No" responses (for severe burden monitoring)
    if (burdenLevel === 'severe') {
      const consecutiveCount = checkConsecutiveNoResponses(caregiver, responses);
      responseData.consecutiveNoCount = consecutiveCount;

      // Alert admin if 3 consecutive "No" responses
      if (consecutiveCount >= 3) {
        await triggerAdminAlert(caregiverId, consecutiveCount, responses);
        responseData.adminAlerted = true;
      }
    }

    caregiver.flowResponses[dayKey] = responseData;

    // Update last activity
    caregiver.lastActivity = new Date();

    // Save to database
    await caregiver.save();

    res.status(200).json({
      message: 'Flow responses saved successfully',
      caregiverId,
      day,
      burdenLevel,
      consecutiveNoCount: responseData.consecutiveNoCount,
      adminAlerted: responseData.adminAlerted || false
    });

  } catch (error) {
    console.error('Error saving flow responses:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

function checkConsecutiveNoResponses(caregiver, currentResponses) {
  let consecutiveCount = 0;

  // Check current responses for "No" answers
  const currentNoResponses = Object.values(currentResponses).filter(response => 
    response === 'no' || response === 'No'
  ).length;

  if (currentNoResponses > 0) {
    consecutiveCount = 1;

    // Check previous days for consecutive "No" responses
    const flowResponses = caregiver.flowResponses || {};
    const sortedDays = Object.keys(flowResponses)
      .filter(key => key.startsWith('day'))
      .sort((a, b) => {
        const dayA = parseInt(a.replace('day', ''));
        const dayB = parseInt(b.replace('day', ''));
        return dayB - dayA; // Sort in descending order (newest first)
      });

    for (let i = 0; i < sortedDays.length && i < 2; i++) { // Check last 2 days
      const dayData = flowResponses[sortedDays[i]];
      if (dayData && dayData.responses) {
        const prevNoResponses = Object.values(dayData.responses).filter(response => 
          response === 'no' || response === 'No'
        ).length;

        if (prevNoResponses > 0) {
          consecutiveCount++;
        } else {
          break; // Stop counting if we find a day without "No" responses
        }
      }
    }
  }

  return consecutiveCount;
}

async function triggerAdminAlert(caregiverId, consecutiveCount, responses) {
  try {
    // This could be enhanced to send email, SMS, or database notification
    console.log(`🚨 ADMIN ALERT: Caregiver ${caregiverId} has ${consecutiveCount} consecutive days with "No" responses`);
    console.log('Recent responses:', responses);

    // You could implement:
    // 1. Email notification to admin
    // 2. SMS alert
    // 3. Database flag for admin dashboard
    // 4. Slack/Teams notification
    
    // For now, we'll just log it
    // Future enhancement: Add to admin notification queue
    
  } catch (error) {
    console.error('Error triggering admin alert:', error);
  }
}