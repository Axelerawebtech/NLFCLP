require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function checkDetailedAudioContent() {
  let client;
  
  try {
    console.log('🔗 Connecting to Cloud MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
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

    console.log('📊 Program Config ID:', config._id);
    console.log('📊 Last Updated:', config.updatedAt);
    
    if (config.contentManagement && config.contentManagement.audioContent) {
      console.log('\n🎵 Detailed Audio Content Structure:');
      console.log(JSON.stringify(config.contentManagement.audioContent, null, 2));
      
      // Check Day 0 specifically
      if (config.contentManagement.audioContent['0']) {
        console.log('\n📱 Day 0 Audio Content:');
        console.log('English:', config.contentManagement.audioContent['0'].english || 'NOT FOUND');
        console.log('Kannada:', config.contentManagement.audioContent['0'].kannada || 'NOT FOUND');
        console.log('Hindi:', config.contentManagement.audioContent['0'].hindi || 'NOT FOUND');
      } else {
        console.log('\n❌ Day 0 audio content object not found');
      }
    } else {
      console.log('❌ No audioContent section found');
    }

    // Check raw database document
    console.log('\n🔍 Raw contentManagement structure:');
    if (config.contentManagement) {
      const keys = Object.keys(config.contentManagement);
      console.log('Available content types:', keys);
      
      keys.forEach(key => {
        console.log(`${key}:`, typeof config.contentManagement[key], 
                   Object.keys(config.contentManagement[key] || {}));
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

checkDetailedAudioContent();