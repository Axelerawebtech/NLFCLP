// fix-day1-video-manual.js
// Run this script to fix the Day 1 video issue

require('dotenv').config();
const { MongoClient } = require('mongodb');

async function fixDay1Video() {
  try {
    console.log('🔧 Fixing Day 1 Video Issue...');
    console.log('Connecting to MongoDB...');
    
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      return;
    }
    
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('cancercare');
    const collection = db.collection('programconfigs');
    
    // REPLACE THIS WITH YOUR ACTUAL CLOUDINARY VIDEO URL
    // Example: https://res.cloudinary.com/your-cloud/video/upload/v1234567890/video.mp4
    const yourVideoUrl = 'https://res.cloudinary.com/dp2mpayng/video/upload/v1730127012/caregiver-program-videos/mild_burden_video.mp4';
    
    if (yourVideoUrl === 'PASTE_YOUR_CLOUDINARY_VIDEO_URL_HERE') {
      console.log('⚠️ Using example video URL. Replace with your actual Cloudinary video URL if different');
      // Don't exit, continue with example URL
    }
    
    console.log('📹 Setting video URL:', yourVideoUrl);
    
    // Update the global config with the Day 1 mild video
    const result = await collection.updateOne(
      { configType: 'global' },
      {
        $set: {
          'day1.videos.mild.videoUrl.english': yourVideoUrl,
          'day1.videos.mild.videoTitle.english': 'Day 1 Support Video for Mild Burden',
          'day1.videos.mild.description.english': 'Personalized support content for caregivers experiencing mild burden levels.',
          'day1.videos.moderate.videoUrl.english': '',
          'day1.videos.moderate.videoTitle.english': 'Day 1 Support Video for Moderate Burden',
          'day1.videos.moderate.description.english': 'Personalized support content for caregivers experiencing moderate burden levels.',
          'day1.videos.severe.videoUrl.english': '',
          'day1.videos.severe.videoTitle.english': 'Day 1 Support Video for Severe Burden',
          'day1.videos.severe.description.english': 'Personalized support content for caregivers experiencing severe burden levels.',
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log('✅ Day 1 video configuration updated!');
    console.log('Modified documents:', result.modifiedCount);
    console.log('Upserted:', result.upsertedCount);
    
    // Verify the update
    const config = await collection.findOne({ configType: 'global' });
    if (config?.day1?.videos?.mild?.videoUrl?.english) {
      console.log('✅ Verification: Video URL is now set in database');
      console.log('URL:', config.day1.videos.mild.videoUrl.english);
    } else {
      console.log('❌ Verification failed: Video URL not found');
    }
    
    await client.close();
    console.log('🔌 Database connection closed');
    
    console.log('\n🧪 Next Steps:');
    console.log('1. Start your server: npm run dev');
    console.log('2. Complete Day 1 Zarit assessment with mild burden result');
    console.log('3. Video should appear after assessment completion');
    console.log('\n🔍 Test the API:');
    console.log('curl http://localhost:3000/api/caregiver/get-video-content?day=1&language=english&burdenLevel=mild');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixDay1Video();