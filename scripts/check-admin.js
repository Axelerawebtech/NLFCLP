require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

(async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const Admin = mongoose.models.Admin || mongoose.model('Admin', new mongoose.Schema({}, { strict: false }));
    const admin = await Admin.findOne({ username: 'admin' }).lean();

    if (!admin) {
      console.log('No admin found with username "admin".');
    } else {
      console.log('Admin document found:');
      console.log(JSON.stringify(admin, null, 2));
    }
  } catch (err) {
    console.error('Error querying admin:', err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
