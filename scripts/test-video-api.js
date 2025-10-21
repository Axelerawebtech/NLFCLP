import dotenv from 'dotenv';
import dbConnect from '../lib/mongodb.js';
import ProgramConfig from '../models/ProgramConfig.js';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testVideoContentAPI() {
  try {
    await dbConnect();
    console.log('✅ Connected to MongoDB');

    const day = 0;
    const language = 'english';
    
    // Find the global program configuration
    const config = await ProgramConfig.findOne({ 
      configType: 'global', 
      caregiverId: null 
    });

    if (!config) {
      console.log('❌ No program configuration found');
      return;
    }

    console.log('📊 Testing Day 0 video content retrieval...');
    
    // Debug: Show full config structure
    console.log('\n🔍 Full config structure:');
    console.log('📊 Config keys:', Object.keys(config.toObject ? config.toObject() : config));
    
    if (config.contentManagement) {
      console.log('📊 contentManagement keys:', Object.keys(config.contentManagement));
      if (config.contentManagement.audioContent) {
        console.log('📊 audioContent structure:', JSON.stringify(config.contentManagement.audioContent, null, 2));
      } else {
        console.log('❌ No audioContent in contentManagement');
      }
    } else {
      console.log('❌ No contentManagement found');
    }

    let videoContent = null;

    if (day === 0) {
      // Day 0: Core module - same for all caregivers
      if (config.day0IntroVideo) {
        videoContent = {
          day: 0,
          title: config.day0IntroVideo.title?.[language] || config.day0IntroVideo.title?.english || 'Welcome Video',
          videoUrl: config.day0IntroVideo.videoUrl?.[language] || config.day0IntroVideo.videoUrl?.english || '',
          description: config.day0IntroVideo.description?.[language] || config.day0IntroVideo.description?.english || '',
          type: 'core-module'
        };
      }
    }

    console.log('📹 Video Content:', videoContent);

    // Check for audio content
    let audioContent = null;
    console.log('\n🔍 Debugging audio content search...');
    console.log('📊 day value:', day, typeof day);
    
    if (config.contentManagement && config.contentManagement.audioContent) {
      console.log('📁 audioContent type:', typeof config.contentManagement.audioContent);
      
      // Handle Mongoose Map properly
      const audioContentMap = config.contentManagement.audioContent;
      
      // Try direct Map access methods
      console.log('📁 Map has method:', typeof audioContentMap.get);
      console.log('📁 Map keys method:', typeof audioContentMap.keys);
      
      if (audioContentMap.get) {
        // It's a Map, use Map methods
        console.log('📁 Using Map methods...');
        const dayContent = audioContentMap.get(day.toString()) || audioContentMap.get(day);
        
        if (dayContent) {
          console.log('📁 Found audio content for day:', day);
          console.log('📁 Day content:', dayContent);
          const audioUrl = dayContent[language];
          if (audioUrl) {
            audioContent = {
              audioUrl,
              title: `Day ${day} Audio Content`,
              description: `Audio content for Day ${day} in ${language}`
            };
            console.log(`🎵 Audio content found for Day ${day}, Language: ${language}`);
            console.log('🎵 Audio Content:', audioContent);
          } else {
            console.log('📁 No audio URL found for language:', language);
            console.log('📁 Available languages:', Object.keys(dayContent));
          }
        } else {
          console.log('📁 No audio content found for day:', day);
          console.log('📁 Trying to list all map keys...');
          try {
            for (let [key, value] of audioContentMap) {
              console.log(`📁 Map key: ${key}, value:`, value);
            }
          } catch (err) {
            console.log('📁 Error iterating map:', err.message);
          }
        }
      } else {
        // Regular object access
        console.log('📁 Using object access...');
        const dayKey = audioContentMap[day] ? day : day.toString();
        if (audioContentMap[dayKey]) {
          const audioUrl = audioContentMap[dayKey][language];
          if (audioUrl) {
            audioContent = {
              audioUrl,
              title: `Day ${day} Audio Content`,
              description: `Audio content for Day ${day} in ${language}`
            };
          }
        }
      }
    } else {
      console.log('📁 No contentManagement.audioContent found');
    }

    // Merge audio content into video content response
    if (audioContent) {
      videoContent.audioUrl = audioContent.audioUrl;
      videoContent.audioTitle = audioContent.title;
    }

    console.log('\n📊 Final Response:');
    console.log(JSON.stringify({
      success: true,
      videoContent,
      metadata: {
        day: day,
        language: language,
        hasVideo: !!videoContent?.videoUrl,
        hasAudio: !!videoContent?.audioUrl
      }
    }, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testVideoContentAPI();