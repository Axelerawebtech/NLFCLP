// Fix Day 1 Video Display Issue
// This script checks and fixes the Day 1 mild burden level video configuration

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://axelerawebtech_db_user:M7EOU2FK8vqO7vs3@cluster0.e6faone.mongodb.net/cancercare?retryWrites=true&w=majority&appName=Cluster0';

async function fixDay1VideoDisplay() {
  let client;
  
  try {
    console.log('🔧 Fixing Day 1 Video Display Issue...');
    console.log('🔗 Connecting to MongoDB...');
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('cancercare');
    
    // 1. Check current Day 1 video configuration
    console.log('\n📋 Step 1: Checking current Day 1 video configuration...');
    const configCollection = db.collection('programconfigs');
    const config = await configCollection.findOne({ configType: 'global' });
    
    if (!config) {
      console.log('❌ No global config found!');
      return;
    }
    
    console.log('✅ Global config found');
    
    // Check Day 1 videos structure
    if (config.day1?.videos?.mild?.videoUrl?.english) {
      console.log('✅ Day 1 mild video URL already configured:');
      console.log(`   URL: ${config.day1.videos.mild.videoUrl.english.substring(0, 60)}...`);
      console.log(`   Title: ${config.day1.videos.mild.videoTitle?.english || 'No title'}`);
    } else {
      console.log('❌ Day 1 mild video URL not properly configured');
      
      // Check if there are any videos in contentManagement that need to be moved
      if (config.contentManagement) {
        console.log('🔍 Checking contentManagement for uploaded videos...');
        
        // Look for any video URLs that might be the Day 1 mild video
        const findVideos = (obj, path = '') => {
          const videos = [];
          if (typeof obj === 'object' && obj !== null) {
            for (const [key, value] of Object.entries(obj)) {
              if (key === 'videoUrl' && typeof value === 'string' && value.includes('cloudinary')) {
                videos.push({ path: path + key, url: value });
              } else if (typeof value === 'object') {
                videos.push(...findVideos(value, path + key + '.'));
              }
            }
          }
          return videos;
        };
        
        const foundVideos = findVideos(config.contentManagement);
        
        if (foundVideos.length > 0) {
          console.log(`🎬 Found ${foundVideos.length} video(s) in contentManagement:`);
          foundVideos.forEach((video, index) => {
            console.log(`   ${index + 1}. ${video.path}: ${video.url.substring(0, 60)}...`);
          });
          
          // Move the first video to Day 1 mild (assuming it's the uploaded video)
          if (foundVideos.length > 0) {
            const firstVideo = foundVideos[0];
            console.log(`\n🔧 Moving video to Day 1 mild burden level...`);
            
            await configCollection.updateOne(
              { configType: 'global' },
              {
                $set: {
                  'day1.videos.mild.videoUrl.english': firstVideo.url,
                  'day1.videos.mild.videoTitle.english': 'Day 1 Support Video for Mild Burden Level',
                  'day1.videos.mild.description.english': 'Personalized support content for caregivers experiencing mild burden levels.',
                  updatedAt: new Date()
                }
              }
            );
            
            console.log('✅ Video moved to Day 1 mild burden level');
            console.log(`   Video URL: ${firstVideo.url.substring(0, 60)}...`);
          }
        } else {
          console.log('❌ No videos found in contentManagement');
          console.log('📝 You need to upload a video for Day 1 mild burden level');
          
          // Set up placeholder structure anyway
          await configCollection.updateOne(
            { configType: 'global' },
            {
              $set: {
                'day1.videos.mild.videoUrl.english': 'https://res.cloudinary.com/dp2mpayng/video/upload/v1730127012/caregiver-program-videos/sample_mild_video.mp4',
                'day1.videos.mild.videoTitle.english': 'Day 1 Support Video for Mild Burden Level',
                'day1.videos.mild.description.english': 'Personalized support content for caregivers experiencing mild burden levels.',
                updatedAt: new Date()
              }
            }
          );
          
          console.log('⚠️  Added placeholder video URL - replace with your actual video URL');
        }
      } else {
        console.log('❌ No contentManagement section found');
        
        // Set up the structure with placeholder
        await configCollection.updateOne(
          { configType: 'global' },
          {
            $set: {
              'day1.videos.mild.videoUrl.english': 'https://res.cloudinary.com/dp2mpayng/video/upload/v1730127012/caregiver-program-videos/sample_mild_video.mp4',
              'day1.videos.mild.videoTitle.english': 'Day 1 Support Video for Mild Burden Level',
              'day1.videos.mild.description.english': 'Personalized support content for caregivers experiencing mild burden levels.',
              updatedAt: new Date()
            }
          }
        );
        
        console.log('⚠️  Added placeholder video URL - replace with your actual video URL');
      }
    }
    
    // 2. Check caregiver programs to see if any have Day 1 data
    console.log('\n📋 Step 2: Checking caregiver programs with Day 1 data...');
    const caregiverCollection = db.collection('caregiverprograms');
    const programs = await caregiverCollection.find({
      'dayModules.day': 1,
      burdenLevel: 'mild'
    }).toArray();
    
    console.log(`📊 Found ${programs.length} caregiver(s) with Day 1 mild burden level`);
    
    // Check their Day 1 module status
    for (const program of programs) {
      const day1Module = program.dayModules.find(m => m.day === 1);
      console.log(`\nCaregiver: ${program.caregiverId}`);
      console.log(`  Burden Level: ${program.burdenLevel}`);
      console.log(`  Burden Test Completed: ${day1Module?.burdenTestCompleted}`);
      console.log(`  Has Video URL: ${!!day1Module?.videoUrl}`);
      console.log(`  Video Completed: ${day1Module?.videoCompleted}`);
      
      // If burden test is completed but no video URL, update it
      if (day1Module?.burdenTestCompleted && !day1Module?.videoUrl) {
        console.log(`  🔧 Updating Day 1 module with video URL...`);
        
        const updatedConfig = await configCollection.findOne({ configType: 'global' });
        const videoUrl = updatedConfig?.day1?.videos?.mild?.videoUrl?.english;
        
        if (videoUrl) {
          await caregiverCollection.updateOne(
            { caregiverId: program.caregiverId, 'dayModules.day': 1 },
            {
              $set: {
                'dayModules.$.videoUrl': { english: videoUrl },
                'dayModules.$.videoTitle': { english: 'Day 1 Support Video for Mild Burden Level' },
                'dayModules.$.content': { english: 'Personalized support content for mild burden level' }
              }
            }
          );
          
          console.log(`  ✅ Video URL added to caregiver program`);
        } else {
          console.log(`  ❌ No video URL available in config`);
        }
      }
    }
    
    // 3. Verify the fix
    console.log('\n📋 Step 3: Verifying the fix...');
    const verifyConfig = await configCollection.findOne({ configType: 'global' });
    
    if (verifyConfig?.day1?.videos?.mild?.videoUrl?.english) {
      console.log('✅ Day 1 mild video URL is now configured');
      console.log(`   URL: ${verifyConfig.day1.videos.mild.videoUrl.english.substring(0, 60)}...`);
      console.log(`   Title: ${verifyConfig.day1.videos.mild.videoTitle?.english || 'No title'}`);
      
      // Test the API logic
      console.log('\n🧪 Testing API logic...');
      const testBurdenLevel = 'mild';
      const testLanguage = 'english';
      
      const videoConfig = verifyConfig.day1.videos[testBurdenLevel];
      const videoUrl = videoConfig.videoUrl?.[testLanguage] || videoConfig.videoUrl?.english || '';
      
      if (videoUrl) {
        console.log(`✅ API should now return video for ${testBurdenLevel} burden level`);
        console.log(`   Video URL: ${videoUrl.substring(0, 50)}...`);
      } else {
        console.log(`❌ No video URL found for ${testBurdenLevel} burden level`);
      }
    } else {
      console.log('❌ Day 1 mild video is still not configured');
    }
    
    console.log('\n🎉 Fix completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Make sure your Next.js server is running: npm run dev');
    console.log('2. Go to caregiver dashboard');
    console.log('3. Complete Day 1 Zarit burden assessment');
    console.log('4. The video should now appear after assessment completion');
    
  } catch (error) {
    console.error('❌ Error fixing Day 1 video display:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the fix
fixDay1VideoDisplay();