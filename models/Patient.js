import mongoose from 'mongoose';

const QuestionnaireAnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  questionText: {
    type: String,
  },
  answer: {
    type: mongoose.Schema.Types.Mixed,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const PatientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  maritalStatus: {
    type: String,
    required: true,
  },
  educationLevel: {
    type: String,
    required: true,
  },
  employmentStatus: {
    type: String,
    required: true,
  },
  residentialArea: {
    type: String,
    required: true,
  },
  cancerType: {
    type: String,
    required: true,
  },
  cancerStage: {
    type: String,
    required: true,
  },
  treatmentModality: {
    type: [String],
    required: true,
  },
  illnessDuration: {
    type: String,
    required: true,
  },
  comorbidities: {
    type: [String],
    required: true,
  },
  healthInsurance: {
    type: String,
    required: true,
  },
  isAssigned: {
    type: Boolean,
    default: false,
  },
  assignedCaregiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Caregiver',
    default: null,
  },
  // Consent Form Status
  consentAccepted: {
    type: Boolean,
    default: true, // Since they complete registration, consent is accepted
  },
  consentAcceptedAt: {
    type: Date,
    default: Date.now,
  },
  // Questionnaire System
  questionnaireEnabled: {
    type: Boolean,
    default: false,
  },
  questionnaireAnswers: [QuestionnaireAnswerSchema],
  questionnaireAttempts: [{
    attemptNumber: {
      type: Number,
      default: 1,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    answers: [QuestionnaireAnswerSchema],
  }],
  questionnaireRetakeStatus: {
    type: String,
    enum: ['none', 'scheduled', 'open', 'completed'],
    default: 'none',
  },
  questionnaireRetakeScheduledFor: {
    type: Date,
    default: null,
  },
  questionnaireRetakeCompletedAt: {
    type: Date,
    default: null,
  },
  lastQuestionnaireSubmission: {
    type: Date,
    default: null,
  },
  // Legacy questionnaire answers (keeping for backward compatibility)
  legacyQuestionnaireAnswers: {
    type: Object,
    default: {},
  },
  postTestAvailable: {
    type: Boolean,
    default: false,
  },
  postTestCompleted: {
    type: Boolean,
    default: false,
  },
  postTestScore: {
    type: Number,
    default: null,
  },
  postTestDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
});

export default mongoose.models.Patient || mongoose.model('Patient', PatientSchema);
