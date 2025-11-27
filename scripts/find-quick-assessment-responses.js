const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Quick Assessment Response Finder
 * Shows where and how quick assessment responses are stored
 */

async function findQuickAssessmentResponses(caregiverName) {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected!\n');

    console.log('=' .repeat(70));
    console.log(`🔍 SEARCHING FOR QUICK ASSESSMENT RESPONSES`);
    console.log('='.repeat(70) + '\n');

    // Find the caregiver
    const Caregiver = mongoose.connection.collection('caregivers');
    const caregiver = await Caregiver.findOne({ 
      name: new RegExp(caregiverName, 'i')
    });

    if (!caregiver) {
      console.log(`❌ Caregiver "${caregiverName}" not found\n`);
      
      // Show all caregivers
      const allCaregivers = await Caregiver.find({}).limit(10).toArray();
      if (allCaregivers.length > 0) {
        console.log('📋 Available caregivers:');
        allCaregivers.forEach((c, idx) => {
          console.log(`   ${idx + 1}. ${c.name} (ID: ${c._id})`);
        });
      }
      return;
    }

    console.log(`✅ Caregiver Found: ${caregiver.name} (ID: ${caregiver._id})\n`);

    const caregiverId = caregiver._id;

    // Method 1: Check CaregiverProgram for quickAssessments (CORRECT LOCATION!)
    console.log('📝 METHOD 1: CaregiverProgram quickAssessments (ACTUAL STORAGE)');
    console.log('-'.repeat(70));
    const CaregiverProgram = mongoose.connection.collection('caregiverprograms');
    const program = await CaregiverProgram.findOne({ caregiverId: caregiverId });

    if (program && program.quickAssessments && program.quickAssessments.length > 0) {
      console.log(`✅ Found ${program.quickAssessments.length} quick assessment(s):\n`);
      program.quickAssessments.forEach((assessment, idx) => {
        console.log(`--- Quick Assessment #${idx + 1} ---`);
        console.log(JSON.stringify(assessment, null, 2));
        console.log('\nParsed Data:');
        console.log(`  • Day: ${assessment.day}`);
        console.log(`  • Type: ${assessment.type}`);
        console.log(`  • Language: ${assessment.language}`);
        console.log(`  • Total Questions: ${assessment.totalQuestions}`);
        console.log(`  • Number of Responses: ${assessment.responses?.length || 0}`);
        if (assessment.responses && assessment.responses.length > 0) {
          console.log(`  • Sample Responses:`);
          assessment.responses.slice(0, 3).forEach((response, rIdx) => {
            console.log(`    Q${rIdx + 1}: ${response.questionText}`);
            console.log(`        Answer: ${response.responseValue || response.responseText}`);
            console.log(`        Answered At: ${response.answeredAt ? new Date(response.answeredAt).toLocaleString() : 'N/A'}`);
          });
        }
        console.log(`  • Completed At: ${assessment.completedAt ? new Date(assessment.completedAt).toLocaleString() : 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No quick assessment responses found in CaregiverProgram\n');
    }

    // Method 2: Check TaskResponses (fallback - might not be used)
    console.log('\n📦 METHOD 2: Task Responses (fallback location)');
    console.log('-'.repeat(70));
    const TaskResponse = mongoose.connection.collection('taskresponses');
    const quickAssessmentTasks = await TaskResponse.find({ 
      userId: caregiverId,
      taskType: 'quick-assessment'
    }).sort({ createdAt: 1 }).toArray();

    if (quickAssessmentTasks.length > 0) {
      console.log(`✅ Found ${quickAssessmentTasks.length} quick assessment response(s):\n`);
      quickAssessmentTasks.forEach((task, idx) => {
        console.log(`--- Quick Assessment #${idx + 1} ---`);
        console.log(JSON.stringify(task, null, 2));
        console.log('\nParsed Data:');
        console.log(`  • Task ID: ${task.taskId}`);
        console.log(`  • Day Number: ${task.dayNumber}`);
        console.log(`  • Completed: ${task.completed}`);
        console.log(`  • Response Text: ${task.responseText || 'N/A'}`);
        console.log(`  • Metadata:`, task.metadata || 'N/A');
        if (task.metadata && task.metadata.answers) {
          console.log(`  • Answers:`);
          task.metadata.answers.forEach((answer, aIdx) => {
            console.log(`    Q${aIdx + 1}: ${answer.questionText}`);
            console.log(`        Answer: ${answer.answer}`);
          });
        }
        console.log(`  • Created: ${task.createdAt ? new Date(task.createdAt).toLocaleString() : 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No quick assessment responses found in taskresponses (expected)\n');
    }

    // Method 3: Check all task responses for this user
    console.log('\n📂 METHOD 3: All Task Responses for this Caregiver');
    console.log('-'.repeat(70));
    const allTasks = await TaskResponse.find({ 
      userId: caregiverId
    }).sort({ createdAt: 1 }).toArray();

    if (allTasks.length > 0) {
      console.log(`✅ Found ${allTasks.length} total task response(s):\n`);
      
      // Group by task type
      const byType = {};
      allTasks.forEach(task => {
        const type = task.taskType || 'unknown';
        if (!byType[type]) byType[type] = [];
        byType[type].push(task);
      });

      Object.keys(byType).forEach(type => {
        console.log(`\n  ${type}: ${byType[type].length} response(s)`);
        byType[type].forEach((task, idx) => {
          console.log(`    ${idx + 1}. Task ID: ${task.taskId} | Day: ${task.dayNumber} | Completed: ${task.completed}`);
          if (type === 'quick-assessment' && task.metadata?.answers) {
            console.log(`       Answers: ${task.metadata.answers.length} questions`);
          }
        });
      });
    } else {
      console.log('⚠️  No task responses found at all\n');
    }

    // Method 4: Show full program data
    if (program) {
      console.log('\n\n📊 METHOD 4: Full CaregiverProgram Document');
      console.log('-'.repeat(70));
      console.log('✅ Program Found:\n');
      console.log(`  • Program ID: ${program._id}`);
      console.log(`  • Caregiver ID: ${program.caregiverId}`);
      console.log(`  • Current Day: ${program.currentDay || 0}`);
      console.log(`  • Burden Level: ${program.burdenLevel || 'N/A'}`);
      console.log(`  • Quick Assessments Count: ${program.quickAssessments?.length || 0}`);
      console.log(`  • One-Time Assessments Count: ${program.oneTimeAssessments?.length || 0}`);
      console.log(`  • Created: ${program.createdAt ? new Date(program.createdAt).toLocaleString() : 'N/A'}`);
      console.log(`  • Last Updated: ${program.updatedAt ? new Date(program.updatedAt).toLocaleString() : 'N/A'}`);
    } else {
      console.log('\n\n⚠️  No CaregiverProgram found for this caregiver\n');
    }

    // Summary
    console.log('\n\n' + '='.repeat(70));
    console.log('📊 SUMMARY: HOW QUICK ASSESSMENTS ARE STORED');
    console.log('='.repeat(70));
    console.log(`
✅ CORRECT ANSWER: Quick Assessment responses are stored in 'caregiverprograms' collection!

Collection: caregiverprograms
Field: quickAssessments (Array)
Structure:
{
  _id: ObjectId,
  caregiverId: ObjectId (caregiver's _id),
  currentDay: Number,
  burdenLevel: String,
  quickAssessments: [
    {
      day: Number,
      type: String ("quick_assessment"),
      responses: [
        {
          questionId: String,
          questionText: String,
          responseValue: Mixed (answer value),
          responseText: String,
          answeredAt: Date
        }
      ],
      language: String,
      totalQuestions: Number,
      completedAt: Date
    }
  ],
  oneTimeAssessments: [...],
  createdAt: Date,
  updatedAt: Date
}

📋 HOW TO QUERY MANUALLY:

In MongoDB Compass:
  Collection: caregiverprograms
  Filter: { "caregiverId": ObjectId("${caregiverId}") }
  Look at the "quickAssessments" array field

In MongoDB Shell (mongosh):
  db.caregiverprograms.findOne({ 
    caregiverId: ObjectId("${caregiverId}")
  })
  
  // Or to see only quick assessments:
  db.caregiverprograms.findOne(
    { caregiverId: ObjectId("${caregiverId}") },
    { quickAssessments: 1, _id: 0 }
  )

📤 HOW ADMIN RETRIEVES THE DATA:

The admin dashboard queries:
  1. GET /api/admin/caregiver/profile?caregiverId=:id
  2. Backend finds CaregiverProgram by caregiverId
  3. Returns program.quickAssessments array
  4. Frontend displays each day's responses

The API endpoint (pages/api/admin/caregiver/profile.js) does:
  const program = await CaregiverProgram.findOne({ caregiverId });
  
  return {
    assessments: {
      quickAssessments: program.quickAssessments.map(qa => ({
        day: qa.day,
        type: qa.type,
        responses: qa.responses,
        completedAt: qa.completedAt,
        totalQuestions: qa.totalQuestions
      }))
    }
  };
`);

    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

// Get caregiver name from command line or use default
const caregiverName = process.argv[2] || 'caregiverone';

console.log('\n🔎 Quick Assessment Response Finder');
console.log('━'.repeat(70));
console.log('This script shows where quick assessment responses are stored\n');

findQuickAssessmentResponses(caregiverName);
