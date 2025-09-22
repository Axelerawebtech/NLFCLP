require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const Admin = mongoose.models.Admin || mongoose.model('Admin', new mongoose.Schema({}, { strict: false }));
    const admin = await Admin.findOne({ username: 'admin' }).lean();
    if (!admin) {
      console.log('Admin not found');
      return;
    }
    console.log('Stored password hash:', admin.password);
    const match = await bcrypt.compare('admin123', admin.password);
    console.log('Does admin123 match stored hash?', match);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
