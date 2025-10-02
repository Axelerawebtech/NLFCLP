import dbConnect from '../../../lib/mongodb';
import Admin from '../../../models/Admin';
import { comparePassword, generateToken } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Try to connect to database
    await dbConnect();

    if (process.env.NODE_ENV !== 'production') {
      console.log('[debug] admin-login request body:', req.body);
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (process.env.NODE_ENV !== 'production') {
      console.log('[debug] admin found:', !!admin);
      if (admin) console.log('[debug] admin record (partial):', { username: admin.username, email: admin.email, passwordHashPresent: !!admin.password });
    }
    if (!admin) {
      if (process.env.NODE_ENV !== 'production') {
        const mongoose = require('mongoose');
        let adminCount = null;
        try {
          adminCount = await Admin.countDocuments();
        } catch (e) {
          adminCount = `count error: ${e.message}`;
        }
        let dbName = null;
        try {
          dbName = mongoose.connection && mongoose.connection.db && mongoose.connection.db.databaseName;
        } catch (e) {
          dbName = `db error: ${e.message}`;
        }
        const debug = { foundAdmin: false, mongooseReadyState: mongoose.connection.readyState, adminCount, dbName };
        return res.status(401).json(Object.assign({ message: 'Invalid credentials' }, debug));
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await comparePassword(password, admin.password);
    if (process.env.NODE_ENV !== 'production') {
      console.log('[debug] password valid:', isPasswordValid);
    }
    if (!isPasswordValid) {
      const debug = process.env.NODE_ENV !== 'production' ? { foundAdmin: true, passwordValid: false } : undefined;
      return res.status(401).json(Object.assign({ message: 'Invalid credentials' }, debug));
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken({
      id: admin._id,
      adminId: admin.adminId,
      username: admin.username,
      role: 'admin'
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        adminId: admin.adminId,
        username: admin.username,
        name: admin.name,
        email: admin.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    // Handle specific database connection errors
    if (error.message.includes('Database connection failed')) {
      return res.status(503).json({
        message: 'Database connection failed. Please check your MongoDB Atlas configuration.',
        error: 'Service temporarily unavailable'
      });
    }

    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}
