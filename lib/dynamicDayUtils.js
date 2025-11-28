const SUPPORTED_LANGUAGES = ['english', 'kannada', 'hindi'];

const cloneDeep = (value) => (value === null || value === undefined)
  ? value
  : JSON.parse(JSON.stringify(value));

const normalizeLanguage = (language = 'english') => {
  const normalized = language.toLowerCase();
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : 'english';
};

const normalizeLevelKey = (value = '') => {
  if (!value && value !== 0) return '';
  return value.toString().trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

const buildLevelAliasSet = (level = {}) => {
  const aliases = new Set();
  const addAlias = (val) => {
    const normalized = normalizeLevelKey(val);
    if (normalized) aliases.add(normalized);
  };

  addAlias(level.levelKey);
  addAlias(level.levelLabel);

  // Some content uses semantic names like "normal-stress"; derive short forms
  if (level.levelLabel) {
    const stripped = level.levelLabel.toLowerCase().replace(/level|stress|burden|content|tasks?/g, '').trim();
    addAlias(stripped);
  }

  return aliases;
};

const findMatchingLevel = (levels = [], structureLevel) => {
  if (!structureLevel) return null;
  const targetAliases = buildLevelAliasSet(structureLevel);
  return levels.find(level => {
    const levelAliases = buildLevelAliasSet(level);
    for (const alias of targetAliases) {
      if (levelAliases.has(alias)) {
        return true;
      }
    }
    return false;
  }) || null;
};

export const mapArrayBy = (arr = [], key = 'levelKey') => {
  const map = new Map();
  arr?.forEach(item => {
    if (item && item[key] !== undefined) {
      map.set(item[key], item);
    }
  });
  return map;
};

const ensureTaskId = (task = {}, index = 0) => {
  if (task.taskId) return task.taskId;
  return `task_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`;
};

const buildFollowupTaskId = ({
  dayNumber,
  questionId,
  optionKey,
  optionIndex
}) => {
  const dayPart = typeof dayNumber === 'number' ? `day${dayNumber}` : 'day';
  const questionPart = normalizeIdentifier(questionId) || `q${(optionIndex ?? 0) + 1}`;
  const optionPart = normalizeIdentifier(optionKey) || `opt${(optionIndex ?? 0) + 1}`;
  return `${dayPart}_${questionPart}_${optionPart}_followup`;
};

const getContentForInference = (task = {}) => {
  if (task.content && typeof task.content === 'object') return task.content;
  if (task.contentOverrides && typeof task.contentOverrides === 'object') return task.contentOverrides;
  return null;
};

export const inferTaskTypeFromContent = (task = {}) => {
  const content = getContentForInference(task);
  if (!content) return null;

  const has = (key) => Boolean(content[key]);
  const hasArray = (key) => Array.isArray(content[key]) && content[key].length > 0;

  if (has('calmingVideo') || has('calmingTrack')) return 'calming-video';
  if (has('videoUrl')) return 'video';
  if (has('audioUrl')) return 'audio-message';
  if (hasArray('questions')) return 'quick-assessment';
  if (hasArray('activities')) return 'activity-selector';
  if (has('fieldType') || has('placeholder') || has('problemLabel') || has('solutionLabel')) return 'interactive-field';
  if (has('reminderMessage') || has('reminderTime') || has('frequency') || has('weekDays') || has('customInterval')) return 'reminder';
  if (has('reflectionQuestion') || has('sliderLeftLabel') || has('sliderRightLabel')) return 'reflection-prompt';
  if (has('feelingQuestion')) return 'feeling-check';
  if (hasArray('checklistItems') || has('checklistQuestion')) return 'task-checklist';
  if (has('imageUrl')) return 'visual-cue';
  if (has('textContent')) return 'motivation-message';
  return null;
};

const toPlainObject = (value) => {
  if (!value) return null;
  if (typeof value.toObject === 'function') {
    // Convert mongoose documents/subdocuments into plain JSON we can safely mutate
    return value.toObject({ depopulate: true, getters: false, virtuals: false });
  }
  return { ...value };
};

const normalizeFollowupTask = (task, context) => {
  if (!task) return null;
  const normalized = toPlainObject(task);
  if (!normalized.taskId) {
    normalized.taskId = buildFollowupTaskId(context);
  }
  if (normalized.taskOrder === undefined) {
    normalized.taskOrder = (context.optionIndex ?? 0) + 1;
  }
  if (!normalized.taskType) {
    normalized.taskType = inferTaskTypeFromContent(normalized) || 'motivation-message';
  }
  return normalized;
};

const normalizeIdentifier = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = `${value}`.trim();
  return normalized.length ? normalized : null;
};

