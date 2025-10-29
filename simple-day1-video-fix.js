// Simple Day 1 video fix using mongoose directly
console.log('🔧 Starting Day 1 Video Fix...');

const mongoose = require('mongoose');

// Use the connection string directly
const MONGODB_URI = 'mongodb+srv://axelerawebtech_db_user:M7EOU2FK8vqO7vs3@cluster0.e6faone.mongodb.net/cancercare?retryWrites=true&w=majority&appName=Cluster0';

async function fixDay1Video() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully');

    // Define the schema
    const programConfigSchema = new mongoose.Schema({}, { strict: false });
    const ProgramConfig = mongoose.model('ProgramConfig', programConfigSchema, 'programconfigs');

    // Your video URL - replace with actual URL if different
    const videoUrl = 'https://res.cloudinary.com/dp2mpayng/video/upload/v1730127012/caregiver-program-videos/mild_burden_video.mp4';
    
    console.log('📹 Setting video URL:', videoUrl);

    // Update or create the global config
    const result = await ProgramConfig.updateOne(
      { configType: 'global' },
      {
        $set: {
          'day1.videos.mild.videoUrl.english': videoUrl,
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

    console.log('✅ Update completed!');
    console.log('Modified documents:', result.modifiedCount);
    console.log('Upserted documents:', result.upsertedCount);

    // Verify the update
    const config = await ProgramConfig.findOne({ configType: 'global' });
    if (config?.day1?.videos?.mild?.videoUrl?.english) {
      console.log('✅ Verification successful!');
      console.log('Mild video URL:', config.day1.videos.mild.videoUrl.english);
    } else {
      console.log('❌ Verification failed - video URL not found');
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');

    console.log('\n🎉 Day 1 video fix completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your server: npm run dev');
    console.log('2. Go to caregiver dashboard');
    console.log('3. Complete Day 1 Zarit burden assessment');
    console.log('4. Choose answers that result in "mild" burden level');
    console.log('5. Video should appear after assessment completion');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.name === 'MongoNetworkError') {
      console.log('💡 Check your internet connection and MongoDB credentials');
    }
  }
}

fixDay1Video();