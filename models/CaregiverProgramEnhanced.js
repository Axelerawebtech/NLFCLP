import mongoose from 'mongoose';

// Schema for different daily assessments
const DailyAssessmentSchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true,
    min: 1, // Day 0 quick assessments are stored separately
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
    enum: ['low', 'moderate', 'high', 'mild', 'severe'], // Support both legacy and new formats
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

// Legacy Zarit Burden Schema (for Day 1) - made optional for backwards compatibility
const ZaritBurdenSchema = new mongoose.Schema({
  question1: { type: Number, min: 0, max: 4, required: false },
  question2: { type: Number, min: 0, max: 4, required: false },
  question3: { type: Number, min: 0, max: 4, required: false },
  question4: { type: Number, min: 0, max: 4, required: false },
  question5: { type: Number, min: 0, max: 4, required: false },
  question6: { type: Number, min: 0, max: 4, required: false },
  question7: { type: Number, min: 0, max: 4, required: false },
  totalScore: { type: Number, required: false },
  burdenLevel: { 
    type: String, 
    enum: ['mild', 'moderate', 'severe', 'low', 'high'], // Support both legacy and new
    required: false 
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
  // Legacy Zarit assessment (kept for compatibility, completely optional)
  zaritBurdenAssessment: {
    type: ZaritBurdenSchema,
    required: false,
    default: undefined // Don't create this field unless explicitly set
  },
  // New enhanced day modules with daily assessments
  dayModules: [DayModuleSchema],
  dailyTasks: [DailyTaskSchema],
  currentDay: { type: Number, default: 0 },
  overallProgress: { type: Number, default: 0 },
  // Flow responses for burden-specific content interactions
  flowResponses: {
    type: Map,
    of: {
      burdenLevel: { type: String, enum: ['mild', 'moderate', 'severe'] },
      flowType: { type: String },
      responses: { type: Map, of: mongoose.Schema.Types.Mixed },
      submittedAt: { type: Date },
      consecutiveNoCount: { type: Number, default: 0 },
      adminAlerted: { type: Boolean, default: false }
    }
  },
  // Quick assessments for Day 0 (daily pre-module assessments)
  quickAssessments: [{
    day: { type: Number, required: true },
    type: { type: String, default: 'quick_assessment' },
    responses: [{
      questionId: { type: String, required: true },
      questionText: { type: String, required: true },
      responseValue: { type: mongoose.Schema.Types.Mixed },
      responseText: { type: String },
      answeredAt: { type: Date, default: Date.now }
    }],
    language: { type: String, default: 'english' },
    totalQuestions: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now }
  }],
  // One-time assessments (Zarit Burden, Stress, WHOQOL, etc.)
  oneTimeAssessments: [{
    type: { 
      type: String, 
      enum: ['zarit_burden', 'stress_burden', 'whoqol', 'practical_questions'],
      required: true 
    },
    responses: [{
      questionId: { type: String, required: true },
      questionText: { type: String, required: true },
      responseValue: { type: mongoose.Schema.Types.Mixed },
      answeredAt: { type: Date, default: Date.now }
    }],
    totalScore: { type: Number },
    scoreLevel: { 
      type: String, 
      enum: ['low', 'moderate', 'high', 'mild', 'severe'] // Support both legacy and new formats
    },
    language: { type: String, default: 'english' },
    totalQuestions: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
    // Assessment locking mechanism
    locked: { type: Boolean, default: false },
    canRetakeAssessment: { type: Boolean, default: true },
    lockedAt: { type: Date },
    lockedBy: { type: String, default: 'system' }, // 'system' or 'admin'
    retakeCount: { type: Number, default: 0 },
    maxRetakes: { type: Number, default: 1 } // Admin can configure this
  }],
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
  consecutiveNoCount: { type: Number, default: 0 },
  // Admin actions log
  adminActions: [{
    action: { 
      type: String, 
      enum: ['assessment_retake_allowed', 'day_unlocked', 'progress_reset', 'content_override'],
      required: true 
    },
    assessmentType: { type: String }, // For assessment-related actions
    day: { type: Number }, // For day-related actions
    performedBy: { type: String, required: true }, // Admin ID or username
    performedAt: { type: Date, default: Date.now },
    details: { type: String },
    oldValue: { type: mongoose.Schema.Types.Mixed },
    newValue: { type: mongoose.Schema.Types.Mixed }
  }]
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
  // Correct score ranges: 0-40 mild, 41-60 moderate, 61-88 severe
  if (totalScore <= 40) burdenLevel = 'mild';
  else if (totalScore <= 60) burdenLevel = 'moderate';
  else burdenLevel = 'severe';
  
  this.zaritBurdenAssessment = {
    ...responses,
    totalScore,
    burdenLevel
  };
  
  this.burdenLevel = burdenLevel;
  return { totalScore, burdenLevel };
};

// Lock assessment after completion
CaregiverProgramSchema.methods.lockAssessment = function(assessmentType, lockedBy = 'system') {
  const assessment = this.oneTimeAssessments.find(a => a.type === assessmentType);
  if (assessment && !assessment.locked) {
    assessment.locked = true;
    assessment.lockedAt = new Date();
    assessment.lockedBy = lockedBy;
    assessment.canRetakeAssessment = false;
    return true;
  }
  return false;
};

// Allow assessment retake (admin function)
CaregiverProgramSchema.methods.allowAssessmentRetake = function(assessmentType, adminId = null) {
  const assessment = this.oneTimeAssessments.find(a => a.type === assessmentType);
  if (assessment) {
    assessment.canRetakeAssessment = true;
    assessment.locked = false;
    assessment.lockedAt = null;
    assessment.lockedBy = null;
    assessment.retakeCount = (assessment.retakeCount || 0) + 1;
    
    // Log admin action
    if (adminId) {
      if (!this.adminActions) this.adminActions = [];
      this.adminActions.push({
        action: 'assessment_retake_allowed',
        assessmentType: assessmentType,
        performedBy: adminId,
        performedAt: new Date(),
        details: `Allowed retake of ${assessmentType} assessment (attempt #${assessment.retakeCount})`
      });
    }
    
    return true;
  }
  return false;
};

// Check if assessment can be taken/retaken
CaregiverProgramSchema.methods.canTakeAssessment = function(assessmentType) {
  const assessment = this.oneTimeAssessments.find(a => a.type === assessmentType);
  
  if (!assessment) {
    // No previous assessment, can take
    return { canTake: true, reason: 'first_time' };
  }
  
  if (assessment.locked && !assessment.canRetakeAssessment) {
    return { 
      canTake: false, 
      reason: 'locked',
      lockedAt: assessment.lockedAt,
      lockedBy: assessment.lockedBy 
    };
  }
  
  if (assessment.retakeCount >= assessment.maxRetakes && !assessment.canRetakeAssessment) {
    return { 
      canTake: false, 
      reason: 'max_retakes_reached',
      retakeCount: assessment.retakeCount,
      maxRetakes: assessment.maxRetakes 
    };
  }
  
  return { 
    canTake: true, 
    reason: assessment.canRetakeAssessment ? 'retake_allowed' : 'within_limits',
    retakeCount: assessment.retakeCount || 0 
  };
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