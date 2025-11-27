const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function findCaregiverData(caregiverName) {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined. Add it to .env.local');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    // Define Caregiver Schema
    const Caregiver = mongoose.models.Caregiver || mongoose.model(
      'Caregiver',
      new mongoose.Schema({}, { strict: false }),
      'caregivers'
    );

    // Define UserProgress Schema
    const UserProgress = mongoose.models.UserProgress || mongoose.model(
      'UserProgress',
      new mongoose.Schema({}, { strict: false }),
      'userprogresses'
    );

    // Define TestResponse Schema
    const TestResponse = mongoose.models.TestResponse || mongoose.model(
      'TestResponse',
      new mongoose.Schema({}, { strict: false }),
      'testresponses'
    );

    // Define TaskResponse Schema
    const TaskResponse = mongoose.models.TaskResponse || mongoose.model(
      'TaskResponse',
      new mongoose.Schema({}, { strict: false }),
      'taskresponses'
    );

    console.log(`\n🔍 Searching for caregiver: "${caregiverName}"\n`);

    // Find caregiver by name (case-insensitive)
    let caregiver = await Caregiver.findOne({ 
      name: new RegExp(caregiverName, 'i')
    });

    if (!caregiver) {
      console.log(`❌ No exact match found for: "${caregiverName}"`);
      console.log('\n💡 Searching for all caregivers with similar names...\n');
      
      // Try partial match with first 3 characters
      const similarCaregivers = await Caregiver.find({ 
        name: new RegExp(caregiverName.substring(0, 3), 'i')
      }).limit(20);
      
      if (similarCaregivers.length > 0) {
        console.log(`📋 Found ${similarCaregivers.length} caregiver(s) with similar names:\n`);
        similarCaregivers.forEach((c, idx) => {
          console.log(`   ${idx + 1}. Name: "${c.name}" | ID: ${c._id} | Email: ${c.email || 'N/A'} | Phone: ${c.phone || 'N/A'} | Created: ${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}`);
        });
        
        // Auto-select first match if only one found
        if (similarCaregivers.length === 1) {
          console.log(`\n✨ Auto-selecting the only match: "${similarCaregivers[0].name}"\n`);
          caregiver = similarCaregivers[0];
        } else {
          console.log(`\n💡 TIP: Run the script with the exact name, e.g.:`);
          console.log(`   node scripts/find-caregiver-data.js "${similarCaregivers[0].name}"`);
          return;
        }
      } else {
        console.log('❌ No caregivers found with similar names.');
        console.log('\n🔍 Showing ALL caregivers in database:\n');
        
        const allCaregivers = await Caregiver.find({}).limit(20);
        if (allCaregivers.length > 0) {
          allCaregivers.forEach((c, idx) => {
            console.log(`   ${idx + 1}. "${c.name}" | ID: ${c._id} | Phone: ${c.phone || 'N/A'}`);
          });
        } else {
          console.log('   No caregivers found in database.');
        }
        return;
      }
    }

    console.log('✅ Caregiver Found!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Caregiver Information:`);
    console.log(`   • Name: ${caregiver.name}`);
    console.log(`   • ID: ${caregiver._id}`);
    console.log(`   • Email: ${caregiver.email || 'N/A'}`);
    console.log(`   • Phone: ${caregiver.phone || 'N/A'}`);
    console.log(`   • Language: ${caregiver.language || 'N/A'}`);
    console.log(`   • Burden Level: ${caregiver.burdenLevel || 'N/A'}`);
    console.log(`   • Created: ${caregiver.createdAt ? new Date(caregiver.createdAt).toLocaleString() : 'N/A'}`);

    // Find user progress
    const progress = await UserProgress.findOne({ userId: caregiver._id });

    if (progress) {
      console.log(`\n📊 Program Progress:`);
      console.log(`   • Progress ID: ${progress._id}`);
      console.log(`   • Current Day: ${progress.currentDay || 0}`);
      console.log(`   • Program Type: ${progress.programType || 'N/A'}`);
      console.log(`   • Days Completed: ${progress.daysCompleted || []}`);
      console.log(`   • Last Updated: ${progress.updatedAt ? new Date(progress.updatedAt).toLocaleString() : 'N/A'}`);

      if (progress.dayProgress && typeof progress.dayProgress === 'object') {
        console.log(`\n📅 Day-by-Day Progress:`);
        Object.keys(progress.dayProgress).sort((a, b) => {
          const dayA = parseInt(a.replace('day', ''));
          const dayB = parseInt(b.replace('day', ''));
          return dayA - dayB;
        }).forEach(day => {
          const dayData = progress.dayProgress[day];
          console.log(`\n   ${day.toUpperCase()}:`);
          console.log(`      • Completed: ${dayData.completed || false}`);
          console.log(`      • Test Completed: ${dayData.testCompleted || false}`);
          console.log(`      • Test Score: ${dayData.testScore !== undefined ? dayData.testScore : 'N/A'}`);
          console.log(`      • Level Key: ${dayData.levelKey || 'N/A'}`);
          console.log(`      • Completed At: ${dayData.completedAt ? new Date(dayData.completedAt).toLocaleString() : 'N/A'}`);
          
          if (dayData.completedTasks && dayData.completedTasks.length > 0) {
            console.log(`      • Completed Tasks: ${dayData.completedTasks.join(', ')}`);
          }
        });
      }
    } else {
      console.log(`\n⚠️  No progress data found for this user.`);
    }

      // Find test responses
      const testResponses = await TestResponse.find({ userId: caregiver._id }).sort({ createdAt: 1 });

      if (testResponses.length > 0) {
        console.log(`\n📝 Test Responses (${testResponses.length} total):`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        testResponses.forEach((response, idx) => {
          console.log(`\n   Test #${idx + 1}:`);
          console.log(`   • Response ID: ${response._id}`);
          console.log(`   • Day Number: ${response.dayNumber || 'N/A'}`);
          console.log(`   • Test Name: ${response.testName || 'N/A'}`);
          console.log(`   • Test Type: ${response.testType || 'N/A'}`);
          console.log(`   • Total Score: ${response.totalScore !== undefined ? response.totalScore : 'N/A'}`);
          console.log(`   • Level Key: ${response.levelKey || 'N/A'}`);
          console.log(`   • Language: ${response.language || 'N/A'}`);
          console.log(`   • Completed At: ${response.createdAt ? new Date(response.createdAt).toLocaleString() : 'N/A'}`);
          
          if (response.answers && Array.isArray(response.answers)) {
            console.log(`   • Number of Answers: ${response.answers.length}`);
            console.log(`   • Sample Answers:`);
            response.answers.slice(0, 3).forEach((answer, aIdx) => {
              console.log(`      Q${aIdx + 1}: "${answer.questionText?.substring(0, 50)}..." → Score: ${answer.selectedScore}`);
            });
          }
        });
      } else {
        console.log(`\n⚠️  No test responses found for this caregiver.`);
      }

      // Find task responses
      const taskResponses = await TaskResponse.find({ userId: caregiver._id }).sort({ createdAt: 1 });    if (taskResponses.length > 0) {
      console.log(`\n✅ Task Responses (${taskResponses.length} total):`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Group by day
      const tasksByDay = {};
      taskResponses.forEach(task => {
        const day = task.dayNumber || 'unknown';
        if (!tasksByDay[day]) tasksByDay[day] = [];
        tasksByDay[day].push(task);
      });

      Object.keys(tasksByDay).sort((a, b) => {
        if (a === 'unknown') return 1;
        if (b === 'unknown') return -1;
        return parseInt(a) - parseInt(b);
      }).forEach(day => {
        console.log(`\n   DAY ${day}:`);
        tasksByDay[day].forEach((task, idx) => {
          console.log(`\n      Task #${idx + 1}:`);
          console.log(`      • Task ID: ${task.taskId || 'N/A'}`);
          console.log(`      • Task Type: ${task.taskType || 'N/A'}`);
          console.log(`      • Completed: ${task.completed || false}`);
          console.log(`      • Response Text: ${task.responseText ? `"${task.responseText.substring(0, 100)}${task.responseText.length > 100 ? '...' : ''}"` : 'N/A'}`);
          console.log(`      • Completed At: ${task.createdAt ? new Date(task.createdAt).toLocaleString() : 'N/A'}`);
        });
      });
      } else {
        console.log(`\n⚠️  No task responses found for this caregiver.`);
      }    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Data retrieval complete!\n');

  } catch (error) {
    console.error('❌ Error finding caregiver data:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed.');
  }
}

// Get caregiver name from command line argument or use default
const caregiverName = process.argv[2] || 'checkyy';

console.log('🔎 Caregiver Data Finder');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

findCaregiverData(caregiverName);
