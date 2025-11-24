const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });


const DAY_NUMBER = 5;
const LANGUAGE = 'english';

const BASE_TEST_OPTIONS = [
  { optionText: 'Never', score: 0 },
  { optionText: 'Rarely', score: 1 },
  { optionText: 'Often', score: 2 },
  { optionText: 'Always', score: 3 }
];

const TEST_QUESTIONS = [
  'I can list at least three people who can step in for me if I need a break.',
  'I feel comfortable asking friends or family members for practical help.',
  'Someone checks in on me regularly just to see how I am doing.',
  'My support network knows the signs that I am feeling overwhelmed.',
  'I have a mentor, counselor, or elder whom I can call for guidance.',
  'I am part of an online or in-person caregiver community.',
  'I can talk openly about my emotions without being judged.',
  'Someone regularly offers to help without being asked.',
  'I have transportation support when I need to attend appointments.',
  'I can count on someone to help me handle paperwork or logistics.',
  'Friends invite me to non-caregiving activities that refill my energy.',
  'I know which neighbors I can rely on in a pinch.',
  'I celebrate milestones or small wins with someone else.',
  'I have a spiritual or faith group that encourages me.',
  'When I feel isolated, I know exactly who to text or call.',
  'I have backup childcare or eldercare options mapped out.',
  'People in my circle understand the medical needs I am managing.',
  'I know how to access local caregiver resources or helplines.',
  'I have a written list of supporters and how they help.',
  'I feel confident that my support system will grow with me.'
].map((questionText, index) => ({
  id: index + 1,
  questionText,
  options: BASE_TEST_OPTIONS.map(opt => ({ ...opt })),
  enabled: true
}));

const SCORE_RANGES = [
  {
    rangeName: 'support_thriving',
    label: 'Thriving Support System',
    minScore: 0,
    maxScore: 25,
    levelKey: 'mild'
  },
  {
    rangeName: 'support_building',
    label: 'Developing Support Network',
    minScore: 26,
    maxScore: 44,
    levelKey: 'moderate'
  },
  {
    rangeName: 'support_critical',
    label: 'Critical Support Gap',
    minScore: 45,
    maxScore: 60,
    levelKey: 'severe'
  }
];

