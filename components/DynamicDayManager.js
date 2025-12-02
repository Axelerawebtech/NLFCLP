import { useState, useEffect } from 'react';
import { motion, Reorder, AnimatePresence } from 'framer-motion';
import {
  shouldShowTitleField,
  shouldShowDescriptionField,
  isTitleRequired,
  isDescriptionRequired
} from '../utils/taskMetadata';

const DEFAULT_TEST_OPTION_LABELS = {
  english: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  kannada: ['ಎಂದಿಗೂ ಇಲ್ಲ', 'ಅಪರೂಪವಾಗಿ', 'ಕೆಲವೊಮ್ಮೆ', 'ಹೆಚ್ಚು ಬಾರಿ', 'ಯಾವಾಗಲೂ'],
  hindi: ['कभी नहीं', 'कभी कभार', 'कभी-कभी', 'अक्सर', 'हमेशा']
};

const BASE_LANGUAGE = 'english';

const cloneDeep = (value) => {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch (err) {
      console.warn('structuredClone failed, falling back to JSON clone:', err);
    }
  }
  return value ? JSON.parse(JSON.stringify(value)) : value;
};

const getDefaultOptionLabels = (language = 'english') => {
  return DEFAULT_TEST_OPTION_LABELS[language] || DEFAULT_TEST_OPTION_LABELS.english;
};

const slugifyLevelKey = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
};

const normalizeDayConfigLevels = (config) => {
  if (!config?.hasTest || !config?.testConfig?.scoreRanges?.length) {
    return config;
  }

  if (config?.testConfig?.disableLevels) {
    return config;
  }

  const scoreRangesClone = config.testConfig.scoreRanges.map(range => ({ ...range }));
  const originalContentByLevel = (config.contentByLevel || []).map(level => ({ ...level }));
  const keyMap = {};
  const usedKeys = new Set();

  const normalizedScoreRanges = scoreRangesClone.map((range, index) => {
    const originalKey = range.levelKey;
    const baseKey = slugifyLevelKey(range.label || range.rangeName || originalKey || `level-${index + 1}`) || `level-${index + 1}`;
    let normalizedKey = baseKey;
    let suffix = 2;
    while (usedKeys.has(normalizedKey)) {
      normalizedKey = `${baseKey}-${suffix++}`;
    }
    usedKeys.add(normalizedKey);
    if (originalKey) {
      keyMap[originalKey] = normalizedKey;
    }
    return {
      ...range,
      levelKey: normalizedKey
    };
  });

  const existingLevels = new Map();
  originalContentByLevel.forEach(level => {
    const mappedKey = keyMap[level.levelKey] || level.levelKey;
    existingLevels.set(mappedKey, {
      ...level,
      levelKey: mappedKey
    });
  });

  const normalizedContentByLevel = normalizedScoreRanges.map(range => {
    if (existingLevels.has(range.levelKey)) {
      const existingLevel = existingLevels.get(range.levelKey);
      return {
        ...existingLevel,
        levelKey: range.levelKey,
        levelLabel: existingLevel.levelLabel || range.label || range.levelKey
      };
    }
    return {
      levelKey: range.levelKey,
      levelLabel: range.label || range.levelKey,
      tasks: []
    };
  });

  return {
    ...config,
    testConfig: {
      ...config.testConfig,
      scoreRanges: normalizedScoreRanges
    },
    contentByLevel: normalizedContentByLevel
  };
};

const hasFollowupTasksDefined = (testConfig = {}) => {
  if (!Array.isArray(testConfig.questions)) return false;
  return testConfig.questions.some(question =>
    Array.isArray(question?.options) && question.options.some(option => Boolean(option?.followupTask))
  );
};

const collapseLevelsToDefault = (config = {}) => {
  const existingLevels = Array.isArray(config.contentByLevel) ? config.contentByLevel : [];
  if (!existingLevels.length) {
    config.contentByLevel = [{ levelKey: 'default', levelLabel: 'Default', tasks: [] }];
    return config;
  }

  const aggregatedTasks = existingLevels
    .flatMap(level => level?.tasks || [])
    .map(task => ({ ...task }))
    .sort((a, b) => (a.taskOrder || 0) - (b.taskOrder || 0))
    .map((task, idx) => ({ ...task, taskOrder: idx + 1 }));

  const defaultLevel = existingLevels.find(level => level.levelKey === 'default') || existingLevels[0];
  config.contentByLevel = [{
    levelKey: 'default',
    levelLabel: defaultLevel?.levelLabel || 'Default',
    tasks: aggregatedTasks
  }];
  return config;
};

/**
 * DynamicDayManager Component
 * 
 * Complete dynamic day content management with:
 * - Language tabs at the top
 * - Test configuration UI
 * - Cloudinary video upload
 * - Framer Motion reordering
 * - All content types supported
 */

