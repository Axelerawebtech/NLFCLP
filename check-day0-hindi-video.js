const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function checkDay0HindiVideo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const ProgramConfig = mongoose.model('ProgramConfig', new mongoose.Schema({}, { strict: false }));

    const config = await ProgramConfig.findOne({ 
      configType: 'global', 
      caregiverId: null 
    });

    if (!config) {
      console.log('❌ No global ProgramConfig found');
      return;
    }

    console.log('📊 Day 0 IntroVideo structure:');
    console.log(JSON.stringify(config.day0IntroVideo, null, 2));

    console.log('\n🔍 Video URLs:');
    if (config.day0IntroVideo?.videoUrl) {
      console.log('English:', config.day0IntroVideo.videoUrl.english || 'NOT SET');
      console.log('Kannada:', config.day0IntroVideo.videoUrl.kannada || 'NOT SET');
      console.log('Hindi:', config.day0IntroVideo.videoUrl.hindi || 'NOT SET');
    } else {
      console.log('❌ No videoUrl object found');
    }

    console.log('\n📝 All keys in videoUrl:', Object.keys(config.day0IntroVideo?.videoUrl || {}));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkDay0HindiVideo();
