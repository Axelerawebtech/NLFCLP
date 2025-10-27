import mongoose from 'mongoose';

const ZaritBurdenSchema = new mongoose.Schema({
  // Old format (backward compatibility)
  question1: { type: Number, min: 0, max: 4 }, // relative asks for more help
  question2: { type: Number, min: 0, max: 4 }, // affects relationship with family
  question3: { type: Number, min: 0, max: 4 }, // relative is dependent
  question4: { type: Number, min: 0, max: 4 }, // privacy affected
  question5: { type: Number, min: 0, max: 4 }, // social life suffered
  question6: { type: Number, min: 0, max: 4 }, // relative expects only you
  question7: { type: Number, min: 0, max: 4 }, // wish to leave care to someone else
  
  // New format (array of answers)
  answers: { type: [Number], default: undefined }, // Array of 7 answers (0-4 each)
  
  totalScore: { type: Number },
  burdenLevel: { 
    type: String, 
    enum: ['mild', 'moderate', 'severe']
  },
  completedAt: { type: Date, default: Date.now }
}, { strict: false }); // Allow additional fields

const DailyTaskSchema = new mongoose.Schema({
  day: { type: Number, required: true }, // 0-7
  task1: { type: Boolean, default: null }, // "Did you take one 2-minute break today?"
  task2: { type: Boolean, default: null }, // "Did you practice deep breathing today?" or other tasks
  problemSolution: { 
    problem: { type: String },
    solution: { type: String },
    helpfulResponse: { type: Boolean, default: null } // For weekly check-in
  },
  reflectionText: { type: String }, // For severe burden reflection
  completedAt: { type: Date, default: Date.now }
});

// Content completion tracking schema
const ContentCompletionSchema = new mongoose.Schema({
  contentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Content', 
    required: true 
  },
  orderNumber: { type: Number, required: true },
  contentType: { 
    type: String, 
    enum: ['video', 'text', 'quiz', 'assessment', 'audio', 'task'],
    required: true 
  },
  
  // Completion status
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  startedAt: { type: Date },
  
  // Progress tracking (for videos, quizzes, etc.)
  progress: { type: Number, default: 0, min: 0, max: 100 },
  
  // Content-specific completion data
  completionData: {
    // For video content
    watchDuration: { type: Number }, // seconds watched
    totalDuration: { type: Number }, // total video duration
    
    // For quiz/assessment content  
    answers: [mongoose.Schema.Types.Mixed],
    score: { type: Number },
    
    // For task content
    taskResponses: [{
      taskId: String,
      response: mongoose.Schema.Types.Mixed,
      completedAt: Date
    }],
    
    // General interaction data
    interactions: [{
      action: String, // 'started', 'paused', 'resumed', 'completed'
      timestamp: { type: Date, default: Date.now },
      data: mongoose.Schema.Types.Mixed
    }]
  },
  
  // Unlock status
  isUnlocked: { type: Boolean, default: false },
  unlockedAt: { type: Date }
}, { timestamps: true });

const DayModuleSchema = new mongoose.Schema({
  day: { type: Number, required: true }, // 0-7 (7 days + day 0)
  
  // Legacy fields (keep for backward compatibility)
  videoWatched: { type: Boolean, default: false },
  videoProgress: { type: Number, default: 0 }, // percentage
  videoStartedAt: { type: Date },
  videoCompletedAt: { type: Date },
  videoId: { type: String }, // Dynamic video based on burden level
  
  // Audio completion tracking
  audioCompleted: { type: Boolean, default: false },
  audioCompletedAt: { type: Date },
  
  // Day 1 specific fields (burden test)
  burdenTestCompleted: { type: Boolean, default: false }, // For Day 1 only
  burdenLevel: { type: String, enum: ['mild', 'moderate', 'severe'], default: null }, // For Day 1 only
  burdenScore: { type: Number, default: null }, // For Day 1 only (0-28 points)
  
  // NEW: Ordered content completion tracking
  contentCompletions: [ContentCompletionSchema],
  currentContentIndex: { type: Number, default: 0 }, // Index of current unlocked content
  
  // Multi-language video support (admin uploads via Cloudinary)
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
  
  // Multi-language content (Day 2-9 content varies by burden level)
  content: {
    english: { type: String },
    kannada: { type: String },
    hindi: { type: String }
  },
  
  tasksCompleted: { type: Boolean, default: false },
  taskResponses: [{
    taskId: String,
    taskDescription: String,
    response: mongoose.Schema.Types.Mixed, // Can be Boolean, String, or Object
    completedAt: { type: Date, default: Date.now }
  }],
  completedAt: { type: Date },
  progressPercentage: { type: Number, default: 0 }, // overall module completion
  adminPermissionGranted: { type: Boolean, default: false },
  unlockedAt: { type: Date }, // When this day was unlocked
  scheduledUnlockAt: { type: Date }, // When this day should unlock based on wait time
  lastModifiedAt: { type: Date, default: Date.now }
});