export default function DynamicDayManager() {
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayConfig, setDayConfig] = useState(null);
  const [days, setDays] = useState([]);
  const [daysLoading, setDaysLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('default');
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showTestConfig, setShowTestConfig] = useState(false);
  const [globalWaitTimes, setGlobalWaitTimes] = useState({ day0ToDay1: 24, betweenDays: 24 });
  const [loadingGlobalWaits, setLoadingGlobalWaits] = useState(false);
  const [savingGlobalWaits, setSavingGlobalWaits] = useState(false);
  const [waitTimesMessage, setWaitTimesMessage] = useState('');
  const [pendingTestConfig, setPendingTestConfig] = useState(null);
  const [hasUnsavedTestConfig, setHasUnsavedTestConfig] = useState(false);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [mutationMessage, setMutationMessage] = useState('');
  const withUiSpinner = async (message, fn) => {
    setMutationMessage(message);
    setMutationLoading(true);
    try {
      return await fn();
    } finally {
      setMutationLoading(false);
      setMutationMessage('');
    }
  };


  const languages = [
    { code: 'english', label: 'English', flag: '🇺🇸' },
    { code: 'kannada', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'hindi', label: 'हिंदी', flag: '🇮🇳' }
  ];

  const handleLanguageSwitch = (langCode) => {
    if (langCode === selectedLanguage) return;
    setError('');
    setSelectedLanguage(langCode);
  };

  const isBaseLanguage = selectedLanguage === BASE_LANGUAGE;
  const testLevelsDisabled = Boolean(dayConfig?.testConfig?.disableLevels);

  const toTitleCase = (text = '') =>
    text.replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (match) => match.toUpperCase())
      .trim();

  const resolveLevelLabel = (labelData) => {
    if (!labelData) return '';
    if (typeof labelData === 'string') return labelData;
    if (typeof labelData === 'object') {
      return labelData[selectedLanguage] || labelData.english || labelData.kannada || labelData.hindi || '';
    }
    return '';
  };

  const getLevelDisplayLabel = (levelConfig) => {
    if (!levelConfig) return 'Level';
    const label = resolveLevelLabel(levelConfig.label) || levelConfig.levelLabel;
    if (label && label.trim()) return label;
    if (levelConfig.levelKey) return toTitleCase(levelConfig.levelKey);
    return 'Level';
  };

  // Load all configured days for current language
  useEffect(() => {
    fetchDays();
  }, [selectedLanguage]);

  //update

  useEffect(() => {
    fetchGlobalWaitTimes();
  }, []);

  const fetchGlobalWaitTimes = async () => {
    try {
      setLoadingGlobalWaits(true);
      const res = await fetch('/api/admin/program/config');
      const data = await res.json();
      if (data.success && data.config?.waitTimes) {
        setGlobalWaitTimes({
          day0ToDay1: data.config.waitTimes.day0ToDay1 ?? 24,
          betweenDays: data.config.waitTimes.betweenDays ?? 24
        });
      }
    } catch (err) {
      console.error('Failed to load global wait times:', err);
    } finally {
      setLoadingGlobalWaits(false);
    }
  };

  const fetchDays = async () => {
    try {
      setDaysLoading(true);
      setError('');
      const res = await fetch(`/api/admin/dynamic-days/config?language=${selectedLanguage}`);
      const data = await res.json();

      if (data.success) {
        setDays(data.days || []);
      } else {
        setError(data.error || 'Failed to load days');
      }
    } catch (err) {
      console.error('Failed to load days:', err);
      setError('Failed to load days');
    } finally {
      setDaysLoading(false);
    }
  };

  const handleTestConfigChange = (updatedConfig, markDirty = true) => {
    let nextSelectedLevel = null;
    let normalizedPendingCopy = null;

    setDayConfig(prev => {
      const mergedConfig = normalizeDayConfigLevels({
        ...prev,
        hasTest: updatedConfig ? true : prev.hasTest,
        testConfig: updatedConfig
      });

      if (updatedConfig?.disableLevels) {
        collapseLevelsToDefault(mergedConfig);
      }

      const availableLevels = mergedConfig.contentByLevel?.map(level => level.levelKey) || [];
      if (mergedConfig.hasTest && availableLevels.length && !availableLevels.includes(selectedLevel)) {
        nextSelectedLevel = availableLevels[0];
      }
      if (!mergedConfig.hasTest) {
        nextSelectedLevel = 'default';
      }

      normalizedPendingCopy = mergedConfig.testConfig
        ? JSON.parse(JSON.stringify(mergedConfig.testConfig))
        : null;

      return mergedConfig;
    });

    if (nextSelectedLevel) {
      setSelectedLevel(nextSelectedLevel);
    }

    if (markDirty) {
      setPendingTestConfig(normalizedPendingCopy);
      setHasUnsavedTestConfig(true);
    }
  };

  const handleUpdateGlobalWaitTimes = async () => {
    try {
      setSavingGlobalWaits(true);
      setWaitTimesMessage('');
      const waitTimesPayload = {
        day0ToDay1: Number(globalWaitTimes.day0ToDay1) || 0,
        betweenDays: Number(globalWaitTimes.betweenDays) || 0
      };

      const res = await fetch('/api/admin/program/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configType: 'global',
          waitTimes: waitTimesPayload
        })
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload.message || 'Failed to update global wait times');
      }

      setWaitTimesMessage('✅ Global wait times updated');
      setTimeout(() => setWaitTimesMessage(''), 4000);
    } catch (err) {
      console.error('Failed to update global wait times:', err);
      setWaitTimesMessage(err.message || 'Failed to update wait times');
    } finally {
      setSavingGlobalWaits(false);
    }
  };

  // Load specific day configuration for current language
  const loadDayConfig = async (dayNum, preserveTestConfig = false) => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/admin/dynamic-days/config?day=${dayNum}&language=${selectedLanguage}`);
      const data = await res.json();
      
      if (data.success) {
        let mergedConfig;
        if (data.isNew || !data.dayConfig) {
          mergedConfig = {
            dayNumber: dayNum,
            language: selectedLanguage,
            dayName: '',
            hasTest: false,
            testConfig: null,
            contentByLevel: [{
              levelKey: 'default',
              levelLabel: 'Default',
              tasks: []
            }],
            enabled: true
          };
          console.log(`✨ Creating new configuration for Day ${dayNum} (${selectedLanguage})`);
        } else {
          mergedConfig = data.dayConfig;
          console.log(`✅ Loaded configuration for Day ${dayNum} (${selectedLanguage})`);
        }

        if (preserveTestConfig && hasUnsavedTestConfig) {
          const clonedPending = pendingTestConfig
            ? JSON.parse(JSON.stringify(pendingTestConfig))
            : null;
          const userDisabledTest = dayConfig?.hasTest === false;
          if (clonedPending) {
            mergedConfig = {
              ...mergedConfig,
              hasTest: true,
              testConfig: clonedPending
            };
            setPendingTestConfig(clonedPending);
          } else if (userDisabledTest) {
            mergedConfig = {
              ...mergedConfig,
              hasTest: false,
              testConfig: null,
              contentByLevel: [{
                levelKey: 'default',
                levelLabel: 'Default',
                tasks: []
              }]
            };
            setPendingTestConfig(null);
          } else {
            setPendingTestConfig(null);
            setHasUnsavedTestConfig(false);
          }
        } else {
          setPendingTestConfig(null);
          setHasUnsavedTestConfig(false);
        }

        const normalizedConfig = normalizeDayConfigLevels(mergedConfig);
        if (normalizedConfig?.testConfig?.disableLevels) {
          collapseLevelsToDefault(normalizedConfig);
        }
        setDayConfig(cloneDeep(normalizedConfig));

        if (normalizedConfig.hasTest && normalizedConfig.contentByLevel?.length) {
          const availableLevels = normalizedConfig.contentByLevel.map(level => level.levelKey);
          const preferredLevel = availableLevels.includes(selectedLevel) && preserveTestConfig
            ? selectedLevel
            : availableLevels[0];
          setSelectedLevel(preferredLevel || 'default');
        } else {
          setSelectedLevel('default');
        }
      } else {
        setError(data.error || 'Failed to load day configuration');
      }
    } catch (err) {
      setError('Failed to load day configuration');
      console.error('Error loading day config:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reload the currently selected day whenever the language tab changes
  useEffect(() => {
    if (selectedDay !== null) {
      loadDayConfig(selectedDay, true);
    }
  }, [selectedLanguage]);

  // Save day configuration
  const saveDayConfig = async () => {
    if (!dayConfig) return;

    try {
      setSaving(true);
      setError('');

      const payload = cloneDeep(dayConfig);
      if (payload?.testConfig?.disableLevels) {
        collapseLevelsToDefault(payload);
      }

      const res = await fetch('/api/admin/dynamic-days/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: selectedDay,
          language: selectedLanguage,
          dayConfig: payload
        })
      });

      const data = await res.json();
      
      if (data.success) {
        alert(`✅ Day ${selectedDay} (${selectedLanguage}) saved successfully!`);
        setDayConfig(cloneDeep(payload));
        setPendingTestConfig(null);
        setHasUnsavedTestConfig(false);
        await fetchDays();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to save configuration');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Toggle test configuration
  const toggleHasTest = (hasTest) => {
    if (!isBaseLanguage) {
      alert('Test levels can only be configured in the base language (English).');
      return;
    }
    setDayConfig(prev => {
      const updated = { ...prev, hasTest };
      
      if (hasTest) {
        // Initialize test config with 3 default levels
        const defaultTestConfig = {
          testName: '',
          testType: 'custom',
          questions: [],
          scoreRanges: [
            {
              rangeName: 'mild',
              label: 'Mild',
              minScore: 0,
              maxScore: 40,
              levelKey: 'mild'
            },
            {
              rangeName: 'moderate',
              label: 'Moderate',
              minScore: 41,
              maxScore: 60,
              levelKey: 'moderate'
            },
            {
              rangeName: 'severe',
              label: 'Severe',
              minScore: 61,
              maxScore: 88,
              levelKey: 'severe'
            }
          ]
        };
        updated.testConfig = defaultTestConfig;

        // Create content by level structure
        updated.contentByLevel = updated.testConfig.scoreRanges.map(range => ({
          levelKey: range.levelKey,
          levelLabel: range.label,
          tasks: []
        }));

        setSelectedLevel('mild');
        setPendingTestConfig(JSON.parse(JSON.stringify(defaultTestConfig)));
        setHasUnsavedTestConfig(true);
      } else {
        // Reset to default level
        updated.testConfig = null;
        updated.contentByLevel = [{
          levelKey: 'default',
          levelLabel: 'Default',
          tasks: []
        }];
        setSelectedLevel('default');
        setPendingTestConfig(null);
        setHasUnsavedTestConfig(true);
      }
      
      return updated;
    });
  };

  // Add task
  const addTask = async (taskData) => {
    if (!isBaseLanguage) {
      alert('Add or duplicate tasks only while editing the English structure.');
      return { success: false, error: 'Structure locked for translations' };
    }
    const targetLevelKey = effectiveLevelKey;
    return withUiSpinner('Adding task...', async () => {
      try {
      // First, check if day config exists in database by trying to add the task
      let res = await fetch('/api/admin/dynamic-days/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: selectedDay,
          language: selectedLanguage,
          levelKey: targetLevelKey,
          task: taskData
        })
      });

      let data = await res.json();
      
      // If day doesn't exist, save it first then retry
      if (!data.success && data.error?.includes('not found')) {
        console.log('Day not in database yet, saving configuration first...');
        
        // Save day configuration
        const saveRes = await fetch('/api/admin/dynamic-days/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dayNumber: selectedDay,
            language: selectedLanguage,
            dayConfig
          })
        });

        const saveData = await saveRes.json();
        
        if (!saveData.success) {
          alert('Failed to save day configuration: ' + saveData.error);
          return;
        }

        console.log('✅ Day configuration saved, now adding task...');

        // Retry adding the task
        res = await fetch('/api/admin/dynamic-days/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dayNumber: selectedDay,
            language: selectedLanguage,
            levelKey: targetLevelKey,
            task: taskData
          })
        });

        data = await res.json();
      }
      
        if (data.success) {
          if (hasUnsavedTestConfig) {
            setDayConfig(prev => {
              if (!prev) return prev;
              const updated = cloneDeep(prev);
              const targetLevel = updated.contentByLevel?.find(level => level.levelKey === targetLevelKey);
              if (targetLevel) {
                const nextTasks = Array.isArray(targetLevel.tasks) ? [...targetLevel.tasks] : [];
                const sanitizedTask = {
                  ...data.task,
                  title: data.task.title || taskData.title || '',
                  description: data.task.description || taskData.description || '',
                  content: taskData.content || data.task.content || {}
                };
                nextTasks.push(sanitizedTask);
                targetLevel.tasks = nextTasks
                  .sort((a, b) => (a.taskOrder || 0) - (b.taskOrder || 0))
                  .map((task, idx) => ({ ...task, taskOrder: idx + 1 }));
              }
              return updated;
            });
          } else {
            await loadDayConfig(selectedDay, true);
          }
          await fetchDays(); // Refresh days list
          setShowAddTask(false);
          console.log('✅ Task added successfully');
          return data;
        } else {
          alert(data.error);
          return data;
        }
      } catch (err) {
        alert('Failed to add task');
        console.error(err);
        return { success: false, error: err.message };
      }
    });
  };

  // Delete task
  const deleteTask = async (taskId) => {
    if (!isBaseLanguage) {
      alert('Delete tasks only in the English structure tab.');
      return;
    }
    if (!confirm('⚠️ Are you sure you want to delete this task?')) return;

    await withUiSpinner('Deleting task...', async () => {
      try {
        const res = await fetch(
          `/api/admin/dynamic-days/tasks?dayNumber=${selectedDay}&language=${selectedLanguage}&levelKey=${effectiveLevelKey}&taskId=${taskId}`,
          { method: 'DELETE' }
        );

        const data = await res.json();
        
        if (data.success) {
          await loadDayConfig(selectedDay, true);
        } else {
          alert(data.error);
        }
      } catch (err) {
        alert('Failed to delete task');
        console.error(err);
      }
    });
  };

  // Update task order after reordering
  const handleReorder = async (newOrderedTasks) => {
    if (!isBaseLanguage) {
      alert('Reorder tasks in the English structure tab only.');
      return;
    }
    // Update local state immediately for smooth UX
    setDayConfig(prev => {
      const updated = { ...prev };
      const levelConfig = updated.contentByLevel.find(l => l.levelKey === effectiveLevelKey);
      if (levelConfig) {
        levelConfig.tasks = newOrderedTasks.map((task, index) => ({
          ...task,
          taskOrder: index + 1
        }));
      }
      return updated;
    });

    // Save to backend
    try {
      for (let i = 0; i < newOrderedTasks.length; i++) {
        const task = newOrderedTasks[i];
        const newOrder = i + 1;
        
        if (task.taskOrder !== newOrder) {
          await fetch('/api/admin/dynamic-days/tasks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dayNumber: selectedDay,
              language: selectedLanguage,
              levelKey: effectiveLevelKey,
              taskId: task.taskId,
              reorder: { newOrder }
            })
          });
        }
      }
    } catch (err) {
      console.error('Failed to save reordered tasks:', err);
      // Reload to get correct state
      await loadDayConfig(selectedDay, true);
    }
  };

  const effectiveLevelKey = testLevelsDisabled ? 'default' : (selectedLevel || 'default');
  const currentLevelConfig = dayConfig?.contentByLevel?.find(l => l.levelKey === effectiveLevelKey);
  const overlayActive = loading || saving || mutationLoading || daysLoading || savingGlobalWaits || loadingGlobalWaits;
  const overlayMessage = saving
    ? 'Saving day configuration...'
    : mutationLoading
      ? mutationMessage || 'Applying changes...'
      : loading
        ? 'Loading day content...'
        : savingGlobalWaits
          ? 'Updating wait time defaults...'
          : loadingGlobalWaits
            ? 'Fetching wait time defaults...'
            : daysLoading
              ? 'Refreshing day list...'
              : 'Working...';

  const handleTaskUpdate = async (taskData) => {
    if (!editingTask) {
      return { success: false, error: 'No task selected' };
    }

    if (isBaseLanguage) {
      return withUiSpinner('Updating task...', async () => {
        try {
          const res = await fetch('/api/admin/dynamic-days/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dayNumber: selectedDay,
            language: selectedLanguage,
            levelKey: effectiveLevelKey,
            taskId: editingTask.taskId,
            updates: taskData
          })
        });

          const data = await res.json();

          if (data.success) {
            await loadDayConfig(selectedDay, true);
            setEditingTask(null);
          }

          return data;
        } catch (err) {
          console.error('Failed to update task:', err);
          return { success: false, error: err.message };
        }
      });
    }

    setDayConfig(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated.contentByLevel = (prev.contentByLevel || []).map(level => {
        if (level.levelKey !== effectiveLevelKey) {
          return level;
        }
        return {
          ...level,
          tasks: level.tasks.map(task => {
            if (task.taskId !== editingTask.taskId) {
              return task;
            }
            return {
              ...task,
              title: taskData.title,
              description: taskData.description,
              content: taskData.content || task.content
            };
          })
        };
      });
      return updated;
    });
    setEditingTask(null);
    return { success: true };
  };

  return (
    <div style={{ padding: '0', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Language Tabs - Top Level */}
      <div style={{ 
        marginBottom: '30px', 
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#374151' }}>
          🌐 Select Language for Configuration
        </h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {languages.map(lang => (
            <motion.button
              key={lang.code}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLanguageSwitch(lang.code)}
              style={{
                padding: '12px 24px',
                backgroundColor: selectedLanguage === lang.code ? '#3b82f6' : '#f3f4f6',
                color: selectedLanguage === lang.code ? 'white' : '#374151',
                border: selectedLanguage === lang.code ? '2px solid #2563eb' : '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '20px' }}>{lang.flag}</span>
              {lang.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Global Wait Time Configuration */}
      <div style={{
        marginBottom: '24px',
        padding: '20px',
        backgroundColor: '#fff7ed',
        borderRadius: '12px',
        border: '2px solid #fed7aa'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#9a3412', margin: 0 }}>
              ⏳ Global Wait Time Defaults
            </h3>
            <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#7c2d12' }}>
              Configure the default delay between program milestones. Applies across all languages.
            </p>
          </div>
          {waitTimesMessage && (
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 600,
                color: waitTimesMessage.includes('✅') ? '#166534' : '#991b1b',
                backgroundColor: waitTimesMessage.includes('✅') ? '#dcfce7' : '#fee2e2'
              }}
            >
              {waitTimesMessage}
            </motion.span>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginTop: '16px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#7c2d12', marginBottom: '6px' }}>
              Hours between Day 0 onboarding → Day 1 content
            </label>
            <input
              type="number"
              value={globalWaitTimes.day0ToDay1}
              onChange={(e) => setGlobalWaitTimes(prev => ({ ...prev, day0ToDay1: e.target.value }))}
              disabled={loadingGlobalWaits}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '2px solid #d1d5db',
                fontSize: '15px',
                backgroundColor: loadingGlobalWaits ? '#f3f4f6' : 'white'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#7c2d12', marginBottom: '6px' }}>
              Hours between subsequent days
            </label>
            <input
              type="number"
              value={globalWaitTimes.betweenDays}
              onChange={(e) => setGlobalWaitTimes(prev => ({ ...prev, betweenDays: e.target.value }))}
              disabled={loadingGlobalWaits}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '2px solid #d1d5db',
                fontSize: '15px',
                backgroundColor: loadingGlobalWaits ? '#f3f4f6' : 'white'
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleUpdateGlobalWaitTimes}
            disabled={savingGlobalWaits || loadingGlobalWaits}
            style={{
              padding: '10px 20px',
              backgroundColor: savingGlobalWaits || loadingGlobalWaits ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: savingGlobalWaits || loadingGlobalWaits ? 'not-allowed' : 'pointer'
            }}
          >
            {savingGlobalWaits ? 'Saving...' : 'Update Wait Times'}
          </button>
          <button
            onClick={fetchGlobalWaitTimes}
            disabled={savingGlobalWaits}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              color: '#374151',
              fontWeight: 600,
              cursor: savingGlobalWaits ? 'not-allowed' : 'pointer'
            }}
          >
            Refresh Values
          </button>
        </div>
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px', color: '#111827' }}>
        🗓️ Dynamic Day Content Manager
      </h2>

      {/* Day Selector */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ 
          marginBottom: '30px', 
          padding: '20px', 
          backgroundColor: '#f9fafb', 
          borderRadius: '12px',
          border: '2px solid #e5e7eb'
        }}
      >
        <label style={{ display: 'block', fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: '#111827' }}>
          📅 Select Day to Configure
        </label>
        <select
          value={selectedDay || ''}
          onChange={(e) => {
            const day = parseInt(e.target.value);
            setSelectedDay(day);
            loadDayConfig(day);
          }}
          style={{
            width: '100%',
            maxWidth: '300px',
            padding: '12px 16px',
            fontSize: '15px',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          <option value="">Choose a day...</option>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(day => {
            const configured = days.find(d => d.dayNumber === day);
            return (
              <option key={day} value={day}>
                Day {day} {configured ? '✓ Configured' : '○ Not configured'}
              </option>
            );
          })}
        </select>
      </motion.div>

      {selectedLanguage && selectedLanguage !== '' && (
        <div style={{
          marginBottom: '20px',
          padding: '16px 20px',
          borderRadius: '10px',
          border: `1px solid ${isBaseLanguage ? '#bbf7d0' : '#fde68a'}`,
          backgroundColor: isBaseLanguage ? '#ecfdf5' : '#fffbeb',
          color: isBaseLanguage ? '#065f46' : '#92400e',
          fontSize: '14px',
          fontWeight: 500
        }}>
          {isBaseLanguage
            ? 'Editing shared structure. Changes here affect every language (task order, tests, media, etc.).'
            : 'Translation mode. Only adjust text or localized media. Add/delete tasks or change scoring only in English.'}
        </div>
      )}

      {selectedDay !== null && dayConfig && (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Day Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Day Name ({selectedLanguage})
              </label>
              <input
                type="text"
                value={dayConfig.dayName || ''}
                onChange={(e) => setDayConfig(prev => ({
                  ...prev,
                  dayName: e.target.value
                }))}
                placeholder={`e.g., Day ${selectedDay} - Introduction`}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Test Configuration */}
            <motion.div 
              layout
              style={{ 
                marginBottom: '30px', 
                padding: '24px', 
                backgroundColor: '#f0f9ff', 
                border: '2px solid #bfdbfe', 
                borderRadius: '12px' 
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px', color: '#1e40af' }}>
                📊 Test/Assessment Configuration
              </h3>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={dayConfig.hasTest}
                    onChange={(e) => toggleHasTest(e.target.checked)}
                    style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '15px', fontWeight: '500', color: '#1e40af' }}>
                    This day has a test/assessment with multiple levels
                  </span>
                </label>
              </div>

              <AnimatePresence>
                {dayConfig.hasTest && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ marginTop: '20px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}
                  >
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                        Test Name ({selectedLanguage})
                      </label>
                      <input
                        type="text"
                        value={dayConfig.testConfig?.testName || ''}
                        onChange={(e) => setDayConfig(prev => ({
                          ...prev,
                          testConfig: {
                            ...prev.testConfig,
                            testName: e.target.value
                          }
                        }))}
                        placeholder="e.g., Stress Level Assessment"
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          fontSize: '15px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '6px'
                        }}
                      />
                    </div>

                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                      {testLevelsDisabled
                        ? '📊 Score-based levels are disabled. Everyone sees the default plan.'
                        : `📊 Levels configured: ${dayConfig.testConfig?.scoreRanges?.length || 0}`}
                    </p>
                    
                    <button
                      onClick={() => setShowTestConfig(!showTestConfig)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {showTestConfig ? '▼ Hide' : '▶'} Configure Test Questions & Score Ranges
                    </button>

                    <AnimatePresence>
                      {showTestConfig && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <TestConfigEditor
                            testConfig={dayConfig.testConfig}
                            selectedLanguage={selectedLanguage}
                            hasUnsavedChanges={hasUnsavedTestConfig}
                            onChange={handleTestConfigChange}
                            structureLocked={!isBaseLanguage}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Level Tabs */}
            <AnimatePresence>
              {dayConfig.hasTest && dayConfig.testConfig?.scoreRanges?.length > 0 && !testLevelsDisabled && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ marginBottom: '20px' }}
                >
                  <div style={{ display: 'flex', gap: '10px', borderBottom: '3px solid #e5e7eb', flexWrap: 'wrap' }}>
                    {dayConfig.testConfig.scoreRanges.map(range => (
                      <motion.button
                        key={range.levelKey}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedLevel(range.levelKey)}
                        style={{
                          padding: '14px 28px',
                          backgroundColor: selectedLevel === range.levelKey ? '#3b82f6' : 'transparent',
                          color: selectedLevel === range.levelKey ? 'white' : '#374151',
                          border: 'none',
                          borderBottom: selectedLevel === range.levelKey ? '4px solid #2563eb' : 'none',
                          fontSize: '15px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          borderRadius: '8px 8px 0 0',
                          textTransform: 'capitalize'
                        }}
                      >
                        {getLevelDisplayLabel(range)}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Content Tasks Manager */}
            <motion.div layout style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>
                  📝 Content Tasks {testLevelsDisabled ? '(Single plan)' : currentLevelConfig && `(${getLevelDisplayLabel(currentLevelConfig)})`}
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (!isBaseLanguage) {
                      alert('Add tasks only while editing the English structure.');
                      return;
                    }
                    setShowAddTask(true);
                  }}
                  disabled={!isBaseLanguage}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: !isBaseLanguage ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: !isBaseLanguage ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>+</span> Add Task
                </motion.button>
              </div>

              {/* Task List with Framer Motion Reorder */}
              {currentLevelConfig?.tasks && currentLevelConfig.tasks.length > 0 ? (
                <Reorder.Group
                  axis="y"
                  values={currentLevelConfig.tasks.sort((a, b) => a.taskOrder - b.taskOrder)}
                  onReorder={isBaseLanguage ? handleReorder : () => {}}
                  style={{ listStyle: 'none', padding: 0, margin: 0 }}
                >
                  {currentLevelConfig.tasks
                    .sort((a, b) => a.taskOrder - b.taskOrder)
                    .map((task) => (
                      <Reorder.Item
                        key={task.taskId}
                        value={task}
                        dragListener={isBaseLanguage}
                        style={{ marginBottom: '12px' }}
                      >
                        <TaskCard
                          task={task}
                          selectedLanguage={selectedLanguage}
                          onEdit={() => setEditingTask(task)}
                          onDelete={() => deleteTask(task.taskId)}
                          canDelete={isBaseLanguage}
                        />
                      </Reorder.Item>
                    ))}
                </Reorder.Group>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ 
                    padding: '60px 40px', 
                    textAlign: 'center', 
                    backgroundColor: '#f9fafb', 
                    border: '2px dashed #d1d5db',
                    borderRadius: '12px'
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '8px', fontWeight: '500' }}>
                    No tasks added yet
                  </p>
                  <p style={{ fontSize: '14px', color: '#9ca3af' }}>
                    Click "Add Task" to create your first content task
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Save Button */}
            <motion.div 
              layout
              style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveDayConfig}
                disabled={saving}
                style={{
                  padding: '14px 36px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {saving ? '⏳ Saving...' : '💾 Save Day Configuration'}
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTask && (
          <TaskEditorModal
            selectedLanguage={selectedLanguage}
            structureLocked={!isBaseLanguage}
            selectedDay={selectedDay}
            selectedLevel={selectedLevel}
            onSave={addTask}
            onClose={() => setShowAddTask(false)}
          />
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <TaskEditorModal
            selectedLanguage={selectedLanguage}
            task={editingTask}
            structureLocked={!isBaseLanguage}
            selectedDay={selectedDay}
            selectedLevel={selectedLevel}
            onSave={handleTaskUpdate}
            onClose={() => setEditingTask(null)}
          />
        )}
      </AnimatePresence>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            marginTop: '20px', 
            padding: '16px 20px', 
            backgroundColor: '#fee2e2', 
            border: '2px solid #fecaca', 
            borderRadius: '8px',
            color: '#991b1b',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          ⚠️ {error}
        </motion.div>
      )}

      <AnimatePresence>
        {overlayActive && (
          <motion.div
            key="ui-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15,23,42,0.55)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(2px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                backgroundColor: 'white',
                padding: '28px 36px',
                borderRadius: '18px',
                boxShadow: '0 20px 45px rgba(15,23,42,0.25)',
                textAlign: 'center',
                width: 'min(320px, 90vw)'
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, ease: 'linear', duration: 1 }}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: '4px solid #bfdbfe',
                  borderTopColor: '#2563eb',
                  margin: '0 auto 16px'
                }}
              />
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>{overlayMessage}</p>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Please wait while we update the program.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Task Editor Modal Component with Cloudinary Upload
function TaskEditorModal({ selectedLanguage, task, onSave, onClose, structureLocked = false, selectedDay = null, selectedLevel = 'default' }) {
  const [taskType, setTaskType] = useState(task?.taskType || '');
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [showTitleField, setShowTitleField] = useState(() =>
    shouldShowTitleField(task?.taskType || '', task?.title || '')
  );
  const [showDescriptionField, setShowDescriptionField] = useState(() =>
    shouldShowDescriptionField(task?.taskType || '', task?.description || '')
  );
  const [content, setContent] = useState(task?.content || {});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savingTask, setSavingTask] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const effectiveTaskType = structureLocked && task ? task.taskType : taskType;
  const titleIsRequired = isTitleRequired(effectiveTaskType);
  const descriptionIsRequired = isDescriptionRequired(effectiveTaskType);

  const handleTaskTypeChange = (nextType) => {
    if (structureLocked) return;
    setTaskType(nextType);
    setShowTitleField(shouldShowTitleField(nextType, title));
    setShowDescriptionField(shouldShowDescriptionField(nextType, description));
  };

  const taskTypes = [
    { value: 'video', label: '🎥 Video' },
    { value: 'motivation-message', label: '💪 Motivation Message' },
    { value: 'quick-assessment', label: '📊 Quick Assessment' },
    { value: 'reminder', label: '⏰ Reminder' },
    { value: 'interactive-field', label: '✍️ Interactive Field' },
    { value: 'greeting-message', label: '👋 Greeting Message' },
    { value: 'activity-selector', label: '🎯 Activity Selector' },
    { value: 'calming-video', label: '🧘 Calming Video' },
    { value: 'reflection-prompt', label: '💭 Reflection Prompt' },
    { value: 'feeling-check', label: '😊 How Are You Feeling?' },
    { value: 'audio-message', label: '🔊 Audio Message' },
    { value: 'healthcare-tip', label: '🏥 Healthcare Tip' },
    { value: 'task-checklist', label: '✅ Task Checklist' },
    { value: 'visual-cue', label: '🖼️ Visual Cue with Image' }
  ];

  // Handle image upload to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Please upload a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('❌ File size exceeds 10MB limit');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success) {
            setContent(prev => ({ ...prev, imageUrl: data.url }));
            alert('✅ Image uploaded successfully!');
          } else {
            alert('❌ Upload failed: ' + data.error);
          }
        } else {
          alert('❌ Upload failed');
        }
        setUploading(false);
        setUploadProgress(0);
      };

      xhr.onerror = () => {
        alert('❌ Upload failed');
        setUploading(false);
        setUploadProgress(0);
      };

      xhr.open('POST', '/api/admin/upload-image');
      xhr.send(formData);
    } catch (err) {
      alert('❌ Upload error: ' + err.message);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle audio upload to Cloudinary
  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a', 'audio/x-m4a'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Please upload a valid audio file (MP3, WAV, OGG, AAC, M4A)');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('❌ File size exceeds 100MB limit');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('audio', file);
      formData.append('language', selectedLanguage);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success && data.url) {
            setContent(prev => ({
              ...prev,
              audioUrl: data.url
            }));
            alert('✅ Audio uploaded successfully!');
          } else {
            alert('❌ Upload failed: ' + (data.error || 'Unknown error'));
          }
        } else {
          alert('❌ Upload failed with status: ' + xhr.status);
        }
        setUploading(false);
        setUploadProgress(0);
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        alert('❌ Upload failed. Please try again.');
        setUploading(false);
        setUploadProgress(0);
      });

      // Send request
      xhr.open('POST', '/api/admin/upload-audio');
      xhr.send(formData);

    } catch (err) {
      console.error('Upload error:', err);
      alert('❌ Failed to upload audio');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Please upload a valid video file (MP4, MOV, AVI, MKV)');
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('❌ File size exceeds 500MB limit');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('video', file);
      formData.append('language', selectedLanguage);
      
      // Add day and burden level for auto-save
      if (selectedDay !== null && selectedDay !== undefined) {
        formData.append('day', selectedDay.toString());
      }
      if (selectedLevel && selectedLevel !== 'default') {
        formData.append('burdenLevel', selectedLevel);
      }
      // Add title and description if available
      if (title) {
        formData.append('videoTitle', title);
      }
      if (description) {
        formData.append('description', description);
      }

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          if (data.success && data.url) {
            // Update content with video URL (simple string, not multi-language)
            setContent(prev => ({
              ...prev,
              videoUrl: data.url
            }));
            alert('✅ Video uploaded successfully!');
          } else {
            alert('❌ Upload failed: ' + (data.error || 'Unknown error'));
          }
        } else {
          alert('❌ Upload failed with status: ' + xhr.status);
        }
        setUploading(false);
        setUploadProgress(0);
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        alert('❌ Upload failed. Please try again.');
        setUploading(false);
        setUploadProgress(0);
      });

      // Send request
      xhr.open('POST', '/api/admin/upload-video');
      xhr.send(formData);

    } catch (err) {
      console.error('Upload error:', err);
      alert('❌ Failed to upload video');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async (closeAfter = true) => {
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const includeTitle = showTitleField || titleIsRequired;
    const includeDescription = showDescriptionField || descriptionIsRequired;
    const typeForValidation = effectiveTaskType;

    if (!typeForValidation) {
      alert('⚠️ Please select a task type');
      return;
    }

    if (titleIsRequired && !normalizedTitle) {
      alert('⚠️ This task type needs a title');
      return;
    }

    // Validate content based on task type
    if (typeForValidation === 'video' || typeForValidation === 'calming-video') {
      if (!content.videoUrl) {
        alert('⚠️ Please upload or enter a video URL before adding this task');
        return;
      }
    }

    if (typeForValidation === 'audio-message') {
      if (!content.audioUrl) {
        alert('⚠️ Please upload or enter an audio URL before adding this task');
        return;
      }
    }

    if (typeForValidation === 'motivation-message' || typeForValidation === 'greeting-message' || typeForValidation === 'healthcare-tip') {
      if (!content.textContent) {
        alert('⚠️ Please enter message content before adding this task');
        return;
      }
    }

    if (typeForValidation === 'reflection-prompt') {
      if (!content.reflectionQuestion) {
        alert('⚠️ Please enter a reflection question before adding this task');
        return;
      }
    }

    if (typeForValidation === 'feeling-check') {
      if (!content.feelingQuestion) {
        alert('⚠️ Please enter a feeling question before adding this task');
        return;
      }
    }

    if (typeForValidation === 'reminder') {
      if (!content.reminderMessage) {
        alert('⚠️ Please enter a reminder message before adding this task');
        return;
      }
    }

    if (typeForValidation === 'activity-selector') {
      if (!content.activities || content.activities.length === 0) {
        alert('⚠️ Please add at least one activity before adding this task');
        return;
      }
    }

    if (typeForValidation === 'quick-assessment') {
      if (!content.questions || content.questions.length === 0) {
        alert('⚠️ Please add at least one question before adding this task');
        return;
      }
    }

    if (typeForValidation === 'visual-cue') {
      if (!content.imageUrl) {
        alert('⚠️ Please upload an image before adding this task');
        return;
      }
      if (!content.textContent) {
        alert('⚠️ Please enter a message before adding this task');
        return;
      }
    }

    if (typeForValidation === 'task-checklist') {
      if (!content.checklistQuestion) {
        alert('⚠️ Please enter a question before adding this task');
        return;
      }
    }

    const taskData = {
      taskType: typeForValidation,
      title: includeTitle ? normalizedTitle : '',
      description: includeDescription ? normalizedDescription : '',
      content,
      enabled: true
    };

    // Debug log for task-checklist
    if (typeForValidation === 'task-checklist') {
      console.log('💾 Saving Task Checklist:', {
        taskType: typeForValidation,
        title,
        description,
        checklistQuestion: content.checklistQuestion,
        fullContent: content
      });
    }

    // Debug log for reminder tasks being saved
    if (typeForValidation === 'reminder') {
      console.log('💾 Saving Reminder Task:', {
        taskType: typeForValidation,
        title,
        reminderMessage: content.reminderMessage,
        frequency: content.frequency,
        fullContent: content
      });
    }

    try {
      setSavingTask(true);
      setSaveMessage('');

      const result = await onSave(taskData);

      if (result && result.success) {
        setSaveMessage('✅ Saved successfully');
        if (closeAfter) onClose();
      } else {
        const err = (result && result.error) || 'Failed to save task';
        alert(err);
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save task');
    } finally {
      setSavingTask(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '85vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>
          {task ? '✏️ Edit Task' : '➕ Add New Task'}
        </h3>

        {structureLocked && (
          <div style={{
            marginBottom: '16px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #fde68a',
            backgroundColor: '#fffbeb',
            color: '#92400e',
            fontSize: '13px',
            fontWeight: 600
          }}>
            Structure is locked for this language. Update only the text or localized media; task type, order, and scoring must be edited in English.
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
            Task Type *
          </label>
          <select
            value={taskType}
            onChange={(e) => handleTaskTypeChange(e.target.value)}
            disabled={structureLocked}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '15px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              backgroundColor: structureLocked ? '#f3f4f6' : 'white',
              cursor: structureLocked ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            <option value="">Select task type...</option>
            {taskTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {showTitleField ? (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Title ({selectedLanguage}){titleIsRequired ? ' *' : ''}
              </label>
              {!titleIsRequired && (
                <button
                  type="button"
                  onClick={() => {
                    setShowTitleField(false);
                    setTitle('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Remove title
                </button>
              )}
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
          </div>
        ) : (
          taskType && (
            <button
              type="button"
              onClick={() => setShowTitleField(true)}
              style={{
                marginBottom: '16px',
                padding: '8px 12px',
                backgroundColor: '#e0e7ff',
                color: '#3730a3',
                border: '1px dashed #3730a3',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              + Add optional title
            </button>
          )
        )}

        {showDescriptionField ? (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                Description ({selectedLanguage}){descriptionIsRequired ? ' *' : ''}
              </label>
              {!descriptionIsRequired && (
                <button
                  type="button"
                  onClick={() => {
                    setShowDescriptionField(false);
                    setDescription('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Remove description
                </button>
              )}
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        ) : (
          taskType && (
            <button
              type="button"
              onClick={() => setShowDescriptionField(true)}
              style={{
                marginBottom: '20px',
                padding: '8px 12px',
                backgroundColor: '#ecfccb',
                color: '#4d7c0f',
                border: '1px dashed #4d7c0f',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              + Add optional description
            </button>
          )
        )}

        {/* Type-specific content fields */}
        {(taskType === 'video' || taskType === 'calming-video') && (
          <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f0f9ff', border: '2px solid #bfdbfe', borderRadius: '12px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1e40af' }}>
              🎥 Video Upload ({selectedLanguage})
            </label>
            
            {content.videoUrl && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '6px', marginBottom: '12px' }}>
                  <p style={{ fontSize: '13px', color: '#1e40af', margin: 0, wordBreak: 'break-all' }}>
                    ✅ Video URL: {content.videoUrl}
                  </p>
                </div>
                <video 
                  controls 
                  style={{ 
                    width: '100%', 
                    maxHeight: '300px', 
                    borderRadius: '8px',
                    backgroundColor: '#000',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  src={content.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                disabled={uploading}
                style={{ display: 'none' }}
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                style={{
                  padding: '12px 20px',
                  backgroundColor: uploading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  textAlign: 'center',
                  display: 'block'
                }}
              >
                {uploading ? '⏳ Uploading...' : '📤 Upload Video to Cloudinary'}
              </label>

              {uploading && (
                <div style={{ width: '100%' }}>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: '#e5e7eb', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      style={{ 
                        height: '100%', 
                        backgroundColor: '#3b82f6',
                        transition: 'width 0.3s ease'
                      }} 
                    />
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', textAlign: 'center' }}>
                    {uploadProgress}% uploaded
                  </p>
                </div>
              )}

              <div style={{ borderTop: '1px solid #bfdbfe', paddingTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                  Or enter video URL manually:
                </label>
                <input
                  type="text"
                  value={content.videoUrl || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    videoUrl: e.target.value
                  }))}
                  placeholder="https://..."
                  disabled={uploading}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {(taskType === 'motivation-message' || taskType === 'greeting-message' || taskType === 'healthcare-tip') && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Message Content ({selectedLanguage})
            </label>
            <textarea
              value={content.textContent || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                textContent: e.target.value
              }))}
              placeholder="Enter message content"
              rows={5}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        )}

        {taskType === 'reflection-prompt' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Reflection Question ({selectedLanguage})
            </label>
            <textarea
              value={content.reflectionQuestion || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                reflectionQuestion: e.target.value
              }))}
              placeholder="e.g., How are you feeling today? How stressed do you feel?"
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                  Left Label (Min Value)
                </label>
                <input
                  type="text"
                  value={content.sliderLeftLabel || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    sliderLeftLabel: e.target.value
                  }))}
                  placeholder="e.g., Not Well / Very Stressed"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                  Right Label (Max Value)
                </label>
                <input
                  type="text"
                  value={content.sliderRightLabel || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    sliderRightLabel: e.target.value
                  }))}
                  placeholder="e.g., Very Well / Not Stressed"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>
            
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
              💡 Caregiver will use a slider (0-100%) to respond based on your custom labels
            </p>
          </div>
        )}

        {taskType === 'feeling-check' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Feeling Question ({selectedLanguage})
            </label>
            <textarea
              value={content.feelingQuestion || ''}
              onChange={(e) => setContent(prev => ({
                ...prev,
                feelingQuestion: e.target.value
              }))}
              placeholder="e.g., How are you feeling right now?"
              rows={2}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
              💡 Caregiver will select from 4 emojis: 😊 🙂 😐 😔
            </p>
          </div>
        )}

        {taskType === 'audio-message' && (
          <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f5f3ff', border: '2px solid #c4b5fd', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: 0, marginBottom: '16px', color: '#5b21b6' }}>
              🔊 Audio File Management
            </h4>

            {content.audioUrl ? (
              <div>
                {/* Current Audio Display */}
                <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'white', border: '2px solid #ddd6fe', borderRadius: '10px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#6b7280' }}>
                    Current Audio:
                  </label>
                  <audio 
                    controls 
                    src={content.audioUrl}
                    style={{ width: '100%', marginBottom: '12px' }}
                  />
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b7280', wordBreak: 'break-all' }}>
                    🔗 {content.audioUrl}
                  </p>
                </div>

                {/* Replace and Delete Buttons */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <label style={{ flex: '1', minWidth: '150px' }}>
                    <input
                      type="file"
                      accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,audio/m4a"
                      onChange={handleAudioUpload}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: uploading ? '#9ca3af' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        textAlign: 'center',
                        opacity: uploading ? 0.7 : 1
                      }}
                    >
                      {uploading ? `⏳ Uploading... ${uploadProgress}%` : '🔄 Replace Audio'}
                    </motion.div>
                  </label>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (confirm('⚠️ Are you sure you want to delete this audio?')) {
                        setContent(prev => ({ ...prev, audioUrl: '' }));
                      }
                    }}
                    disabled={uploading}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      opacity: uploading ? 0.5 : 1
                    }}
                  >
                    🗑️ Delete Audio
                  </motion.button>
                </div>
              </div>
            ) : (
              <div>
                {/* Upload New Audio */}
                <label style={{ display: 'block', cursor: uploading ? 'not-allowed' : 'pointer' }}>
                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,audio/m4a"
                    onChange={handleAudioUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                  <motion.div
                    whileHover={{ scale: uploading ? 1 : 1.02 }}
                    whileTap={{ scale: uploading ? 1 : 0.98 }}
                    style={{
                      padding: '40px 20px',
                      backgroundColor: uploading ? '#f3f4f6' : 'white',
                      border: '3px dashed #c4b5fd',
                      borderRadius: '12px',
                      textAlign: 'center',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔊</div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#5b21b6' }}>
                      {uploading ? `⏳ Uploading... ${uploadProgress}%` : '📤 Upload Audio File'}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                      Click to browse (MP3, WAV, OGG, AAC, M4A - Max 100MB)
                    </p>
                    {uploading && (
                      <div style={{ marginTop: '16px', width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress}%`, backgroundColor: '#8b5cf6', height: '100%', transition: 'width 0.3s' }} />
                      </div>
                    )}
                  </motion.div>
                </label>

                {/* Manual URL Input Option */}
                <div style={{ marginTop: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#6b7280', textAlign: 'center' }}>
                    Or enter audio URL manually:
                  </p>
                  <input
                    type="text"
                    value={content.audioUrl || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, audioUrl: e.target.value }))}
                    placeholder="https://example.com/audio.mp3"
                    disabled={uploading}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: '14px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: uploading ? '#f9fafb' : 'white'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {taskType === 'visual-cue' && (
          <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#fef2f2', border: '2px solid #fecaca', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: 0, marginBottom: '16px', color: '#991b1b' }}>
              🖼️ Visual Cue with Image
            </h4>

            {/* Image Upload Section */}
            {content.imageUrl ? (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'white', border: '2px solid #fecaca', borderRadius: '10px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#6b7280' }}>
                    Current Image:
                  </label>
                  <img 
                    src={content.imageUrl}
                    alt="Visual cue"
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', marginBottom: '12px' }}
                  />
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6b7280', wordBreak: 'break-all' }}>
                    🔗 {content.imageUrl}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <label style={{ flex: '1', minWidth: '150px' }}>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: '12px 20px',
                        backgroundColor: uploading ? '#9ca3af' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        textAlign: 'center',
                        opacity: uploading ? 0.7 : 1
                      }}
                    >
                      {uploading ? `⏳ Uploading... ${uploadProgress}%` : '🔄 Replace Image'}
                    </motion.div>
                  </label>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (confirm('⚠️ Are you sure you want to delete this image?')) {
                        setContent(prev => ({ ...prev, imageUrl: '' }));
                      }
                    }}
                    disabled={uploading}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      opacity: uploading ? 0.5 : 1
                    }}
                  >
                    🗑️ Delete Image
                  </motion.button>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', cursor: uploading ? 'not-allowed' : 'pointer' }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                  <motion.div
                    whileHover={{ scale: uploading ? 1 : 1.02 }}
                    whileTap={{ scale: uploading ? 1 : 0.98 }}
                    style={{
                      padding: '40px 20px',
                      backgroundColor: uploading ? '#f3f4f6' : 'white',
                      border: '3px dashed #fecaca',
                      borderRadius: '12px',
                      textAlign: 'center',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🖼️</div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#991b1b' }}>
                      {uploading ? `⏳ Uploading... ${uploadProgress}%` : '📤 Upload Image'}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                      Click to browse (JPEG, PNG, GIF, WebP - Max 10MB)
                    </p>
                    {uploading && (
                      <div style={{ marginTop: '16px', width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress}%`, backgroundColor: '#dc2626', height: '100%', transition: 'width 0.3s' }} />
                      </div>
                    )}
                  </motion.div>
                </label>

                <div style={{ marginTop: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#6b7280', textAlign: 'center' }}>
                    Or enter image URL manually:
                  </p>
                  <input
                    type="text"
                    value={content.imageUrl || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    disabled={uploading}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: '14px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      backgroundColor: uploading ? '#f9fafb' : 'white'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Message Text Area */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Message ({selectedLanguage})
              </label>
              <textarea
                value={content.textContent || ''}
                onChange={(e) => setContent(prev => ({ ...prev, textContent: e.target.value }))}
                placeholder="Enter message to display with the image..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '15px',
                  border: '2px solid #fecaca',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>
        )}

        {taskType === 'task-checklist' && (
          <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#e0e7ff', border: '2px solid #a5b4fc', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: 0, marginBottom: '16px', color: '#3730a3' }}>
              ✅ Task Checklist Question
            </h4>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Question ({selectedLanguage})
              </label>
              <textarea
                value={content.checklistQuestion || ''}
                onChange={(e) => setContent(prev => ({ ...prev, checklistQuestion: e.target.value }))}
                placeholder="e.g., Did you complete your daily exercise?"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                💡 Caregiver will answer with Yes or No
              </p>
            </div>
          </div>
        )}

        {taskType === 'reminder' && (
          <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginTop: 0, marginBottom: '16px', color: '#92400e' }}>
              ⏰ Reminder Schedule Settings
            </h4>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Reminder Message ({selectedLanguage})
              </label>
              <textarea
                value={content.reminderMessage || ''}
                onChange={(e) => setContent(prev => ({ ...prev, reminderMessage: e.target.value }))}
                placeholder="Enter reminder message that will be shown in notification"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '2px solid #fbbf24',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#fff7ed', border: '2px solid #fed7aa', borderRadius: '10px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
                👥 Target Audience
              </label>
              <select
                value={content.targetAudience || 'all'}
                onChange={(e) => {
                  const value = e.target.value;
                  setContent(prev => ({ 
                    ...prev, 
                    targetAudience: value,
                    targetLevels: value === 'all' ? [] : (prev.targetLevels || [])
                  }));
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '2px solid #fbbf24',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontWeight: '500',
                  marginBottom: '12px'
                }}
              >
                <option value="all">🌍 All Caregivers</option>
                <option value="specific">🎯 Specific Groups (by burden/stress level)</option>
              </select>

              {content.targetAudience === 'specific' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#92400e', marginBottom: '12px', fontWeight: '500' }}>
                    Select which caregiver groups should receive this reminder:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                      { key: 'mild', label: '🟢 Mild', description: 'Low burden/stress level' },
                      { key: 'moderate', label: '🟡 Moderate', description: 'Medium burden/stress level' },
                      { key: 'severe', label: '🔴 Severe', description: 'High burden/stress level' }
                    ].map(level => {
                      const isSelected = (content.targetLevels || []).includes(level.key);
                      return (
                        <label
                          key={level.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px',
                            backgroundColor: isSelected ? '#fef3c7' : 'white',
                            border: `2px solid ${isSelected ? '#fbbf24' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontWeight: isSelected ? '600' : '400'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const levels = content.targetLevels || [];
                              const updated = e.target.checked
                                ? [...levels, level.key]
                                : levels.filter(l => l !== level.key);
                              setContent(prev => ({ ...prev, targetLevels: updated }));
                            }}
                            style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                          <div>
                            <div style={{ fontSize: '14px', color: '#374151' }}>{level.label}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{level.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {(!content.targetLevels || content.targetLevels.length === 0) && (
                    <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '8px', margin: '8px 0 0 0', fontWeight: '500' }}>
                      ⚠️ Please select at least one group
                    </p>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Frequency
              </label>
              <select
                value={content.frequency || 'daily'}
                onChange={(e) => setContent(prev => ({ ...prev, frequency: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '2px solid #fbbf24',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <option value="daily">📅 Daily</option>
                <option value="weekly">📆 Weekly</option>
                <option value="custom">🕐 Custom Time</option>
              </select>
            </div>

            {content.frequency === 'weekly' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#374151' }}>
                  Select Days of Week
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => {
                    const isSelected = (content.weekDays || []).includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const days = content.weekDays || [];
                          const updated = isSelected
                            ? days.filter(d => d !== day)
                            : [...days, day];
                          setContent(prev => ({ ...prev, weekDays: updated }));
                        }}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: isSelected ? '#fbbf24' : 'white',
                          color: isSelected ? '#78350f' : '#6b7280',
                          border: `2px solid ${isSelected ? '#f59e0b' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                Time
              </label>
              <input
                type="time"
                value={content.reminderTime || '09:00'}
                onChange={(e) => setContent(prev => ({ ...prev, reminderTime: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '2px solid #fbbf24',
                  borderRadius: '8px',
                  fontWeight: '500'
                }}
              />
            </div>

            {content.frequency === 'custom' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  Custom Schedule (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={content.customInterval || 60}
                  onChange={(e) => setContent(prev => ({ ...prev, customInterval: parseInt(e.target.value) || 60 }))}
                  placeholder="e.g., 30 for every 30 minutes"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '14px',
                    border: '2px solid #fbbf24',
                    borderRadius: '8px'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#92400e', marginTop: '6px', margin: '6px 0 0 0' }}>
                  Set interval in minutes (e.g., 30 = every 30 minutes, 120 = every 2 hours)
                </p>
              </div>
            )}

            <div style={{ padding: '12px', backgroundColor: '#fff7ed', borderRadius: '8px', border: '1px solid #fdba74' }}>
              <p style={{ fontSize: '13px', color: '#9a3412', margin: 0, lineHeight: '1.6' }}>
                <strong>ℹ️ Preview:</strong> {content.frequency === 'daily' ? 'Daily' : content.frequency === 'weekly' ? `Weekly on ${(content.weekDays || []).join(', ') || 'no days selected'}` : `Every ${content.customInterval || 60} minutes`} at {content.reminderTime || '09:00'}
                <br />
                <strong>👥 Audience:</strong> {content.targetAudience === 'specific' && content.targetLevels?.length > 0 ? `${content.targetLevels.join(', ')} caregivers only` : 'All caregivers'}
              </p>
            </div>
          </div>
        )}

        {taskType === 'interactive-field' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
              Field Type
            </label>
            <select
              value={content.fieldType || 'text'}
              onChange={(e) => {
                console.log('🔄 Field type changed to:', e.target.value);
                setContent(prev => {
                  const updated = { ...prev, fieldType: e.target.value };
                  console.log('📝 Updated content:', updated);
                  return updated;
                });
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '15px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="text">Text Input</option>
              <option value="textarea">Text Area</option>
              <option value="rating">Rating (1-5)</option>
              <option value="mood-selector">Mood Selector</option>
            </select>
            
            <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#fef3c7', borderRadius: '6px', fontSize: '12px', color: '#92400e' }}>
              ℹ️ Current fieldType: <strong>{content.fieldType || 'text'}</strong> | Showing textarea fields: <strong>{content.fieldType === 'textarea' ? 'YES' : 'NO'}</strong>
            </div>

            {content.fieldType !== 'textarea' && (
              <>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginTop: '12px', marginBottom: '8px', color: '#374151' }}>
                  Placeholder ({selectedLanguage})
                </label>
                <input
                  type="text"
                  value={content.placeholder || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    placeholder: e.target.value
                  }))}
                  placeholder="Enter placeholder text"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '15px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </>
            )}

            {content.fieldType === 'textarea' && (
              <>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginTop: '16px', marginBottom: '8px', color: '#374151' }}>
                  Problem Label ({selectedLanguage})
                </label>
                <textarea
                  value={content.problemLabel || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    problemLabel: e.target.value
                  }))}
                  placeholder="Enter label for the problem field (e.g., 'What is your main challenge?')"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '15px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />

                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginTop: '16px', marginBottom: '8px', color: '#374151' }}>
                  Solution Label ({selectedLanguage})
                </label>
                <textarea
                  value={content.solutionLabel || ''}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    solutionLabel: e.target.value
                  }))}
                  placeholder="Enter label for the solution field (e.g., 'What solutions can you think of?')"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '15px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </>
            )}
          </div>
        )}

        {taskType === 'quick-assessment' && (
          <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e6eef8', borderRadius: '8px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
              📊 Quick Assessment Questions ({(content.questions || []).length})
            </label>

            {(content.questions || []).map((q, qi) => (
              <div key={qi} style={{ marginBottom: '10px', padding: '10px', background: 'white', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px' }}>Question {qi + 1}</strong>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={q.questionType || 'yes-no'}
                      onChange={(e) => {
                        const updated = (content.questions || []).slice();
                        updated[qi] = { ...updated[qi], questionType: e.target.value };
                        // ensure options for yes-no
                        if (e.target.value === 'yes-no') {
                          updated[qi].options = [{ optionText: 'Yes' }, { optionText: 'No' }];
                        }
                        setContent(prev => ({ ...prev, questions: updated }));
                      }}
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    >
                      <option value="yes-no">Yes / No</option>
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="rating">Rating (1-5)</option>
                    </select>
                    <button
                      onClick={() => {
                        if (!confirm('⚠️ Delete this question?')) return;
                        const updated = (content.questions || []).filter((_, i) => i !== qi);
                        setContent(prev => ({ ...prev, questions: updated }));
                      }}
                      style={{ padding: '6px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <textarea
                  value={q.questionText || ''}
                  onChange={(e) => {
                    const updated = (content.questions || []).slice();
                    updated[qi] = { ...updated[qi], questionText: e.target.value };
                    setContent(prev => ({ ...prev, questions: updated }));
                  }}
                  placeholder="Enter question text"
                  rows={2}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '8px' }}
                />

                {q.questionType === 'multiple-choice' && (
                  <div style={{ marginLeft: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '13px' }}>Options</strong>
                      <button
                        onClick={() => {
                          const updated = (content.questions || []).slice();
                          updated[qi] = { ...updated[qi], options: [...(updated[qi].options || []), { optionText: '' }] };
                          setContent(prev => ({ ...prev, questions: updated }));
                        }}
                        style={{ padding: '6px 10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      >+ Add Option</button>
                    </div>
                    {(q.options || []).map((opt, oi) => (
                      <div key={oi} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        <input
                          type="text"
                          value={opt.optionText || ''}
                          onChange={(e) => {
                            const updated = (content.questions || []).slice();
                            updated[qi].options = updated[qi].options.slice();
                            updated[qi].options[oi] = { ...updated[qi].options[oi], optionText: e.target.value };
                            setContent(prev => ({ ...prev, questions: updated }));
                          }}
                          placeholder={`Option ${oi + 1}`}
                          style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                        <button
                          onClick={() => {
                            const updated = (content.questions || []).slice();
                            updated[qi].options = updated[qi].options.filter((_, i) => i !== oi);
                            setContent(prev => ({ ...prev, questions: updated }));
                          }}
                          style={{ padding: '6px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div style={{ marginTop: '8px' }}>
              <button
                onClick={() => {
                  const q = { questionText: '', questionType: 'yes-no', options: [{ optionText: 'Yes' }, { optionText: 'No' }] };
                  setContent(prev => ({ ...prev, questions: [...(prev.questions || []), q] }));
                }}
                style={{ padding: '10px 14px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >+ Add Yes/No Question</button>
            </div>
          </div>
        )}

        {taskType === 'activity-selector' && (
          <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#374151' }}>
              🎯 Activities ({(content.activities || []).length})
            </label>

            {(content.activities || []).map((activity, ai) => (
              <div key={ai} style={{ marginBottom: '12px', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', color: '#075985' }}>Activity {ai + 1}</strong>
                  <button
                    onClick={() => {
                      if (!confirm('⚠️ Delete this activity?')) return;
                      const updated = (content.activities || []).filter((_, i) => i !== ai);
                      setContent(prev => ({ ...prev, activities: updated }));
                    }}
                    style={{ padding: '6px 10px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    🗑️ Delete
                  </button>
                </div>

                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
                  Activity Name ({selectedLanguage})
                </label>
                <input
                  type="text"
                  value={activity.activityName || ''}
                  onChange={(e) => {
                    const updated = (content.activities || []).slice();
                    updated[ai] = { ...updated[ai], activityName: e.target.value };
                    setContent(prev => ({ ...prev, activities: updated }));
                  }}
                  placeholder="e.g., Take a Walk, Read a Book, Call a Friend"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '10px', fontSize: '14px' }}
                />

                
              </div>
            ))}

            <div style={{ marginTop: '12px' }}>
              <button
                onClick={() => {
                  const newActivity = { activityName: '', activityDescription: '' };
                  setContent(prev => ({ ...prev, activities: [...(prev.activities || []), newActivity] }));
                }}
                style={{ padding: '10px 16px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
              >
                + Add Activity
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '28px', paddingTop: '20px', borderTop: '2px solid #e5e7eb', alignItems: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            disabled={uploading || savingTask}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: uploading || savingTask ? 'not-allowed' : 'pointer',
              opacity: uploading || savingTask ? 0.5 : 1
            }}
          >
            Cancel
          </motion.button>
          {taskType === 'quick-assessment' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSave(false)}
              disabled={uploading || savingTask}
              style={{
                padding: '12px 24px',
                backgroundColor: savingTask ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: uploading || savingTask ? 'not-allowed' : 'pointer',
                opacity: uploading || savingTask ? 0.6 : 1
              }}
            >
              {savingTask ? '⏳ Saving...' : '💾 Save Questions'}
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSave(true)}
            disabled={uploading || savingTask}
            style={{
              padding: '12px 28px',
              backgroundColor: uploading || savingTask ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: uploading || savingTask ? 'not-allowed' : 'pointer'
            }}
          >
            {task ? '💾 Update Task' : '➕ Add Task'}
          </motion.button>
          {saveMessage && (
            <div style={{ marginLeft: '12px', color: '#10b981', fontWeight: 600 }}>{saveMessage}</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// TaskCard Component - Individual task display with animations
function TaskCard({ task, selectedLanguage, onEdit, onDelete, canDelete = true }) {
  // Debug log for reminder tasks
  if (task.taskType === 'reminder') {
    console.log('📋 Reminder Task Card Data:', {
      taskType: task.taskType,
      title: task.title,
      hasContent: !!task.content,
      reminderMessage: task.content?.reminderMessage,
      frequency: task.content?.frequency,
      fullContent: task.content
    });
  }
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
      style={{
        padding: '20px',
        backgroundColor: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        cursor: 'grab',
        transition: 'box-shadow 0.2s'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, marginRight: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ 
              padding: '6px 12px', 
              backgroundColor: '#dbeafe', 
              color: '#1e40af', 
              borderRadius: '6px', 
              fontSize: '13px', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{ fontSize: '16px' }}>☰</span> #{task.taskOrder}
            </span>
            <span style={{ 
              padding: '6px 12px', 
              backgroundColor: getTypeColor(task.taskType).bg, 
              color: getTypeColor(task.taskType).text, 
              borderRadius: '6px', 
              fontSize: '12px', 
              fontWeight: '600',
              textTransform: 'capitalize'
            }}>
              {getTypeIcon(task.taskType)} {task.taskType.replace(/-/g, ' ')}
            </span>
          </div>
          <p style={{ fontSize: '16px', fontWeight: '600', margin: '8px 0', color: '#111827' }}>
            {task.title || 'Untitled Task'}
          </p>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.5' }}>
            {task.description || 'No description'}
          </p>

          {task.taskType === 'quick-assessment' && task.content?.questions && (
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#374151' }}>
              <strong>Questions:</strong> {(task.content.questions || []).length} question(s)
              {(task.content.questions || []).slice(0, 2).map((q, i) => (
                <div key={i} style={{ marginTop: '6px', color: '#6b7280' }}>{i + 1}. {typeof q.questionText === 'string' ? q.questionText : JSON.stringify(q.questionText)}</div>
              ))}
            </div>
          )}

          {(task.taskType === 'video' || task.taskType === 'calming-video') && task.content?.videoUrl && (
            <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#f0f9ff', border: '2px solid #bae6fd', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '600', color: '#0c4a6e' }}>
                🎥 Video Preview:
              </p>
              <video 
                controls 
                style={{ width: '100%', maxHeight: '200px', borderRadius: '6px', backgroundColor: '#000' }}
                src={task.content.videoUrl}
              />
            </div>
          )}

          {task.taskType === 'audio-message' && task.content?.audioUrl && (
            <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#f5f3ff', border: '2px solid #c4b5fd', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '600', color: '#5b21b6' }}>
                🔊 Audio Preview:
              </p>
              <audio 
                controls 
                style={{ width: '100%' }}
                src={task.content.audioUrl}
              />
            </div>
          )}

          {(task.taskType === 'motivation-message' || task.taskType === 'greeting-message' || task.taskType === 'healthcare-tip') && task.content?.textContent && (
            <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#92400e' }}>
                💬 Message:
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#78350f', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                {task.content.textContent.length > 150 ? task.content.textContent.substring(0, 150) + '...' : task.content.textContent}
              </p>
            </div>
          )}

          {task.taskType === 'reflection-prompt' && task.content?.reflectionQuestion && (
            <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#92400e' }}>
                💭 Question:
              </p>
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#78350f', lineHeight: '1.5' }}>
                {task.content.reflectionQuestion}
              </p>
              {(task.content.sliderLeftLabel || task.content.sliderRightLabel) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#92400e', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #fde68a' }}>
                  <span>📍 Left: {task.content.sliderLeftLabel || 'Not set'}</span>
                  <span>📍 Right: {task.content.sliderRightLabel || 'Not set'}</span>
                </div>
              )}
            </div>
          )}

          {task.taskType === 'feeling-check' && task.content?.feelingQuestion && (
            <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#991b1b' }}>
                😊 Question:
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#7f1d1d', lineHeight: '1.5' }}>
                {task.content.feelingQuestion}
              </p>
            </div>
          )}

          {task.taskType === 'activity-selector' && task.content?.activities && task.content.activities.length > 0 && (
            <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '600', color: '#0c4a6e' }}>
                🎯 Activities: {task.content.activities.length}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {task.content.activities.slice(0, 3).map((activity, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: '#075985', padding: '6px', backgroundColor: '#e0f2fe', borderRadius: '4px' }}>
                    • {activity.activityName}
                  </div>
                ))}
                {task.content.activities.length > 3 && (
                  <div style={{ fontSize: '11px', color: '#6b7280', fontStyle: 'italic' }}>
                    +{task.content.activities.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}

          {task.taskType === 'reminder' && task.content && (
            <div style={{ marginTop: '14px', padding: '14px', backgroundColor: '#fef3c7', border: '2px solid #fbbf24', borderRadius: '8px' }}>
              {task.content.reminderMessage && (
                <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: '#fffbeb', borderRadius: '6px', border: '1px solid #fde68a' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📢 Reminder Message
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#78350f', lineHeight: '1.6', fontWeight: '500' }}>
                    {task.content.reminderMessage}
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '12px' }}>
                {task.content.frequency && (
                  <span style={{ padding: '6px 12px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {task.content.frequency === 'daily' && '📅 Daily'}
                    {task.content.frequency === 'weekly' && `📆 Weekly${task.content.weekDays && task.content.weekDays.length > 0 ? ` (${task.content.weekDays.join(', ')})` : ''}`}
                    {task.content.frequency === 'custom' && `🔄 Every ${task.content.customInterval || 60} min`}
                    {!['daily', 'weekly', 'custom'].includes(task.content.frequency) && '📅 Not Set'}
                  </span>
                )}
                {task.content.frequency !== 'custom' && (
                  <span style={{ padding: '6px 12px', backgroundColor: '#e0e7ff', color: '#3730a3', borderRadius: '6px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    ⏰ {task.content.reminderTime || '09:00'}
                  </span>
                )}
                <span style={{ 
                  padding: '6px 12px', 
                  backgroundColor: (task.content.targetAudience || 'all') === 'all' ? '#d1fae5' : '#fed7aa', 
                  color: (task.content.targetAudience || 'all') === 'all' ? '#065f46' : '#9a3412', 
                  borderRadius: '6px', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  👥 {(task.content.targetAudience || 'all') === 'all' ? 'All Caregivers' : `${(task.content.targetLevels || []).join(', ')} only`}
                </span>
              </div>
            </div>
          )}

          {task.taskType === 'interactive-field' && task.content && (() => {
            const fieldType = task.content.fieldType || 'text';
            const problemLabel = task.content.problemLabel || 'Problem';
            const solutionLabel = task.content.solutionLabel || 'Solution';
            const placeholder = task.content.placeholder || 'Caregiver response...';
            const previewStyles = {
              wrapper: {
                marginTop: '14px',
                padding: '12px',
                backgroundColor: '#dcfce7',
                border: '1px solid #86efac',
                borderRadius: '8px'
              },
              input: {
                width: '100%',
                padding: '10px',
                fontSize: '13px',
                border: '1px solid #86efac',
                borderRadius: '6px',
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                fontFamily: 'inherit'
              }
            };

            if (fieldType === 'textarea') {
              return (
                <div style={previewStyles.wrapper}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 600, color: '#15803d' }}>{problemLabel}</p>
                      <textarea disabled rows={3} placeholder={placeholder} style={{ ...previewStyles.input, resize: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 600, color: '#15803d' }}>{solutionLabel}</p>
                      <textarea disabled rows={3} placeholder="Describe the solution..." style={{ ...previewStyles.input, resize: 'none' }} />
                    </div>
                  </div>
                </div>
              );
            }

            if (fieldType === 'rating') {
              return (
                <div style={previewStyles.wrapper}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#166534' }}>Caregiver sees a 1-5 rating scale</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1, 2, 3, 4, 5].map(num => (
                      <div key={num} style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        border: num === 3 ? '3px solid #f59e0b' : '2px solid #bbf7d0',
                        backgroundColor: num === 3 ? '#fef3c7' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        color: '#166534'
                      }}>
                        {num}
                      </div>
                    ))}
                  </div>
                  <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#15803d' }}>
                    Placeholder: {placeholder}
                  </p>
                </div>
              );
            }

            if (fieldType === 'mood-selector') {
              const moods = [
                { emoji: '😌', label: 'Calm' },
                { emoji: '😣', label: 'Stressed' },
                { emoji: '😫', label: 'Overwhelmed' },
                { emoji: '😊', label: 'Grateful' }
              ];
              return (
                <div style={previewStyles.wrapper}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600, color: '#166534' }}>Caregiver picks one mood:</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {moods.map(mood => (
                      <div key={mood.label} style={{
                        flex: '1 0 120px',
                        minWidth: '120px',
                        padding: '12px',
                        borderRadius: '10px',
                        border: '2px solid #bbf7d0',
                        backgroundColor: '#f0fdf4',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: '600',
                        color: '#15803d'
                      }}>
                        <span style={{ fontSize: '24px' }}>{mood.emoji}</span>
                        <span style={{ fontSize: '13px' }}>{mood.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div style={previewStyles.wrapper}>
                <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 600, color: '#15803d' }}>Single text input</p>
                <input type="text" disabled placeholder={placeholder} style={previewStyles.input} />
              </div>
            );
          })()}

          {task.taskType === 'visual-cue' && task.content && (
            <div style={{ marginTop: '14px', padding: '14px', backgroundColor: '#fef2f2', border: '2px solid #fecaca', borderRadius: '8px' }}>
              {task.content.imageUrl && (
                <div style={{ marginBottom: '12px' }}>
                  <img 
                    src={task.content.imageUrl}
                    alt="Visual cue"
                    style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }}
                  />
                </div>
              )}
              {task.content.textContent && (
                <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #fecaca' }}>
                  <p style={{ margin: 0, fontSize: '13px', color: '#7f1d1d', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {task.content.textContent.length > 150 ? task.content.textContent.substring(0, 150) + '...' : task.content.textContent}
                  </p>
                </div>
              )}
            </div>
          )}

          {task.taskType === 'task-checklist' && task.content && (
            <div style={{ marginTop: '14px', padding: '14px', backgroundColor: '#e0e7ff', border: '2px solid #a5b4fc', borderRadius: '8px' }}>
              {task.content.checklistQuestion && (
                <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #a5b4fc' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#3730a3', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ❓ Question
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#3730a3', lineHeight: '1.6', fontWeight: '500' }}>
                    {task.content.checklistQuestion}
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#6366f1', fontStyle: 'italic' }}>
                    ✅ Yes / ❌ No response
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onEdit}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ✏️ Edit
          </motion.button>
          {canDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🗑️ Delete
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Helper functions for task types
function getTypeIcon(type) {
  const icons = {
    'video': '🎥',
    'motivation-message': '💪',
    'quick-assessment': '📊',
    'reminder': '⏰',
    'interactive-field': '✍️',
    'greeting-message': '👋',
    'activity-selector': '🎯',
    'calming-video': '🧘',
    'reflection-prompt': '💭',
    'feeling-check': '😊',
    'audio-message': '🔊',
    'healthcare-tip': '🏥',
    'task-checklist': '✅',
    'visual-cue': '🖼️'
  };
  return icons[type] || '📄';
}

function getTypeColor(type) {
  const colors = {
    'video': { bg: '#dbeafe', text: '#1e40af' },
    'motivation-message': { bg: '#fef3c7', text: '#92400e' },
    'quick-assessment': { bg: '#e0e7ff', text: '#3730a3' },
    'reminder': { bg: '#fee2e2', text: '#991b1b' },
    'interactive-field': { bg: '#dcfce7', text: '#166534' },
    'greeting-message': { bg: '#fce7f3', text: '#9f1239' },
    'activity-selector': { bg: '#e0f2fe', text: '#075985' },
    'calming-video': { bg: '#f3e8ff', text: '#6b21a8' },
    'reflection-prompt': { bg: '#fef9c3', text: '#854d0e' },
    'feeling-check': { bg: '#fed7aa', text: '#9a3412' },
    'audio-message': { bg: '#ddd6fe', text: '#5b21b6' },
    'healthcare-tip': { bg: '#d1fae5', text: '#065f46' },
    'task-checklist': { bg: '#e0e7ff', text: '#3730a3' },
    'visual-cue': { bg: '#fef2f2', text: '#991b1b' }
  };
  return colors[type] || { bg: '#f3f4f6', text: '#374151' };
}

// Test Configuration Editor Component
function TestConfigEditor({ testConfig, selectedLanguage, hasUnsavedChanges = false, onChange, structureLocked = false }) {
  const [showQuestions, setShowQuestions] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [followupEditor, setFollowupEditor] = useState(null);
  const scoreRanges = Array.isArray(testConfig.scoreRanges) ? testConfig.scoreRanges : [];
  const hasExistingFollowups = Array.isArray(testConfig.questions)
    ? testConfig.questions.some(question =>
        Array.isArray(question?.options) && question.options.some(option => option?.followupTask))
    : false;
  const followupToggleActive = testConfig.enableFollowupTasks === undefined
    ? hasExistingFollowups
    : Boolean(testConfig.enableFollowupTasks);
  const allowFollowupConfig = followupToggleActive || hasExistingFollowups;
  const levelsDisabled = Boolean(testConfig.disableLevels);
  const isBaseLanguage = selectedLanguage === BASE_LANGUAGE;
  const guardStructureChange = () => {
    if (!structureLocked) return false;
    alert('Structure changes (levels/questions/options) are only editable in the English base language.');
    return true;
  };

  const handleFollowupToggleChange = (checked) => {
    if (structureLocked) return;
    if (!checked && hasExistingFollowups) {
      const confirmDisable = confirm('Follow-up tasks already exist. Disable them and hide the extra tasks?');
      if (!confirmDisable) return;
    }
    onChange({
      ...testConfig,
      enableFollowupTasks: checked
    });
  };

  const handleDisableLevelsToggle = (checked) => {
    if (structureLocked) return;
    onChange({
      ...testConfig,
      disableLevels: checked
    });
  };
  
  const buildDefaultOptions = () => {
    return getDefaultOptionLabels(selectedLanguage).map((label, idx) => ({
      optionText: label,
      score: idx
    }));
  };

  const addQuestion = () => {
    if (guardStructureChange()) return;
    const newQuestion = {
      id: (testConfig.questions?.length || 0) + 1,
      questionText: '',
      options: buildDefaultOptions(),
      enabled: true
    };
    
    onChange({
      ...testConfig,
      questions: [...(testConfig.questions || []), newQuestion]
    });
  };

  const openFollowupEditor = (questionIndex, optionIndex) => {
    const option = testConfig.questions?.[questionIndex]?.options?.[optionIndex];
    if (!option) return;
    if (structureLocked && !option.followupTask) {
      alert('Create follow-up tasks in the English base language first.');
      return;
    }
    setFollowupEditor({
      questionIndex,
      optionIndex,
      task: option.followupTask ? cloneDeep(option.followupTask) : null
    });
  };

  const handleFollowupSave = async (questionIndex, optionIndex, taskPayload) => {
    const updatedQuestions = testConfig.questions.map((question, qIdx) => {
      if (qIdx !== questionIndex) return question;
      const updatedOptions = question.options.map((opt, oIdx) => {
        if (oIdx !== optionIndex) return opt;
        const optionKey = opt.optionKey || `q${questionIndex + 1}_opt${optionIndex + 1}`;
        const existingTaskId = opt.followupTask?.taskId;
        return {
          ...opt,
          followupTask: {
            ...cloneDeep(taskPayload),
            taskId: taskPayload.taskId || existingTaskId || `${optionKey}_followup`,
            enabled: taskPayload.enabled !== false
          }
        };
      });
      return { ...question, options: updatedOptions };
    });

    onChange({
      ...testConfig,
      questions: updatedQuestions
    });
    setFollowupEditor(null);
    return { success: true };
  };

  const handleRemoveFollowup = (questionIndex, optionIndex) => {
    if (!isBaseLanguage) {
      alert('Remove follow-up tasks only while editing English.');
      return;
    }
    if (!confirm('Remove this follow-up task?')) return;

    const updatedQuestions = testConfig.questions.map((question, qIdx) => {
      if (qIdx !== questionIndex) return question;
      const updatedOptions = question.options.map((opt, oIdx) => (
        oIdx === optionIndex ? { ...opt, followupTask: null } : opt
      ));
      return { ...question, options: updatedOptions };
    });

    onChange({
      ...testConfig,
      questions: updatedQuestions
    });
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...testConfig.questions];
    updated[index][field] = value;
    onChange({
      ...testConfig,
      questions: updated
    });
  };

  const deleteQuestion = (index) => {
    if (guardStructureChange()) return;
    if (!confirm('⚠️ Delete this question?')) return;
    const updated = testConfig.questions.filter((_, i) => i !== index);
    onChange({
      ...testConfig,
      questions: updated
    });
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const updated = [...testConfig.questions];
    updated[questionIndex].options[optionIndex][field] = value;
    onChange({
      ...testConfig,
      questions: updated
    });
  };

  const addOption = (questionIndex) => {
    if (guardStructureChange()) return;
    const updated = [...testConfig.questions];
    const nextIndex = updated[questionIndex].options.length;
    const defaultLabels = getDefaultOptionLabels(selectedLanguage);
    const fallbackLabel = defaultLabels[nextIndex] || `Option ${nextIndex + 1}`;
    updated[questionIndex].options.push({
      optionText: fallbackLabel,
      score: nextIndex
    });
    onChange({
      ...testConfig,
      questions: updated
    });
  };

  const deleteOption = (questionIndex, optionIndex) => {
    if (guardStructureChange()) return;
    const updated = [...testConfig.questions];
    updated[questionIndex].options.splice(optionIndex, 1);
    onChange({
      ...testConfig,
      questions: updated
    });
  };

  const applyDefaultOptions = (questionIndex) => {
    if (guardStructureChange()) return;
    const updated = [...testConfig.questions];
    updated[questionIndex].options = buildDefaultOptions();
    onChange({
      ...testConfig,
      questions: updated
    });
  };
  
  const addScoreRange = () => {
    if (guardStructureChange()) return;
    const newRange = {
      rangeName: `level_${testConfig.scoreRanges.length + 1}`,
      label: '',
      minScore: 0,
      maxScore: 10,
      levelKey: `level_${testConfig.scoreRanges.length + 1}`
    };
    
    onChange({
      ...testConfig,
      scoreRanges: [...testConfig.scoreRanges, newRange]
    });
  };

  const updateScoreRange = (index, field, value) => {
    const updated = [...testConfig.scoreRanges];
    updated[index][field] = value;
    
    onChange({
      ...testConfig,
      scoreRanges: updated
    });
  };

  const deleteScoreRange = (index) => {
    if (guardStructureChange()) return;
    if (!confirm('⚠️ Delete this score range? This will also remove associated content.')) return;
    
    const updated = testConfig.scoreRanges.filter((_, i) => i !== index);
    onChange({
      ...testConfig,
      scoreRanges: updated
    });
  };

  return (
    <>
    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      {hasUnsavedChanges && (
        <div style={{
          marginBottom: '12px',
          padding: '10px 14px',
          backgroundColor: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '6px',
          color: '#92400e',
          fontSize: '13px',
          fontWeight: 600
        }}>
          ⚠️ Unsaved question changes. Click "Save Day Configuration" to persist.
        </div>
      )}

      {structureLocked && (
        <div style={{
          marginBottom: '12px',
          padding: '10px 14px',
          backgroundColor: '#fffbeb',
          border: '1px solid #fde68a',
          borderRadius: '6px',
          color: '#92400e',
          fontSize: '13px',
          fontWeight: 600
        }}>
          Translation mode: question/order/score changes are disabled. Update only the wording for this language.
        </div>
      )}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#eef2ff',
        borderRadius: '8px',
        border: '1px solid #c7d2fe',
        display: 'grid',
        gap: '12px'
      }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: structureLocked ? 'not-allowed' : 'pointer' }}>
          <input
            type="checkbox"
            checked={followupToggleActive}
            onChange={(e) => handleFollowupToggleChange(e.target.checked)}
            disabled={structureLocked}
            style={{ marginTop: '4px', width: '18px', height: '18px' }}
          />
          <span style={{ fontSize: '14px', color: '#1e1b4b' }}>
            <strong>Enable follow-up tasks per answer.</strong> When on, you can attach a bonus task that unlocks after a caregiver picks that answer.
          </span>
        </label>
        {hasExistingFollowups && !followupToggleActive && (
          <div style={{ fontSize: '13px', color: '#b45309', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '10px' }}>
            Follow-up tasks exist but are hidden from caregivers until you re-enable this toggle.
          </div>
        )}
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: structureLocked ? 'not-allowed' : 'pointer' }}>
          <input
            type="checkbox"
            checked={levelsDisabled}
            onChange={(e) => handleDisableLevelsToggle(e.target.checked)}
            disabled={structureLocked}
            style={{ marginTop: '4px', width: '18px', height: '18px' }}
          />
          <span style={{ fontSize: '14px', color: '#1e1b4b' }}>
            <strong>Skip score-based levels.</strong> Everyone sees the same default task list regardless of their score.
          </span>
        </label>
      </div>
      
      {/* Questions Section */}
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '8px', border: '2px solid #bfdbfe' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
            ❓ Test Questions ({testConfig.questions?.length || 0})
          </h4>
          <button
            onClick={addQuestion}
            disabled={structureLocked}
            style={{
              padding: '8px 16px',
              backgroundColor: structureLocked ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: structureLocked ? 'not-allowed' : 'pointer'
            }}
          >
            + Add Question
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {testConfig.questions?.map((question, qIndex) => (
            <div key={qIndex} style={{ padding: '15px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Question {qIndex + 1}</span>
                <button
                  onClick={() => deleteQuestion(qIndex)}
                  disabled={structureLocked}
                  style={{
                    padding: '4px 12px',
                    backgroundColor: structureLocked ? '#fca5a5' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: structureLocked ? 'not-allowed' : 'pointer'
                  }}
                >
                  🗑️ Delete
                </button>
              </div>

              <textarea
                value={question.questionText}
                onChange={(e) => updateQuestion(qIndex, 'questionText', e.target.value)}
                placeholder="Enter question text..."
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  minHeight: '60px',
                  fontFamily: 'inherit'
                }}
              />

              <div style={{ marginLeft: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Options:</span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => applyDefaultOptions(qIndex)}
                      disabled={structureLocked}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: structureLocked ? '#fcd34d' : '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: structureLocked ? 'not-allowed' : 'pointer'
                      }}
                    >
                      ⚡ Prefill Defaults ({selectedLanguage})
                    </button>
                    <button
                      onClick={() => addOption(qIndex)}
                      disabled={structureLocked}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: structureLocked ? '#93c5fd' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        cursor: structureLocked ? 'not-allowed' : 'pointer'
                      }}
                    >
                      + Add Option
                    </button>
                  </div>
                </div>

                {levelsDisabled && (
                  <div style={{
                    marginBottom: '10px',
                    padding: '8px 10px',
                    backgroundColor: '#eef2ff',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#3730a3'
                  }}>
                    Score weights are hidden while "Skip score-based levels" is enabled.
                  </div>
                )}

                {question.options?.map((option, oIndex) => (
                  <div key={oIndex} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={option.optionText}
                      onChange={(e) => updateOption(qIndex, oIndex, 'optionText', e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      style={{
                        flex: 1,
                        minWidth: '180px',
                        padding: '8px',
                        fontSize: '13px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px'
                      }}
                    />
                    {!levelsDisabled && (
                      <input
                        type="number"
                        value={option.score}
                        onChange={(e) => updateOption(qIndex, oIndex, 'score', parseInt(e.target.value) || 0)}
                        placeholder="Score"
                        style={{
                          width: '70px',
                          padding: '8px',
                          fontSize: '13px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px'
                        }}
                        disabled={structureLocked}
                      />
                    )}
                    {question.options.length > 2 && (
                      <button
                        onClick={() => deleteOption(qIndex, oIndex)}
                        disabled={structureLocked}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: structureLocked ? '#fca5a5' : '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '11px',
                          cursor: structureLocked ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    )}
                    {allowFollowupConfig ? (
                      <div style={{
                        flexBasis: '100%',
                        padding: '10px',
                        border: '1px dashed #cbd5f5',
                        borderRadius: '6px',
                        backgroundColor: '#f8fafc'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                          <div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Follow-Up Task
                            </span>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#0f172a' }}>
                              {option.followupTask
                                ? `${option.followupTask.taskType || 'custom'} · ${option.followupTask.title || 'Untitled follow-up'}`
                                : 'No follow-up configured for this answer'}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => openFollowupEditor(qIndex, oIndex)}
                            disabled={structureLocked && !option.followupTask}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: structureLocked && !option.followupTask ? '#cbd5f5' : '#2563eb',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: structureLocked && !option.followupTask ? 'not-allowed' : 'pointer'
                            }}
                            title={structureLocked && !option.followupTask ? 'Create follow-up tasks in English first' : undefined}
                          >
                            {option.followupTask ? 'Edit follow-up task' : 'Add follow-up task'}
                          </button>
                          {option.followupTask && isBaseLanguage && (
                            <button
                              onClick={() => handleRemoveFollowup(qIndex, oIndex)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#f87171',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              Remove follow-up
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{
                        flexBasis: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontSize: '13px'
                      }}>
                        Enable follow-up tasks above to attach extra actions to this answer.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {(!testConfig.questions || testConfig.questions.length === 0) && (
            <p style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
              No questions added yet. Click "Add Question" to create test questions.
            </p>
          )}
        </div>
      </div>

      {/* Score Ranges Section */}
      {!levelsDisabled && (
        <>
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#111827' }}>
        🎯 Score Ranges & Levels
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
        {scoreRanges.map((range, index) => (
          <motion.div
            key={index}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              border: '2px solid #e5e7eb',
              borderRadius: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '12px' }}>
              <h5 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: '#374151' }}>
                Level {index + 1}: {range.levelKey}
              </h5>
              {scoreRanges.length > 1 && (
                <button
                  onClick={() => deleteScoreRange(index)}
                  disabled={structureLocked}
                  style={{
                    padding: '4px 10px',
                    backgroundColor: structureLocked ? '#fecaca' : '#fee2e2',
                    color: '#991b1b',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: structureLocked ? 'not-allowed' : 'pointer'
                  }}
                >
                  🗑️ Delete
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>
                  Level Label ({selectedLanguage})
                </label>
                <input
                  type="text"
                  value={range.label || ''}
                  onChange={(e) => updateScoreRange(index, 'label', e.target.value)}
                  placeholder="e.g., Mild"
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>
                  Level Key
                </label>
                <input
                  type="text"
                  value={range.levelKey}
                  onChange={(e) => updateScoreRange(index, 'levelKey', e.target.value)}
                  placeholder="e.g., mild"
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                  disabled={structureLocked}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>
                  Min Score
                </label>
                <input
                  type="number"
                  value={range.minScore}
                  onChange={(e) => updateScoreRange(index, 'minScore', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                  disabled={structureLocked}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#6b7280' }}>
                  Max Score
                </label>
                <input
                  type="number"
                  value={range.maxScore}
                  onChange={(e) => updateScoreRange(index, 'maxScore', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                  disabled={structureLocked}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={addScoreRange}
        disabled={structureLocked}
        style={{
          padding: '10px 20px',
          backgroundColor: structureLocked ? '#93c5fd' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: structureLocked ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        + Add Score Range
      </motion.button>
        </>
      )}

      {levelsDisabled && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #cbd5f5',
          backgroundColor: '#eff6ff',
          fontSize: '14px',
          color: '#1d4ed8'
        }}>
          Score-based levels are turned off. Caregivers will see the default tasks regardless of their scores.
        </div>
      )}

      <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '20px' }}>
        <button
          onClick={() => setShowQuestions(!showQuestions)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {showQuestions ? '▼ Hide' : '▶'} Configure Test Questions ({testConfig.questions?.length || 0} questions)
        </button>

        <AnimatePresence>
          {showQuestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: '20px' }}
            >
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                ℹ️ Test questions configuration will be added here. For now, you can reuse the Burden Assessment configuration or add custom questions via API.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>

    <AnimatePresence>
      {followupEditor && (
        <TaskEditorModal
          selectedLanguage={selectedLanguage}
          task={followupEditor.task}
          structureLocked={!isBaseLanguage}
          onSave={(taskPayload) => handleFollowupSave(followupEditor.questionIndex, followupEditor.optionIndex, taskPayload)}
          onClose={() => setFollowupEditor(null)}
        />
      )}
    </AnimatePresence>
  </>
  );
}
