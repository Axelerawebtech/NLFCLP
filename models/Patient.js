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
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  cancerType: {
    type: String,
    required: true,
  },
  stage: {
    type: String,
    required: true,
  },
  treatmentStatus: {
    type: String,
    required: true,
  },
  diagnosisDate: {
    type: Date,
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
