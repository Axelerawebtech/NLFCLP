require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function checkAudioContent() {
  let client;
  
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to:', process.env.MONGODB_URI ? 'Cloud MongoDB' : 'Local MongoDB');
    client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/caregiver_program');
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('programconfigs');
    
    // Find the global config
    const config = await collection.findOne({ 
      configType: 'global', 
      caregiverId: null 
    });

    if (!config) {
      console.log('❌ No global config found');
      return;
    }

    console.log('📊 Program Config Structure:');
    console.log('configType:', config.configType);
    console.log('caregiverId:', config.caregiverId);
    
    if (config.contentManagement) {
      console.log('\n🎵 Content Management Structure:');
      console.log(JSON.stringify(config.contentManagement, null, 2));
      
      // Specifically check for audioContent
      if (config.contentManagement.audioContent) {
        console.log('\n🎵 Audio Content Found:');
        console.log(JSON.stringify(config.contentManagement.audioContent, null, 2));
      } else {
        console.log('\n❌ No audioContent section found in contentManagement');
      }
    } else {
      console.log('❌ No contentManagement found');
    }

    // Check if day0IntroVideo exists
    if (config.day0IntroVideo) {
      console.log('\n📹 Day 0 Video Content:');
      console.log(JSON.stringify(config.day0IntroVideo, null, 2));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

checkAudioContent();