const buildTasks = {
  mild: () => ([
    {
      taskId: 'day5_mild_greeting',
      taskOrder: 1,
      taskType: 'greeting-message',
      title: 'Day 5 Kickoff',
      description: 'Start by noticing the support already around you.',
      enabled: true,
      content: {
        textContent: 'Today we will map the people, communities, and tools that keep you steady. Take a deep breath—you are not alone in this journey.'
      }
    },
    {
      taskId: 'day5_mild_stream',
      taskOrder: 2,
      taskType: 'interactive-field',
      title: 'Support Stream',
      description: 'Capture two conversations that lifted your spirits this week.',
      enabled: true,
      content: {
        fieldType: 'textarea',
        placeholder: 'Who encouraged you? What did they say? How did you feel?'
      }
    },
    {
      taskId: 'day5_mild_quickpulse',
      taskOrder: 3,
      taskType: 'quick-assessment',
      title: 'Connection Pulse',
      description: 'Answer two rapid-fire questions about recent outreach.',
      enabled: true,
      content: {
        questions: [
          {
            questionText: 'Did you send or receive an encouraging message today?',
            questionType: 'yes-no'
          },
          {
            questionText: 'Who would love to hear a thank-you from you this week?',
            questionType: 'multiple-choice',
            options: [
              { optionText: 'Family member' },
              { optionText: 'Friend or neighbor' },
              { optionText: 'Health professional' },
              { optionText: 'Community group' }
            ]
          }
        ]
      }
    },
    {
      taskId: 'day5_mild_activity',
      taskOrder: 4,
      taskType: 'activity-selector',
      title: 'Choose a Micro-Action',
      description: 'Pick the next supportive action you will take today.',
      enabled: true,
      content: {
        activities: [
          { activityName: 'Send a 30-second gratitude note.' },
          { activityName: 'Invite someone for a 10-minute voice call.' },
          { activityName: 'Share one helpful resource link.' }
        ]
      }
    },
    {
      taskId: 'day5_mild_reflection',
      taskOrder: 5,
      taskType: 'reflection-prompt',
      title: 'Anchor Thought',
      description: 'Lock in the support you have built.',
      enabled: true,
      content: {
        reflectionQuestion: 'Who surprised you with kindness recently, and how can you nurture that connection?'
      }
    }
  ]),
  moderate: () => ([
    {
      taskId: 'day5_mod_motivation',
      taskOrder: 1,
      taskType: 'motivation-message',
      title: 'You Deserve Backup',
      description: 'Let this encouragement sink in.',
      enabled: true,
      content: {
        textContent: 'Your resilience inspires people around you. Today we will turn admirers into active helpers.'
      }
    },
    {
      taskId: 'day5_mod_mapping',
      taskOrder: 2,
      taskType: 'interactive-field',
      title: 'Support Matrix',
      description: 'Document gaps and brainstorm solutions.',
      enabled: true,
      content: {
        fieldType: 'textarea',
        problemLabel: 'Where are you carrying too much alone?',
        solutionLabel: 'What experiment will you try this week to invite support?',
        placeholder: 'Example: Meal prep help / ask cousin on Sunday.'
      }
    },
    {
      taskId: 'day5_mod_quickscan',
      taskOrder: 3,
      taskType: 'quick-assessment',
      title: 'Network Health Scan',
      description: 'Rate how supported you felt in specific scenarios.',
      enabled: true,
      content: {
        questions: [
          {
            questionText: 'Someone proactively checked on me in the last 48 hours.',
            questionType: 'yes-no'
          },
          {
            questionText: 'I delegated a care task within the past week.',
            questionType: 'yes-no'
          },
          {
            questionText: 'I know who to contact if I need emergency coverage.',
            questionType: 'yes-no'
          }
        ]
      }
    },
    {
      taskId: 'day5_mod_reminder',
      taskOrder: 4,
      taskType: 'reminder',
      title: 'Plan a Connection Ping',
      description: 'Schedule a gentle check-in reminder.',
      enabled: true,
      content: {
        reminderMessage: 'Send one specific help request before 6 PM tomorrow.',
        frequency: 'once',
        reminderTime: '18:00',
        targetAudience: 'caregiver',
        targetLevels: ['moderate']
      }
    },
    {
      taskId: 'day5_mod_checklist',
      taskOrder: 5,
      taskType: 'task-checklist',
      title: 'Permission to Receive',
      description: 'Say yes to support when it is offered.',
      enabled: true,
      content: {
        checklistQuestion: 'If someone offers assistance this week, will you accept it?'
      }
    }
  ]),
  severe: () => ([
    {
      taskId: 'day5_sev_feelings',
      taskOrder: 1,
      taskType: 'feeling-check',
      title: 'Heartbeat Check',
      description: 'Name what your heart needs before reaching out.',
      enabled: true,
      content: {
        feelingQuestion: 'What does your heart need support with right now?'
      }
    },
    {
      taskId: 'day5_sev_journal',
      taskOrder: 2,
      taskType: 'interactive-field',
      title: 'Emergency Plan Notes',
      description: 'Capture two people who can cover critical tasks.',
      enabled: true,
      content: {
        fieldType: 'textarea',
        placeholder: 'List name + phone + task they can cover (medication, meals, errands, etc.)'
      }
    },
    {
      taskId: 'day5_sev_checklist',
      taskOrder: 3,
      taskType: 'task-checklist',
      title: 'Reach Out Today',
      description: 'Answer honestly and stay accountable.',
      enabled: true,
      content: {
        checklistQuestion: 'Will you contact one person on your emergency list within the next 2 hours?'
      }
    },
    {
      taskId: 'day5_sev_activity',
      taskOrder: 4,
      taskType: 'activity-selector',
      title: 'Stabilizing Choices',
      description: 'Pick the support move that feels doable right now.',
      enabled: true,
      content: {
        activities: [
          { activityName: 'Text the prepared request script.' },
          { activityName: 'Forward a shared calendar slot for respite.' },
          { activityName: 'Send a voice memo explaining how someone can help today.' }
        ]
      }
    },
    {
      taskId: 'day5_sev_reminder',
      taskOrder: 5,
      taskType: 'reminder',
      title: 'Crisis Line Ready',
      description: 'Keep emergency numbers top of mind.',
      enabled: true,
      content: {
        reminderMessage: 'Pin your emergency contact list somewhere visible.',
        frequency: 'daily',
        reminderTime: '09:00',
        targetAudience: 'caregiver',
        targetLevels: ['severe'],
        customInterval: 1
      }
    }
  ])
};

