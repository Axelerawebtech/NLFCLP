require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkVideosInDatabase() {
  console.log('🔍 Checking videos in database...');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected');

    // Use dynamic import to handle ES6 modules
    const ProgramConfigSchema = new mongoose.Schema({}, { strict: false });
    const ProgramConfig = mongoose.models.ProgramConfig || mongoose.model('ProgramConfig', ProgramConfigSchema);
    
    const config = await ProgramConfig.findOne({ configType: 'global' });
    
    if (!config) {
      console.log('❌ No global ProgramConfig found');
      return;
    }

    console.log('\n📊 Database structure analysis:');
    
    // Check Day 1 videos
    console.log('\n🎬 Day 1 Videos:');
    if (config.day1?.videos) {
      const day1Videos = config.day1.videos;
      
      ['mild', 'moderate', 'severe'].forEach(level => {
        console.log(`\n  ${level.toUpperCase()} Burden Level:`);
        if (day1Videos[level]) {
          const levelData = day1Videos[level];
          
          ['english', 'kannada', 'hindi'].forEach(lang => {
            const videoUrl = levelData.videoUrl?.[lang];
            const videoTitle = levelData.videoTitle?.[lang];
            
            console.log(`    ${lang}: ${videoUrl ? '✅ VIDEO FOUND' : '❌ NO VIDEO'}`);
            if (videoUrl) {
              console.log(`      URL: ${videoUrl.substring(0, 80)}...`);
              console.log(`      Title: ${videoTitle || 'No title'}`);
            }
          });
        } else {
          console.log(`    ❌ No data for ${level} level`);
        }
      });
    } else {
      console.log('❌ No day1.videos found');
    }

    // Check Day 0 videos
    console.log('\n🎬 Day 0 Videos:');
    if (config.day0IntroVideo) {
      const day0Video = config.day0IntroVideo;
      
      ['english', 'kannada', 'hindi'].forEach(lang => {
        const videoUrl = day0Video.videoUrl?.[lang];
        const title = day0Video.title?.[lang];
        
        console.log(`  ${lang}: ${videoUrl ? '✅ VIDEO FOUND' : '❌ NO VIDEO'}`);
        if (videoUrl) {
          console.log(`    URL: ${videoUrl.substring(0, 80)}...`);
          console.log(`    Title: ${title || 'No title'}`);
        }
      });
    } else {
      console.log('❌ No day0IntroVideo found');
    }

    console.log('\n🎯 Summary for Admin Interface:');
    console.log('- Day 1 Severe English:', config.day1?.videos?.severe?.videoUrl?.english ? '✅ Should show Replace/Delete' : '❌ Should show Upload');
    console.log('- Day 1 Moderate English:', config.day1?.videos?.moderate?.videoUrl?.english ? '✅ Should show Replace/Delete' : '❌ Should show Upload');
    console.log('- Day 1 Mild English:', config.day1?.videos?.mild?.videoUrl?.english ? '✅ Should show Replace/Delete' : '❌ Should show Upload');

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database disconnected');
  }
}

checkVideosInDatabase();