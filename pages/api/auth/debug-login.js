import dbConnect from '../../../lib/mongodb';
import Admin from '../../../models/Admin';
import { comparePassword } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();
    console.log('Database connected for debug login');

    const { username, password } = req.body;
    console.log('Debug: Login attempt for username:', username);

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required',
        debug: 'Missing credentials'
      });
    }

    // Check total admin count
    const totalAdmins = await Admin.countDocuments();
    console.log('Debug: Total admin users in database:', totalAdmins);

    // Find admin by username with detailed logging
    console.log('Debug: Searching for admin with username:', username);
    const admin = await Admin.findOne({ username });

    if (!admin) {
      console.log('Debug: No admin found with username:', username);

      // List all admins for debugging
      const allAdmins = await Admin.find({}, { username: 1, email: 1, adminId: 1 });
      console.log('Debug: All admins in database:', allAdmins);

      return res.status(401).json({
        message: 'Invalid credentials',
        debug: {
          message: 'User not found',
          totalAdmins,
          searchedUsername: username,
          existingUsernames: allAdmins.map(a => a.username)
        }
      });
    }

    console.log('Debug: Admin found:', {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      adminId: admin.adminId
    });

    // Check password with detailed logging
    console.log('Debug: Comparing passwords...');
    const isPasswordValid = await comparePassword(password, admin.password);
    console.log('Debug: Password comparison result:', isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials',
        debug: {
          message: 'Password mismatch',
          userFound: true,
          passwordProvided: !!password
        }
      });
    }

    console.log('Debug: Login successful for user:', admin.username);

    res.status(200).json({
      success: true,
      message: 'Debug login successful',
      debug: {
        userFound: true,
        passwordValid: true,
        adminId: admin.adminId,
        username: admin.username
      }
    });

  } catch (error) {
    console.error('Debug login error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug login failed',
      error: error.message,
      debug: {
        errorType: error.constructor.name,
        errorMessage: error.message
      }
    });
  }
}
