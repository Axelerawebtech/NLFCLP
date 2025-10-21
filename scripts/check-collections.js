const { MongoClient } = require('mongodb');

async function checkCollections() {
  console.log('🔍 Checking database collections...\n');
  
  const client = await MongoClient.connect('mongodb+srv://axelerawebtech_db_user:M7EOU2FK8vqO7vs3@cluster0.e6faone.mongodb.net/cancercare?retryWrites=true&w=majority&appName=Cluster0');
  const db = client.db('cancercare');
  
  try {
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check each collection for caregiver data
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`\n📊 ${collection.name}: ${count} documents`);
      
      if (count > 0) {
        const sample = await db.collection(collection.name).findOne();
        console.log('Sample document keys:', Object.keys(sample));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkCollections().catch(console.error);