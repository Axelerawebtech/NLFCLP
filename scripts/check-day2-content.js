// Script to check if Day 2-7 content exists in database
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const ProgramConfigSchema = new mongoose.Schema({}, { strict: false });

async function checkDayContent() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const ProgramConfig = mongoose.models.ProgramConfig || mongoose.model('ProgramConfig', ProgramConfigSchema);
    
    const config = await ProgramConfig.findOne({ configType: 'global' });
    
    if (!config) {
      console.log('❌ No global config found!');
      return;
    }

    console.log('📊 Content Configuration Status:\n');

    // Check Day 0
    console.log('Day 0 (Intro Video):');
    console.log('  Has config:', !!config.day0IntroVideo);
    console.log('  English URL:', config.day0IntroVideo?.videoUrl?.english ? '✅ Set' : '❌ Missing');
    console.log('');

    // Check Day 1
    console.log('Day 1 (Burden Videos):');
    console.log('  Has config:', !!config.day1?.videos);
    if (config.day1?.videos) {
      console.log('  Mild:', config.day1.videos.mild?.videoUrl?.english ? '✅ Set' : '❌ Missing');
      console.log('  Moderate:', config.day1.videos.moderate?.videoUrl?.english ? '✅ Set' : '❌ Missing');
      console.log('  Severe:', config.day1.videos.severe?.videoUrl?.english ? '✅ Set' : '❌ Missing');
    }
    console.log('');

    // Check Days 2-7
    console.log('Days 2-7 (Dynamic Content):');
    console.log('  Has contentRules:', !!config.contentRules);
    
    if (config.contentRules) {
      const burdenLevels = ['mild', 'moderate', 'severe'];
      
      for (const level of burdenLevels) {
        console.log(`\n  ${level.toUpperCase()}:`);
        const levelConfig = config.contentRules[level];
        
        if (!levelConfig || !levelConfig.days) {
          console.log('    ❌ No days configuration');
          continue;
        }

        // Check if it's a Map
        if (levelConfig.days instanceof Map) {
          console.log(`    Days configured: ${levelConfig.days.size}`);
          for (let day = 2; day <= 7; day++) {
            const dayContent = levelConfig.days.get(day.toString());
            if (dayContent) {
              console.log(`    Day ${day}: ✅ ${dayContent.videoTitle?.english || 'No title'}`);
              console.log(`      Video URL: ${dayContent.videoUrl?.english ? '✅' : '❌'}`);
            } else {
              console.log(`    Day ${day}: ❌ Not configured`);
            }
          }
        } else {
          console.log('    Days is not a Map, checking object keys...');
          const dayKeys = Object.keys(levelConfig.days || {});
          console.log(`    Day keys found: ${dayKeys.join(', ') || 'none'}`);
        }
      }
    }

    console.log('\n\n📋 Summary:');
    console.log('To add Day 2-7 content, you need to:');
    console.log('1. Go to Admin Dashboard → Program Configuration');
    console.log('2. Configure videos for Days 2-7 for each burden level (mild, moderate, severe)');
    console.log('3. Each day needs: video title, video URL, and description in all languages');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkDayContent();
