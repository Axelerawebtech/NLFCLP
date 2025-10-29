// Simple test to check MongoDB connection and Day 1 video config
require('dotenv').config();

async function test() {
  try {
    // Check environment
    console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    // Try connection
    const mongoose = require('mongoose');
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/caregiver-support';
    
    console.log('Connecting to:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    
    // Simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Disconnected');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();