export const normalizeAnswerValue = (value) => {
  if (value === undefined || value === null) return null;
  const normalized = `${value}`.trim();
  return normalized.length ? normalized.toLowerCase() : null;
};

const sanitizeTaskDefinition = (task = {}, index = 0) => {
  if (!task || typeof task !== 'object') return null;
  const sanitized = {
    taskId: ensureTaskId(task, index),
    taskType: task.taskType,
    taskOrder: task.taskOrder ?? index + 1,
    title: task.title || '',
    description: task.description || '',
    content: cloneDeep(task.content || {}),
    enabled: task.enabled !== false,
    createdAt: task.createdAt ? new Date(task.createdAt) : new Date()
  };
  return sanitized;
};

const hasQuestionIdentifier = (value) => normalizeIdentifier(value) !== null;

const hasFollowupTasksDefined = (testConfig = {}) => {
  if (!Array.isArray(testConfig.questions)) return false;
  return testConfig.questions.some(question =>
    Array.isArray(question?.options) &&
    question.options.some(option => option?.followupTask)
  );
};

const collapseLevelsToDefault = (config = {}) => {
  const existingLevels = Array.isArray(config.contentByLevel) ? config.contentByLevel : [];
  const aggregatedTasks = existingLevels
    .flatMap(level => level?.tasks || [])
    .map(task => ({ ...task }))
    .sort((a, b) => (a.taskOrder || 0) - (b.taskOrder || 0))
    .map((task, idx) => ({
      ...task,
      taskOrder: idx + 1
    }));

  const defaultLevel = existingLevels.find(level => level.levelKey === 'default') || existingLevels[0] || {};
  config.contentByLevel = [{
    levelKey: 'default',
    levelLabel: defaultLevel.levelLabel || 'Default',
    tasks: aggregatedTasks
  }];
  return config;
};

const resolveQuestionId = (question, fallback) => {
  if (!question) return fallback;
  if (hasQuestionIdentifier(question.questionId)) {
    return question.questionId;
  }
  if (hasQuestionIdentifier(question.id)) {
    return question.id;
  }
  return fallback;
};

