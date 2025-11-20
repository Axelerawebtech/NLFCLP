/**
 * Helper Script: Set Caregiver Burden Level
 * 
 * Quick script to set or update a caregiver's burden level for testing
 * reminder target audience filtering.
 * 
 * Usage:
 *   node set-caregiver-burden-level.js <caregiverId> <level>
 * 
 * Example:
 *   node set-caregiver-burden-level.js 67890abcdef12345 mild
 *   node set-caregiver-burden-level.js 67890abcdef12345 moderate
 *   node set-caregiver-burden-level.js 67890abcdef12345 severe
 *   node set-caregiver-burden-level.js 67890abcdef12345 null  (to remove level)
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nlfcp';

async function setCaregiverLevel() {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.log('❌ Usage: node set-caregiver-burden-level.js <caregiverId> <level>');
      console.log('\nValid levels: mild, moderate, severe, null');
      console.log('\nExamples:');
      console.log('  node set-caregiver-burden-level.js 67890abcdef12345 mild');
      console.log('  node set-caregiver-burden-level.js 67890abcdef12345 null');
      process.exit(1);
    }

    const caregiverId = args[0];
    const levelInput = args[1].toLowerCase();
    
    const validLevels = ['mild', 'moderate', 'severe', 'null'];
    if (!validLevels.includes(levelInput)) {
      console.log(`❌ Invalid level: ${levelInput}`);
      console.log(`Valid levels: ${validLevels.join(', ')}`);
      process.exit(1);
    }

    const level = levelInput === 'null' ? null : levelInput;

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const CaregiverProgram = mongoose.model('CaregiverProgram');

    // Try to find by string ID first
    let caregiver = await CaregiverProgram.findOne({ caregiverId });
    
    // If not found and ID looks like ObjectId, try as ObjectId
    if (!caregiver && mongoose.Types.ObjectId.isValid(caregiverId)) {
      caregiver = await CaregiverProgram.findOne({ 
        caregiverId: new mongoose.Types.ObjectId(caregiverId) 
      });
    }

    if (!caregiver) {
      console.log(`❌ Caregiver not found: ${caregiverId}\n`);
      
      // List available caregivers
      console.log('Available caregivers:');
      const caregivers = await CaregiverProgram.find({})
        .select('caregiverId burdenLevel')
        .limit(10);
      
      if (caregivers.length === 0) {
        console.log('  (No caregivers found in database)');
      } else {
        for (const c of caregivers) {
          console.log(`  - ID: ${c.caregiverId}, Level: ${c.burdenLevel || 'not set'}`);
        }
        if (caregivers.length === 10) {
          console.log('  ... (showing first 10 only)');
        }
      }
      
      await mongoose.connection.close();
      process.exit(1);
    }

    console.log('👤 Caregiver Found:');
    console.log(`   ID: ${caregiver.caregiverId}`);
    console.log(`   Current Burden Level: ${caregiver.burdenLevel || 'not set'}`);
    console.log('');

    // Update the level
    const oldLevel = caregiver.burdenLevel;
    caregiver.burdenLevel = level;
    await caregiver.save();

    console.log('✅ Successfully Updated!');
    console.log(`   Old Level: ${oldLevel || 'not set'}`);
    console.log(`   New Level: ${level || 'not set'}`);
    console.log('');

    // Show which reminders this caregiver can now receive
    console.log('📋 Checking eligible reminders...\n');

    const ProgramConfig = mongoose.model('ProgramConfig');
    const configs = await ProgramConfig.find({ configType: 'global' });

    let eligibleCount = 0;
    let totalReminders = 0;

    for (const config of configs) {
      if (!config.dynamicDays) continue;

      for (const day of config.dynamicDays) {
        if (day.contentByLevel) {
          for (const levelConfig of day.contentByLevel) {
            const reminders = (levelConfig.tasks || []).filter(
              task => task.taskType === 'reminder' && task.enabled
            );

            for (const reminder of reminders) {
              totalReminders++;
              const content = reminder.content || {};
              const targetAudience = content.targetAudience || 'all';
              const targetLevels = content.targetLevels || [];

              let eligible = false;
              
              if (targetAudience === 'all') {
                eligible = true;
              } else if (targetAudience === 'specific' && level) {
                if (targetLevels.includes(level)) {
                  eligible = true;
                }
              }

              if (eligible) {
                eligibleCount++;
                console.log(`✓ Day ${day.dayNumber}: ${reminder.title}`);
                console.log(`  Target: ${targetAudience === 'all' ? 'All caregivers' : targetLevels.join(', ')}`);
                console.log(`  Frequency: ${content.frequency || 'daily'} at ${content.reminderTime || '09:00'}`);
                console.log('');
              }
            }
          }
        }
      }
    }

    if (eligibleCount === 0) {
      console.log('❌ No eligible reminders found for this caregiver level');
      if (!level) {
        console.log('   (Caregiver has no level set - only "All Caregivers" reminders will work)');
      }
    } else {
      console.log(`\n📊 Summary: ${eligibleCount} out of ${totalReminders} reminders are eligible`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
setCaregiverLevel();
