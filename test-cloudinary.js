// Test Cloudinary Configuration
const cloudinary = require('cloudinary');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('🔧 Cloudinary Configuration:');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set (hidden)' : 'Missing');

// Test connection by fetching account usage
async function testCloudinary() {
  try {
    console.log('\n🔗 Testing Cloudinary connection...');
    
    // Try to get API ping (simplest test)
    const result = await cloudinary.v2.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('Response:', result);
    
  } catch (error) {
    console.error('❌ Cloudinary connection failed:');
    console.error('Error:', error.message);
    console.error('Error details:', error);
    
    if (error.message.includes('disabled')) {
      console.log('\n⚠️ Your Cloudinary account appears to be disabled.');
      console.log('Please check:');
      console.log('1. Login to https://console.cloudinary.com/');
      console.log('2. Verify your account is active');
      console.log('3. Check if billing/payment is required');
      console.log('4. Verify the credentials are correct');
    }
  }
}

testCloudinary();
