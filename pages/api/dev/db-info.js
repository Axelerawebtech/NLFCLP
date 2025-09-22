import dbConnect from '../../../lib/mongodb';
import Admin from '../../../models/Admin';

export default async function handler(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not allowed in production' });
  }

  try {
    await dbConnect();
    const mongoose = require('mongoose');
    const adminCount = await Admin.countDocuments();
    const dbName = mongoose.connection && mongoose.connection.db && mongoose.connection.db.databaseName;
    res.status(200).json({ ok: true, dbName, adminCount });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
