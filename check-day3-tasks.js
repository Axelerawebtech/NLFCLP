const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://axeleratest:FPJrR5K9YP8Z4I9X@axeleracluster.e3tm5.mongodb.net/axelera-nlf?retryWrites=true&w=majority';

async function checkDay3Tasks() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const ProgramConfig = mongoose.model('ProgramConfig', new mongoose.Schema({}, { strict: false }), 'programconfigs');
    
    // Get global config
    const config = await ProgramConfig.findOne({ configType: 'global' });
    
    if (!config) {
      console.log('❌ No global config found');
      return;
    }

    console.log('\n=== Day 3 Tasks Status ===\n');
    
    const day3Configs = config.dynamicDays?.filter(d => d.dayNumber === 3);
    
    if (!day3Configs || day3Configs.length === 0) {
      console.log('❌ No Day 3 configurations found');
      return;
    }

    day3Configs.forEach((dayConfig) => {
      console.log(`\n--- Day 3 (${dayConfig.language}) ---`);
      console.log('Enabled:', dayConfig.enabled);
      console.log('Has Test:', dayConfig.hasTest);
      
      if (dayConfig.contentByLevel && dayConfig.contentByLevel.length > 0) {
        dayConfig.contentByLevel.forEach(level => {
          console.log(`\n  Level: ${level.levelKey} (${level.levelLabel})`);
          console.log(`  Tasks Count: ${level.tasks?.length || 0}`);
          
          if (level.tasks && level.tasks.length > 0) {
            console.log('  Tasks:');
            level.tasks.forEach((task, idx) => {
              console.log(`    ${idx + 1}. ${task.title || 'Untitled'} (${task.taskType})`);
              console.log(`       Enabled: ${task.enabled}`);
              console.log(`       Order: ${task.taskOrder}`);
            });
          } else {
            console.log('  ⚠️ No tasks defined for this level');
          }
        });
      } else {
        console.log('  ❌ No content levels defined');
      }
    });

    // Check a caregiver's Day 3 module
    const CaregiverProgram = mongoose.model('CaregiverProgram', new mongoose.Schema({}, { strict: false }), 'caregiverprograms');
    
    console.log('\n\n=== Checking Caregiver Programs for Day 3 ===\n');
    const caregiverPrograms = await CaregiverProgram.find({ 'dayModules.day': 3 }).limit(5);
    
    if (caregiverPrograms.length > 0) {
      caregiverPrograms.forEach((program, idx) => {
        const day3Module = program.dayModules?.find(m => m.day === 3);
        if (day3Module) {
          console.log(`\nCaregiver ${idx + 1}:`);
          console.log('  Day 3 Unlocked:', day3Module.unlocked);
          console.log('  Test Completed:', day3Module.dynamicTestCompleted || false);
          console.log('  Tasks in Module:', day3Module.tasks?.length || 0);
          
          if (day3Module.tasks && day3Module.tasks.length > 0) {
            console.log('  Task Details:');
            day3Module.tasks.forEach((task, i) => {
              console.log(`    ${i + 1}. ${task.title || 'Untitled'} (${task.taskType})`);
            });
          } else {
            console.log('  ⚠️ No tasks saved in caregiver module');
          }
          
          console.log('  Task Responses:', day3Module.taskResponses?.length || 0);
        }
      });
    } else {
      console.log('No caregivers with Day 3 found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkDay3Tasks();