function buildDay5Config() {
  return {
    dayName: 'Day 5 - Strengthening Support Systems',
    enabled: true,
    hasTest: true,
    defaultLevelKey: 'mild',
    testConfig: {
      testName: 'Social Support Strength Assessment',
      testType: 'custom',
      questions: TEST_QUESTIONS,
      scoreRanges: SCORE_RANGES
    },
    contentByLevel: [
      {
        levelKey: 'mild',
        levelLabel: 'Confident Connector',
        tasks: buildTasks.mild()
      },
      {
        levelKey: 'moderate',
        levelLabel: 'Support System Builder',
        tasks: buildTasks.moderate()
      },
      {
        levelKey: 'severe',
        levelLabel: 'Critical Support Strategist',
        tasks: buildTasks.severe()
      }
    ]
  };
}

async function seedDay5Content() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined. Add it to .env.local');
    }

      console.log('🔌 Connecting to MongoDB...');
      await mongoose.connect(mongoUri);

      const ProgramConfig = mongoose.models.ProgramConfig || mongoose.model(
        'ProgramConfig',
        new mongoose.Schema({}, { strict: false }),
        'programconfigs'
      );

    let config = await ProgramConfig.findOne({ configType: 'global' });
    if (!config) {
      console.log('⚠️  Global ProgramConfig not found. Creating a new one.');
      config = new ProgramConfig({ configType: 'global', dynamicDays: [] });
    }

    if (!Array.isArray(config.dynamicDays)) {
      config.dynamicDays = [];
    }

    const newDayConfig = buildDay5Config();
    const existingIndex = config.dynamicDays.findIndex(
      (entry) => entry.dayNumber === DAY_NUMBER && entry.language === LANGUAGE
    );

    if (existingIndex >= 0) {
      console.log(`♻️  Updating existing Day ${DAY_NUMBER} (${LANGUAGE}) configuration...`);
      config.dynamicDays[existingIndex] = {
        ...newDayConfig,
        dayNumber: DAY_NUMBER,
        language: LANGUAGE
      };
    } else {
      console.log(`➕ Inserting new Day ${DAY_NUMBER} (${LANGUAGE}) configuration...`);
      config.dynamicDays.push({
        ...newDayConfig,
        dayNumber: DAY_NUMBER,
        language: LANGUAGE
      });
    }

    config.dynamicDays.sort((a, b) => {
      if (a.dayNumber !== b.dayNumber) return a.dayNumber - b.dayNumber;
      return a.language.localeCompare(b.language);
    });

    config.markModified('dynamicDays');
    await config.save();

    console.log('\n✅ Day 5 content saved successfully!');
    console.log(`   • Questions added: ${TEST_QUESTIONS.length}`);
    console.log('   • Levels configured:', newDayConfig.contentByLevel.map(level => `${level.levelKey} (${level.tasks.length} tasks)`).join(', '));
    console.log('\nUse the caregiver dashboard to load Day 5 and verify tasks/test rendering.');
  } catch (error) {
    console.error('❌ Failed to seed Day 5 content:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed.');
  }
}

seedDay5Content();
