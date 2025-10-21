import mongoose from 'mongoose';

// Schema for different daily assessments
const DailyAssessmentSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    min: 1,
    max: 7
  },
  assessmentType: {
    type: String,
    required: true,
    enum: [
      'zarit_burden',      // Day 1 - Zarit Burden Scale
      'stress_level',      // Day 2 - Stress Assessment
      'coping_strategies', // Day 3 - Coping Mechanisms
      'self_care',         // Day 4 - Self-Care Assessment
      'social_support',    // Day 5 - Social Support Network
      'emotional_wellbeing', // Day 6 - Emotional Health
      'program_evaluation' // Day 7 - Program Effectiveness
    ]
  },
  responses: {
    type: Map,
    of: mongoose.Schema.Types.Mixed // Flexible storage for different question types
  },
  totalScore: {
    type: Number,
    required: true
  },
  scoreLevel: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Enhanced Day Module Schema with daily assessments
const DayModuleSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    min: 0,
    max: 7
  },
  // Day-specific assessment (undefined for Day 0 initially)
  dailyAssessment: {
    type: DailyAssessmentSchema,
    required: false
  },
  // Content level determined by assessment score
  contentLevel: {
    type: String,
    enum: ['low', 'moderate', 'high'],
    required: false // Make optional initially
  },
  // Video and task completion
  videoCompleted: {
    type: Boolean,
    default: false
  },
  videoProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Audio completion tracking (for Day 0 sequential flow)
  audioCompleted: {
    type: Boolean,
    default: false
  },
  audioCompletedAt: {
    type: Date
  },
  tasksCompleted: {
    type: Boolean,
    default: false
  },
  taskResponses: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  // Progress tracking
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Admin permissions
  adminPermissionGranted: {
    type: Boolean,
    default: function() {
      return this.day === 0; // Day 0 is always unlocked
    }
  },
  // Timing
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
});

// Legacy Zarit Burden Schema (for Day 1)
const ZaritBurdenSchema = new mongoose.Schema({
  question1: { type: Number, min: 0, max: 4, required: true },
  question2: { type: Number, min: 0, max: 4, required: true },
  question3: { type: Number, min: 0, max: 4, required: true },
  question4: { type: Number, min: 0, max: 4, required: true },
  question5: { type: Number, min: 0, max: 4, required: true },
  question6: { type: Number, min: 0, max: 4, required: true },
  question7: { type: Number, min: 0, max: 4, required: true },
  totalScore: { type: Number, required: true },
  burdenLevel: { 
    type: String, 
    enum: ['mild', 'moderate', 'severe'], 
    required: true 
  },
  completedAt: { type: Date, default: Date.now }
});

const DailyTaskSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  responses: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  completedAt: { type: Date, default: Date.now }
});

