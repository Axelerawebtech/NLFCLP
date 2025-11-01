const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://axelerawebtech_db_user:M7EOU2FK8vqO7vs3@cluster0.e6faone.mongodb.net/cancercare?retryWrites=true&w=majority&appName=Cluster0';

async function testBurdenQuestionRecording() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('cancercare');
    const caregiverProgramsCollection = db.collection('caregiverprograms');

    // Find the most recent burden assessment
    const programsWithBurdenAssessments = await caregiverProgramsCollection.find({
      'oneTimeAssessments.type': 'zarit_burden'
    }).toArray();

    if (programsWithBurdenAssessments.length === 0) {
      console.log('⚠️  No burden assessments found. Take an assessment first to test the recording.');
      return;
    }

    // Get the most recent assessment
    const latestProgram = programsWithBurdenAssessments
      .sort((a, b) => {
        const aDate = a.oneTimeAssessments.find(assessment => assessment.type === 'zarit_burden')?.completedAt || new Date(0);
        const bDate = b.oneTimeAssessments.find(assessment => assessment.type === 'zarit_burden')?.completedAt || new Date(0);
        return new Date(bDate) - new Date(aDate);
      })[0];

    const latestAssessment = latestProgram.oneTimeAssessments.find(a => a.type === 'zarit_burden');

    console.log('\n📊 Latest Burden Assessment Analysis:');
    console.log(`Caregiver ID: ${latestProgram.caregiverId}`);
    console.log(`Total Score: ${latestAssessment.totalScore}`);
    console.log(`Burden Level: ${latestAssessment.scoreLevel}`);
    console.log(`Completed: ${latestAssessment.completedAt}`);
    console.log(`Total Responses: ${latestAssessment.responses?.length || 0}`);

    if (latestAssessment.responses && latestAssessment.responses.length > 0) {
      console.log('\n📝 Question and Answer Analysis:');
      
      // Check first 3 responses for data quality
      latestAssessment.responses.slice(0, 3).forEach((response, index) => {
        console.log(`\n--- Response ${index + 1} ---`);
        console.log(`Question Number: ${response.questionNumber}`);
        console.log(`Question Text: "${response.questionText}"`);
        console.log(`Response Value: ${response.responseValue}`);
        console.log(`Response Text: "${response.responseText}"`);
        console.log(`Answered At: ${response.answeredAt}`);
        
        // Check for issues
        const issues = [];
        if (!response.questionText || response.questionText.includes('Question ')) {
          issues.push('❌ Generic question text');
        }
        if (!response.responseText || response.responseText.includes('Option ')) {
          issues.push('❌ Generic response text');
        }
        if (response.questionText && response.questionText.length > 20) {
          issues.push('✅ Proper question text');
        }
        if (response.responseText && !response.responseText.includes('Option')) {
          issues.push('✅ Proper response text');
        }
        
        if (issues.length > 0) {
          console.log(`Issues/Status: ${issues.join(', ')}`);
        }
      });

      // Summary analysis
      console.log('\n📊 Data Quality Summary:');
      const genericQuestions = latestAssessment.responses.filter(r => 
        !r.questionText || r.questionText.includes('Question ')
      ).length;
      
      const genericResponses = latestAssessment.responses.filter(r => 
        !r.responseText || r.responseText.includes('Option ')
      ).length;

      const properQuestions = latestAssessment.responses.filter(r => 
        r.questionText && r.questionText.length > 20 && !r.questionText.includes('Question ')
      ).length;

      const properResponses = latestAssessment.responses.filter(r => 
        r.responseText && !r.responseText.includes('Option ')
      ).length;

      console.log(`Generic Question Texts: ${genericQuestions}/${latestAssessment.responses.length}`);
      console.log(`Generic Response Texts: ${genericResponses}/${latestAssessment.responses.length}`);
      console.log(`Proper Question Texts: ${properQuestions}/${latestAssessment.responses.length}`);
      console.log(`Proper Response Texts: ${properResponses}/${latestAssessment.responses.length}`);

      if (genericQuestions > 0 || genericResponses > 0) {
        console.log('\n🔧 Issues Found:');
        if (genericQuestions > 0) {
          console.log('- Question texts are not being captured properly');
        }
        if (genericResponses > 0) {
          console.log('- Response option texts are not being captured properly');
        }
        console.log('\n💡 Solutions:');
        console.log('- Check that answerDetails is being sent correctly from frontend');
        console.log('- Verify question structure in the API processing');
        console.log('- Test with a new assessment after the fix');
      } else {
        console.log('\n✅ Data quality looks good!');
        console.log('✅ Question texts are being captured properly');
        console.log('✅ Response option texts are being captured properly');
      }

    } else {
      console.log('⚠️  No response details found in the assessment');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔚 Disconnected from MongoDB');
  }
}

console.log('🚀 Testing Zarit Burden Assessment Question Recording...');
testBurdenQuestionRecording();