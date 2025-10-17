const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const ProgramConfigSchema = new mongoose.Schema({
  configType: {
    type: String,
    enum: ['global', 'caregiver-specific'],
    default: 'global'
  },
  caregiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caregiver',
    default: null
  },
  waitTimes: {
    day0ToDay1: { type: Number, default: 24 },
    betweenDays: { type: Number, default: 24 }
  },
  contentRules: {
    mild: {
      days: {
        type: Map,
        of: new mongoose.Schema({
          videoId: String,
          videoTitle: String,
          videoUrl: String,
          tasks: [{
            taskId: String,
            taskDescription: String,
            taskType: { type: String, enum: ['checkbox', 'text', 'reflection', 'problem-solving'] }
          }],
          additionalContent: String
        }, { _id: false })
      }
    },
    moderate: {
      days: {
        type: Map,
        of: new mongoose.Schema({
          videoId: String,
          videoTitle: String,
          videoUrl: String,
          tasks: [{
            taskId: String,
            taskDescription: String,
            taskType: { type: String, enum: ['checkbox', 'text', 'reflection', 'problem-solving'] }
          }],
          additionalContent: String
        }, { _id: false })
      }
    },
    severe: {
      days: {
        type: Map,
        of: new mongoose.Schema({
          videoId: String,
          videoTitle: String,
          videoUrl: String,
          tasks: [{
            taskId: String,
            taskDescription: String,
            taskType: { type: String, enum: ['checkbox', 'text', 'reflection', 'problem-solving'] }
          }],
          additionalContent: String
        }, { _id: false })
      }
    }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const ProgramConfig = mongoose.models.ProgramConfig || mongoose.model('ProgramConfig', ProgramConfigSchema);

async function initializeDefaultConfig() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if global config already exists
    const existingConfig = await ProgramConfig.findOne({ configType: 'global' });
    
    if (existingConfig) {
      console.log('Global configuration already exists');
      return;
    }

    // Create default configuration
    const defaultConfig = {
      configType: 'global',
      waitTimes: {
        day0ToDay1: 24,
        betweenDays: 24
      },
      contentRules: {
        mild: {
          days: new Map([
            ['2', {
              videoId: 'mild_day2',
              videoTitle: 'Basic Self-Care Strategies',
              videoUrl: 'https://example.com/videos/mild_day2',
              tasks: [
                {
                  taskId: 'task_1',
                  taskDescription: 'Did you take at least one 10-minute break today?',
                  taskType: 'checkbox'
                },
                {
                  taskId: 'task_2',
                  taskDescription: 'Practice one relaxation technique',
                  taskType: 'checkbox'
                }
              ]
            }],
            ['3', {
              videoId: 'mild_day3',
              videoTitle: 'Maintaining Healthy Routines',
              videoUrl: 'https://example.com/videos/mild_day3',
              tasks: []
            }]
          ])
        },
        moderate: {
          days: new Map([
            ['2', {
              videoId: 'moderate_day2',
              videoTitle: 'Managing Stress and Emotions',
              videoUrl: 'https://example.com/videos/moderate_day2',
              tasks: [
                {
                  taskId: 'task_1',
                  taskDescription: 'Identify one stressor and write down a coping strategy',
                  taskType: 'text'
                }
              ]
            }]
          ])
        },
        severe: {
          days: new Map([
            ['2', {
              videoId: 'severe_day2',
              videoTitle: 'Intensive Support and Resources',
              videoUrl: 'https://example.com/videos/severe_day2',
              tasks: [
                {
                  taskId: 'task_1',
                  taskDescription: 'Reflect on your feelings today',
                  taskType: 'reflection'
                }
              ]
            }]
          ])
        }
      }
    };

    await ProgramConfig.create(defaultConfig);
    console.log('✅ Default global configuration created successfully');

  } catch (error) {
    console.error('Error initializing configuration:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

initializeDefaultConfig();
