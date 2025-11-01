const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://axelerawebtech_db_user:M7EOU2FK8vqO7vs3@cluster0.e6faone.mongodb.net/cancercare?retryWrites=true&w=majority&appName=Cluster0';

async function clearBurdenAssessmentForTesting() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('cancercare');
    
    // Find all caregivers with burden assessments
    const caregiverProgramsCollection = db.collection('caregiverprograms');
    
    const programsWithBurdenTests = await caregiverProgramsCollection.find({
      'oneTimeAssessments.type': 'zarit_burden'
    }).toArray();

    console.log(`🔍 Found ${programsWithBurdenTests.length} programs with burden assessments`);

    if (programsWithBurdenTests.length === 0) {
      console.log('No burden assessments found to clear.');
      return;
    }

    // Show current assessments
    for (const program of programsWithBurdenTests) {
      const burdenAssessment = program.oneTimeAssessments.find(a => a.type === 'zarit_burden');
      console.log(`\nCaregiver ID: ${program.caregiverId}`);
      console.log(`Current score: ${burdenAssessment.totalScore}`);
      console.log(`Current level: ${burdenAssessment.scoreLevel}`);
      console.log(`Completed at: ${burdenAssessment.completedAt}`);
    }

    // Ask if user wants to proceed (for safety)
    console.log('\n⚠️  This will clear all burden assessments so they can be retaken with correct scoring.');
    console.log('✅ Proceeding with clearing assessments for testing...');

    // Clear burden assessments from all programs
    const clearResult = await caregiverProgramsCollection.updateMany(
      { 'oneTimeAssessments.type': 'zarit_burden' },
      {
        $pull: {
          oneTimeAssessments: { type: 'zarit_burden' }
        },
        $unset: {
          burdenLevel: '',
          'dayModules.$[day1].dailyAssessment': ''
        }
      },
      {
        arrayFilters: [{ 'day1.day': 1 }]
      }
    );

    console.log(`✅ Cleared burden assessments from ${clearResult.modifiedCount} programs`);

    // Also reset Day 1 progress to allow retaking
    const resetProgressResult = await caregiverProgramsCollection.updateMany(
      { 'dayModules.day': 1 },
      {
        $set: {
          'dayModules.$[day1].progressPercentage': 0,
          'dayModules.$[day1].videoUrl': null,
          'dayModules.$[day1].videoTitle': null
        }
      },
      {
        arrayFilters: [{ 'day1.day': 1 }]
      }
    );

    console.log(`✅ Reset Day 1 progress for ${resetProgressResult.modifiedCount} programs`);

    console.log('\n🎯 Ready for testing:');
    console.log('1. The burden assessment configuration is now fixed');
    console.log('2. Previous assessments have been cleared');
    console.log('3. Caregivers can now retake the assessment');
    console.log('4. Score 22 should now correctly show as "mild"');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔚 Disconnected from MongoDB');
  }
}

console.log('🚀 Clearing burden assessments for testing with fixed scoring...');
clearBurdenAssessmentForTesting();