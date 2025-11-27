import dbConnect from '../../../lib/mongodb';
import ProgramConfig from '../../../models/ProgramConfig';
import CaregiverProgram from '../../../models/CaregiverProgramEnhanced';
import Caregiver from '../../../models/Caregiver';
import {
  getStructureForDay,
  getTranslationForDay,
  composeDayConfig
} from '../../../lib/dynamicDayUtils';

/**
 * API Route: /api/caregiver/check-reminders
 * Method: GET
 * 
 * Purpose: Check for pending reminders for a caregiver
 * - Fetches reminder tasks from dynamic day content
 * - Checks if reminder should fire based on schedule
 * - Returns list of reminders to show
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed' 
    });
  }

  await dbConnect();

  try {
    const { caregiverId, day } = req.query;

    if (!caregiverId || day === undefined) {
      return res.status(400).json({ 
        success: false,
        error: 'Caregiver ID and day are required' 
      });
    }

    const dayNumber = parseInt(day);

    // Resolve caregiver and associated program (supports string IDs and Mongo ObjectIds)
    let caregiverDoc = await Caregiver.findOne({ caregiverId });
    if (!caregiverDoc && /^[0-9a-fA-F]{24}$/.test(caregiverId)) {
      caregiverDoc = await Caregiver.findById(caregiverId);
    }

    if (!caregiverDoc) {
      return res.status(404).json({
        success: false,
        error: 'Caregiver not found'
      });
    }

    let caregiverProgram = await CaregiverProgram.findOne({ caregiverId: caregiverDoc._id });
    if (!caregiverProgram) {
      return res.json({ success: true, reminders: [] });
    }

    // Initialize lastNotifications if not exists
    if (!caregiverProgram.lastNotifications) {
      caregiverProgram.lastNotifications = {};
    }

    // Get language preference
    const preferredLanguages = buildLanguagePreferenceOrder(caregiverProgram.language);

    // Get global config
    const config = await ProgramConfig.findOne({ configType: 'global' });
    if (!config) {
      return res.json({ success: true, reminders: [] });
    }

    // Find day configuration (supports unified dynamic day structures)
    const dayConfig = resolveDayConfig({
      config,
      dayNumber,
      preferredLanguages
    });
    
    if (!dayConfig || dayConfig.enabled === false) {
      return res.json({ success: true, reminders: [] });
    }

    // Determine level
    let levelKey = 'default';
    if (dayConfig.hasTest && dayConfig.testConfig?.scoreRanges && caregiverProgram.burdenLevel) {
      const matchingRange = dayConfig.testConfig.scoreRanges.find(
        range => range.levelKey === caregiverProgram.burdenLevel
      );
      if (matchingRange) {
        levelKey = matchingRange.levelKey;
      }
    }

    // Get content for level
    const levelConfig = dayConfig.contentByLevel?.find(l => l.levelKey === levelKey);
    if (!levelConfig) {
      return res.json({ success: true, reminders: [] });
    }

    // Filter reminder tasks
    const reminderTasks = (levelConfig.tasks || [])
      .filter(task => task.enabled && task.taskType === 'reminder');

    const now = new Date();
    const remindersToShow = [];

    // Get caregiver's current burden/stress level for filtering
    const caregiverLevel = caregiverProgram.burdenLevel || null;

    console.log(`\n🔔 Checking reminders for caregiver ${caregiverId}, day ${dayNumber}`);
    console.log(`   Caregiver level: ${caregiverLevel || 'NOT SET'}`);
    console.log(`   Found ${reminderTasks.length} reminder tasks`);
    console.log(`   Current time: ${now.toISOString()} (${now.getHours()}:${now.getMinutes()})`);

    for (const task of reminderTasks) {
      const content = task.content || {};
      const taskId = task.taskId;
      
      console.log(`\n  📋 Checking reminder: ${task.title}`);
      console.log(`     Task ID: ${taskId}`);
      
      if (!content.reminderMessage) {
        console.log(`     ❌ SKIP: No reminder message`);
        continue;
      }

      // Check if this reminder is targeted to specific groups
      const targetAudience = content.targetAudience || 'all';
      const targetLevels = content.targetLevels || [];

      console.log(`     Target: ${targetAudience} ${targetAudience === 'specific' ? `(${targetLevels.join(', ')})` : ''}`);

      // Filter by target audience
      if (targetAudience === 'specific') {
        // If specific groups are targeted but caregiver has no level yet, skip
        if (!caregiverLevel) {
          console.log(`     ❌ SKIP: Caregiver has no level, but reminder targets specific groups`);
          continue;
        }
        
        // If caregiver's level is not in the target list, skip
        if (!targetLevels.includes(caregiverLevel)) {
          console.log(`     ❌ SKIP: Caregiver level '${caregiverLevel}' not in targets [${targetLevels.join(', ')}]`);
          continue;
        }
        
        console.log(`     ✅ MATCH: Caregiver level '${caregiverLevel}' is in targets`);
      } else {
        console.log(`     ✅ MATCH: Reminder targets all caregivers`);
      }

      // Get last notification time for this task
      const lastNotifTime = caregiverProgram.lastNotifications[taskId];
      
      console.log(`     Schedule: ${content.frequency || 'daily'} at ${content.reminderTime || '09:00'}`);
      console.log(`     Last notif: ${lastNotifTime ? new Date(lastNotifTime).toISOString() : 'NEVER'}`);
      
      // Check if reminder should fire based on schedule
      const shouldFire = checkReminderSchedule(
        content,
        lastNotifTime ? new Date(lastNotifTime) : null,
        now
      );

      console.log(`     Should fire: ${shouldFire ? '✅ YES' : '❌ NO'}`);

      if (shouldFire) {
        remindersToShow.push({
          id: taskId,
          title: task.title || 'Reminder',
          message: content.reminderMessage,
          frequency: content.frequency || 'daily',
          time: content.reminderTime || '09:00',
          targetAudience: targetAudience,
          targetLevels: targetLevels
        });

        // Update last notification time
        caregiverProgram.lastNotifications[taskId] = now.toISOString();
      }
    }

    // Save updated notification times
    if (remindersToShow.length > 0) {
      caregiverProgram.markModified('lastNotifications');
      await caregiverProgram.save();
    }

    res.status(200).json({
      success: true,
      reminders: remindersToShow
    });

  } catch (error) {
    console.error('Error checking reminders:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to check reminders',
      details: error.message 
    });
  }
}

/**
 * Check if reminder should fire based on schedule
 */
