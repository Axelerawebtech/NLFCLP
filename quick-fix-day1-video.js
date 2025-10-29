// Quick fix to add a test video for Day 1 mild burden level
// Run this script after starting the dev server: node quick-fix-day1-video.js

async function fixDay1Video() {
  try {
    console.log('🔧 Quick Fix: Adding Day 1 mild video...');

    const response = await fetch('http://localhost:3000/api/admin/day1-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        burdenLevel: 'mild',
        language: 'english',
        videoUrl: 'https://res.cloudinary.com/dp2mpayng/video/upload/v1730127012/caregiver-program-videos/sample_mild_video.mp4', // Replace with actual uploaded video URL
        videoTitle: 'Day 1 Support Video for Mild Burden Level',
        description: 'This video provides personalized support and guidance for caregivers experiencing mild burden levels.'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success:', data.message);
      console.log('📹 Video URL saved for mild burden level');
      
      // Test the video content API
      console.log('\n🧪 Testing video content API...');
      
      const testResponse = await fetch('http://localhost:3000/api/caregiver/get-video-content?day=1&language=english&burdenLevel=mild');
      const testData = await testResponse.json();
      
      if (testResponse.ok && testData.videoContent) {
        console.log('✅ Video content API test successful!');
        console.log('📹 Video Title:', testData.videoContent.title);
        console.log('🔗 Video URL:', testData.videoContent.videoUrl.substring(0, 50) + '...');
      } else {
        console.log('❌ Video content API test failed:', testData.error);
      }
      
    } else {
      console.error('❌ Error:', data.error);
    }

  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('\n💡 Make sure the development server is running on port 3000');
    console.log('   Run: npm run dev');
  }
}

fixDay1Video();