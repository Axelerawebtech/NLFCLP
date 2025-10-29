const { MongoClient } = require('mongodb');

// Find and fix caregiver with mild burden level
async function findAndFixCaregiverData() {
  console.log('🔧 Finding and Fixing Caregiver Day 1 Module Data...');

  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb+srv://axelerawebtech:6EYIFXZgvCwPaVHV@cluster0.eap1i.mongodb.net/cancer-care?retryWrites=true&w=majority');
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    
    // 1. Find all caregivers with mild burden level and program-level data but missing Day 1 module data
    const caregivers = await db.collection('caregiverprograms').find({
      burdenLevel: 'mild',
      'zaritBurdenAssessment.completedAt': { $exists: true }
    }).toArray();
    
    console.log(`📊 Found ${caregivers.length} caregiver(s) with mild burden level`);
    
    // 2. Get the video config for mild burden level
    const config = await db.collection('programconfigs').findOne({ configType: 'global' });
    const mildVideoConfig = config?.day1?.videos?.mild;
    
    if (!mildVideoConfig) {
      console.log('❌ Mild video config not found');
      return;
    }
    
    console.log('✅ Mild video config found');
    
    for (const program of caregivers) {
      console.log(`\n🔍 Checking caregiver: ${program.caregiverId}`);
      
      const day1Module = program.dayModules?.find(m => m.day === 1);
      if (!day1Module) {
        console.log('  ❌ No Day 1 module found');
        continue;
      }
      
      console.log('  📊 Current Day 1 module state:');
      console.log('    burdenTestCompleted:', day1Module.burdenTestCompleted);
      console.log('    burdenLevel:', day1Module.burdenLevel);
      console.log('    videoUrl exists:', !!day1Module.videoUrl);
      console.log('    videoTitle exists:', !!day1Module.videoTitle);
      
      // Check if Day 1 module needs fixing
      if (!day1Module.burdenTestCompleted || !day1Module.videoUrl) {
        console.log('  🔧 Fixing Day 1 module...');
        
        const updates = {
          $set: {
            'dayModules.$.burdenTestCompleted': true,
            'dayModules.$.burdenLevel': program.burdenLevel,
            'dayModules.$.burdenScore': program.burdenTestScore || program.zaritBurdenAssessment?.totalScore || 0,
            'dayModules.$.videoTitle': mildVideoConfig.videoTitle,
            'dayModules.$.videoUrl': mildVideoConfig.videoUrl,
            'dayModules.$.content': mildVideoConfig.description,
            'dayModules.$.progressPercentage': 50, // Test completed, video pending
            'dayModules.$.updatedAt': new Date()
          }
        };
        
        const result = await db.collection('caregiverprograms').updateOne(
          { 
            caregiverId: program.caregiverId,
            'dayModules.day': 1
          },
          updates
        );
        
        console.log('  ✅ Update result:', result.modifiedCount > 0 ? 'SUCCESS' : 'NO CHANGES');
        
        if (result.modifiedCount > 0) {
          console.log('  🎉 Fixed Day 1 module for caregiver:', program.caregiverId);
        }
      } else {
        console.log('  ✅ Day 1 module already properly configured');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Load environment variables
if (require('fs').existsSync('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
}

findAndFixCaregiverData();