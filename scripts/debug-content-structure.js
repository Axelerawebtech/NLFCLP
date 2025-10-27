require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function debugContentStructure() {
  const mongoUri = process.env.MONGODB_URI;
  console.log('🔗 Connecting to:', mongoUri ? mongoUri.substring(0, 50) + '...' : 'No URI found');
  
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    console.log('🔍 Connected to MongoDB');
    
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
    
    console.log('\n📊 Current contentManagement structure:');
    console.log('Type of contentManagement:', typeof config.contentManagement);
    
    if (config.contentManagement) {
      console.log('\n🔍 contentManagement keys:', Object.keys(config.contentManagement));
      
      // Check audioContent structure
      if (config.contentManagement.audioContent) {
        console.log('\n🎵 audioContent structure:');
        console.log('Type:', typeof config.contentManagement.audioContent);
        console.log('Content:', JSON.stringify(config.contentManagement.audioContent, null, 2));
      }
      
      // Check other content types
      const contentTypes = ['motivationMessages', 'healthcareTips', 'reminders', 'dailyTaskTemplates'];
      
      for (const type of contentTypes) {
        if (config.contentManagement[type]) {
          console.log(`\n📝 ${type} structure:`, typeof config.contentManagement[type]);
        }
      }
    } else {
      console.log('❌ No contentManagement found in config');
    }
    
    console.log('\n✅ Debug complete');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await client.close();
  }
}

debugContentStructure();