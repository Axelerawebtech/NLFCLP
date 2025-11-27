const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Interactive MongoDB Query Tool
 * Run this to manually check any caregiver's data
 */

async function interactiveQuery() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected!\n');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📦 Available Collections:');
    collections.forEach(col => console.log(`   - ${col.name}`));

    console.log('\n' + '='.repeat(70));
    console.log('MANUAL QUERY EXAMPLES FOR CAREGIVER "checkyy"');
    console.log('='.repeat(70) + '\n');

    // 1. Find User
    console.log('1️⃣  FINDING USER:');
    console.log('-'.repeat(70));
    const User = mongoose.connection.collection('users');
    const user = await User.findOne({ 
      name: /checkyy/i,
      role: 'caregiver'
    });
    
    if (user) {
      console.log('✅ User Found:');
      console.log(JSON.stringify(user, null, 2));
      
      const userId = user._id;

      // 2. Find Progress
      console.log('\n\n2️⃣  USER PROGRESS:');
      console.log('-'.repeat(70));
      const UserProgress = mongoose.connection.collection('userprogresses');
      const progress = await UserProgress.findOne({ userId: userId });
      if (progress) {
        console.log('✅ Progress Found:');
        console.log(JSON.stringify(progress, null, 2));
      } else {
        console.log('⚠️  No progress data found');
      }

      // 3. Find Test Responses
      console.log('\n\n3️⃣  TEST RESPONSES:');
      console.log('-'.repeat(70));
      const TestResponse = mongoose.connection.collection('testresponses');
      const tests = await TestResponse.find({ userId: userId }).sort({ createdAt: 1 }).toArray();
      if (tests.length > 0) {
        console.log(`✅ ${tests.length} Test(s) Found:\n`);
        tests.forEach((test, idx) => {
          console.log(`--- Test #${idx + 1} ---`);
          console.log(JSON.stringify(test, null, 2));
          console.log('');
        });
      } else {
        console.log('⚠️  No test responses found');
      }

      // 4. Find Task Responses
      console.log('\n\n4️⃣  TASK RESPONSES:');
      console.log('-'.repeat(70));
      const TaskResponse = mongoose.connection.collection('taskresponses');
      const tasks = await TaskResponse.find({ userId: userId }).sort({ createdAt: 1 }).toArray();
      if (tasks.length > 0) {
        console.log(`✅ ${tasks.length} Task(s) Found:\n`);
        tasks.forEach((task, idx) => {
          console.log(`--- Task #${idx + 1} ---`);
          console.log(JSON.stringify(task, null, 2));
          console.log('');
        });
      } else {
        console.log('⚠️  No task responses found');
      }

      // 5. Summary Stats
      console.log('\n\n5️⃣  SUMMARY STATISTICS:');
      console.log('-'.repeat(70));
      console.log(`📊 User: ${user.name}`);
      console.log(`📧 Email: ${user.email || 'N/A'}`);
      console.log(`🎯 Current Day: ${progress?.currentDay || 0}`);
      console.log(`✅ Tests Completed: ${tests.length}`);
      console.log(`📝 Tasks Completed: ${tasks.length}`);
      
      if (tests.length > 0) {
        console.log(`\n📈 Test Scores by Day:`);
        tests.forEach(test => {
          console.log(`   Day ${test.dayNumber}: ${test.totalScore} points (${test.levelKey}) - ${test.testName}`);
        });
      }

    } else {
      console.log('❌ User "checkyy" not found');
      
      // Search for similar users
      console.log('\n🔍 Searching for similar caregivers...');
      const similarUsers = await User.find({ 
        name: /check/i,
        role: 'caregiver'
      }).limit(10).toArray();
      
      if (similarUsers.length > 0) {
        console.log(`\n📋 Found ${similarUsers.length} similar caregiver(s):`);
        similarUsers.forEach((u, idx) => {
          console.log(`   ${idx + 1}. ${u.name} (ID: ${u._id})`);
        });
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Query Complete!');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

// HOW TO USE:
console.log('\n📖 HOW TO USE THIS SCRIPT:');
console.log('━'.repeat(70));
console.log('1. Run: node scripts/manual-db-check.js');
console.log('2. This will show ALL data for caregiver "checkyy"');
console.log('3. Modify the name in line 42 to check other caregivers');
console.log('━'.repeat(70) + '\n');

interactiveQuery();
