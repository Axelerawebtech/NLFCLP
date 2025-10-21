require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function fixAudioContentStructure() {
  let client;
  
  try {
    console.log('🔗 Connecting to Cloud MongoDB...');
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db();
    const collection = db.collection('programconfigs');
    
    // Find the global config
    let config = await collection.findOne({ 
      configType: 'global', 
      caregiverId: null 
    });

    if (!config) {
      console.log('❌ No global config found, creating one...');
      config = {
        configType: 'global',
        caregiverId: null,
        contentManagement: {}
      };
    }

    // Initialize contentManagement if needed
    if (!config.contentManagement) {
      config.contentManagement = {};
    }

    // Add audioContent structure if missing
    if (!config.contentManagement.audioContent) {
      config.contentManagement.audioContent = {};
      console.log('➕ Added audioContent structure');
    }

    // Test adding a sample audio content for Day 0
    if (!config.contentManagement.audioContent['0']) {
      config.contentManagement.audioContent['0'] = {};
    }

    // Update the config in database
    const result = await collection.updateOne(
      { configType: 'global', caregiverId: null },
      { 
        $set: { 
          contentManagement: config.contentManagement,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('✅ Database updated:', result.modifiedCount ? 'Modified existing' : 'Created new');
    
    // Verify the structure
    const updatedConfig = await collection.findOne({ 
      configType: 'global', 
      caregiverId: null 
    });

    if (updatedConfig.contentManagement.audioContent) {
      console.log('✅ Audio content structure verified in database');
      console.log('🎵 audioContent structure:', JSON.stringify(updatedConfig.contentManagement.audioContent, null, 2));
    } else {
      console.log('❌ Audio content structure still missing');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

fixAudioContentStructure();