export function buildStructureFromDayConfig({ dayConfig, dayNumber, language, existingStructure }) {
  const hasTest = Boolean(dayConfig.hasTest && dayConfig.testConfig);
  const normalizedLanguageValue = normalizeLanguage(language);
  const baseLanguage = normalizedLanguageValue === 'english'
    ? 'english'
    : (existingStructure?.baseLanguage || normalizedLanguageValue);
  const structure = {
    dayNumber,
    baseLanguage,
    dayName: dayConfig.dayName || '',
    hasTest,
    enabled: dayConfig.enabled !== false,
    testStructure: null,
    contentLevels: (dayConfig.contentByLevel || []).map(level => ({
      levelKey: level.levelKey,
      levelLabel: level.levelLabel || '',
      tasks: level.tasks?.map((task, idx) => ({
        taskId: ensureTaskId(task, idx),
        taskType: task.taskType,
        taskOrder: task.taskOrder ?? idx + 1,
        title: task.title || '',
        description: task.description || '',
        content: task.content || {},
        enabled: task.enabled !== false,
        createdAt: task.createdAt ? new Date(task.createdAt) : new Date()
      })) || []
    }))
  };

  if (hasTest) {
    structure.testStructure = {
      testName: dayConfig.testConfig?.testName || '',
      testType: dayConfig.testConfig?.testType || 'custom',
      disableLevels: Boolean(dayConfig.testConfig?.disableLevels),
      enableFollowupTasks: dayConfig.testConfig?.enableFollowupTasks,
      questionSequence: (dayConfig.testConfig?.questions || []).map((question, idx) => {
        const questionIdValue = resolveQuestionId(question, idx + 1);
        return {
          questionId: questionIdValue,
          questionText: question.questionText || '',
          enabled: question.enabled !== false,
          options: (question.options || []).map((option, optIdx) => {
            const optionKey = option.optionKey || `q${questionIdValue}_opt${optIdx + 1}`;
            const followupTask = option.followupTask ? sanitizeTaskDefinition({
              ...option.followupTask,
              taskId: option.followupTask.taskId || `${optionKey}_followup`
            }, optIdx) : null;
            return {
              optionKey,
              optionText: option.optionText || '',
              score: option.score ?? 0,
              answerValue: option.answerValue || option.optionValue || option.optionText || option.score,
              followupTask
            };
          })
        };
      }),
      scoreRanges: (dayConfig.testConfig?.scoreRanges || []).map((range, rIdx) => ({
        levelKey: range.levelKey || `level-${rIdx + 1}`,
        rangeName: range.rangeName || '',
        label: range.label || '',
        minScore: range.minScore ?? 0,
        maxScore: range.maxScore ?? 0
      }))
    };
  }

  if (existingStructure) {
    structure.createdAt = existingStructure.createdAt;
  }
  structure.updatedAt = new Date();
  return structure;
}

export function buildTranslationFromDayConfig({ dayConfig, dayNumber, language }) {
  const translation = {
    dayNumber,
    language: normalizeLanguage(language),
    dayName: dayConfig.dayName || '',
    testContent: null,
    levelContent: (dayConfig.contentByLevel || []).map(level => ({
      levelKey: level.levelKey,
      levelLabel: level.levelLabel || '',
      tasks: (level.tasks || []).map(task => ({
        taskId: task.taskId,
        title: task.title || '',
        description: task.description || '',
        contentOverrides: cloneDeep(task.content || {})
      }))
    })),
    updatedAt: new Date()
  };

  if (dayConfig.hasTest && dayConfig.testConfig) {
    translation.testContent = {
      testName: dayConfig.testConfig.testName || '',
      questions: (dayConfig.testConfig.questions || []).map((question, idx) => {
        const questionIdValue = resolveQuestionId(question, idx + 1);
        return {
          questionId: questionIdValue,
          questionText: question.questionText || '',
            options: (question.options || []).map((option, optIdx) => {
              const optionKey = option.optionKey || `q${questionIdValue}_opt${optIdx + 1}`;
              const normalizedFollowup = normalizeFollowupTask(option.followupTask, {
                dayNumber,
                questionId: questionIdValue,
                optionKey,
                optionIndex: optIdx
              });
              return {
                optionKey,
                optionText: option.optionText || '',
                followupTask: normalizedFollowup ? {
                  taskId: normalizedFollowup.taskId,
                  taskType: normalizedFollowup.taskType,
                  title: normalizedFollowup.title || '',
                  description: normalizedFollowup.description || '',
                  contentOverrides: cloneDeep(normalizedFollowup.content || {})
                } : null
              };
            })
        };
      }),
      scoreRanges: (dayConfig.testConfig.scoreRanges || []).map((range, rIdx) => ({
        levelKey: range.levelKey || `level-${rIdx + 1}`,
        label: range.label || ''
      }))
    };
  }

  return translation;
}

export function upsertStructure(configDoc, structurePayload) {
  if (!configDoc.dynamicDayStructures) {
    configDoc.dynamicDayStructures = [];
  }
  const index = configDoc.dynamicDayStructures.findIndex(d => d.dayNumber === structurePayload.dayNumber);
  if (index >= 0) {
    configDoc.dynamicDayStructures[index] = {
      ...configDoc.dynamicDayStructures[index].toObject?.() ?? configDoc.dynamicDayStructures[index],
      ...structurePayload
    };
  } else {
    configDoc.dynamicDayStructures.push(structurePayload);
  }
  configDoc.markModified('dynamicDayStructures');
}

