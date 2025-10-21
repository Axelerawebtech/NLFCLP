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
