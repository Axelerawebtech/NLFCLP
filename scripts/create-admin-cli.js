require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin').default || mongoose.model('Admin');

async function main() {
  const argv = require('yargs').argv;
  const username = argv.username || argv.u || 'admin';
  const password = argv.password || argv.p || 'admin123';
  const email = argv.email || argv.e || 'admin@cancercare.com';

  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log('Admin already exists with username:', username);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 12);
  const admin = new Admin({ username, password: hashed, name: 'System Administrator', email });
  await admin.save();
  console.log('Created admin', username);
  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
