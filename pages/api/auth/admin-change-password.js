import dbConnect from '../../../lib/mongodb';
import Admin from '../../../models/Admin';
import { comparePassword, hashPassword } from '../../../lib/auth';

const MIN_LENGTH = 8;
const LETTER_REGEX = /[A-Za-z]/;
const NUMBER_REGEX = /[0-9]/;
const SYMBOL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

const validateNewPassword = (password = '') => {
  if (typeof password !== 'string' || password.length < MIN_LENGTH) {
    return `Password must be at least ${MIN_LENGTH} characters long.`;
  }
  if (!LETTER_REGEX.test(password)) {
    return 'Password must include at least one letter (A-Z or a-z).';
  }
  if (!NUMBER_REGEX.test(password)) {
    return 'Password must include at least one number (0-9).';
  }
  if (!SYMBOL_REGEX.test(password)) {
    return 'Password must include at least one symbol (e.g. ! @ # $ %).';
  }
  return '';
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` });
  }

  try {
    await dbConnect();

    const { username, currentPassword, newPassword } = req.body || {};

    if (!username || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Username, current password, and new password are required.'
      });
    }

    const policyError = validateNewPassword(newPassword);
    if (policyError) {
      return res.status(400).json({ success: false, message: policyError });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isCurrentValid = await comparePassword(currentPassword, admin.password);
    if (!isCurrentValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isSamePassword = await comparePassword(newPassword, admin.password);
    if (isSamePassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from the current password.' });
    }

    const hashedPassword = await hashPassword(newPassword);
    admin.password = hashedPassword;
    admin.passwordUpdatedAt = new Date();
    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully. Sign in with your new password.'
    });
  } catch (error) {
    console.error('[admin-change-password] ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to update password. Please try again later.'
    });
  }
}
