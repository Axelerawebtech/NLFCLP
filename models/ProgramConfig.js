import mongoose from 'mongoose';

// Global program configuration schema
const ProgramConfigSchema = new mongoose.Schema({
  configType: {
    type: String,
    enum: ['global', 'caregiver-specific'],
    default: 'global'
  },
  caregiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caregiver',
    default: null // null for global config
  },
  
  // Day 0: Introductory video (same for all users, all burden levels)
  day0IntroVideo: {
    title: {
      english: { type: String, default: 'Welcome to the Caregiver Support Program' },
      kannada: { type: String, default: 'ಕಾಳಜಿ ನೀಡುವವರ ಬೆಂಬಲ ಕಾರ್ಯಕ್ರಮಕ್ಕೆ ಸುಸ್ವಾಗತ' },
      hindi: { type: String, default: 'देखभालकर्ता सहायता कार्यक्रम में आपका स्वागत है' }
    },
    videoUrl: {
      english: { type: String },
      kannada: { type: String },
      hindi: { type: String }
    },
    description: {
      english: { type: String },
      kannada: { type: String },
      hindi: { type: String }
    }
  },
  
  // Day 1: MCQ Burden Test (no video/content, just assessment)
  // Configured separately in assessment component
  
  // Wait time configuration
  waitTimes: {
    day0ToDay1: { type: Number, default: 24 }, // hours
    betweenDays: { type: Number, default: 24 }, // hours between subsequent days
  },
  // Dynamic content rules based on burden test (Days 2-9)
  contentRules: {
    mild: {
      days: {
        type: Map,
        of: new mongoose.Schema({
          videoId: String,
          videoTitle: {
            english: String,
            kannada: String,
            hindi: String
          },
          videoUrl: {
            english: String,
            kannada: String,
            hindi: String
          },
          content: {
            english: String,
            kannada: String,
            hindi: String
          },
          tasks: [{
            taskId: String,
            taskDescription: {
              english: String,
              kannada: String,
              hindi: String
            },
            taskType: { type: String, enum: ['checkbox', 'text', 'reflection', 'problem-solving'] }
          }]
        }, { _id: false })
      }
    },
    moderate: {
      days: {
        type: Map,
        of: new mongoose.Schema({
          videoId: String,
          videoTitle: {
            english: String,
            kannada: String,
            hindi: String
          },
          videoUrl: {
            english: String,
            kannada: String,
            hindi: String
          },
          content: {
            english: String,
            kannada: String,
            hindi: String
          },
          tasks: [{
            taskId: String,
            taskDescription: {
              english: String,
              kannada: String,
              hindi: String
            },
            taskType: { type: String, enum: ['checkbox', 'text', 'reflection', 'problem-solving'] }
          }]
        }, { _id: false })
      }
    },
    severe: {
      days: {
        type: Map,
        of: new mongoose.Schema({
          videoId: String,
          videoTitle: {
            english: String,
            kannada: String,
            hindi: String
          },
          videoUrl: {
            english: String,
            kannada: String,
            hindi: String
          },
          content: {
            english: String,
            kannada: String,
            hindi: String
          },
          tasks: [{
            taskId: String,
            taskDescription: {
              english: String,
              kannada: String,
              hindi: String
            },
            taskType: { type: String, enum: ['checkbox', 'text', 'reflection', 'problem-solving'] }
          }]
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

// Ensure only one global config exists
ProgramConfigSchema.index({ configType: 1, caregiverId: 1 }, { 
  unique: true,
  partialFilterExpression: { configType: 'caregiver-specific' }
});

const ProgramConfig = mongoose.models.ProgramConfig || mongoose.model('ProgramConfig', ProgramConfigSchema);

export default ProgramConfig;
