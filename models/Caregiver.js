import mongoose from 'mongoose';

const CaregiverSchema = new mongoose.Schema({
  caregiverId: {
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
  relationshipToPatient: {
    type: String,
    required: true,
  },
  hoursPerDay: {
    type: String,
    required: true,
  },
  durationOfCaregiving: {
    type: String,
    required: true,
  },
  previousExperience: {
    type: String,
    required: true,
  },
  supportSystem: {
    type: [String],
    required: true,
  },
  physicalHealth: {
    type: [String],
    required: true,
  },
  mentalHealth: {
    type: [String],
    required: true,
  },
  isAssigned: {
    type: Boolean,
    default: false,
  },
  assignedPatient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
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
  // Questionnaire Answers
  questionnaireAnswers: {
    type: Object,
    default: {},
  },
  programProgress: {
    currentDay: {
      type: Number,
      default: 1,
    },
    completedDays: [{
      day: Number,
      completedAt: Date,
      notes: String,
    }],
    isCompleted: {
      type: Boolean,
      default: false,
    },
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

export default mongoose.models.Caregiver || mongoose.model('Caregiver', CaregiverSchema);
