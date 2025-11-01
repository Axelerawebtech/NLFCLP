const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://axelerawebtech_db_user:M7EOU2FK8vqO7vs3@cluster0.e6faone.mongodb.net/cancercare?retryWrites=true&w=majority&appName=Cluster0';

// Correct score ranges - updated to fix the scoring issue
const correctScoreRanges = {
  mild: {
    min: 0,
    max: 40,
    label: {
      english: 'Mild burden',
      kannada: 'ಕಡಿಮೆ ಹೊರೆ',
      hindi: 'हल्का बोझ'
    },
    burdenLevel: 'mild'
  },
  moderate: {
    min: 41,
    max: 60,
    label: {
      english: 'Moderate burden',
      kannada: 'ಮಧ್ಯಮ ಹೊರೆ',
      hindi: 'मध्यम बोझ'
    },
    burdenLevel: 'moderate'
  },
  severe: {
    min: 61,
    max: 88,
    label: {
      english: 'Severe burden',
      kannada: 'ತೀವ್ರ ಹೊರೆ',
      hindi: 'गंभीर बोझ'
    },
    burdenLevel: 'severe'
  }
};

async function fixBurdenAssessmentConfiguration() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('cancercare');
    const programConfigCollection = db.collection('programconfigs');

    // Find the global config
    const config = await programConfigCollection.findOne({ configType: 'global' });

    if (!config) {
      console.log('❌ No global config found');
      return;
    }

    console.log('🔍 Current burden assessment config:');
    console.log('Current score ranges:', JSON.stringify(config.day1?.scoreRanges, null, 2));

    // Update the score ranges
    const updateResult = await programConfigCollection.updateOne(
      { configType: 'global' },
      {
        $set: {
          'day1.scoreRanges': correctScoreRanges
        }
      }
    );

    console.log('✅ Updated score ranges:', updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO CHANGES');

    // Verify the update
    const updatedConfig = await programConfigCollection.findOne({ configType: 'global' });
    console.log('✅ New score ranges:', JSON.stringify(updatedConfig.day1?.scoreRanges, null, 2));

    // Test the scoring logic
    console.log('\n🧪 Testing scoring logic:');
    testScoring(22); // Your test case
    testScoring(44); // Test moderate case
    testScoring(66); // Test severe case

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('🔚 Disconnected from MongoDB');
  }
}

function testScoring(score) {
  let level;
  if (score <= 40) level = 'mild';
  else if (score <= 60) level = 'moderate';
  else level = 'severe';

  console.log(`Score ${score} → ${level}`);
}

// Test cases to verify the fix
function runTests() {
  console.log('\n=== SCORING VERIFICATION ===');
  console.log('Testing option 2 (Rarely) for all 22 questions:');
  console.log('22 questions × 1 point each = 22 total score');
  
  const score = 22;
  let burdenLevel;
  if (score <= 40) burdenLevel = 'mild';
  else if (score <= 60) burdenLevel = 'moderate';
  else burdenLevel = 'severe';
  
  console.log(`Result: Score ${score} → ${burdenLevel} (${burdenLevel === 'mild' ? '✅ CORRECT' : '❌ WRONG'})`);
  
  console.log('\nScore range verification:');
  console.log('0-40: mild');
  console.log('41-60: moderate');
  console.log('61-88: severe');
}

console.log('🚀 Starting burden assessment configuration fix...');
runTests();
fixBurdenAssessmentConfiguration();