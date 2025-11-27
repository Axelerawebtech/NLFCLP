/*
 * Migration script to backfill the unified dynamicDayStructures/dynamicDayTranslations
 * collections from the legacy language-specific dynamicDays payloads.
 *
 * Usage:
 *   node scripts/migrate-dynamic-day-structures.js [--dry-run] [--force] [--force-structures] [--force-translations] [--config <id>]
 *
 * Flags:
 *   --dry-run             : Runs the migration logic without persisting any changes.
 *   --force               : Rebuilds both structures and translations even if they exist.
 *   --force-structures    : Rebuilds only the structures when they already exist.
 *   --force-translations  : Rebuilds only the translations when they already exist.
 *   --config <id>         : Limits migration to a single ProgramConfig document.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const SUPPORTED_LANGUAGES = ['english', 'kannada', 'hindi'];
const DEFAULT_ENV_PATHS = ['.env.local', '.env'];

function loadEnv() {
  for (const candidate of DEFAULT_ENV_PATHS) {
    if (fs.existsSync(candidate)) {
      dotenv.config({ path: candidate });
      return;
    }
  }
  dotenv.config();
}

loadEnv();

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set. Please update your .env.local or .env file.');
  process.exit(1);
}

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const forceStructures = args.includes('--force') || args.includes('--force-structures');
const forceTranslations = args.includes('--force') || args.includes('--force-translations');

function getArgValue(flag) {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  return args[index + 1] || null;
}

const configIdFilter = getArgValue('--config');

const ProgramConfigSchema = new mongoose.Schema({
  dynamicDays: { type: Array, default: [] },
  dynamicDayStructures: { type: Array, default: [] },
  dynamicDayTranslations: { type: Array, default: [] }
}, { strict: false });

const ProgramConfig = mongoose.models.ProgramConfig
  || mongoose.model('ProgramConfig', ProgramConfigSchema, 'programconfigs');

function normalizeLanguage(language = 'english') {
  const normalized = (language || '').toString().trim().toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(normalized)) {
    return normalized;
  }
  return 'english';
}

function toPlain(value) {
  if (!value) return value;
  if (typeof value.toObject === 'function') {
    return value.toObject();
  }
  return JSON.parse(JSON.stringify(value));
}

function sortByNumericKey(collection = [], key = 'taskOrder') {
  return [...(collection || [])].sort((a, b) => {
    const aValue = a?.[key];
    const bValue = b?.[key];
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    return Number(aValue) - Number(bValue);
  });
}

function sanitizeKey(value, fallback) {
  const source = (value && value.toString().trim()) || fallback;
  return source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

function generateTaskId(dayNumber, levelKey, taskOrder, taskIndex) {
  const safeLevel = sanitizeKey(levelKey || `level-${taskIndex + 1}`, `level-${taskIndex + 1}`);
  const safeOrder = Number.isFinite(taskOrder) ? Number(taskOrder) : (taskIndex + 1);
  return `day${dayNumber}_${safeLevel}_${safeOrder}_${taskIndex + 1}`;
}

function ensureLevels(legacyDay) {
  if (Array.isArray(legacyDay?.contentByLevel) && legacyDay.contentByLevel.length > 0) {
    return legacyDay.contentByLevel;
  }
  // Fallback: treat top-level tasks (if any) as default level content.
  if (Array.isArray(legacyDay?.tasks) && legacyDay.tasks.length > 0) {
    return [{
      levelKey: 'default',
      levelLabel: 'Default',
      tasks: legacyDay.tasks
    }];
  }
  return [];
}

function buildStructureFromLegacyDay(dayNumber, baseLanguage, legacyDay = {}) {
  const contentLevels = ensureLevels(legacyDay).map((level, levelIndex) => {
    const levelKey = (level?.levelKey && level.levelKey.trim())
      ? level.levelKey.trim()
      : (level?.levelLabel && level.levelLabel.trim())
        ? sanitizeKey(level.levelLabel, `level-${levelIndex + 1}`)
        : `level-${levelIndex + 1}`;

    const tasks = sortByNumericKey(level?.tasks || [], 'taskOrder').map((task, taskIndex) => {
      const taskOrder = Number.isFinite(task?.taskOrder)
        ? Number(task.taskOrder)
        : (taskIndex + 1);
      return {
        taskId: task?.taskId || generateTaskId(dayNumber, levelKey, taskOrder, taskIndex),
        taskType: task?.taskType || 'video',
        taskOrder,
        title: task?.title || '',
        description: task?.description || '',
        content: task?.content || {},
        enabled: task?.enabled !== false,
        createdAt: task?.createdAt ? new Date(task.createdAt) : new Date()
      };
    });

    return {
      levelKey,
      levelLabel: level?.levelLabel || '',
      tasks
    };
  });

  const structure = {
    dayNumber,
    baseLanguage,
    dayName: legacyDay?.dayName || '',
    hasTest: Boolean(legacyDay?.hasTest && legacyDay?.testConfig),
    enabled: legacyDay?.enabled !== false,
    testStructure: null,
    contentLevels,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  if (structure.hasTest) {
    structure.testStructure = {
      testName: legacyDay?.testConfig?.testName || '',
      testType: legacyDay?.testConfig?.testType || 'custom',
      questionSequence: (legacyDay?.testConfig?.questions || []).map((question, questionIndex) => {
        const questionId = Number.isFinite(question?.id)
          ? Number(question.id)
          : (question?.questionId ?? questionIndex + 1);
        return {
          questionId,
          questionText: question?.questionText || '',
          enabled: question?.enabled !== false,
          options: (question?.options || []).map((option, optionIndex) => ({
            optionKey: option?.optionKey || `q${questionId}_opt${optionIndex + 1}`,
            optionText: option?.optionText || '',
            score: Number.isFinite(option?.score) ? Number(option.score) : 0
          }))
        };
      }),
      scoreRanges: (legacyDay?.testConfig?.scoreRanges || []).map((range, rangeIndex) => ({
        levelKey: range?.levelKey || `level-${rangeIndex + 1}`,
        rangeName: range?.rangeName || '',
        label: range?.label || '',
        minScore: Number.isFinite(range?.minScore) ? Number(range.minScore) : 0,
        maxScore: Number.isFinite(range?.maxScore) ? Number(range.maxScore) : 0
      }))
    };
  }

  return structure;
}

function matchTranslationTask(baseTask, candidateTasks = [], fallbackIndex = 0) {
  return candidateTasks.find(task => task?.taskId && task.taskId === baseTask.taskId)
    || candidateTasks.find(task => Number(task?.taskOrder) === Number(baseTask.taskOrder))
    || candidateTasks[fallbackIndex]
    || null;
}

function buildTestTranslation(legacyDay, baseStructure) {
  if (!baseStructure?.hasTest || !baseStructure?.testStructure) {
    return null;
  }

  const legacyTestConfig = (legacyDay?.hasTest && legacyDay?.testConfig)
    ? legacyDay.testConfig
    : null;

  const questionLookup = new Map();
  (legacyTestConfig?.questions || []).forEach((question) => {
    const questionId = Number.isFinite(question?.id)
      ? Number(question.id)
      : (question?.questionId ?? null);
    if (questionId != null) {
      questionLookup.set(questionId, question);
    }
  });

  const scoreRangeLookup = new Map();
  (legacyTestConfig?.scoreRanges || []).forEach((range) => {
    if (range?.levelKey) {
      scoreRangeLookup.set(range.levelKey, range);
    }
  });

  return {
    testName: legacyTestConfig?.testName || '',
    questions: baseStructure.testStructure.questionSequence.map((baseQuestion, questionIndex) => {
      const sourceQuestion = questionLookup.get(baseQuestion.questionId)
        || (legacyTestConfig?.questions || [])[questionIndex]
        || null;
      const options = (baseQuestion.options || []).map((baseOption, optionIndex) => {
        const sourceOption = sourceQuestion?.options?.find(opt => opt?.optionKey === baseOption.optionKey)
          || sourceQuestion?.options?.[optionIndex]
          || null;
        return {
          optionKey: baseOption.optionKey,
          optionText: sourceOption?.optionText || ''
        };
      });
      return {
        questionId: baseQuestion.questionId,
        questionText: sourceQuestion?.questionText || '',
        options
      };
    }),
    scoreRanges: baseStructure.testStructure.scoreRanges.map((baseRange, rangeIndex) => {
      const sourceRange = scoreRangeLookup.get(baseRange.levelKey)
        || (legacyTestConfig?.scoreRanges || [])[rangeIndex]
        || null;
      return {
        levelKey: baseRange.levelKey,
        label: sourceRange?.label || ''
      };
    })
  };
}

function buildTranslationFromLegacyDay(dayNumber, language, legacyDay, baseStructure) {
  const translation = {
    dayNumber,
    language,
    dayName: legacyDay?.dayName || '',
    testContent: buildTestTranslation(legacyDay, baseStructure),
    levelContent: [],
    updatedAt: new Date()
  };

  const legacyLevels = ensureLevels(legacyDay);
  const legacyLevelsByKey = new Map();
  legacyLevels.forEach((level, index) => {
    const key = (level?.levelKey && level.levelKey.trim())
      ? level.levelKey.trim()
      : (level?.levelLabel && level.levelLabel.trim())
        ? sanitizeKey(level.levelLabel, `level-${index + 1}`)
        : `level-${index + 1}`;
    legacyLevelsByKey.set(key, level);
  });

  translation.levelContent = (baseStructure?.contentLevels || []).map((baseLevel, levelIndex) => {
    const legacyLevel = legacyLevelsByKey.get(baseLevel.levelKey) || legacyLevels[levelIndex] || null;
    const tasks = (baseLevel?.tasks || []).map((baseTask, taskIndex) => {
      const legacyTask = matchTranslationTask(baseTask, legacyLevel?.tasks || [], taskIndex);
      return {
        taskId: baseTask.taskId,
        title: legacyTask?.title || '',
        description: legacyTask?.description || '',
        contentOverrides: legacyTask?.content || {}
      };
    });
    return {
      levelKey: baseLevel.levelKey,
      levelLabel: legacyLevel?.levelLabel || baseLevel.levelLabel || '',
      tasks
    };
  });

  return translation;
}

function groupLegacyDays(dynamicDays = []) {
  const groups = new Map();
  dynamicDays.forEach((day) => {
    if (!day || day.dayNumber == null) {
      return;
    }
    const dayNumber = Number(day.dayNumber);
    if (!groups.has(dayNumber)) {
      groups.set(dayNumber, new Map());
    }
    const lang = normalizeLanguage(day.language);
    groups.get(dayNumber).set(lang, day);
  });
  return groups;
}

async function migrateConfig(configDoc) {
  const legacyDays = (configDoc.dynamicDays || []).map(toPlain);
  if (!legacyDays.length) {
    return { skipped: true, reason: 'No legacy dynamicDays present.' };
  }

  const structuresMap = new Map((configDoc.dynamicDayStructures || []).map((entry) => [Number(entry.dayNumber), toPlain(entry)]));
  const translationMap = new Map((configDoc.dynamicDayTranslations || []).map((entry) => [`${Number(entry.dayNumber)}:${entry.language}`, toPlain(entry)]));

  const summary = {
    createdStructures: 0,
    updatedStructures: 0,
    skippedStructures: 0,
    createdTranslations: 0,
    updatedTranslations: 0,
    skippedTranslations: 0
  };

  const groupedDays = groupLegacyDays(legacyDays);

  for (const [dayNumber, langMap] of groupedDays.entries()) {
    const availableLanguages = Array.from(langMap.keys());
    const baseLanguage = availableLanguages.includes('english')
      ? 'english'
      : availableLanguages[0];
    const baseDay = langMap.get(baseLanguage);

    if (!baseDay) {
      console.warn(`⚠️  Skipping day ${dayNumber}: unable to identify base language payload.`);
      continue;
    }

    const existingStructure = structuresMap.get(dayNumber);
    if (existingStructure && !forceStructures) {
      summary.skippedStructures += 1;
    } else {
      const structure = buildStructureFromLegacyDay(dayNumber, baseLanguage, baseDay);
      if (existingStructure) {
        structure.createdAt = existingStructure.createdAt ? new Date(existingStructure.createdAt) : structure.createdAt;
        summary.updatedStructures += 1;
      } else {
        summary.createdStructures += 1;
      }
      structuresMap.set(dayNumber, structure);
    }

    const baseStructure = structuresMap.get(dayNumber);
    for (const [language, languageDay] of langMap.entries()) {
      const translationKey = `${dayNumber}:${language}`;
      const existingTranslation = translationMap.get(translationKey);
      if (existingTranslation && !forceTranslations) {
        summary.skippedTranslations += 1;
        continue;
      }
      const translation = buildTranslationFromLegacyDay(dayNumber, language, languageDay, baseStructure);
      if (existingTranslation) {
        summary.updatedTranslations += 1;
      } else {
        summary.createdTranslations += 1;
      }
      translationMap.set(translationKey, translation);
    }
  }

  const nextStructures = Array.from(structuresMap.values()).sort((a, b) => a.dayNumber - b.dayNumber);
  const nextTranslations = Array.from(translationMap.values()).sort((a, b) => {
    if (a.dayNumber === b.dayNumber) {
      return a.language.localeCompare(b.language);
    }
    return a.dayNumber - b.dayNumber;
  });

  if (!isDryRun) {
    configDoc.dynamicDayStructures = nextStructures;
    configDoc.dynamicDayTranslations = nextTranslations;
    configDoc.markModified('dynamicDayStructures');
    configDoc.markModified('dynamicDayTranslations');
    await configDoc.save();
  }

  return summary;
}

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected. Starting migration...');

    const query = configIdFilter ? { _id: configIdFilter } : {};
    const configs = await ProgramConfig.find(query);
    if (!configs.length) {
      console.log('ℹ️  No ProgramConfig documents matched the provided criteria.');
      return;
    }

    for (const config of configs) {
      console.log(`\n➡️  Processing ProgramConfig ${config._id} (${config.configType || 'global'})`);
      const result = await migrateConfig(config);
      if (result.skipped) {
        console.log(`   Skipped: ${result.reason}`);
        continue;
      }
      console.log('   Migration summary:');
      console.table([{ configId: config._id.toString(), ...result }]);
    }

    if (isDryRun) {
      console.log('\n📝 Dry run complete. No changes were persisted.');
    } else {
      console.log('\n🎉 Migration complete.');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed.');
  }
}

run();
