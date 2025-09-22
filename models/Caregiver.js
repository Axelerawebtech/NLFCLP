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
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  relationshipToPatient: {
    type: String,
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
