const { MongoClient } = require('mongodb');

// Fix the specific caregiver's Day 1 module data
async function fixCaregiverDay1Data() {
  console.log('🔧 Fixing Caregiver Day 1 Module Data...');

  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb+srv://axelerawebtech:6EYIFXZgvCwPaVHV@cluster0.eap1i.mongodb.net/cancer-care?retryWrites=true&w=majority');
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db();
    const caregiverId = '6901fa0357ce8bc36859455c'; // Your caregiver ID
    
    // 1. Get the caregiver program
    const program = await db.collection('caregiverprograms').findOne({ caregiverId });
    
    if (!program) {
      console.log('❌ Caregiver program not found');
      return;
    }
    
    console.log('📊 Current program state:');
    console.log('   Program burden level:', program.burdenLevel);
    console.log('   Burden test score:', program.burdenTestScore);
    console.log('   Assessment completed:', !!program.zaritBurdenAssessment?.completedAt);
    
    const day1Module = program.dayModules?.find(m => m.day === 1);
    if (day1Module) {
      console.log('   Day 1 burden test completed:', day1Module.burdenTestCompleted);
      console.log('   Day 1 burden level:', day1Module.burdenLevel);
      console.log('   Day 1 video URL exists:', !!day1Module.videoUrl);
    }
    
    // 2. Get the video config for mild burden level
    const config = await db.collection('programconfigs').findOne({ configType: 'global' });
    const mildVideoConfig = config?.day1?.videos?.mild;
    
    if (!mildVideoConfig) {
      console.log('❌ Mild video config not found');
      return;
    }
    
    // 3. Fix the Day 1 module if assessment was completed but module not updated
    if (program.burdenLevel === 'mild' && program.zaritBurdenAssessment?.completedAt && day1Module) {
      console.log('🔧 Fixing Day 1 module data...');
      
      const updates = {
        $set: {
          'dayModules.$.burdenTestCompleted': true,
          'dayModules.$.burdenLevel': 'mild',
          'dayModules.$.burdenScore': program.burdenTestScore || program.zaritBurdenAssessment.totalScore,
          'dayModules.$.videoTitle': mildVideoConfig.videoTitle,
          'dayModules.$.videoUrl': mildVideoConfig.videoUrl,
          'dayModules.$.content': mildVideoConfig.description,
          'dayModules.$.progressPercentage': 50, // Test completed, video pending
          'dayModules.$.updatedAt': new Date()
        }
      };
      
      const result = await db.collection('caregiverprograms').updateOne(
        { 
          caregiverId,
          'dayModules.day': 1
        },
        updates
      );
      
      console.log('✅ Update result:', result.modifiedCount > 0 ? 'SUCCESS' : 'NO CHANGES');
      
      // 4. Verify the fix
      const updatedProgram = await db.collection('caregiverprograms').findOne({ caregiverId });
      const updatedDay1 = updatedProgram.dayModules?.find(m => m.day === 1);
      
      console.log('📋 After fix verification:');
      console.log('   Day 1 burden test completed:', updatedDay1.burdenTestCompleted);
      console.log('   Day 1 burden level:', updatedDay1.burdenLevel);
      console.log('   Day 1 video URL exists:', !!updatedDay1.videoUrl?.english);
      console.log('   Day 1 progress percentage:', updatedDay1.progressPercentage);
      
    } else {
      console.log('ℹ️ No fix needed or conditions not met');
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

fixCaregiverDay1Data();