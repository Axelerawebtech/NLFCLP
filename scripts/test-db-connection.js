require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function testConnection() {
  console.log('Testing MongoDB connection...');
  console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');

  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    return;
  }

  try {
    console.log('Attempting to connect...');

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ MongoDB connection successful!');

    // Test basic operations
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections in database`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);

    if (error.message.includes('IP')) {
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Go to your MongoDB Atlas dashboard');
      console.log('2. Navigate to Network Access');
      console.log('3. Add your current IP address to the whitelist');
      console.log('4. Or add 0.0.0.0/0 to allow access from anywhere (for development only)');
    }
  }
}

testConnection();
