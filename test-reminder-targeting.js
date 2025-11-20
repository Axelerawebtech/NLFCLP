/**
 * Test Script: Reminder Target Audience Filtering
 * 
 * This script helps verify that reminders are correctly filtered
 * based on caregiver burden/stress levels.
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nlfcp';

async function testReminderTargeting() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const ProgramConfig = mongoose.model('ProgramConfig');
    const CaregiverProgram = mongoose.model('CaregiverProgram');

    // Find all reminder tasks
    console.log('📋 Finding all reminder tasks...\n');
    const configs = await ProgramConfig.find({ configType: 'global' });
    
    for (const config of configs) {
      if (!config.dynamicDays) continue;

      for (const day of config.dynamicDays) {
        const reminderTasks = [];
        
        if (day.contentByLevel) {
          for (const level of day.contentByLevel) {
            const reminders = (level.tasks || []).filter(
              task => task.taskType === 'reminder' && task.enabled
            );
            reminderTasks.push(...reminders.map(r => ({ ...r, levelKey: level.levelKey })));
          }
        }

        if (reminderTasks.length > 0) {
          console.log(`📅 Day ${day.dayNumber} (${day.language}):`);
          
          for (const task of reminderTasks) {
            const content = task.content || {};
            const targetAudience = content.targetAudience || 'all';
            const targetLevels = content.targetLevels || [];
            
            console.log(`  ⏰ ${task.title}`);
            console.log(`     Message: ${content.reminderMessage}`);
            console.log(`     Frequency: ${content.frequency || 'daily'} at ${content.reminderTime || '09:00'}`);
            console.log(`     Target Audience: ${targetAudience}`);
            
            if (targetAudience === 'specific') {
              console.log(`     Target Levels: ${targetLevels.length > 0 ? targetLevels.join(', ') : 'NONE (⚠️ warning)'}`);
              
              if (targetLevels.length === 0) {
                console.log(`     ⚠️  WARNING: No target levels selected - no one will receive this!`);
              }
            } else {
              console.log(`     Target Levels: All caregivers`);
            }
            console.log('');
          }
        }
      }
    }

    // Test with sample caregivers
    console.log('\n👥 Testing with sample caregivers:\n');
    
    const sampleCaregivers = await CaregiverProgram.find({}).limit(5).select('caregiverId burdenLevel');
    
    if (sampleCaregivers.length === 0) {
      console.log('⚠️  No caregivers found in database');
    } else {
      for (const caregiver of sampleCaregivers) {
        console.log(`\n👤 Caregiver: ${caregiver.caregiverId}`);
        console.log(`   Burden Level: ${caregiver.burdenLevel || 'NOT ASSIGNED'}`);
        
        // Simulate reminder filtering
        const eligibleReminders = [];
        
        for (const config of configs) {
          if (!config.dynamicDays) continue;

          for (const day of config.dynamicDays) {
            if (day.contentByLevel) {
              for (const level of day.contentByLevel) {
                const reminders = (level.tasks || []).filter(
                  task => task.taskType === 'reminder' && task.enabled
                );

                for (const reminder of reminders) {
                  const content = reminder.content || {};
                  const targetAudience = content.targetAudience || 'all';
                  const targetLevels = content.targetLevels || [];

                  // Apply filtering logic
                  let eligible = false;
                  
                  if (targetAudience === 'all') {
                    eligible = true;
                  } else if (targetAudience === 'specific') {
                    if (caregiver.burdenLevel && targetLevels.includes(caregiver.burdenLevel)) {
                      eligible = true;
                    }
                  }

                  if (eligible) {
                    eligibleReminders.push({
                      day: day.dayNumber,
                      title: reminder.title,
                      targetAudience,
                      targetLevels
                    });
                  }
                }
              }
            }
          }
        }

        console.log(`   Eligible Reminders: ${eligibleReminders.length}`);
        for (const reminder of eligibleReminders) {
          console.log(`      ✓ Day ${reminder.day}: ${reminder.title} (${reminder.targetAudience})`);
        }
        
        if (eligibleReminders.length === 0) {
          console.log(`      ❌ No reminders match this caregiver's level`);
        }
      }
    }

    // Summary statistics
    console.log('\n\n📊 Summary Statistics:\n');
    
    let totalReminders = 0;
    let allAudienceCount = 0;
    let specificAudienceCount = 0;
    let mildCount = 0;
    let moderateCount = 0;
    let severeCount = 0;

    for (const config of configs) {
      if (!config.dynamicDays) continue;

      for (const day of config.dynamicDays) {
        if (day.contentByLevel) {
          for (const level of day.contentByLevel) {
            const reminders = (level.tasks || []).filter(
              task => task.taskType === 'reminder' && task.enabled
            );

            for (const reminder of reminders) {
              totalReminders++;
              const content = reminder.content || {};
              const targetAudience = content.targetAudience || 'all';
              const targetLevels = content.targetLevels || [];

              if (targetAudience === 'all') {
                allAudienceCount++;
              } else {
                specificAudienceCount++;
                if (targetLevels.includes('mild')) mildCount++;
                if (targetLevels.includes('moderate')) moderateCount++;
                if (targetLevels.includes('severe')) severeCount++;
              }
            }
          }
        }
      }
    }

    console.log(`Total Reminders: ${totalReminders}`);
    console.log(`  🌍 All Caregivers: ${allAudienceCount}`);
    console.log(`  🎯 Specific Groups: ${specificAudienceCount}`);
    if (specificAudienceCount > 0) {
      console.log(`     - 🟢 Targeting Mild: ${mildCount}`);
      console.log(`     - 🟡 Targeting Moderate: ${moderateCount}`);
      console.log(`     - 🔴 Targeting Severe: ${severeCount}`);
    }

    console.log('\n✅ Test complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testReminderTargeting();