export function upsertTranslation(configDoc, translationPayload) {
  if (!configDoc.dynamicDayTranslations) {
    configDoc.dynamicDayTranslations = [];
  }
  const index = configDoc.dynamicDayTranslations.findIndex(
    entry => entry.dayNumber === translationPayload.dayNumber && entry.language === translationPayload.language
  );
  if (index >= 0) {
    configDoc.dynamicDayTranslations[index] = {
      ...configDoc.dynamicDayTranslations[index].toObject?.() ?? configDoc.dynamicDayTranslations[index],
      ...translationPayload
    };
  } else {
    configDoc.dynamicDayTranslations.push(translationPayload);
  }
  configDoc.markModified('dynamicDayTranslations');
}

const buildQuestionLookup = (translation) => {
  const map = new Map();
  translation?.questions?.forEach(q => {
    const key = normalizeIdentifier(q.questionId);
    if (key) {
      map.set(key, q);
    }
  });
  return map;
};

const mergeTaskWithTranslation = (baseTask, translationTask, { allowTranslationTaskType = false } = {}) => {
  if (!baseTask) return null;
  if (!translationTask) return baseTask;

  const mergedContent = translationTask.contentOverrides && Object.keys(translationTask.contentOverrides).length > 0
    ? { ...baseTask.content, ...translationTask.contentOverrides }
    : baseTask.content;

  return {
    ...baseTask,
    taskType: allowTranslationTaskType
      ? (translationTask.taskType || baseTask.taskType)
      : (baseTask.taskType || translationTask.taskType),
    title: translationTask.title || baseTask.title || '',
    description: translationTask.description || baseTask.description || '',
    content: mergedContent
  };
};

export function composeDayConfig(structure, translation) {
  if (!structure) return null;
  const merged = {
    dayNumber: structure.dayNumber,
    dayName: translation?.dayName || structure.dayName || '',
    hasTest: structure.hasTest,
    testConfig: null,
    contentByLevel: [],
    enabled: structure.enabled !== false
  };

  if (structure.hasTest && structure.testStructure) {
    const questionTranslations = buildQuestionLookup(translation?.testContent?.questions);
    const translationMatchesBase = translation?.language && translation.language === (structure.baseLanguage || 'english');
    merged.testConfig = {
      testName: translation?.testContent?.testName || structure.testStructure.testName || '',
      testType: structure.testStructure.testType || 'custom',
      disableLevels: Boolean(structure.testStructure.disableLevels),
      enableFollowupTasks: structure.testStructure.enableFollowupTasks,
      questions: structure.testStructure.questionSequence?.map((question, idx) => {
        const normalizedQuestionKey = normalizeIdentifier(question.questionId);
        const qTranslation = normalizedQuestionKey ? questionTranslations.get(normalizedQuestionKey) : null;
        const fallbackTranslationByIndex = translation?.testContent?.questions?.[idx];
        const effectiveTranslation = qTranslation || fallbackTranslationByIndex;
        const optionTranslations = mapArrayBy(effectiveTranslation?.options || [], 'optionKey');
        return {
          id: question.questionId,
          questionText: effectiveTranslation?.questionText || question.questionText || '',
          enabled: question.enabled !== false,
          options: (question.options || []).map((option, optIdx) => {
            const optTranslation = optionTranslations.get(option.optionKey);
            const fallbackOptionTranslation = effectiveTranslation?.options?.[optIdx];
            const translationForOption = optTranslation || fallbackOptionTranslation;
            const normalizedFollowup = normalizeFollowupTask(option.followupTask, {
              dayNumber: structure.dayNumber,
              questionId: question.questionId,
              optionKey: option.optionKey,
              optionIndex: optIdx
            });
            const mergedFollowupTask = mergeTaskWithTranslation(
              normalizedFollowup,
              translationForOption?.followupTask,
              { allowTranslationTaskType: translationMatchesBase }
            );
            return {
              optionKey: option.optionKey,
              optionText: translationForOption?.optionText || option.optionText || '',
              score: option.score ?? 0,
              answerValue: option.answerValue,
              followupTask: mergedFollowupTask
            };
          })
        };
      }) || [],
      scoreRanges: structure.testStructure.scoreRanges?.map(range => {
        const translationRange = translation?.testContent?.scoreRanges?.find(r => r.levelKey === range.levelKey);
        return {
          rangeName: range.rangeName || '',
          levelKey: range.levelKey,
          label: translationRange?.label || range.label || '',
          minScore: range.minScore ?? 0,
          maxScore: range.maxScore ?? 0
        };
      }) || []
    };
  }

  const translationLevels = translation?.levelContent || [];

  merged.contentByLevel = structure.contentLevels?.map(level => {
    const levelTranslation = findMatchingLevel(translationLevels, level);
    const taskTranslationMap = mapArrayBy(levelTranslation?.tasks || [], 'taskId');
    return {
      levelKey: level.levelKey,
      levelLabel: levelTranslation?.levelLabel || level.levelLabel || '',
      tasks: (level.tasks || []).map(task => {
        const taskTranslation = taskTranslationMap.get(task.taskId);
        return {
          taskId: task.taskId,
          taskOrder: task.taskOrder,
          taskType: task.taskType,
          title: taskTranslation?.title || task.title || '',
          description: taskTranslation?.description || task.description || '',
          content: taskTranslation?.contentOverrides && Object.keys(taskTranslation.contentOverrides).length > 0
            ? { ...task.content, ...taskTranslation.contentOverrides }
            : task.content,
          enabled: task.enabled !== false,
          createdAt: task.createdAt
        };
      })
    };
  }) || [];

  merged.enabled = true;
  return merged;
}

