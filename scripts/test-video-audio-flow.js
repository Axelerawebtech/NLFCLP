// Test script to verify video→audio sequential flow
const { MongoClient } = require('mongodb');

// Replace with your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0.ktxyi.mongodb.net/cancer-care-app?retryWrites=true&w=majority';

async function testVideoAudioFlow() {
  console.log('🔬 Testing Video→Audio Sequential Flow...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('cancer-care-app');
    const collection = db.collection('caregiverprograms');
    
    // Find a caregiver to test with
    const caregiver = await collection.findOne({});
    
    if (!caregiver) {
      console.log('❌ No caregivers found in database');
      return;
    }
    
    console.log(`\n👤 Testing with Caregiver ID: ${caregiver.caregiverId}`);
    
    // Check current Day 0 status
    const day0Module = caregiver.dayModules.find(d => d.day === 0);
    
    if (!day0Module) {
      console.log('❌ No Day 0 module found');
      return;
    }
    
    console.log('\n📊 Current Day 0 Status:');
    console.log(`   videoWatched: ${day0Module.videoWatched || false}`);
    console.log(`   videoCompleted: ${day0Module.videoCompleted || false}`);
    console.log(`   audioCompleted: ${day0Module.audioCompleted || false}`);
    console.log(`   progressPercentage: ${day0Module.progressPercentage || 0}%`);
    
    // Test flow: Mark video as completed
    console.log('\n🎬 Simulating video completion...');
    const videoResult = await collection.updateOne(
      { caregiverId: caregiver.caregiverId, 'dayModules.day': 0 },
      { 
        $set: { 
          'dayModules.$.videoCompleted': true,
          'dayModules.$.videoWatched': true,
          'dayModules.$.videoProgress': 100,
          'dayModules.$.videoCompletedAt': new Date()
        }
      }
    );
    
    if (videoResult.modifiedCount > 0) {
      console.log('✅ Video marked as completed');
      
      // Check if audio should now be unlocked
      const updatedCaregiver = await collection.findOne({ caregiverId: caregiver.caregiverId });
      const updatedDay0 = updatedCaregiver.dayModules.find(d => d.day === 0);
      
      console.log('\n🔊 Audio Unlock Check:');
      console.log(`   videoCompleted: ${updatedDay0.videoCompleted}`);
      console.log(`   → Audio should be UNLOCKED: ${updatedDay0.videoCompleted ? 'YES ✅' : 'NO ❌'}`);
      
      // Test audio completion
      console.log('\n🎵 Simulating audio completion...');
      const audioResult = await collection.updateOne(
        { caregiverId: caregiver.caregiverId, 'dayModules.day': 0 },
        { 
          $set: { 
            'dayModules.$.audioCompleted': true,
            'dayModules.$.audioCompletedAt': new Date(),
            'dayModules.$.progressPercentage': 100,
            'dayModules.$.completedAt': new Date()
          }
        }
      );
      
      if (audioResult.modifiedCount > 0) {
        console.log('✅ Audio marked as completed');
        
        const finalCaregiver = await collection.findOne({ caregiverId: caregiver.caregiverId });
        const finalDay0 = finalCaregiver.dayModules.find(d => d.day === 0);
        
        console.log('\n🏆 Final Day 0 Status:');
        console.log(`   videoCompleted: ${finalDay0.videoCompleted}`);
        console.log(`   audioCompleted: ${finalDay0.audioCompleted}`);
        console.log(`   progressPercentage: ${finalDay0.progressPercentage}%`);
        console.log(`   Day 0 Complete: ${finalDay0.progressPercentage === 100 ? 'YES ✅' : 'NO ❌'}`);
      }
    }
    
    console.log('\n✅ Flow test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

testVideoAudioFlow();