// Quick MongoDB debug script
require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function main() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const config = await db.collection('programconfigs').findOne({ 
      configType: 'global', 
      caregiverId: null 
    });
    
    if (config && config.contentManagement) {
      console.log('📊 contentManagement structure:');
      console.log(JSON.stringify(config.contentManagement, null, 2));
    } else {
      console.log('❌ No contentManagement found');
    }
    
    await client.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();