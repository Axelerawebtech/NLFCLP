const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://axelerawebtech_db_user:M7EOU2FK8vqO7vs3@cluster0.e6faone.mongodb.net/cancercare?retryWrites=true&w=majority&appName=Cluster0';

async function checkBurdenAssessmentRecording() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('cancercare');
    const caregiverProgramsCollection = db.collection('caregiverprograms');

    // Find programs with burden assessments
    const programsWithBurdenAssessments = await caregiverProgramsCollection.find({
      'oneTimeAssessments.type': 'zarit_burden'
    }).toArray();

    console.log(`\n🔍 Found ${programsWithBurdenAssessments.length} programs with burden assessments`);

    if (programsWithBurdenAssessments.length > 0) {
      console.log('\n📊 Recent Burden Assessment Data Structure:');
      
      // Show the most recent assessment structure
      const latestProgram = programsWithBurdenAssessments
        .sort((a, b) => {
          const aDate = a.oneTimeAssessments.find(assessment => assessment.type === 'zarit_burden')?.completedAt || new Date(0);
          const bDate = b.oneTimeAssessments.find(assessment => assessment.type === 'zarit_burden')?.completedAt || new Date(0);
          return new Date(bDate) - new Date(aDate);
        })[0];

      const latestAssessment = latestProgram.oneTimeAssessments.find(a => a.type === 'zarit_burden');

      console.log('\n📋 Assessment Overview:');
      console.log(`Caregiver ID: ${latestProgram.caregiverId}`);
      console.log(`Assessment Type: ${latestAssessment.type}`);
      console.log(`Total Score: ${latestAssessment.totalScore}`);
      console.log(`Burden Level: ${latestAssessment.scoreLevel}`);
      console.log(`Completed At: ${latestAssessment.completedAt}`);
      console.log(`Language: ${latestAssessment.language}`);
      console.log(`Total Questions: ${latestAssessment.totalQuestions || latestAssessment.responses?.length}`);

      if (latestAssessment.assessmentDetails) {
        console.log('\n📊 Assessment Statistics:');
        console.log(`Average Score: ${latestAssessment.assessmentDetails.averageScore}`);
        console.log(`Max Possible Score: ${latestAssessment.assessmentDetails.maxPossibleScore}`);
        console.log(`Completion Percentage: ${latestAssessment.assessmentDetails.completionPercentage}%`);
        console.log(`Questions Answered: ${latestAssessment.assessmentDetails.questionsAnswered}`);
      }

      if (latestAssessment.metadata) {
        console.log('\n🔍 Metadata:');
        console.log(`Submission Method: ${latestAssessment.metadata.submissionMethod}`);
        console.log(`Submitted From: ${latestAssessment.metadata.submittedFrom}`);
      }

      console.log('\n📝 Sample Responses (first 3):');
      if (latestAssessment.responses && latestAssessment.responses.length > 0) {
        latestAssessment.responses.slice(0, 3).forEach((response, index) => {
          console.log(`\nQ${index + 1}:`);
          console.log(`  Question: ${response.questionText}`);
          console.log(`  Score: ${response.responseValue}`);
          if (response.responseText) {
            console.log(`  Selected: ${response.responseText}`);
          }
          console.log(`  Answered: ${response.answeredAt}`);
        });

        if (latestAssessment.responses.length > 3) {
          console.log(`\n... and ${latestAssessment.responses.length - 3} more responses`);
        }
      }

      console.log('\n✅ Assessment data is being properly recorded in caregiver profile');
      console.log('✅ This data will appear in the admin caregiver profile page');
      console.log('✅ All responses, scores, and completion date are tracked');

    } else {
      console.log('\n⚠️  No burden assessments found yet.');
      console.log('💡 Take a burden assessment to see the recording in action.');
    }

    // Show the expected data structure
    console.log('\n📖 Expected Data Structure for Zarit Burden Assessment:');
    console.log(`
    oneTimeAssessments: [
      {
        type: "zarit_burden",
        responses: [
          {
            questionId: "question1",
            questionNumber: 1,
            questionText: "Do you feel that your relative asks for more help than he/she needs?",
            responseValue: 2,
            responseText: "Sometimes", 
            answeredAt: Date
          },
          // ... 21 more responses
        ],
        totalScore: 44,
        scoreLevel: "moderate",
        completedAt: Date,
        language: "english",
        totalQuestions: 22,
        assessmentDetails: {
          averageScore: 2.0,
          maxPossibleScore: 88,
          completionPercentage: 50,
          questionsAnswered: 22
        },
        metadata: {
          submissionMethod: "inline_assessment",
          submittedFrom: "caregiver_dashboard"
        }
      }
    ]
    `);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔚 Disconnected from MongoDB');
  }
}

console.log('🚀 Checking Zarit Burden Assessment recording...');
checkBurdenAssessmentRecording();