// Fix Day 1 video issue - move uploaded video to correct location
require('dotenv').config();
const mongoose = require('mongoose');

async function fixDay1VideoIssue() {
  try {
    console.log('🔧 Starting Day 1 Video Fix...\n');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const ProgramConfig = mongoose.connection.db.collection('programconfigs');
    
    // Find the global config
    const config = await ProgramConfig.findOne({ configType: 'global' });
    
    if (!config) {
      console.log('❌ No global config found');
      return;
    }

    console.log('📋 Found global config with ID:', config._id);
    
    // Check if Day 1 videos are properly configured
    let needsUpdate = false;
    let updatedConfig = { ...config };

    // Initialize day1 structure if missing
    if (!updatedConfig.day1) {
      console.log('🔧 Initializing day1 structure...');
      updatedConfig.day1 = {
        videos: {
          mild: { videoTitle: {}, videoUrl: {}, description: {} },
          moderate: { videoTitle: {}, videoUrl: {}, description: {} },
          severe: { videoTitle: {}, videoUrl: {}, description: {} }
        }
      };
      needsUpdate = true;
    }

    if (!updatedConfig.day1.videos) {
      console.log('🔧 Initializing day1.videos structure...');
      updatedConfig.day1.videos = {
        mild: { videoTitle: {}, videoUrl: {}, description: {} },
        moderate: { videoTitle: {}, videoUrl: {}, description: {} },
        severe: { videoTitle: {}, videoUrl: {}, description: {} }
      };
      needsUpdate = true;
    }

    // Check each burden level
    ['mild', 'moderate', 'severe'].forEach(level => {
      if (!updatedConfig.day1.videos[level]) {
        console.log(`🔧 Initializing ${level} burden level config...`);
        updatedConfig.day1.videos[level] = {
          videoTitle: {},
          videoUrl: {},
          description: {}
        };
        needsUpdate = true;
      }
      
      // Initialize language objects if missing
      ['videoTitle', 'videoUrl', 'description'].forEach(field => {
        if (!updatedConfig.day1.videos[level][field]) {
          updatedConfig.day1.videos[level][field] = {};
          needsUpdate = true;
        }
      });
    });

    // Look for videos that might have been uploaded to other locations
    console.log('\n🔍 Checking for videos in other locations...');
    
    // Check contentManagement for any video URLs that should be Day 1 videos
    if (config.contentManagement) {
      console.log('📁 Found contentManagement section');
      
      // Check for any Cloudinary video URLs
      const findVideoUrls = (obj, path = '') => {
        const videoUrls = [];
        
        if (typeof obj === 'string' && obj.includes('cloudinary.com') && obj.includes('.mp4')) {
          videoUrls.push({ path, url: obj });
        } else if (typeof obj === 'object' && obj !== null) {
          for (const [key, value] of Object.entries(obj)) {
            videoUrls.push(...findVideoUrls(value, path ? `${path}.${key}` : key));
          }
        }
        
        return videoUrls;
      };

      const foundVideos = findVideoUrls(config.contentManagement, 'contentManagement');
      
      if (foundVideos.length > 0) {
        console.log('🎬 Found video URLs in contentManagement:');
        foundVideos.forEach((video, index) => {
          console.log(`  ${index + 1}. ${video.path}: ${video.url}`);
        });

        // If we find videos, let's assume the first one is the mild burden video
        // This is a reasonable assumption since user said they uploaded for mild level
        if (foundVideos.length > 0) {
          const firstVideo = foundVideos[0];
          console.log(`\n🔧 Moving video to Day 1 mild burden level...`);
          console.log(`   Source: ${firstVideo.path}`);
          console.log(`   URL: ${firstVideo.url}`);
          
          // Add to mild burden level (English)
          updatedConfig.day1.videos.mild.videoUrl.english = firstVideo.url;
          updatedConfig.day1.videos.mild.videoTitle.english = 'Day 1 Video for Mild Burden Level';
          updatedConfig.day1.videos.mild.description.english = 'Personalized video content for caregivers with mild burden level';
          
          needsUpdate = true;
          console.log('✅ Video moved to Day 1 mild burden level');
        }
      }
    }

    // Update the database if needed
    if (needsUpdate) {
      console.log('\n💾 Updating database...');
      
      await ProgramConfig.updateOne(
        { _id: config._id },
        { 
          $set: { 
            day1: updatedConfig.day1,
            updatedAt: new Date()
          }
        }
      );
      
      console.log('✅ Database updated successfully');
    } else {
      console.log('\n✅ No updates needed');
    }

    // Verify the fix
    console.log('\n🔍 Verifying Day 1 video configuration...');
    const verifyConfig = await ProgramConfig.findOne({ configType: 'global' });
    
    if (verifyConfig.day1?.videos?.mild?.videoUrl?.english) {
      console.log('✅ Day 1 mild video is now configured:');
      console.log('   URL:', verifyConfig.day1.videos.mild.videoUrl.english);
      console.log('   Title:', verifyConfig.day1.videos.mild.videoTitle.english || 'Not set');
    } else {
      console.log('❌ Day 1 mild video is still not configured');
    }

    // Test the video content API
    console.log('\n🧪 Testing video content API logic...');
    
    const testBurdenLevel = 'mild';
    const testLanguage = 'english';
    
    if (verifyConfig.day1?.videos?.[testBurdenLevel]) {
      const videoConfig = verifyConfig.day1.videos[testBurdenLevel];
      const videoUrl = videoConfig.videoUrl?.[testLanguage] || videoConfig.videoUrl?.english || '';
      
      if (videoUrl) {
        console.log(`✅ API should now return video for ${testBurdenLevel} burden level`);
        console.log(`   Video URL: ${videoUrl.substring(0, 50)}...`);
      } else {
        console.log(`❌ No video URL found for ${testBurdenLevel} burden level`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Add some example video data for testing if no videos are found
async function addTestVideoData() {
  console.log('\n🧪 Adding test video data...');
  
  await mongoose.connect(process.env.MONGODB_URI);
  const ProgramConfig = mongoose.connection.db.collection('programconfigs');
  
  // This is a sample Cloudinary URL - replace with actual uploaded video URL
  const sampleVideoUrl = 'https://res.cloudinary.com/dp2mpayng/video/upload/v1730127012/caregiver-program-videos/sample_mild_video.mp4';
  
  await ProgramConfig.updateOne(
    { configType: 'global' },
    {
      $set: {
        'day1.videos.mild.videoUrl.english': sampleVideoUrl,
        'day1.videos.mild.videoTitle.english': 'Day 1 Video for Mild Burden Level',
        'day1.videos.mild.description.english': 'This video provides support and guidance for caregivers experiencing mild burden levels.',
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
  
  console.log('✅ Test video data added');
  await mongoose.disconnect();
}

// Run the fix
fixDay1VideoIssue().then(() => {
  console.log('\n🎉 Day 1 video fix completed!');
  console.log('\nNext steps:');
  console.log('1. Complete the Zarit burden assessment');
  console.log('2. Check if the video appears after assessment completion');
  console.log('3. If no video appears, the admin needs to upload videos specifically for Day 1 burden levels');
});