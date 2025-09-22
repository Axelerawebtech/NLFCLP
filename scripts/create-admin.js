require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Admin schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected successfully!');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const adminUser = new Admin({
      username: 'admin',
      password: hashedPassword,
      name: 'System Administrator',
      email: 'admin@cancercare.com'
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('⚠️  Please change the default password after first login');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
