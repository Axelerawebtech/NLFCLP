import dbConnect from '../../../lib/mongodb';
import Caregiver from '../../../models/Caregiver';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { weeks = 4 } = req.query; // Default to last 4 weeks
    const weeksToFetch = parseInt(weeks);

    // Calculate date ranges for each week
    const now = new Date();
    const weeklyData = [];

    for (let i = 0; i < weeksToFetch; i++) {
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      weekEnd.setHours(23, 59, 59, 999);

      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);

      // Find all caregivers with support requests in this week
      const caregivers = await Caregiver.find(
        {
          'supportRequests': {
            $elemMatch: {
              requestedAt: {
                $gte: weekStart,
                $lte: weekEnd
              }
            }
          }
        },
        {
          _id: 1,
          caregiverId: 1,
          name: 1,
          supportRequests: 1
        }
      );

      // Filter and count requests for this week
      let totalRequests = 0;
      let adminCallRequests = 0;
      let nursePIRequests = 0;
      let resolvedRequests = 0;
      let pendingRequests = 0;
      const uniqueCaregivers = new Set();

      caregivers.forEach(caregiver => {
        const weekRequests = caregiver.supportRequests.filter(req => {
          const reqDate = new Date(req.requestedAt);
          return reqDate >= weekStart && reqDate <= weekEnd;
        });

        if (weekRequests.length > 0) {
          uniqueCaregivers.add(caregiver.caregiverId);
          
          weekRequests.forEach(req => {
            totalRequests++;
            
            if (req.requestType === 'admin-call') {
              adminCallRequests++;
            } else if (req.requestType === 'nurse-pi') {
              nursePIRequests++;
            }

            if (req.status === 'resolved') {
              resolvedRequests++;
            } else if (req.status === 'pending') {
              pendingRequests++;
            }
          });
        }
      });

      weeklyData.push({
        weekNumber: i + 1,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        weekLabel: `${weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`,
        totalRequests,
        adminCallRequests,
        nursePIRequests,
        resolvedRequests,
        pendingRequests,
        uniqueCaregiversCount: uniqueCaregivers.size,
        caregivers: Array.from(uniqueCaregivers)
      });
    }

    // Calculate overall statistics
    const totalStats = {
      totalRequests: weeklyData.reduce((sum, week) => sum + week.totalRequests, 0),
      totalAdminCalls: weeklyData.reduce((sum, week) => sum + week.adminCallRequests, 0),
      totalNursePICalls: weeklyData.reduce((sum, week) => sum + week.nursePIRequests, 0),
      totalResolved: weeklyData.reduce((sum, week) => sum + week.resolvedRequests, 0),
      totalPending: weeklyData.reduce((sum, week) => sum + week.pendingRequests, 0),
      uniqueCaregiversSought: new Set(weeklyData.flatMap(w => w.caregivers)).size
    };

    return res.status(200).json({
      success: true,
      period: `Last ${weeksToFetch} weeks`,
      weeklyData: weeklyData.reverse(), // Most recent week first
      summary: totalStats
    });

  } catch (error) {
    console.error('Error fetching support request report:', error);
    return res.status(500).json({
      message: 'Error fetching support request report',
      error: error.message
    });
  }
}