const CaregiverProgramSchema = new mongoose.Schema({
  caregiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Caregiver', 
    required: true,
    unique: true 
  },
  // Legacy Zarit assessment (kept for compatibility)
  zaritBurdenAssessment: ZaritBurdenSchema,
  // New enhanced day modules with daily assessments
  dayModules: [DayModuleSchema],
  dailyTasks: [DailyTaskSchema],
  currentDay: { type: Number, default: 0 },
  overallProgress: { type: Number, default: 0 },
  // Overall burden level (from Day 1 Zarit assessment)
  burdenLevel: { 
    type: String, 
    enum: ['mild', 'moderate', 'severe'], 
    required: false // Make optional initially
  },
  programStartedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
  notifications: [{
    message: { type: String, required: true },
    type: { type: String, enum: ['daily', 'weekly', 'support'], required: true },
    sentAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  supportTriggered: { type: Boolean, default: false },
  consecutiveNoCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Initialize day modules for new caregiver
CaregiverProgramSchema.methods.initializeDayModules = function() {
  this.dayModules = [];
  for (let i = 0; i <= 7; i++) {
    const dayModule = {
      day: i,
      videoCompleted: false,
      videoProgress: 0,
      tasksCompleted: false,
      progressPercentage: 0,
      adminPermissionGranted: i === 0 ? true : false
      // contentLevel and dailyAssessment will be undefined initially
      // and will be set after assessment completion
    };
    this.dayModules.push(dayModule);
  }
};

// Calculate assessment score level based on day and score
CaregiverProgramSchema.methods.calculateScoreLevel = function(day, totalScore) {
  // Different scoring thresholds for different assessments
  const scoringConfig = {
    1: { low: 10, high: 20 },      // Zarit Burden (0-28 scale)
    2: { low: 8, high: 16 },       // Stress Level (0-24 scale)
    3: { low: 12, high: 24 },      // Coping Strategies (0-36 scale)
    4: { low: 10, high: 20 },      // Self-Care (0-30 scale)
    5: { low: 15, high: 30 },      // Social Support (0-45 scale)
    6: { low: 12, high: 24 },      // Emotional Wellbeing (0-36 scale)
    7: { low: 20, high: 40 }       // Program Evaluation (0-60 scale)
  };

  const thresholds = scoringConfig[day];
  if (!thresholds) return 'moderate';

  if (totalScore <= thresholds.low) return 'low';
  if (totalScore >= thresholds.high) return 'high';
  return 'moderate';
};

// Calculate Zarit Burden Level (legacy method)
CaregiverProgramSchema.methods.calculateBurdenLevel = function(responses) {
  const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
  
  let burdenLevel;
  if (totalScore <= 10) burdenLevel = 'mild';
  else if (totalScore <= 20) burdenLevel = 'moderate';
  else burdenLevel = 'severe';
  
  this.zaritBurdenAssessment = {
    ...responses,
    totalScore,
    burdenLevel
  };
  
  this.burdenLevel = burdenLevel;
  return { totalScore, burdenLevel };
};

// Calculate overall progress
CaregiverProgramSchema.methods.calculateOverallProgress = function() {
  if (this.dayModules.length === 0) return 0;
  
  const totalProgress = this.dayModules.reduce((sum, module) => {
    return sum + module.progressPercentage;
  }, 0);
  
  this.overallProgress = Math.round(totalProgress / this.dayModules.length);
  return this.overallProgress;
};

// Update day module progress
CaregiverProgramSchema.methods.updateDayProgress = function(day) {
  const dayModule = this.dayModules.find(module => module.day === day);
  if (!dayModule) return;

  let progress = 0;
  
  // Day 0 (Core module) - video (50%) + audio (50%)
  if (day === 0) {
    if (dayModule.videoCompleted) progress += 50;
    if (dayModule.audioCompleted) progress += 50;
  } else {
    // Days 1-7: Assessment (40%) + Video (40%) + Tasks (20%)
    if (dayModule.dailyAssessment) progress += 40;
    if (dayModule.videoCompleted) progress += 40;
    if (dayModule.tasksCompleted) progress += 20;
  }

  dayModule.progressPercentage = progress;
  
  // Mark as completed if 100%
  if (progress === 100 && !dayModule.completedAt) {
    dayModule.completedAt = new Date();
  }

  this.calculateOverallProgress();
};

// Check if next day should be unlocked
CaregiverProgramSchema.methods.checkDayUnlock = function() {
  for (let i = 1; i <= 7; i++) {
    const currentDay = this.dayModules.find(module => module.day === i);
    const previousDay = this.dayModules.find(module => module.day === i - 1);
    
    if (currentDay && previousDay && previousDay.progressPercentage === 100) {
      // Auto-unlock next day if previous day is completed
      if (!currentDay.adminPermissionGranted) {
        currentDay.adminPermissionGranted = true;
      }
    }
  }
};

// Unlock day (automatically or manually by admin)
CaregiverProgramSchema.methods.unlockDay = function(day, method = 'automatic') {
  const dayModule = this.dayModules.find(m => m.day === day);
  if (!dayModule) return false;
  
  const now = new Date();
  dayModule.adminPermissionGranted = true;
  dayModule.unlockedAt = now;
  
  return true;
};

const CaregiverProgram = mongoose.models.CaregiverProgram || mongoose.model('CaregiverProgram', CaregiverProgramSchema);

export default CaregiverProgram;