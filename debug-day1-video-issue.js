// Debug script to check Day 1 video issue
// Run with: node debug-day1-video-issue.js

const mongoose = require('mongoose');
require('dotenv').config();

async function debugDay1Video() {
  try {
    console.log('🔍 Starting Day 1 Video Debug...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Check ProgramConfig for Day 1 videos
    console.log('📋 Checking ProgramConfig...');
    const ProgramConfig = mongoose.connection.db.collection('programconfigs');
    const config = await ProgramConfig.findOne({ configType: 'global' });
    
    if (!config) {
      console.log('❌ No global program config found');
      return;
    }

    console.log('Global config found with ID:', config._id);
    
    if (config.day1?.videos) {
      console.log('\n🎬 Day 1 Video Configuration:');
      ['mild', 'moderate', 'severe'].forEach(level => {
        const video = config.day1.videos[level];
        if (video) {
          console.log(`\n${level.toUpperCase()} Burden Level:`);
          console.log('  Video Title:', JSON.stringify(video.videoTitle, null, 2));
          console.log('  Video URL:', JSON.stringify(video.videoUrl, null, 2));
          console.log('  Description:', JSON.stringify(video.description, null, 2));
          
          // Check if URLs are actually populated
          const hasUrl = video.videoUrl && (video.videoUrl.english || video.videoUrl.kannada || video.videoUrl.hindi);
          console.log('  Has Video URL:', hasUrl ? '✅' : '❌');
        } else {
          console.log(`\n${level.toUpperCase()} Burden Level: ❌ Not configured`);
        }
      });
    } else {
      console.log('❌ No Day 1 videos configuration found');
    }

    // 2. Check actual caregiver programs
    console.log('\n\n👥 Checking Caregiver Programs...');
    const CaregiverProgram = mongoose.connection.db.collection('caregiverprograms');
    const programs = await CaregiverProgram.find({}).toArray();
    
    console.log(`Found ${programs.length} caregiver programs\n`);
    
    programs.forEach((program, index) => {
      console.log(`Program ${index + 1}:`);
      console.log('  Caregiver ID:', program.caregiverId);
      console.log('  Burden Level:', program.burdenLevel || 'Not set');
      console.log('  Burden Test Score:', program.burdenTestScore || 'Not set');
      console.log('  Burden Test Completed At:', program.burdenTestCompletedAt || 'Not completed');
      
      // Check Day 1 module
      const day1Module = program.dayModules?.find(m => m.day === 1);
      if (day1Module) {
        console.log('  Day 1 Module:');
        console.log('    Burden Test Completed:', day1Module.burdenTestCompleted || false);
        console.log('    Burden Level:', day1Module.burdenLevel || 'Not set');
        console.log('    Burden Score:', day1Module.burdenScore || 'Not set');
        console.log('    Video Title:', JSON.stringify(day1Module.videoTitle, null, 2));
        console.log('    Video URL:', JSON.stringify(day1Module.videoUrl, null, 2));
        console.log('    Video Completed:', day1Module.videoCompleted || false);
        console.log('    Progress Percentage:', day1Module.progressPercentage || 0);
        
        // Check if video URL is populated
        const hasVideoUrl = day1Module.videoUrl && 
          (typeof day1Module.videoUrl === 'string' || 
           (day1Module.videoUrl.english || day1Module.videoUrl.kannada || day1Module.videoUrl.hindi));
        console.log('    Has Video URL:', hasVideoUrl ? '✅' : '❌');
      } else {
        console.log('  ❌ No Day 1 module found');
      }
      
      // Check Zarit assessment
      if (program.zaritBurdenAssessment) {
        console.log('  Zarit Assessment:');
        console.log('    Total Score:', program.zaritBurdenAssessment.totalScore);
        console.log('    Burden Level:', program.zaritBurdenAssessment.burdenLevel);
        console.log('    Completed At:', program.zaritBurdenAssessment.completedAt);
        console.log('    Has Answers:', !!program.zaritBurdenAssessment.answers);
      }
      
      console.log(''); // Empty line between programs
    });

    // 3. Test the video content API logic
    console.log('\n🧪 Testing Video Content API Logic...');
    
    // Find a program with burden level set
    const testProgram = programs.find(p => p.burdenLevel);
    if (testProgram) {
      console.log(`Testing with burden level: ${testProgram.burdenLevel}`);
      
      // Simulate API request
      const burdenLevel = testProgram.burdenLevel;
      const day = 1;
      const language = 'english';
      
      console.log(`Simulating: GET /api/caregiver/get-video-content?day=${day}&language=${language}&burdenLevel=${burdenLevel}`);
      
      if (config.day1?.videos?.[burdenLevel]) {
        const videoConfig = config.day1.videos[burdenLevel];
        console.log('✅ Video config found for burden level');
        console.log('Video URL (English):', videoConfig.videoUrl?.english || 'Not set');
        console.log('Video Title (English):', videoConfig.videoTitle?.english || 'Not set');
        
        if (videoConfig.videoUrl?.english) {
          console.log('✅ Video URL is available - API should return success');
        } else {
          console.log('❌ Video URL is not set - this is likely the issue!');
        }
      } else {
        console.log('❌ No video config found for burden level:', burdenLevel);
      }
    } else {
      console.log('❌ No caregiver program with burden level found to test');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

debugDay1Video();