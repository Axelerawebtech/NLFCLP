const SUPPORTED_LANGUAGES = ['english', 'kannada', 'hindi'];

const cloneDeep = (value) => (value === null || value === undefined)
  ? value
  : JSON.parse(JSON.stringify(value));

const normalizeLanguage = (language = 'english') => {
  const normalized = language.toLowerCase();
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : 'english';
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

export function buildStructureFromDayConfig({ dayConfig, dayNumber, language, existingStructure }) {
  const hasTest = Boolean(dayConfig.hasTest && dayConfig.testConfig);
  const baseLanguage = existingStructure?.baseLanguage || normalizeLanguage(language);
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
      questionSequence: (dayConfig.testConfig?.questions || []).map((question, idx) => ({
        questionId: question.id ?? idx + 1,
        questionText: question.questionText || '',
        enabled: question.enabled !== false,
        options: (question.options || []).map((option, optIdx) => ({
          optionKey: `q${question.id ?? idx + 1}_opt${optIdx + 1}`,
          optionText: option.optionText || '',
          score: option.score ?? 0
        }))
      })),
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
      questions: (dayConfig.testConfig.questions || []).map((question, idx) => ({
        questionId: question.id ?? idx + 1,
        questionText: question.questionText || '',
        options: (question.options || []).map((option, optIdx) => ({
          optionKey: `q${question.id ?? idx + 1}_opt${optIdx + 1}`,
          optionText: option.optionText || ''
        }))
      })),
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
    map.set(q.questionId, q);
  });
  return map;
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
    merged.testConfig = {
      testName: translation?.testContent?.testName || structure.testStructure.testName || '',
      testType: structure.testStructure.testType || 'custom',
      questions: structure.testStructure.questionSequence?.map(question => {
        const qTranslation = questionTranslations.get(question.questionId);
        const optionTranslations = mapArrayBy(qTranslation?.options || [], 'optionKey');
        return {
          id: question.questionId,
          questionText: qTranslation?.questionText || question.questionText || '',
          enabled: question.enabled !== false,
          options: (question.options || []).map(option => {
            const optTranslation = optionTranslations.get(option.optionKey);
            return {
              optionText: optTranslation?.optionText || option.optionText || '',
              score: option.score ?? 0
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

  const levelTranslationMap = mapArrayBy(translation?.levelContent || [], 'levelKey');

  merged.contentByLevel = structure.contentLevels?.map(level => {
    const levelTranslation = levelTranslationMap.get(level.levelKey);
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
