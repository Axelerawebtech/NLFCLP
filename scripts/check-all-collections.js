const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

async function checkAllCollections() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env.local');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected!\n');

    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    
    console.log('=' .repeat(70));
    console.log(`📊 DATABASE: ${dbName}`);
    console.log('='.repeat(70) + '\n');

    // Get all collections
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('❌ No collections found in database!\n');
      return;
    }

    console.log(`📦 Found ${collections.length} collection(s):\n`);

    // Check each collection
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);
      
      const count = await collection.countDocuments();
      
      console.log('-'.repeat(70));
      console.log(`📁 Collection: ${collectionName}`);
      console.log(`   📊 Document Count: ${count}`);
      
      if (count > 0) {
        // Show sample document
        const sample = await collection.findOne();
        console.log(`   📄 Sample Document:`);
        console.log(JSON.stringify(sample, null, 6));
        
        // If it's users collection, show all users
        if (collectionName === 'users') {
          const allUsers = await collection.find({}).toArray();
          console.log(`\n   👥 ALL USERS IN DATABASE:`);
          allUsers.forEach((user, idx) => {
            console.log(`\n   User #${idx + 1}:`);
            console.log(`      • Name: ${user.name || 'N/A'}`);
            console.log(`      • Email: ${user.email || 'N/A'}`);
            console.log(`      • Phone: ${user.phone || 'N/A'}`);
            console.log(`      • Role: ${user.role || 'N/A'}`);
            console.log(`      • ID: ${user._id}`);
            console.log(`      • Created: ${user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}`);
          });
        }

        // If it's userprogresses, show all
        if (collectionName === 'userprogresses') {
          const allProgress = await collection.find({}).toArray();
          console.log(`\n   📈 ALL USER PROGRESS:`);
          allProgress.forEach((prog, idx) => {
            console.log(`\n   Progress #${idx + 1}:`);
            console.log(`      • User ID: ${prog.userId}`);
            console.log(`      • Current Day: ${prog.currentDay || 0}`);
            console.log(`      • Program Type: ${prog.programType || 'N/A'}`);
            if (prog.dayProgress) {
              const days = Object.keys(prog.dayProgress);
              console.log(`      • Days with data: ${days.join(', ')}`);
            }
          });
        }

        // If it's testresponses, show summary
        if (collectionName === 'testresponses') {
          const allTests = await collection.find({}).toArray();
          console.log(`\n   📝 ALL TEST RESPONSES:`);
          allTests.forEach((test, idx) => {
            console.log(`\n   Test #${idx + 1}:`);
            console.log(`      • User ID: ${test.userId}`);
            console.log(`      • Day: ${test.dayNumber}`);
            console.log(`      • Test Name: ${test.testName || 'N/A'}`);
            console.log(`      • Score: ${test.totalScore}`);
            console.log(`      • Level: ${test.levelKey}`);
            console.log(`      • Date: ${test.createdAt ? new Date(test.createdAt).toLocaleString() : 'N/A'}`);
          });
        }

        // If it's taskresponses, show summary
        if (collectionName === 'taskresponses') {
          const allTasks = await collection.find({}).toArray();
          console.log(`\n   ✅ ALL TASK RESPONSES:`);
          
          // Group by user
          const byUser = {};
          allTasks.forEach(task => {
            const userId = task.userId.toString();
            if (!byUser[userId]) byUser[userId] = [];
            byUser[userId].push(task);
          });

          Object.keys(byUser).forEach((userId, idx) => {
            console.log(`\n   User ${idx + 1} (ID: ${userId}):`);
            console.log(`      • Total Tasks: ${byUser[userId].length}`);
            const byDay = {};
            byUser[userId].forEach(task => {
              const day = task.dayNumber || 'unknown';
              byDay[day] = (byDay[day] || 0) + 1;
            });
            Object.keys(byDay).sort().forEach(day => {
              console.log(`      • Day ${day}: ${byDay[day]} tasks`);
            });
          });
        }

        // If it's programconfigs, show days configured
        if (collectionName === 'programconfigs') {
          const configs = await collection.find({}).toArray();
          console.log(`\n   ⚙️  PROGRAM CONFIGURATIONS:`);
          configs.forEach((config, idx) => {
            console.log(`\n   Config #${idx + 1}:`);
            console.log(`      • Type: ${config.configType || 'N/A'}`);
            if (config.dynamicDays && Array.isArray(config.dynamicDays)) {
              console.log(`      • Days Configured: ${config.dynamicDays.length}`);
              const daysByNumber = {};
              config.dynamicDays.forEach(day => {
                const dayNum = day.dayNumber;
                const lang = day.language;
                if (!daysByNumber[dayNum]) daysByNumber[dayNum] = [];
                daysByNumber[dayNum].push(lang);
              });
              Object.keys(daysByNumber).sort((a, b) => parseInt(a) - parseInt(b)).forEach(dayNum => {
                console.log(`      • Day ${dayNum}: ${daysByNumber[dayNum].join(', ')}`);
              });
            }
          });
        }
      } else {
        console.log(`   ⚠️  Empty collection (no documents)`);
      }
      console.log('');
    }

    console.log('='.repeat(70));
    console.log('✅ Database Check Complete!');
    console.log('='.repeat(70) + '\n');

    // Summary
    const userCount = await db.collection('users').countDocuments();
    const progressCount = await db.collection('userprogresses').countDocuments();
    const testCount = await db.collection('testresponses').countDocuments();
    const taskCount = await db.collection('taskresponses').countDocuments();

    console.log('📊 QUICK SUMMARY:');
    console.log(`   • Users: ${userCount}`);
    console.log(`   • User Progress Records: ${progressCount}`);
    console.log(`   • Test Responses: ${testCount}`);
    console.log(`   • Task Responses: ${taskCount}`);

    if (userCount === 0) {
      console.log('\n⚠️  WARNING: No users found in database!');
      console.log('   This means no one has registered yet.');
      console.log('   To test:');
      console.log('   1. Start your Next.js app: npm run dev');
      console.log('   2. Go to the registration page');
      console.log('   3. Register a new caregiver account');
      console.log('   4. Complete Day 0 and Day 1 assessments');
      console.log('   5. Run this script again to see the data\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

console.log('\n🔍 DATABASE INSPECTOR');
console.log('━'.repeat(70));
console.log('This script will show ALL data in your MongoDB database\n');

checkAllCollections();
