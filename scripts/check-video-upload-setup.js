const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function checkDay1VideoUploadSetup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Cloudinary config
    console.log('📋 Cloudinary Configuration:');
    console.log(`  Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || '❌ MISSING'}`);
    console.log(`  API Key: ${process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ MISSING'}`);
    console.log(`  API Secret: ${process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ MISSING'}`);
    console.log('');

    // Check ProgramConfig structure
    const ProgramConfig = mongoose.model('ProgramConfig', new mongoose.Schema({}, { strict: false, collection: 'programconfigs' }));
    
    const config = await ProgramConfig.findOne({ 
      configType: 'global', 
      caregiverId: null 
    });

    if (!config) {
      console.log('⚠️  No global config found in database');
      console.log('This will be created automatically on first video upload\n');
    } else {
      console.log('✅ Global config found');
      console.log(`  Config ID: ${config._id}`);
      console.log('');
      
      // Check Day 1 structure
      console.log('📋 Day 1 Video Configuration:');
      if (config.day1 && config.day1.videos) {
        ['mild', 'moderate', 'severe'].forEach(level => {
          console.log(`\n  ${level.toUpperCase()} burden level:`);
          const videos = config.day1.videos[level];
          if (videos) {
            ['english', 'hindi', 'kannada'].forEach(lang => {
              const url = videos.videoUrl?.[lang];
              const title = videos.videoTitle?.[lang];
              console.log(`    ${lang}: ${url ? '✅ Video uploaded' : '❌ No video'}`);
              if (title) console.log(`      Title: ${title}`);
            });
          } else {
            console.log(`    ❌ No video configuration`);
          }
        });
      } else {
        console.log('  ❌ Day 1 videos structure not initialized');
      }
    }

    console.log('\n\n📝 Common Causes of 500 Error on Video Upload:');
    console.log('  1. Cloudinary credentials missing or incorrect');
    console.log('  2. File size exceeds 500MB limit');
    console.log('  3. Network timeout (large file + slow connection)');
    console.log('  4. Incorrect form data format (missing day/burdenLevel)');
    console.log('  5. Temporary directory permissions');
    console.log('');
    console.log('💡 Check the server console (npm run dev) for detailed error messages');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkDay1VideoUploadSetup();