const CaregiverProgramSchema = new mongoose.Schema({
  caregiverId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Caregiver', 
    required: true,
    unique: true 
  },
  zaritBurdenAssessment: ZaritBurdenSchema,
  dayModules: [DayModuleSchema],
  dailyTasks: [DailyTaskSchema],
  currentDay: { type: Number, default: 0 }, // Current active day (0-7 for 7 days + day 0)
  overallProgress: { type: Number, default: 0 }, // Overall program progress percentage
  burdenLevel: { 
    type: String, 
    enum: ['mild', 'moderate', 'severe'], 
    default: null 
  },
  burdenTestScore: { type: Number, default: null }, // Percentage score from Day 1 test
  burdenTestCompletedAt: { type: Date, default: null },
  programStartedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
  // Wait time configuration (can override global config)
  customWaitTimes: {
    day0ToDay1: { type: Number }, // hours, null means use global config
    betweenDays: { type: Number } // hours, null means use global config
  },
  // Track when each day should unlock
  dayUnlockSchedule: [{
    day: Number,
    scheduledUnlockAt: Date,
    actualUnlockedAt: Date,
    unlockMethod: { type: String, enum: ['automatic', 'manual-admin'], default: 'automatic' }
  }],
  notifications: [{
    message: { type: String, required: true },
    type: { type: String, enum: ['daily', 'weekly', 'support'], required: true },
    sentAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  supportTriggered: { type: Boolean, default: false }, // For severe burden auto-support
  consecutiveNoCount: { type: Number, default: 0 }, // Track consecutive "No" responses
  contentAssignedDynamically: { type: Boolean, default: false }, // Flag for dynamic content assignment
  adminNotes: [{ 
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    addedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Initialize day modules for new caregiver (7 days: 0-7)
CaregiverProgramSchema.methods.initializeDayModules = function() {
  this.dayModules = [];
  const now = new Date();
  
  for (let i = 0; i <= 7; i++) {
    this.dayModules.push({
      day: i,
      adminPermissionGranted: i === 0 ? true : false, // Day 0 is always available
      unlockedAt: i === 0 ? now : null,
      scheduledUnlockAt: i === 0 ? now : null
    });
  }
  
  // Initialize unlock schedule
  this.dayUnlockSchedule = [];
  this.dayUnlockSchedule.push({
    day: 0,
    scheduledUnlockAt: now,
    actualUnlockedAt: now,
    unlockMethod: 'automatic'
  });
};

// Calculate Zarit Burden Level and set up Day 1 unlock schedule
CaregiverProgramSchema.methods.calculateBurdenLevel = function(responses) {
  const totalScore = Object.values(responses).reduce((sum, score) => sum + score, 0);
  const maxScore = 7 * 4; // 7 questions, max 4 points each
  const percentage = (totalScore / maxScore) * 100;
  
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
  this.burdenTestScore = percentage;
  this.burdenTestCompletedAt = new Date();
  
  return { burdenLevel, percentage };
};

// Schedule day unlock based on wait time
CaregiverProgramSchema.methods.scheduleDayUnlock = function(day, waitTimeHours) {
  const previousDay = this.dayModules.find(m => m.day === day - 1);
  if (!previousDay) return null;
  
  const baseTime = previousDay.completedAt || previousDay.unlockedAt || new Date();
  const scheduledUnlockAt = new Date(baseTime.getTime() + waitTimeHours * 60 * 60 * 1000);
  
  const dayModule = this.dayModules.find(m => m.day === day);
  if (dayModule) {
    dayModule.scheduledUnlockAt = scheduledUnlockAt;
  }
  
  this.dayUnlockSchedule.push({
    day,
    scheduledUnlockAt,
    actualUnlockedAt: null,
    unlockMethod: 'automatic'
  });
  
  return scheduledUnlockAt;
};

// NEW: Content completion and unlocking methods

// Initialize content for a day with ordered content
CaregiverProgramSchema.methods.initializeDayContent = async function(day, orderedContent) {
  const dayModule = this.dayModules.find(m => m.day === day);
  if (!dayModule) return false;
  
  // Clear existing content completions for this day
  dayModule.contentCompletions = [];
  dayModule.currentContentIndex = 0;
  
  // Add content completion tracking for each ordered content
  orderedContent.forEach((content, index) => {
    dayModule.contentCompletions.push({
      contentId: content._id,
      orderNumber: content.orderNumber,
      contentType: content.contentType,
      isCompleted: false,
      progress: 0,
      isUnlocked: index === 0, // Only first content is unlocked initially
      unlockedAt: index === 0 ? new Date() : null,
      completionData: {
        interactions: []
      }
    });
  });
  
  return true;
};

// Mark content as completed and unlock next content
CaregiverProgramSchema.methods.completeContent = function(day, contentId, completionData = {}) {
  const dayModule = this.dayModules.find(m => m.day === day);
  if (!dayModule) return false;
  
  const contentCompletion = dayModule.contentCompletions.find(
    cc => cc.contentId.toString() === contentId.toString()
  );
  
  if (!contentCompletion) return false;
  
  // Mark as completed
  contentCompletion.isCompleted = true;
  contentCompletion.completedAt = new Date();
  contentCompletion.progress = 100;
  
  // Store completion data
  if (completionData) {
    contentCompletion.completionData = {
      ...contentCompletion.completionData,
      ...completionData
    };
  }
  
  // Add completion interaction
  contentCompletion.completionData.interactions.push({
    action: 'completed',
    timestamp: new Date(),
    data: completionData
  });
  
  // Unlock next content in sequence
  const currentIndex = dayModule.contentCompletions.findIndex(
    cc => cc.contentId.toString() === contentId.toString()
  );
  
  if (currentIndex !== -1 && currentIndex + 1 < dayModule.contentCompletions.length) {
    const nextContent = dayModule.contentCompletions[currentIndex + 1];
    if (!nextContent.isUnlocked) {
      nextContent.isUnlocked = true;
      nextContent.unlockedAt = new Date();
      dayModule.currentContentIndex = currentIndex + 1;
    }
  }
  
  // Update day module progress
  const completedCount = dayModule.contentCompletions.filter(cc => cc.isCompleted).length;
  const totalCount = dayModule.contentCompletions.length;
  
  if (totalCount > 0) {
    dayModule.progressPercentage = Math.round((completedCount / totalCount) * 100);
    
    // Mark day as completed if all content is done
    if (completedCount === totalCount) {
      dayModule.completedAt = new Date();
      
      // Update legacy fields for backward compatibility
      dayModule.videoWatched = true;
      dayModule.tasksCompleted = true;
      dayModule.videoCompletedAt = new Date();
    }
  }
  
  // Update overall program progress
  this.updateOverallProgress();
  this.lastActiveAt = new Date();
  
  return true;
};

// Update content progress (for videos, quizzes, etc.)
CaregiverProgramSchema.methods.updateContentProgress = function(day, contentId, progress, progressData = {}) {
  const dayModule = this.dayModules.find(m => m.day === day);
  if (!dayModule) return false;
  
  const contentCompletion = dayModule.contentCompletions.find(
    cc => cc.contentId.toString() === contentId.toString()
  );
  
  if (!contentCompletion) return false;
  
  contentCompletion.progress = Math.min(100, Math.max(0, progress));
  
  // Store progress data
  if (progressData) {
    contentCompletion.completionData = {
      ...contentCompletion.completionData,
      ...progressData
    };
  }
  
  // Add progress interaction
  contentCompletion.completionData.interactions.push({
    action: 'progress',
    timestamp: new Date(),
    data: { progress, ...progressData }
  });
  
  // Auto-complete if progress reaches 100%
  if (progress >= 100 && !contentCompletion.isCompleted) {
    return this.completeContent(day, contentId, progressData);
  }
  
  this.lastActiveAt = new Date();
  return true;
};

// Get next unlocked content for a day
CaregiverProgramSchema.methods.getNextUnlockedContent = function(day) {
  const dayModule = this.dayModules.find(m => m.day === day);
  if (!dayModule) return null;
  
  return dayModule.contentCompletions.find(cc => cc.isUnlocked && !cc.isCompleted);
};

// Get all unlocked content for a day (in order)
CaregiverProgramSchema.methods.getUnlockedContent = function(day) {
  const dayModule = this.dayModules.find(m => m.day === day);
  if (!dayModule) return [];
  
  return dayModule.contentCompletions
    .filter(cc => cc.isUnlocked)
    .sort((a, b) => a.orderNumber - b.orderNumber);
};

// Check if specific content is unlocked
CaregiverProgramSchema.methods.isContentUnlocked = function(day, contentId) {
  const dayModule = this.dayModules.find(m => m.day === day);
  if (!dayModule) return false;
  
  const contentCompletion = dayModule.contentCompletions.find(
    cc => cc.contentId.toString() === contentId.toString()
  );
  
  return contentCompletion ? contentCompletion.isUnlocked : false;
};

// Update overall progress calculation
CaregiverProgramSchema.methods.updateOverallProgress = function() {
  const totalDays = this.dayModules.length;
  if (totalDays === 0) {
    this.overallProgress = 0;
    return;
  }
  
  const totalProgress = this.dayModules.reduce((sum, day) => sum + (day.progressPercentage || 0), 0);
  this.overallProgress = Math.round(totalProgress / totalDays);
};

// Unlock day (automatically or manually by admin)
CaregiverProgramSchema.methods.unlockDay = function(day, method = 'automatic') {
  const dayModule = this.dayModules.find(m => m.day === day);
  if (!dayModule) return false;
  
  const now = new Date();
  dayModule.adminPermissionGranted = true;
  dayModule.unlockedAt = now;
  
  const scheduleEntry = this.dayUnlockSchedule.find(s => s.day === day);
  if (scheduleEntry) {
    scheduleEntry.actualUnlockedAt = now;
    scheduleEntry.unlockMethod = method;
  } else {
    this.dayUnlockSchedule.push({
      day,
      scheduledUnlockAt: now,
      actualUnlockedAt: now,
      unlockMethod: method
    });
  }
  
  return true;
};

// Assign dynamic content to days 2-9 based on burden level
CaregiverProgramSchema.methods.assignDynamicContent = async function(programConfig) {
  if (!this.burdenLevel || this.contentAssignedDynamically) {
    return false;
  }
  
  const contentRules = programConfig.contentRules[this.burdenLevel];
  if (!contentRules || !contentRules.days) {
    return false;
  }
  
  // Assign content for days 2-7
  for (let day = 2; day <= 7; day++) {
    const dayContent = contentRules.days.get(String(day));
    const dayModule = this.dayModules.find(m => m.day === day);
    
    if (dayContent && dayModule) {
      dayModule.videoId = dayContent.videoId;
      dayModule.videoTitle = dayContent.videoTitle;
      dayModule.videoUrl = dayContent.videoUrl;
    }
  }
  
  this.contentAssignedDynamically = true;
  return true;
};

// Grant permission for next day
CaregiverProgramSchema.methods.grantDayPermission = function(day) {
  const dayModule = this.dayModules.find(module => module.day === day);
  if (dayModule) {
    dayModule.adminPermissionGranted = true;
  }
};

// Complete day module
CaregiverProgramSchema.methods.completeDayModule = function(day) {
  const dayModule = this.dayModules.find(module => module.day === day);
  if (dayModule) {
    dayModule.videoWatched = true;
    dayModule.tasksCompleted = true;
    dayModule.completedAt = new Date();
    dayModule.progressPercentage = 100;
    
    // Update overall progress (7 days total: 0-7)
    const completedModules = this.dayModules.filter(module => module.progressPercentage === 100).length;
    this.overallProgress = (completedModules / 8) * 100;
    
    this.lastActiveAt = new Date();
  }
};

// Add daily task response
CaregiverProgramSchema.methods.addDailyTaskResponse = function(day, taskData) {
  this.dailyTasks.push({
    day,
    ...taskData
  });
  
  // Check for consecutive "No" responses for severe burden
  if (this.burdenLevel === 'severe' && taskData.task1 === false && taskData.task2 === false) {
    this.consecutiveNoCount += 1;
    if (this.consecutiveNoCount >= 3 && !this.supportTriggered) {
      this.triggerSupportMessage();
    }
  } else {
    this.consecutiveNoCount = 0; // Reset if any "Yes" response
  }
  
  this.lastActiveAt = new Date();
};

// Trigger support message for severe burden
CaregiverProgramSchema.methods.triggerSupportMessage = function() {
  this.supportTriggered = true;
  this.notifications.push({
    message: "It seems you are having a difficult week. Please call your nurse or Tele-MANAS (14416) for support.",
    type: 'support'
  });
};

const CaregiverProgram = mongoose.models.CaregiverProgram || mongoose.model('CaregiverProgram', CaregiverProgramSchema);

export default CaregiverProgram;