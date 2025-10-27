import mongoose from 'mongoose';

// Content schema for ordered content management
const ContentSchema = new mongoose.Schema({
  // Basic content identification
  day: {
    type: Number,
    required: true,
    min: 0,
    max: 7
  },
  orderNumber: {
    type: Number,
    required: true,
    min: 1
  },
  contentType: {
    type: String,
    required: true,
    enum: ['video', 'text', 'quiz', 'assessment', 'audio', 'task']
  },
  
  // Assessment-based categorization (for days 1+)
  category: {
    type: String,
    enum: [
      // Day 1: Burden levels
      'mild', 'moderate', 'severe',
      // Day 2: Stress levels  
      'low', 'high',
      // Day 3: WHOQOL-BREF domains
      'physical', 'psychological', 'social', 'environment',
      // Day 4: Care types
      'wound-care', 'drain-care', 'stoma-care', 'feeding-tube', 
      'urinary-catheter', 'oral-anticancer', 'bedbound-patient',
      // Day 0 and general content
      'all'
    ],
    default: 'all'
  },
  
  // Multi-language content
  title: {
    english: { type: String, required: true },
    kannada: { type: String },
    hindi: { type: String }
  },
  description: {
    english: { type: String },
    kannada: { type: String },
    hindi: { type: String }
  },
  
  // Content URLs/data based on type
  content: {
    // For video content
    videoUrl: {
      english: { type: String },
      kannada: { type: String },
      hindi: { type: String }
    },
    // For audio content
    audioUrl: {
      english: { type: String },
      kannada: { type: String },
      hindi: { type: String }
    },
    // For text content
    textContent: {
      english: { type: String },
      kannada: { type: String },
      hindi: { type: String }
    },
    // For quiz/assessment content
    questions: [{
      id: { type: String },
      questionText: {
        english: { type: String },
        kannada: { type: String },
        hindi: { type: String }
      },
      questionType: {
        type: String,
        enum: ['multiple-choice', 'yes-no', 'rating', 'text-input'],
        default: 'yes-no'
      },
      options: [{
        optionText: {
          english: { type: String },
          kannada: { type: String },
          hindi: { type: String }
        },
        score: { type: Number, default: 0 }
      }],
      enabled: { type: Boolean, default: true }
    }],
    // For task content
    tasks: [{
      taskId: { type: String },
      taskDescription: {
        english: { type: String },
        kannada: { type: String },
        hindi: { type: String }
      },
      taskType: {
        type: String,
        enum: ['checkbox', 'text', 'reflection', 'rating', 'reminder'],
        default: 'checkbox'
      }
    }]
  },
  
  // Completion requirements
  completionCriteria: {
    type: String,
    enum: ['view', 'interact', 'complete-assessment', 'complete-tasks'],
    default: 'view'
  },
  
  // Unlock conditions
  requiresPreviousCompletion: {
    type: Boolean,
    default: true
  },
  
  // Admin configuration
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  // Metadata
  estimatedDuration: { // in minutes
    type: Number,
    default: 5
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
ContentSchema.index({ day: 1, category: 1, orderNumber: 1 });
ContentSchema.index({ day: 1, orderNumber: 1 });
ContentSchema.index({ contentType: 1, day: 1 });

// Ensure unique ordering within day and category
ContentSchema.index(
  { day: 1, category: 1, orderNumber: 1 }, 
  { unique: true }
);

// Virtual for checking if content has video
ContentSchema.virtual('hasVideo').get(function() {
  return !!(this.content?.videoUrl?.english || 
           this.content?.videoUrl?.kannada || 
           this.content?.videoUrl?.hindi);
});

// Virtual for checking if content has audio
ContentSchema.virtual('hasAudio').get(function() {
  return !!(this.content?.audioUrl?.english || 
           this.content?.audioUrl?.kannada || 
           this.content?.audioUrl?.hindi);
});

// Method to get localized content
ContentSchema.methods.getLocalizedContent = function(language = 'english') {
  const langMap = { en: 'english', kn: 'kannada', hi: 'hindi' };
  const lang = langMap[language] || language;
  
  return {
    title: this.title[lang] || this.title.english,
    description: this.description[lang] || this.description.english,
    videoUrl: this.content?.videoUrl?.[lang] || this.content?.videoUrl?.english,
    audioUrl: this.content?.audioUrl?.[lang] || this.content?.audioUrl?.english,
    textContent: this.content?.textContent?.[lang] || this.content?.textContent?.english,
    questions: this.content?.questions?.map(q => ({
      ...q,
      questionText: q.questionText[lang] || q.questionText.english,
      options: q.options?.map(opt => ({
        ...opt,
        optionText: opt.optionText[lang] || opt.optionText.english
      }))
    })),
    tasks: this.content?.tasks?.map(t => ({
      ...t,
      taskDescription: t.taskDescription[lang] || t.taskDescription.english
    }))
  };
};

// Static method to get ordered content for a day
ContentSchema.statics.getOrderedContentForDay = async function(day, category = 'all', language = 'english') {
  const contents = await this.find({
    day: day,
    $or: [
      { category: category },
      { category: 'all' }
    ],
    isActive: true
  }).sort({ orderNumber: 1 });
  
  return contents.map(content => ({
    _id: content._id,
    day: content.day,
    orderNumber: content.orderNumber,
    contentType: content.contentType,
    category: content.category,
    completionCriteria: content.completionCriteria,
    requiresPreviousCompletion: content.requiresPreviousCompletion,
    estimatedDuration: content.estimatedDuration,
    difficulty: content.difficulty,
    ...content.getLocalizedContent(language)
  }));
};

const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema);

export default Content;