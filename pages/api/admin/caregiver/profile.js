import dbConnect from '../../../../lib/mongodb';
import Caregiver from '../../../../models/Caregiver';
import CaregiverProgram from '../../../../models/CaregiverProgramEnhanced';
import ProgramConfig from '../../../../models/ProgramConfig';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { caregiverId } = req.query;
      
      console.log('Fetching profile for caregiverId:', caregiverId);
      
      if (!caregiverId) {
        return res.status(400).json({
          success: false,
          message: 'Caregiver ID is required'
        });
      }
      
      // Fetch caregiver details without populate
      const caregiver = await Caregiver.findById(caregiverId);
      console.log('Caregiver found:', caregiver ? 'Yes' : 'No');
      
      if (!caregiver) {
        return res.status(404).json({
          success: false,
          message: 'Caregiver not found'
        });
      }
      
      // Fetch program progress
      const program = await CaregiverProgram.findOne({ caregiverId });
      console.log('Program found:', program ? 'Yes' : 'No');
      
      if (program && program.zaritBurdenAssessment) {
        console.log('zaritBurdenAssessment data:', JSON.stringify(program.zaritBurdenAssessment, null, 2));
      }
      
      // Try to fetch caregiver-specific config alongside global defaults
      let customConfig = null;
      let globalConfig = null;
      let effectiveConfig = null;
      try {
        const [custom, global] = await Promise.all([
          ProgramConfig.findOne({
            configType: 'caregiver-specific',
            caregiverId
          }),
          ProgramConfig.findOne({ configType: 'global' })
        ]);

        customConfig = custom;
        globalConfig = global;
        effectiveConfig = customConfig || globalConfig;
        console.log('Custom config found:', customConfig ? 'Yes' : 'No');
        console.log('Global config found:', globalConfig ? 'Yes' : 'No');
      } catch (configError) {
        console.log('ProgramConfig lookup failed:', configError.message);
      }
      
      // Organize assessment data
      let assessmentData = {
        quickAssessments: [],           // Daily assessments organized by day
        oneTimeAssessments: [],         // Scored assessments (zarit, stress, whoqol, etc.)
        dailyModuleAssessments: [],     // Day-specific module assessments
        dynamicTests: [],               // Dynamic personalized tests assigned per day
        zaritBurdenAssessment: null     // Legacy Zarit assessment for compatibility
      };

      if (program) {
        // Organize quick assessments by day
        if (program.quickAssessments && program.quickAssessments.length > 0) {
          assessmentData.quickAssessments = program.quickAssessments
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .map(qa => ({
              day: qa.day,
              type: qa.type,
              responses: qa.responses || [],
              language: qa.language || 'english',
              totalQuestions: qa.totalQuestions || 0,
              completedAt: qa.completedAt,
              responseCount: qa.responses ? qa.responses.length : 0
            }));
        }

        // Organize one-time assessments with enhanced validation and logging
        console.log('🔍 DEBUG: One-time assessments check:');
        console.log('  Program has oneTimeAssessments:', !!program.oneTimeAssessments);
        console.log('  OneTimeAssessments length:', program.oneTimeAssessments ? program.oneTimeAssessments.length : 0);
        
        if (program.oneTimeAssessments && program.oneTimeAssessments.length > 0) {
          console.log('  🎯 Found one-time assessments:', program.oneTimeAssessments.length);
          console.log('  Assessment types:', program.oneTimeAssessments.map(a => a.type));
          
          // VALIDATION: Ensure all assessments have required fields
          const validAssessments = program.oneTimeAssessments.filter(ota => {
            const isValid = ota.type && ota.completedAt && ota.totalScore !== undefined;
            if (!isValid) {
              console.warn('⚠️ Invalid assessment found:', {
                hasType: !!ota.type,
                hasCompletedAt: !!ota.completedAt,
                hasTotalScore: ota.totalScore !== undefined,
                assessmentId: ota._id
              });
            }
            return isValid;
          });
          
          console.log('  📊 Valid assessments after filtering:', validAssessments.length);
          
          assessmentData.oneTimeAssessments = validAssessments
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .map(ota => {
              // Ensure consistent data structure for frontend
              const mappedAssessment = {
                type: ota.type,
                responses: ota.responses || [],
                totalScore: Number(ota.totalScore) || 0,
                scoreLevel: ota.scoreLevel || 'unknown',
                language: ota.language || 'english',
                totalQuestions: ota.totalQuestions || 0,
                completedAt: ota.completedAt,
                responseCount: ota.responses ? ota.responses.length : 0,
                // Additional metadata for better tracking
                retakeCount: ota.retakeCount || 0,
                assessmentDetails: ota.assessmentDetails || {}
              };
              
              // Validate essential fields
              if (!mappedAssessment.type || mappedAssessment.totalScore === undefined) {
                console.error('❌ Critical assessment data missing:', mappedAssessment);
              }
              
              return mappedAssessment;
            });
          
          console.log('  📊 Processed assessments:', assessmentData.oneTimeAssessments.length);
          console.log('  📋 Assessment details:', assessmentData.oneTimeAssessments.map(a => ({
            type: a.type,
            score: a.totalScore,
            level: a.scoreLevel,
            date: a.completedAt
          })));
          
        } else {
          console.log('  ❌ No one-time assessments found in program');
          // Ensure empty array instead of undefined
          assessmentData.oneTimeAssessments = [];
        }

        // Extract daily module assessments (from dayModules)
        if (program.dayModules && program.dayModules.length > 0) {
          assessmentData.dailyModuleAssessments = program.dayModules
            .filter(module => module.dailyAssessment)
            .map(module => ({
              day: module.day,
              assessmentType: module.dailyAssessment.assessmentType,
              responses: module.dailyAssessment.responses,
              totalScore: module.dailyAssessment.totalScore,
              scoreLevel: module.dailyAssessment.scoreLevel,
              completedAt: module.dailyAssessment.completedAt
            }))
            .sort((a, b) => a.day - b.day);

          assessmentData.dynamicTests = program.dayModules
            .filter(module => module.dynamicTestCompleted || module.dynamicTest?.completedAt)
            .map(module => {
              const dynamicTest = module.dynamicTest || {};
              return {
                day: module.day,
                testName: dynamicTest.testName || `Day ${module.day} Assessment`,
                totalScore: dynamicTest.totalScore ?? null,
                assignedLevel: dynamicTest.assignedLevel || dynamicTest.burdenLevel || program.burdenLevel,
                answers: Array.isArray(dynamicTest.answers) ? dynamicTest.answers : [],
                answersCount: Array.isArray(dynamicTest.answers) ? dynamicTest.answers.length : 0,
                completedAt: dynamicTest.completedAt || module.completedAt || null,
                raw: dynamicTest
              };
            })
            .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0));
        }

        // Legacy Zarit assessment (for backward compatibility)
        if (program.zaritBurdenAssessment) {
          assessmentData.zaritBurdenAssessment = program.zaritBurdenAssessment;
        }
      }
      
      // Calculate detailed statistics
      let statistics = {
        totalDays: 8,
        completedDays: 0,
        currentDay: program?.currentDay || 0,
        overallProgress: program?.overallProgress || 0,
        burdenLevel: program?.burdenLevel || 'Not assessed',
        burdenTestScore: program?.burdenTestScore || null,
        daysProgress: [],
        assessmentCounts: {
          quickAssessments: assessmentData.quickAssessments.length,
          oneTimeAssessments: assessmentData.oneTimeAssessments.length,
          dailyModuleAssessments: assessmentData.dailyModuleAssessments.length,
          dynamicTests: assessmentData.dynamicTests.length
        }
      };
      
      if (program && program.dayModules) {
        statistics.completedDays = program.dayModules.filter(m => m.progressPercentage === 100).length;
        
        // Detailed progress for each day
        const programLanguage = program.language || 'english';
        statistics.daysProgress = await Promise.all(program.dayModules.map(async module => {
          // Handle multi-language videoTitle
          let videoTitleDisplay = 'Not assigned';
          if (module.videoTitle) {
            if (typeof module.videoTitle === 'string') {
              videoTitleDisplay = module.videoTitle;
            } else if (typeof module.videoTitle === 'object') {
              // Try to get any available language
              videoTitleDisplay = module.videoTitle.english || 
                                 module.videoTitle.kannada || 
                                 module.videoTitle.hindi || 
                                 'Not assigned';
            }
          }
          
          const dayConfig = effectiveConfig
            ? findDayConfig(effectiveConfig, module.day, programLanguage)
            : null;
          const dynamicTestTaskMeta = buildDynamicTestTaskMeta({
            dayModule: module,
            dayConfig
          });
          const dynamicTestResponsePayload = buildDynamicTestResponsePayload({
            dayModule: module,
            taskMeta: dynamicTestTaskMeta,
            dayConfig
          });
          const hasDynamicTest = Boolean(dynamicTestTaskMeta);
          const dynamicTestCompleted = Boolean(
            module.dynamicTestCompleted ||
            module.dynamicTest?.completedAt
          );

          // Load tasks (persisted or from config) for accurate counts
          let tasks = Array.isArray(module.tasks)
            ? module.tasks.filter(task => task?.taskType !== 'dynamic-test')
            : [];
          if ((!tasks || tasks.length === 0) && effectiveConfig) {
            tasks = await resolveTasksFromConfig({
              config: effectiveConfig,
              dayNumber: module.day,
              language: programLanguage,
              burdenLevel: program.burdenLevel,
              contentLevel: module.contentLevel
            });
          }

          if (hasDynamicTest) {
            const stripped = tasks.filter(task => task?.taskId !== dynamicTestTaskMeta.taskId);
            tasks = [dynamicTestTaskMeta, ...stripped];
          }

          let {
            normalizedTasks,
            actionableTasks,
            taskMap,
            actionableTaskIds,
            nonActionableCount
          } = classifyTasks(tasks);

          let totalTasks = normalizedTasks.length;
          const hasVideoTask = normalizedTasks.some(task => VIDEO_TASK_TYPES.has(task.taskType));

          const rawResponses = Array.isArray(module.taskResponses) ? module.taskResponses : [];
          const latestResponses = buildLatestResponseMap(rawResponses);
          const dayTaskLookup = buildDailyTaskResponseLookup(program?.dailyTasks, module.day);
          if (dynamicTestResponsePayload && dynamicTestTaskMeta) {
            latestResponses[dynamicTestTaskMeta.taskId] = dynamicTestResponsePayload;
          }

          const responseTaskIds = new Set([
            ...Object.keys(latestResponses),
            ...Object.keys(dayTaskLookup)
          ]);

          const completedActionableTasksCount = [...responseTaskIds]
            .filter(taskId => actionableTaskIds.has(taskId))
            .length;

          const shouldAutoCompletePassiveTasks = completedActionableTasksCount > 0;
          const autoCompletedTasks = shouldAutoCompletePassiveTasks ? nonActionableCount : 0;
          const progressCompletedCount = totalTasks > 0
            ? Math.min(totalTasks, completedActionableTasksCount + autoCompletedTasks)
            : completedActionableTasksCount;

          const formattedResponses = [...responseTaskIds]
            .map(taskId => formatTaskResponseForAdmin(
              taskMap[taskId],
              latestResponses[taskId],
              dayTaskLookup[taskId]
            ))
            .filter(Boolean);

          const calculatedProgress = totalTasks > 0
            ? Math.min(100, Math.round((progressCompletedCount / totalTasks) * 100))
            : module.progressPercentage || 0;

          const hasLegacyVideo = Boolean(
            module.day === 0 ||
            (videoTitleDisplay && videoTitleDisplay !== 'Not assigned') ||
            module.videoWatched ||
            module.videoCompleted ||
            (module.videoProgress && module.videoProgress > 0)
          );
          const hasVideoContent = hasVideoTask || hasLegacyVideo;
          const normalizedVideoProgress = hasVideoContent
            ? Math.max(0, Math.min(100, module.videoProgress || 0))
            : null;
          
          return {
            day: module.day,
            progressPercentage: calculatedProgress, // Use calculated progress instead of database value
            videoProgress: normalizedVideoProgress,
            hasVideoContent,
            videoWatched: module.videoWatched,
            audioCompleted: module.audioCompleted || false,
            audioCompletedAt: module.audioCompletedAt,
            tasksCompleted: calculatedProgress === 100,
            completedAt: module.completedAt,
            unlockedAt: module.unlockedAt,
            scheduledUnlockAt: module.scheduledUnlockAt,
            isUnlocked: module.adminPermissionGranted,
            videoTitle: videoTitleDisplay,
            videoTitleMultiLang: module.videoTitle,
            hasDynamicTest,
            dynamicTestCompleted,
            dynamicTest: module.dynamicTest || null,
            // Enhanced task progress details
            totalTasks,
            completedTasks: completedActionableTasksCount,
            taskResponses: formattedResponses,
            tasks: normalizedTasks.map(t => ({
              taskId: t.taskId,
              taskOrder: t.taskOrder,
              taskType: t.taskType,
              title: t.title,
              description: t.description,
              content: t.content || {}
            }))
          };
        }));
      }
      
      return res.status(200).json({
        success: true,
        data: {
          caregiver: {
            id: caregiver._id,
            caregiverId: caregiver.caregiverId,
            name: caregiver.name,
            phone: caregiver.phone,
            age: caregiver.age,
            gender: caregiver.gender,
            maritalStatus: caregiver.maritalStatus,
            educationLevel: caregiver.educationLevel,
            employmentStatus: caregiver.employmentStatus,
            residentialArea: caregiver.residentialArea,
            relationshipToPatient: caregiver.relationshipToPatient,
            hoursPerDay: caregiver.hoursPerDay,
            durationOfCaregiving: caregiver.durationOfCaregiving,
            previousExperience: caregiver.previousExperience,
            supportSystem: caregiver.supportSystem,
            physicalHealth: caregiver.physicalHealth,
            mentalHealth: caregiver.mentalHealth,
            isAssigned: caregiver.isAssigned,
            assignedPatient: caregiver.assignedPatient,
            createdAt: caregiver.createdAt,
            lastLogin: caregiver.lastLogin
          },
          program: program ? {
            currentDay: program.currentDay,
            overallProgress: program.overallProgress,
            burdenLevel: program.burdenLevel,
            burdenTestScore: program.burdenTestScore,
            burdenTestCompletedAt: program.burdenTestCompletedAt,
            zaritBurdenAssessment: program.zaritBurdenAssessment,
            dayModules: program.dayModules,
            dailyTasks: program.dailyTasks,
            programStartedAt: program.programStartedAt,
            lastActiveAt: program.lastActiveAt,
            dayUnlockSchedule: program.dayUnlockSchedule,
            contentAssignedDynamically: program.contentAssignedDynamically,
            customWaitTimes: program.customWaitTimes,
            notifications: program.notifications,
            supportTriggered: program.supportTriggered,
            adminNotes: program.adminNotes
          } : null,
          assessments: assessmentData,
          customConfig,
          statistics,
          waitTimeDefaults: {
            global: globalConfig?.waitTimes || { day0ToDay1: 24, betweenDays: 24 },
            caregiverOverrides: program?.customWaitTimes || null
          }
        }
      });
    } catch (error) {
      console.error('Error fetching caregiver profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching caregiver profile',
        error: error.message
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

const LANGUAGE_PRIORITY = ['english', 'kannada', 'hindi'];
const NON_ACTIONABLE_TASK_TYPES = new Set(['reminder', 'dynamic-test']);
const VIDEO_TASK_TYPES = new Set(['video', 'calming-video']);

async function resolveTasksFromConfig({ config, dayNumber, language, burdenLevel, contentLevel }) {
  const dayConfig = findDayConfig(config, dayNumber, language);
  if (!dayConfig) return [];

  const levelKey = determineContentLevelKey(dayConfig, { contentLevel, burdenLevel });
  const levelBlock = dayConfig.contentByLevel?.find(l => l.levelKey === levelKey) || dayConfig.contentByLevel?.[0];
  if (!levelBlock?.tasks?.length) return [];

  return levelBlock.tasks
    .filter(task => task.enabled && task.taskType !== 'dynamic-test')
    .map(task => ({
      taskId: task.taskId,
      taskOrder: task.taskOrder,
      taskType: task.taskType,
      title: task.title || '',
      description: task.description || '',
      content: task.content || {}
    }));
}

function classifyTasks(tasks = []) {
  const normalizedTasks = Array.isArray(tasks) ? [...tasks] : [];
  const actionableTasks = normalizedTasks.filter(task => {
    const type = (task?.taskType || '').toLowerCase();
    return !NON_ACTIONABLE_TASK_TYPES.has(type);
  });

  const taskMap = normalizedTasks.reduce((acc, task) => {
    if (task?.taskId) {
      acc[task.taskId] = task;
    }
    return acc;
  }, {});

  const actionableTaskIds = new Set(
    actionableTasks
      .map(task => task?.taskId)
      .filter(Boolean)
  );

  const nonActionableCount = normalizedTasks.length - actionableTasks.length;

  return {
    normalizedTasks,
    actionableTasks,
    taskMap,
    actionableTaskIds,
    nonActionableCount
  };
}

function buildLatestResponseMap(rawResponses = []) {
  return rawResponses.reduce((acc, response) => {
    if (!response?.taskId) return acc;
    const existing = acc[response.taskId];
    const currentTime = new Date(response.completedAt || 0).getTime();
    const existingTime = existing ? new Date(existing.completedAt || 0).getTime() : -Infinity;
    if (!existing || currentTime >= existingTime) {
      acc[response.taskId] = response;
    }
    return acc;
  }, {});
}

function buildDailyTaskResponseLookup(dailyTasks = [], dayNumber) {
  const lookup = {};
  if (!Array.isArray(dailyTasks)) return lookup;

  dailyTasks
    .filter(entry => entry?.day === dayNumber)
    .forEach(entry => {
      const responses = normalizeResponseContainer(entry.responses);
      responses.forEach(([taskId, payload]) => {
        if (!taskId) return;
        const normalizedPayload = payload || {};
        const cleanedPayload = stripResponseMetadata(normalizedPayload);
        lookup[taskId] = {
          taskId,
          taskType: normalizedPayload.taskType,
          responseText: normalizedPayload.responseText,
          responseData: normalizedPayload.responseData || (Object.keys(cleanedPayload).length ? cleanedPayload : null),
          completedAt: normalizedPayload.completedAt || entry.completedAt,
          recordedAt: normalizedPayload.recordedAt || entry.completedAt
        };
      });
    });

  return lookup;
}

function normalizeResponseContainer(container) {
  if (!container) return [];
  if (container instanceof Map) {
    return Array.from(container.entries());
  }
  if (typeof container === 'object') {
    return Object.entries(container);
  }
  return [];
}

function stripResponseMetadata(payload = {}) {
  const ignored = new Set(['taskId', 'taskType', 'responseText', 'completedAt', 'recordedAt', 'responseData']);
  return Object.entries(payload).reduce((acc, [key, value]) => {
    if (ignored.has(key)) return acc;
    if (value === undefined || value === null) return acc;
    acc[key] = value;
    return acc;
  }, {});
}

function pickFirstString(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }
  return null;
}

function mergeResponseData(primary, secondary) {
  if (primary && typeof primary === 'object' && Object.keys(primary).length > 0) {
    return primary;
  }
  if (secondary && typeof secondary === 'object' && Object.keys(secondary).length > 0) {
    return secondary;
  }
  return null;
}

function formatTaskResponseForAdmin(task = null, response = {}, fallback = null) {
  if (!response && !fallback) return null;

  const taskId = response?.taskId || fallback?.taskId || task?.taskId;
  if (!taskId) return null;

  const mergedTaskType = (response?.taskType || fallback?.taskType || task?.taskType || 'task').toLowerCase();
  const mergedCompletedAt = response?.completedAt || fallback?.completedAt || fallback?.recordedAt || null;
  const data = mergeResponseData(response?.responseData, fallback?.responseData) || {};
  const details = [];
  const resolvedResponseText = pickFirstString(response?.responseText, fallback?.responseText);
  let summary = resolvedResponseText;

  const addDetail = (label, value) => {
    if (value === undefined || value === null || value === '') return;
    details.push({
      label,
      value: typeof value === 'string' ? value : JSON.stringify(value)
    });
  };

  switch (mergedTaskType) {
    case 'quick-assessment': {
      const responses = data?.responses;
      const questionTexts = data?.questionTexts;
      if (responses && typeof responses === 'object') {
        Object.keys(responses).forEach((key) => {
          const question = questionTexts?.[key] || `Question ${Number(key) + 1}`;
          const value = normalizeResponseValue(responses[key]);
          addDetail(question, value);
        });
        if (!summary) {
          const total = Object.keys(responses).length;
          summary = `Answered ${total} question${total === 1 ? '' : 's'}`;
        }
      }
      break;
    }
    case 'feeling-check': {
      const feeling = data?.feeling || summary;
      if (feeling) {
        addDetail('Feeling', feeling);
        summary = summary || feeling;
      }
      break;
    }
    case 'reflection-prompt': {
      if (data?.sliderValue !== undefined) {
        addDetail('Slider Value', `${data.sliderValue}%`);
        summary = summary || `${data.sliderValue}% reported`;
      }
      if (data?.reflectionText) {
        addDetail('Reflection Notes', data.reflectionText);
      }
      break;
    }
    case 'interactive-field': {
      const parsedDetails = extractInteractiveFieldDetails(resolvedResponseText);
      const problemValue = data?.problem || data?.problemText || parsedDetails.problem;
      const solutionValue = data?.solution || data?.solutionText || parsedDetails.solution;

      addDetail('Problem', problemValue);
      addDetail('Solution', solutionValue);

      if (!summary) {
        if (problemValue && solutionValue) {
          summary = 'Problem & solution submitted';
        } else if (problemValue) {
          summary = `Problem noted: ${problemValue}`;
        } else if (solutionValue) {
          summary = `Solution recorded: ${solutionValue}`;
        }
      }
      break;
    }
    case 'task-checklist': {
      addDetail('Question', data?.question || task?.content?.checklistQuestion);
      addDetail('Answer', data?.answer);
      summary = summary || data?.answer || response.responseText;
      break;
    }
    case 'activity-selector': {
      const selected = data?.selectedActivity || response.responseText;
      if (selected) {
        addDetail('Selected Activity', selected);
        summary = summary || selected;
      }
      if (data?.activityDescription) {
        addDetail('Details', data.activityDescription);
      }
      break;
    }
    case 'dynamic-test': {
      if (data?.testName) {
        addDetail('Assessment', data.testName);
      }
      if (data?.totalScore !== undefined) {
        addDetail('Score', data.totalScore);
      }
      if (data?.assignedLevel) {
        addDetail('Assigned Level', data.assignedLevel);
      }
      if (typeof data?.answersCount === 'number') {
        addDetail('Answers Recorded', data.answersCount);
      }
      if (Array.isArray(data?.selectedOptions) && data.selectedOptions.length) {
        data.selectedOptions.forEach((selection, idx) => {
          const label = selection.questionText || `Question ${selection.questionId || idx + 1}`;
          const value = selection.score !== undefined && selection.score !== null
            ? `${selection.optionText} (Score ${selection.score})`
            : selection.optionText;
          addDetail(label, value);
        });
      }
      summary = summary || 'Assessment completed';
      break;
    }
    case 'interactive-message':
    case 'greeting-message':
    case 'motivation-message':
    case 'healthcare-tip': {
      summary = summary || 'Message acknowledged';
      break;
    }
    case 'audio-message':
    case 'calming-audio':
    case 'video':
    case 'calming-video': {
      summary = summary || 'Content completed';
      break;
    }
    default: {
      if (!summary && data?.answer) {
        summary = data.answer;
      }
      break;
    }
  }

  if (!summary) {
    summary = (response?.completed ?? true) ? 'Task marked completed' : 'Task pending';
  }

  const normalizedData = data && Object.keys(data).length > 0 ? data : null;

  return {
    taskId,
    taskType: mergedTaskType || 'task',
    responseText: resolvedResponseText,
    responseSummary: summary,
    responseDetails: details,
    responseData: normalizedData,
    completedAt: mergedCompletedAt
  };
}

function normalizeResponseValue(value) {
  if (value === undefined || value === null) return '—';
  if (typeof value === 'number') {
    if (value === 1) return 'Yes';
    if (value === 0) return 'No';
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map(item => normalizeResponseValue(item)).join(', ');
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (err) {
      return String(value);
    }
  }
  return String(value);
}

function extractInteractiveFieldDetails(text) {
  if (typeof text !== 'string' || text.trim() === '') {
    return {};
  }

  return text.split('|').reduce((acc, segment) => {
    const [rawLabel, ...valueParts] = segment.split(':');
    if (!valueParts.length) return acc;

    const label = rawLabel.trim().toLowerCase();
    const value = valueParts.join(':').trim();
    if (!value) return acc;

    if (label.includes('problem')) {
      acc.problem = value;
    } else if (label.includes('solution')) {
      acc.solution = value;
    }

    return acc;
  }, {});
}

function buildLanguagePreferenceOrder(language) {
  const normalized = typeof language === 'string' ? language.toLowerCase() : null;
  if (normalized && LANGUAGE_PRIORITY.includes(normalized)) {
    return [normalized, ...LANGUAGE_PRIORITY.filter(lang => lang !== normalized)];
  }
  return [...LANGUAGE_PRIORITY];
}

function findDayConfig(config, dayNumber, language) {
  if (!config?.dynamicDays?.length) return null;
  const preferredLanguages = buildLanguagePreferenceOrder(language);
  for (const lang of preferredLanguages) {
    const match = config.dynamicDays.find(dayConfig =>
      dayConfig.dayNumber === dayNumber && dayConfig.language === lang
    );
    if (match) return match;
  }
  return null;
}

function determineContentLevelKey(dayConfig, { contentLevel, burdenLevel }) {
  if (!dayConfig) return contentLevel || 'default';
  if (hasActiveDynamicTestConfig(dayConfig) && dayConfig.testConfig?.scoreRanges?.length) {
    if (contentLevel) return contentLevel;
    if (burdenLevel) {
      const match = dayConfig.testConfig.scoreRanges.find(range =>
        range.levelKey?.toLowerCase() === burdenLevel.toLowerCase()
      );
      if (match?.levelKey) {
        return match.levelKey;
      }
    }
    const fallbackRange = dayConfig.testConfig.scoreRanges[0];
    if (fallbackRange?.levelKey) {
      return fallbackRange.levelKey;
    }
  }
  return contentLevel || 'default';
}

function hasActiveDynamicTestConfig(dayConfig) {
  if (!dayConfig?.hasTest) return false;
  const questions = dayConfig?.testConfig?.questions;
  return Array.isArray(questions) && questions.length > 0;
}

function buildDynamicTestTaskMeta({ dayModule, dayConfig }) {
  const hasConfiguredTest = hasActiveDynamicTestConfig(dayConfig);
  if (!hasConfiguredTest) {
    return null;
  }

  const dayNumber = dayModule?.day ?? dayConfig?.dayNumber ?? 0;
  const taskId = `dynamic-test-day-${dayNumber}`;
  const testName = dayModule?.dynamicTest?.testName || dayConfig?.testConfig?.testName || `Day ${dayNumber} Assessment`;
  const description = dayConfig?.testConfig?.description || 'Complete this assessment to unlock personalized tasks.';

  return {
    taskId,
    taskOrder: -100,
    taskType: 'dynamic-test',
    title: testName,
    description,
    content: {
      testName,
      hasTest: true,
      scoreRanges: dayConfig?.testConfig?.scoreRanges || [],
      assignedLevel: dayModule?.dynamicTest?.assignedLevel || dayModule?.contentLevel || null
    }
  };
}

function buildDynamicTestResponsePayload({ dayModule, taskMeta, dayConfig }) {
  if (!taskMeta) return null;
  const dynamicTest = dayModule?.dynamicTest;
  const completed = Boolean(dayModule?.dynamicTestCompleted || dynamicTest?.completedAt);
  if (!completed) return null;

  const totalScore = dynamicTest?.totalScore;
  const level = dynamicTest?.assignedLevel || dynamicTest?.burdenLevel || dayModule?.contentLevel;

  // Decide if we should expose scores/levels:
  // - Only when the day config explicitly defines score ranges and levels are not disabled
  // - If the test is configured as follow-up-only (followups exist) and there are no score ranges, we hide score/level
  const hasConfiguredScoreRanges = Boolean(dayConfig?.testConfig?.scoreRanges && dayConfig.testConfig.scoreRanges.length);
  const levelsDisabled = Boolean(dayConfig?.testConfig?.disableLevels);
  const hasDefinedFollowups = Boolean(dayConfig?.testConfig?.questions?.some(q => Array.isArray(q.options) && q.options.some(o => o?.followupTask)));
  const includeScores = hasConfiguredScoreRanges && !levelsDisabled;

  const summaryParts = [];
  if (includeScores && typeof totalScore === 'number') {
    summaryParts.push(`Score ${totalScore}`);
  }
  if (includeScores && level) {
    summaryParts.push(`${level} level`);
  }

  const responseData = sanitizeDynamicTestData(dynamicTest, dayModule) || {};
  // If we should not include scores, remove them from the response payload
  if (!includeScores) {
    delete responseData.totalScore;
    delete responseData.assignedLevel;
    delete responseData.burdenLevel;
  }
  const optionSelections = buildDynamicTestAnswerSelections({ dayConfig, dynamicTest });
  if (optionSelections.length) {
    responseData.selectedOptions = optionSelections;
  }
  const normalizedResponseData = Object.keys(responseData).length ? responseData : null;

  return {
    taskId: taskMeta.taskId,
    taskType: 'dynamic-test',
    responseText: summaryParts.join(' • ') || 'Assessment completed',
    responseData: normalizedResponseData,
    completedAt: dynamicTest?.completedAt || dayModule?.completedAt || null
  };
}

function sanitizeDynamicTestData(dynamicTest, dayModule) {
  if (!dynamicTest || typeof dynamicTest !== 'object') {
    if (dayModule?.dynamicTestCompleted) {
      return {
        assignedLevel: dayModule?.contentLevel || dayModule?.burdenLevel || null,
        answersCount: 0
      };
    }
    return null;
  }

  const answersArray = Array.isArray(dynamicTest.answers) ? dynamicTest.answers : [];
  const payload = {
    testName: dynamicTest.testName,
    totalScore: typeof dynamicTest.totalScore === 'number' ? dynamicTest.totalScore : undefined,
    assignedLevel: dynamicTest.assignedLevel || dynamicTest.burdenLevel || null,
    burdenLevel: dynamicTest.burdenLevel,
    answers: answersArray,
    answersCount: answersArray.length,
    completedAt: dynamicTest.completedAt || null
  };

  const cleaned = Object.entries(payload).reduce((acc, [key, value]) => {
    if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
      return acc;
    }
    acc[key] = value;
    return acc;
  }, {});

  return Object.keys(cleaned).length ? cleaned : null;
}

