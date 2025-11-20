/**
 * Debug Reminder Issue
 * Check why reminders aren't firing
 */

import mongoose from 'mongoose';
import ProgramConfig from './models/ProgramConfig.js';
import CaregiverProgram from './models/CaregiverProgram.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nlfcp';

async function debugReminders() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find the test caregiver
    let caregiver = await CaregiverProgram.findOne({ caregiverId: '6911d20e8d8b7c2404583fe4' });
    if (!caregiver) {
      caregiver = await CaregiverProgram.findOne({ caregiverId: new mongoose.Types.ObjectId('6911d20e8d8b7c2404583fe4') });
    }
    if (!caregiver) {
      console.log('❌ Caregiver not found');
      console.log('Listing first 3 caregivers:');
      const all = await CaregiverProgram.find({}).limit(3).select('caregiverId');
      all.forEach(c => console.log(`   - ${c.caregiverId}`));
      return;
    }

    console.log('👤 Caregiver Info:');
    console.log(`   ID: ${caregiver.caregiverId}`);
    console.log(`   Burden Level: ${caregiver.burdenLevel || 'NOT SET'}`);
    console.log(`   Language: ${caregiver.language || 'english'}`);
    console.log('');

    // Find all reminders
    const config = await ProgramConfig.findOne({ configType: 'global' });
    if (!config) {
      console.log('❌ No program config found');
      return;
    }

    const dayConfig = config.dynamicDays?.find(d => d.dayNumber === 0 && d.language === 'english');
    if (!dayConfig) {
      console.log('❌ No config for Day 0');
      return;
    }

    console.log('📅 Day 0 Config:');
    console.log(`   Enabled: ${dayConfig.enabled}`);
    console.log(`   Has ${dayConfig.contentByLevel?.length || 0} level configs`);
    console.log('');

    const levelConfig = dayConfig.contentByLevel?.find(l => l.levelKey === 'default');
    if (!levelConfig) {
      console.log('❌ No default level config');
      return;
    }

    const reminders = (levelConfig.tasks || []).filter(t => t.taskType === 'reminder' && t.enabled);
    console.log(`⏰ Found ${reminders.length} active reminders\n`);

    for (const reminder of reminders) {
      const content = reminder.content || {};
      const now = new Date();
      
      console.log(`📋 Reminder: ${reminder.title}`);
      console.log(`   Message: ${content.reminderMessage}`);
      console.log(`   Target: ${content.targetAudience || 'all'} ${content.targetAudience === 'specific' ? `[${(content.targetLevels || []).join(', ')}]` : ''}`);
      console.log(`   Frequency: ${content.frequency || 'daily'}`);
      console.log(`   Time: ${content.reminderTime || '09:00'}`);
      
      if (content.frequency === 'custom') {
        console.log(`   Interval: ${content.customInterval || 60} minutes`);
      }
      
      const lastNotif = caregiver.lastNotifications?.[reminder.taskId];
      console.log(`   Last notification: ${lastNotif ? new Date(lastNotif).toISOString() : 'NEVER'}`);
      console.log(`   Current time: ${now.toISOString()} (${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')})`);
      
      // Check if it should fire
      const targetAudience = content.targetAudience || 'all';
      const targetLevels = content.targetLevels || [];
      let shouldFire = false;
      let reason = '';
      
      // Target audience check
      if (targetAudience === 'specific') {
        if (!caregiver.burdenLevel) {
          reason = '❌ Caregiver has no burden level';
        } else if (!targetLevels.includes(caregiver.burdenLevel)) {
          reason = `❌ Level '${caregiver.burdenLevel}' not in targets`;
        } else {
          reason = '✅ Level matches';
        }
      } else {
        reason = '✅ All caregivers';
      }
      
      console.log(`   Audience check: ${reason}`);
      
      // Time check for testing
      const [targetHour, targetMin] = (content.reminderTime || '09:00').split(':').map(Number);
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      
      const timeDiff = Math.abs((currentHour * 60 + currentMin) - (targetHour * 60 + targetMin));
      console.log(`   Time diff: ${timeDiff} minutes (${currentHour}:${String(currentMin).padStart(2, '0')} vs ${targetHour}:${String(targetMin).padStart(2, '0')})`);
      console.log(`   Within 1 min window: ${timeDiff <= 1 ? '✅ YES' : '❌ NO'}`);
      
      console.log('');
    }

    // Suggest fixes
    console.log('\n💡 Suggestions:');
    console.log('1. Set caregiver burden level for testing:');
    console.log(`   node set-caregiver-burden-level.js ${caregiver.caregiverId} mild`);
    console.log('');
    console.log('2. Set reminder time to current time + 1 minute in admin UI');
    console.log('');
    console.log('3. Or use custom frequency with 1 minute interval for immediate testing');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

debugReminders();
