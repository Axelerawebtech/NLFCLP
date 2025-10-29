const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/caregiver-support';

async function testDay1VideoConfig() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get ProgramConfig collection directly
    const ProgramConfig = mongoose.connection.db.collection('programconfigs');
    
    // Find global config
    const config = await ProgramConfig.findOne({ configType: 'global' });
    
    if (!config) {
      console.log('❌ No global program config found');
      return;
    }

    console.log('\n📋 Global Program Config Found');
    console.log('Config ID:', config._id);
    
    // Check Day 1 configuration
    if (config.day1) {
      console.log('\n🎬 Day 1 Configuration:');
      console.log('Has day1 object:', !!config.day1);
      console.log('Has videos object:', !!(config.day1.videos));
      
      if (config.day1.videos) {
        console.log('\n📹 Day 1 Videos Configuration:');
        
        // Check each burden level
        ['mild', 'moderate', 'severe'].forEach(level => {
          console.log(`\n${level.toUpperCase()} Burden Level:`);
          
          if (config.day1.videos[level]) {
            const video = config.day1.videos[level];
            console.log('  Has config:', true);
            console.log('  Video Title (English):', video.videoTitle?.english || 'Not set');
            console.log('  Video URL (English):', video.videoUrl?.english || 'Not set');
            console.log('  Description (English):', video.description?.english || 'Not set');
            
            // Check if video URL is actually present
            const hasVideoUrl = !!(video.videoUrl?.english || video.videoUrl?.kannada || video.videoUrl?.hindi);
            console.log('  Has Video URL:', hasVideoUrl);
            
            if (hasVideoUrl) {
              console.log('  ✅ Video available for', level, 'burden level');
            } else {
              console.log('  ❌ No video URL configured for', level, 'burden level');
            }
          } else {
            console.log('  ❌ No configuration for', level, 'burden level');
          }
        });
      } else {
        console.log('❌ No videos object in day1 configuration');
      }
    } else {
      console.log('❌ No day1 configuration found');
    }

    // Also check if there are any caregiver programs with Day 1 data
    const CaregiverProgram = mongoose.connection.db.collection('caregiverprograms');
    const programs = await CaregiverProgram.find({}).toArray();
    
    console.log('\n👥 Caregiver Programs:');
    console.log('Total programs found:', programs.length);
    
    programs.forEach((program, index) => {
      console.log(`\nProgram ${index + 1}:`);
      console.log('  Caregiver ID:', program.caregiverId);
      console.log('  Burden Level:', program.burdenLevel);
      console.log('  Burden Score:', program.burdenTestScore);
      
      const day1Module = program.dayModules?.find(m => m.day === 1);
      if (day1Module) {
        console.log('  Day 1 Module:');
        console.log('    Burden Test Completed:', day1Module.burdenTestCompleted);
        console.log('    Burden Level:', day1Module.burdenLevel);
        console.log('    Has Video Title:', !!day1Module.videoTitle);
        console.log('    Has Video URL:', !!day1Module.videoUrl);
      } else {
        console.log('  ❌ No Day 1 module found');
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testDay1VideoConfig();