function checkReminderSchedule(content, lastNotifTime, now) {
  const frequency = content.frequency || 'daily';
  const reminderTime = content.reminderTime || '09:00';
  const [hours, minutes] = reminderTime.split(':').map(Number);

  // If never sent before, check if current time matches schedule
  if (!lastNotifTime) {
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Check if within 1 minute of scheduled time
    if (Math.abs(currentHour - hours) === 0 && Math.abs(currentMinute - minutes) <= 1) {
      if (frequency === 'daily') {
        return true;
      } else if (frequency === 'weekly') {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = dayNames[now.getDay()];
        const weekDays = content.weekDays || [];
        return weekDays.includes(currentDay);
      } else if (frequency === 'custom') {
        return true; // For custom, first notification fires immediately
      }
    }
    return false;
  }

  // Calculate time since last notification
  const timeSinceLastNotif = now - lastNotifTime;
  const minutesSinceLastNotif = timeSinceLastNotif / (1000 * 60);

  if (frequency === 'daily') {
    // Fire if more than 23 hours since last notification and current time matches
    const hoursSinceLastNotif = timeSinceLastNotif / (1000 * 60 * 60);
    if (hoursSinceLastNotif >= 23) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      return Math.abs(currentHour - hours) === 0 && Math.abs(currentMinute - minutes) <= 1;
    }
  } else if (frequency === 'weekly') {
    // Fire if more than 6.9 days since last notification, correct day, and time matches
    const daysSinceLastNotif = timeSinceLastNotif / (1000 * 60 * 60 * 24);
    if (daysSinceLastNotif >= 6.9) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDay = dayNames[now.getDay()];
      const weekDays = content.weekDays || [];
      
      if (weekDays.includes(currentDay)) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        return Math.abs(currentHour - hours) === 0 && Math.abs(currentMinute - minutes) <= 1;
      }
    }
  } else if (frequency === 'custom') {
    // Fire if interval has passed
    const customInterval = content.customInterval || 60;
    return minutesSinceLastNotif >= customInterval;
  }

  return false;
}

const LANGUAGE_PRIORITY = ['english', 'kannada', 'hindi'];
const LANGUAGE_ALIASES = {
  en: 'english',
  english: 'english',
  hi: 'hindi',
  hindi: 'hindi',
  kn: 'kannada',
  kannada: 'kannada'
};

function buildLanguagePreferenceOrder(language) {
  if (typeof language === 'string') {
    const normalized = language.toLowerCase();
    const canonical = LANGUAGE_ALIASES[normalized];
    if (canonical) {
      return [canonical, ...LANGUAGE_PRIORITY.filter(lang => lang !== canonical)];
    }
  }
  return [...LANGUAGE_PRIORITY];
}

function hasUnifiedDynamicDayStructures(config) {
  return Array.isArray(config?.dynamicDayStructures) && config.dynamicDayStructures.length > 0;
}

function resolveDayConfig({ config, dayNumber, preferredLanguages = [] }) {
  if (!config) return null;

  if (!preferredLanguages.length) {
    preferredLanguages = [...LANGUAGE_PRIORITY];
  }

  if (hasUnifiedDynamicDayStructures(config)) {
    const structure = getStructureForDay(config, dayNumber);
    if (!structure) return null;

    let translation = null;
    for (const lang of preferredLanguages) {
      const candidate = getTranslationForDay(config, dayNumber, lang);
      if (candidate) {
        translation = candidate;
        break;
      }
    }

    return composeDayConfig(structure, translation);
  }

  if (!config.dynamicDays?.length) {
    return null;
  }

  for (const lang of preferredLanguages) {
    const match = config.dynamicDays.find(entry => entry.dayNumber === dayNumber && entry.language === lang);
    if (match) {
      return match;
    }
  }

  return null;
}
