const { MongoClient } = require('mongodb');

// Debugging script to check why mild burden video doesn't appear
async function debugMildVideo() {
  console.log('🔍 Debugging Mild Burden Video Issue...');

  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb+srv://axelerawebtech:6EYIFXZgvCwPaVHV@cluster0.eap1i.mongodb.net/cancer-care?retryWrites=true&w=majority');
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    
    // 1. Check ProgramConfig for Day 1 mild video
    console.log('\n📋 Step 1: Checking ProgramConfig for Day 1 mild video...');
    const config = await db.collection('programconfigs').findOne({ configType: 'global' });
    
    if (config?.day1?.videos?.mild) {
      console.log('✅ Day 1 mild video config found:');
      console.log('   videoTitle:', config.day1.videos.mild.videoTitle);
      console.log('   videoUrl:', config.day1.videos.mild.videoUrl);
      console.log('   description:', config.day1.videos.mild.description);
    } else {
      console.log('❌ Day 1 mild video config NOT found');
      console.log('   Available day1 videos:', Object.keys(config?.day1?.videos || {}));
    }
    
    // 2. Check caregiver program data
    console.log('\n📋 Step 2: Checking caregiver program data...');
    const programs = await db.collection('caregiverprograms').find({
      burdenLevel: 'mild'
    }).toArray();
    
    console.log(`Found ${programs.length} caregiver(s) with mild burden level`);
    
    programs.forEach((program, idx) => {
      console.log(`\nCaregiver ${idx + 1}: ${program.caregiverId}`);
      console.log('  Program burden level:', program.burdenLevel);
      console.log('  Burden test completed at:', program.burdenTestCompletedAt);
      
      const day1Module = program.dayModules?.find(m => m.day === 1);
      if (day1Module) {
        console.log('  Day 1 Module:');
        console.log('    burdenTestCompleted:', day1Module.burdenTestCompleted);
        console.log('    burdenLevel:', day1Module.burdenLevel);
        console.log('    burdenScore:', day1Module.burdenScore);
        console.log('    videoTitle:', day1Module.videoTitle);
        console.log('    videoUrl:', day1Module.videoUrl);
        console.log('    videoCompleted:', day1Module.videoCompleted);
        console.log('    progressPercentage:', day1Module.progressPercentage);
      } else {
        console.log('  Day 1 Module: NOT FOUND');
      }
    });
    
    // 3. Test the API logic
    console.log('\n📋 Step 3: Testing video retrieval logic...');
    
    if (config?.day1?.videos?.mild) {
      const mildVideo = config.day1.videos.mild;
      const hasVideoUrl = !!(mildVideo.videoUrl?.english || mildVideo.videoUrl?.kannada || mildVideo.videoUrl?.hindi);
      console.log('✅ Video URL check passed:', hasVideoUrl);
      
      if (hasVideoUrl) {
        console.log('   Available video URLs:');
        if (mildVideo.videoUrl.english) console.log('     English:', mildVideo.videoUrl.english.substring(0, 50) + '...');
        if (mildVideo.videoUrl.kannada) console.log('     Kannada:', mildVideo.videoUrl.kannada.substring(0, 50) + '...');
        if (mildVideo.videoUrl.hindi) console.log('     Hindi:', mildVideo.videoUrl.hindi.substring(0, 50) + '...');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Load environment variables
if (require('fs').existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

debugMildVideo();