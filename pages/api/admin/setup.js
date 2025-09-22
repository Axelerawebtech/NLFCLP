import dbConnect from '../../../lib/mongodb';
import Admin from '../../../models/Admin';
import { hashPassword, generateUniqueId } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Check if any admin users exist
    const adminCount = await Admin.countDocuments();

    if (adminCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists. Use the login endpoint instead.'
      });
    }

    // Create the initial admin user
    const hashedPassword = await hashPassword('admin123');
    const adminId = generateUniqueId('ADM');

    const adminUser = new Admin({
      adminId,
      username: 'admin',
      email: 'admin@cancercare.com',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();

    res.status(201).json({
      success: true,
      message: 'Initial admin user created successfully!',
      credentials: {
        username: 'admin',
        password: 'admin123'
      },
      adminId: adminUser.adminId,
      note: 'Please change the default password after first login'
    });

  } catch (error) {
    console.error('Error in setup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup admin user',
      error: error.message
    });
  }
}