function buildDynamicTestAnswerSelections({ dayConfig, dynamicTest }) {
  if (!dayConfig?.testConfig?.questions?.length) return [];
  const questions = dayConfig.testConfig.questions;
  const answerDetails = Array.isArray(dynamicTest?.answerDetails) ? dynamicTest.answerDetails : [];
  const answers = Array.isArray(dynamicTest?.answers) ? dynamicTest.answers : [];

  return questions.map((question, idx) => {
    const detail = answerDetails[idx] || {};
    const score = detail.score ?? answers[idx];
    const option = findMatchingOption(question.options, {
      optionKey: detail.optionKey,
      answerValue: detail.answerValue,
      score
    });

    const optionText = pickFirstString(
      detail.optionText,
      detail.answerValue,
      option?.optionText,
      typeof score === 'number' ? `Score ${score}` : null
    );

    if (!optionText) {
      return null;
    }

    const resolvedScore = typeof score === 'number'
      ? score
      : (typeof option?.score === 'number' ? option.score : null);

    return {
      questionId: question.id || question.questionId || idx + 1,
      questionText: question.questionText || `Question ${idx + 1}`,
      optionKey: option?.optionKey || detail.optionKey || null,
      optionText,
      score: resolvedScore
    };
  }).filter(Boolean);
}

function findMatchingOption(options = [], criteria = {}) {
  if (!Array.isArray(options) || options.length === 0) return null;
  const normalizedAnswer = normalizeOptionIdentifier(criteria.answerValue);

  return options.find(option => {
    if (!option) return false;
    if (criteria.optionKey && option.optionKey === criteria.optionKey) {
      return true;
    }

    if (normalizedAnswer) {
      const optionAnswer = normalizeOptionIdentifier(option.answerValue || option.optionText);
      if (optionAnswer && optionAnswer === normalizedAnswer) {
        return true;
      }
    }

    if (typeof criteria.score === 'number' && typeof option.score === 'number') {
      return option.score === criteria.score;
    }

    return false;
  }) || null;
}

function normalizeOptionIdentifier(value) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim().toLowerCase();
  return normalized.length ? normalized : null;
}
