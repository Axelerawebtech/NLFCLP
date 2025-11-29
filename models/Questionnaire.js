import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  translations: {
    en: { type: String },
    hi: { type: String },
    kn: { type: String },
  },
  type: {
    type: String,
    enum: ['text', 'textarea', 'radio', 'checkbox', 'select', 'scale'],
    default: 'text',
  },
  options: [{
    type: String,
  }], // For radio, checkbox, select types
  optionTranslations: {
    en: [{ type: String }],
    hi: [{ type: String }],
    kn: [{ type: String }],
  },
  required: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
});

const QuestionnaireSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  questions: [QuestionSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
QuestionnaireSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Questionnaire || mongoose.model('Questionnaire', QuestionnaireSchema);