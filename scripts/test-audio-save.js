require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function testAudioSave() {
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
      console.log('❌ No global config found');
      return;
    }

    console.log('📊 Before update - Day 0 audio:', config.contentManagement?.audioContent?.['0']);

    // Test the save operation manually
    const testUrl = 'https://res.cloudinary.com/dp2mpayng/video/upload/v1760959957/caregiver-program-audio/1760959954967_0_english_audioContent.mp3';
    
    // Initialize structure if needed
    if (!config.contentManagement) config.contentManagement = {};
    if (!config.contentManagement.audioContent) config.contentManagement.audioContent = {};
    if (!config.contentManagement.audioContent['0']) config.contentManagement.audioContent['0'] = {};
    
    // Save the test URL
    config.contentManagement.audioContent['0'].english = testUrl;
    config.updatedAt = new Date();

    console.log('📊 About to save - Day 0 audio:', config.contentManagement.audioContent['0']);

    // Use updateOne to save
    const result = await collection.updateOne(
      { configType: 'global', caregiverId: null },
      { 
        $set: { 
          'contentManagement.audioContent.0.english': testUrl,
          updatedAt: new Date()
        }
      }
    );

    console.log('✅ Update result:', result);

    // Verify the save
    const updatedConfig = await collection.findOne({ 
      configType: 'global', 
      caregiverId: null 
    });

    console.log('📊 After update - Day 0 audio:', updatedConfig.contentManagement?.audioContent?.['0']);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

testAudioSave();