export function getStructureForDay(configDoc, dayNumber) {
  return configDoc.dynamicDayStructures?.find(entry => entry.dayNumber === dayNumber);
}

export function getTranslationForDay(configDoc, dayNumber, language) {
  const normalized = normalizeLanguage(language);
  return configDoc.dynamicDayTranslations?.find(entry => entry.dayNumber === dayNumber && entry.language === normalized);
}

export function listDayConfigsForLanguage(configDoc, language) {
  const normalized = normalizeLanguage(language);
  return (configDoc.dynamicDayStructures || []).map(structure => {
    const translation = getTranslationForDay(configDoc, structure.dayNumber, normalized);
    const merged = composeDayConfig(structure, translation);
    return {
      ...merged,
      language: normalized
    };
  });
}

export function syncLegacyDynamicDay(configDoc, { dayNumber, language, dayConfig }) {
  if (!configDoc.dynamicDays) {
    configDoc.dynamicDays = [];
  }
  const index = configDoc.dynamicDays.findIndex(d => d.dayNumber === dayNumber && d.language === language);
  if (index >= 0) {
    configDoc.dynamicDays[index] = {
      ...dayConfig,
      dayNumber,
      language
    };
  } else {
    configDoc.dynamicDays.push({
      ...dayConfig,
      dayNumber,
      language
    });
  }
  configDoc.markModified('dynamicDays');
}

export function ensureTestStructureDefaults(structure) {
  if (!structure || typeof structure !== 'object') return;

  if (!structure.hasTest) {
    if (structure.testStructure && !structure.testStructure.testType) {
      structure.testStructure.testType = 'custom';
    }
    return;
  }

  if (!structure.testStructure) {
    structure.testStructure = {
      testName: '',
      testType: 'custom',
      questionSequence: [],
      scoreRanges: []
    };
    return;
  }

  structure.testStructure.testType = structure.testStructure.testType || 'custom';
  if (!Array.isArray(structure.testStructure.questionSequence)) {
    structure.testStructure.questionSequence = [];
  }
  if (!Array.isArray(structure.testStructure.scoreRanges)) {
    structure.testStructure.scoreRanges = [];
  }
}

export function sanitizeDynamicDayStructures(configDoc) {
  if (!configDoc || !Array.isArray(configDoc.dynamicDayStructures)) return;
  configDoc.dynamicDayStructures.forEach(ensureTestStructureDefaults);
}
