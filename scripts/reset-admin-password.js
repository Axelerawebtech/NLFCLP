require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin').default || mongoose.model('Admin');

async function main() {
  const argv = require('yargs').argv;
  const username = argv.username || argv.u || 'admin';
  const newPassword = argv.password || argv.p;

  if (!newPassword) {
    console.error('Provide --password (or -p) to set a new password');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const admin = await Admin.findOne({ username });
  if (!admin) {
    console.error('Admin not found:', username);
    process.exit(1);
  }

  admin.password = await bcrypt.hash(newPassword, 12);
  await admin.save();
  console.log('Password updated for', username);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
