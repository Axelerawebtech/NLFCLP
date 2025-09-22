import dbConnect from '../../../lib/mongodb';
import Admin from '../../../models/Admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const adminCount = await Admin.countDocuments();
    const admins = await Admin.find({}, { password: 0 }); // Exclude password from response

    res.status(200).json({
      success: true,
      adminCount,
      admins,
      message: adminCount === 0 ? 'No admin users found' : `Found ${adminCount} admin user(s)`
    });

  } catch (error) {
    console.error('Error checking admins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check admin users',
      error: error.message
    });
  }
}
