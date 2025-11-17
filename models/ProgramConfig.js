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
  
  // Day 1: Burden Test + Post-Assessment Videos
  // Admin configures burden test questions and videos for each burden level
  // After caregiver completes test, appropriate video is shown based on score
  day1: {
    burdenTestQuestions: [{
      id: { type: Number, required: true },
      questionText: {
        english: { type: String, required: true },
        kannada: { type: String },
        hindi: { type: String }
      },
      options: [{
        optionText: {
          english: { type: String, required: true },
          kannada: { type: String },
          hindi: { type: String }
        },
        score: { type: Number, required: true, default: 0 } // 0, 1, 2, or 3
      }],
      enabled: { type: Boolean, default: true }
    }],
    // Customizable score ranges for burden levels
    scoreRanges: {
      littleOrNoBurden: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 20 },
        label: {
          english: { type: String, default: 'Little or no burden' },
          kannada: { type: String, default: 'ಕಡಿಮೆ ಅಥವಾ ಯಾವುದೇ ಹೊರೆ ಇಲ್ಲ' },
          hindi: { type: String, default: 'कम या कोई बोझ नहीं' }
        },
        burdenLevel: { type: String, default: 'mild' } // Maps to video category
      },
      mildToModerate: {
        min: { type: Number, default: 21 },
        max: { type: Number, default: 40 },
        label: {
          english: { type: String, default: 'Mild to moderate burden' },
          kannada: { type: String, default: 'ಸೌಮ್ಯದಿಂದ ಮಧ್ಯಮ ಹೊರೆ' },
          hindi: { type: String, default: 'हल्के से मध्यम बोझ' }
        },
        burdenLevel: { type: String, default: 'mild' }
      },
      moderateToSevere: {
        min: { type: Number, default: 41 },
        max: { type: Number, default: 60 },
        label: {
          english: { type: String, default: 'Moderate to severe burden' },
          kannada: { type: String, default: 'ಮಧ್ಯಮದಿಂದ ತೀವ್ರ ಹೊರೆ' },
          hindi: { type: String, default: 'मध्यम से गंभीर बोझ' }
        },
        burdenLevel: { type: String, default: 'moderate' }
      },
      severe: {
        min: { type: Number, default: 61 },
        max: { type: Number, default: 88 },
        label: {
          english: { type: String, default: 'Severe burden' },
          kannada: { type: String, default: 'ತೀವ್ರ ಹೊರೆ' },
          hindi: { type: String, default: 'गंभीर बोझ' }
        },
        burdenLevel: { type: String, default: 'severe' }
      }
    },
    videos: {
      mild: {
        videoTitle: {
          english: { type: String },
          kannada: { type: String },
          hindi: { type: String }
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
      moderate: {
        videoTitle: {
          english: { type: String },
          kannada: { type: String },
          hindi: { type: String }
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
      severe: {
        videoTitle: {
          english: { type: String },
          kannada: { type: String },
          hindi: { type: String }
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
      }
    }
  },
  
  // Wait time configuration
  waitTimes: {
    day0ToDay1: { type: Number, default: 24 }, // hours
    betweenDays: { type: Number, default: 24 }, // hours between subsequent days
  },
  
  // NEW DYNAMIC DAY CONFIGURATION SYSTEM
  // Supports flexible content structure with tests and ordered tasks
  // Each day configuration is language-specific
  dynamicDays: [{
    dayNumber: { type: Number, required: true }, // 0, 1, 2, 3...
    language: { 
      type: String, 
      required: true,
      enum: ['english', 'kannada', 'hindi']
    },
    dayName: { type: String, default: '' },
    
    // Test/Assessment Configuration (optional)
    hasTest: { type: Boolean, default: false },
    testConfig: {
      type: {
        testName: { type: String },
        testType: { 
          type: String, 
          enum: ['burden-assessment', 'mood-check', 'stress-level', 'custom'],
          default: 'custom'
        },
        questions: [{
          id: { type: Number },
          questionText: { type: String },
          options: [{
            optionText: { type: String },
            score: { type: Number, default: 0 }
          }],
          enabled: { type: Boolean, default: true }
        }],
        scoreRanges: [{
          rangeName: { type: String }, // 'mild', 'moderate', 'severe' or custom
          label: { type: String },
          minScore: { type: Number },
          maxScore: { type: Number },
          levelKey: { type: String } // Used to map to content levels
        }]
      },
      default: null,
      required: false
    },
    
    // Content organized by level (if test exists) or general content (if no test)
    // If hasTest=true: content separated by levels (mild, moderate, severe)
    // If hasTest=false: only 'default' level exists
    contentByLevel: [{
      levelKey: { type: String, required: true }, // 'default', 'mild', 'moderate', 'severe', or custom
      levelLabel: { type: String },
      
      // Ordered content tasks - displayed in sequence
      tasks: [{
        taskId: { type: String, required: true },
        taskOrder: { type: Number, required: true }, // For sorting
        taskType: { 
          type: String, 
          required: true,
          enum: [
            'video',
            'motivation-message',
            'quick-assessment',
            'reminder',
            'interactive-field',
            'greeting-message',
            'activity-selector',
            'calming-video',
            'reflection-prompt',
            'feeling-check',
            'audio-message',
            'healthcare-tip',
            'task-checklist'
          ]
        },
        
        // Common fields for all task types
        title: { type: String },
        description: { type: String },
        
        // Type-specific content (flexible schema)
        content: {
          // For video tasks
          videoUrl: { type: String },
          
          // For audio tasks
          audioUrl: { type: String },
          
          // For text-based content
          textContent: { type: String },
          
          // For interactive fields
          fieldType: { type: String, enum: ['text', 'textarea', 'rating', 'mood-selector'] },
          placeholder: { type: String },
          
          // For quick assessment
          questions: [{
            questionText: { type: String },
            questionType: { type: String, enum: ['rating', 'yes-no', 'multiple-choice'] },
            options: [{
              optionText: { type: String }
            }]
          }],
          
          // For activity selector
          activities: [{
            activityName: { type: String },
            activityDescription: { type: String }
          }],
          
          // For task checklist
          checklistItems: [{
            itemText: { type: String }
          }]
        },
        
        enabled: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now }
      }]
    }],
    
    enabled: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Content Management for Caregiver Dashboard
  contentManagement: {
    motivationMessages: {
      mild: {
        english: { type: String, default: '' },
        kannada: { type: String, default: '' },
        hindi: { type: String, default: '' }
      },
      moderate: {
        english: { type: String, default: '' },
        kannada: { type: String, default: '' },
        hindi: { type: String, default: '' }
      },
      severe: {
        english: { type: String, default: '' },
        kannada: { type: String, default: '' },
        hindi: { type: String, default: '' }
      }
    },
    healthcareTips: {
      mild: {
        english: { type: String, default: '' },
        kannada: { type: String, default: '' },
        hindi: { type: String, default: '' }
      },
      moderate: {
        english: { type: String, default: '' },
        kannada: { type: String, default: '' },
        hindi: { type: String, default: '' }
      },
      severe: {
        english: { type: String, default: '' },
        kannada: { type: String, default: '' },
        hindi: { type: String, default: '' }
      }
    },
    reminders: {
      mild: {
        english: { type: String, default: '' },
        kannada: { type: String, default: '' },
        hindi: { type: String, default: '' }
      },
      moderate: {
        english: { type: String, default: '' },
        kannada: { type: String, default: '' },
        hindi: { type: String, default: '' }
      },
      severe: {
        english: { type: String, default: '' },
        kannada: { type: String, default: '' },
        hindi: { type: String, default: '' }
      }
    },
    dailyTaskTemplates: {
      mild: [{
        id: { type: String },
        taskDescription: {
          english: { type: String },
          kannada: { type: String },
          hindi: { type: String }
        },
        taskType: { type: String, enum: ['checkbox', 'text', 'reflection', 'rating', 'reminder'], default: 'checkbox' },
        category: { type: String, enum: ['daily', 'selfcare', 'monitoring', 'communication'], default: 'daily' }
      }],
      moderate: [{
        id: { type: String },
        taskDescription: {
          english: { type: String },
          kannada: { type: String },
          hindi: { type: String }
        },
        taskType: { type: String, enum: ['checkbox', 'text', 'reflection', 'rating', 'reminder'], default: 'checkbox' },
        category: { type: String, enum: ['daily', 'selfcare', 'monitoring', 'communication'], default: 'daily' }
      }],
      severe: [{
        id: { type: String },
        taskDescription: {
          english: { type: String },
          kannada: { type: String },
          hindi: { type: String }
        },
        taskType: { type: String, enum: ['checkbox', 'text', 'reflection', 'rating', 'reminder'], default: 'checkbox' },
        category: { type: String, enum: ['daily', 'selfcare', 'monitoring', 'communication'], default: 'daily' }
      }]
    },
    audioContent: {
      type: Map,
      of: {
        english: { type: String },
        kannada: { type: String },
        hindi: { type: String }
      }
    },
    quickAssessmentQuestions: [{
      id: { type: String, required: true },
      questionText: {
        english: { type: String, required: true },
        kannada: { type: String, required: true },
        hindi: { type: String, required: true }
      },
      enabled: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now }
    }]
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
