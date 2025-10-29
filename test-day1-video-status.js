// Test script to check current Day 1 video configuration
// Run: node test-day1-video-status.js

async function checkDay1VideoStatus() {
  try {
    console.log('🔍 Checking Day 1 video configuration...\n');

    // Check current Day 1 video config
    const configResponse = await fetch('http://localhost:3000/api/admin/day1-video');
    const configData = await configResponse.json();

    if (configResponse.ok) {
      console.log('📋 Day 1 Video Configuration:');
      
      ['mild', 'moderate', 'severe'].forEach(level => {
        console.log(`\n${level.toUpperCase()} Burden Level:`);
        const levelConfig = configData.videos[level];
        
        if (levelConfig) {
          console.log('  English:');
          console.log('    Title:', levelConfig.videoTitle?.english || 'Not set');
          console.log('    URL:', levelConfig.videoUrl?.english || 'Not set');
          console.log('    Description:', levelConfig.description?.english || 'Not set');
          
          const hasVideo = !!(levelConfig.videoUrl?.english);
          console.log('    Status:', hasVideo ? '✅ Configured' : '❌ Not configured');
        } else {
          console.log('  ❌ No configuration found');
        }
      });

      // Test video content API for each burden level
      console.log('\n\n🧪 Testing Video Content API...');
      
      for (const burdenLevel of ['mild', 'moderate', 'severe']) {
        console.log(`\nTesting ${burdenLevel} burden level:`);
        
        try {
          const videoResponse = await fetch(`http://localhost:3000/api/caregiver/get-video-content?day=1&language=english&burdenLevel=${burdenLevel}`);
          const videoData = await videoResponse.json();
          
          if (videoResponse.ok && videoData.videoContent) {
            console.log(`  ✅ Video found for ${burdenLevel}`);
            console.log(`     Title: ${videoData.videoContent.title}`);
            console.log(`     URL: ${videoData.videoContent.videoUrl ? videoData.videoContent.videoUrl.substring(0, 50) + '...' : 'No URL'}`);
          } else {
            console.log(`  ❌ No video found for ${burdenLevel}`);
            console.log(`     Error: ${videoData.error || 'Unknown error'}`);
          }
        } catch (err) {
          console.log(`  ❌ API error for ${burdenLevel}: ${err.message}`);
        }
      }

    } else {
      console.error('❌ Failed to get Day 1 configuration:', configData.error);
    }

    // Check if there are any videos in the contentManagement section
    console.log('\n\n🔍 Checking for videos in other locations...');
    
    try {
      // This would require a separate API to check contentManagement
      console.log('💡 If no videos are found above, check the admin panel for uploaded videos');
      console.log('   They might be in the wrong location and need to be moved');
    } catch (err) {
      console.log('⚠️ Could not check contentManagement section');
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('\n💡 Make sure the development server is running on port 3000');
    console.log('   Run: npm run dev');
  }
}

checkDay1VideoStatus();