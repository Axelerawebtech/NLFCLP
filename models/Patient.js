import mongoose from 'mongoose';

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
  // Questionnaire Answers
  questionnaireAnswers: {
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
