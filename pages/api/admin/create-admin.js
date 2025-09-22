import dbConnect from '../../../lib/mongodb';
import Admin from '../../../models/Admin';
import { hashPassword, generateUniqueId } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    console.log('Database connected for admin creation');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists'
      });
    }

    // Create admin user
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
    console.log('Admin user created successfully');

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      adminId: adminUser.adminId,
      username: adminUser.username,
      note: 'Default password is admin123 - please change it after first login'
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message
    });
  }
}
