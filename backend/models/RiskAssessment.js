const mongoose = require('mongoose');

const fetalHeartRateSchema = new mongoose.Schema({
  fetusNumber: {
    type: Number,
    required: true
  },
  heartRate: {
    type: Number,
    required: true
  }
}, { _id: false });

const riskAssessmentSchema = new mongoose.Schema({
  mother: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mother',
    required: true,
  },

  visitDate: {
    type: Date,
    default: Date.now,
  },

  // Vitals
  bloodPressureSystolic: {
    type: Number,
    required: true,
  },

  bloodPressureDiastolic: {
    type: Number,
    required: true,
  },

  weight: {
    type: Number,
    required: true,
  },

  hemoglobin: {
    type: Number,
    required: true,
  },

  // Original field kept for compatibility
  fetalHeartRate: {
    type: Number,
  },

  // Fetal heart rates for multiple fetuses
  fetalHeartRates: {
    type: [fetalHeartRateSchema],
    default: [],
  },

  // Edinburgh Postnatal Depression Scale
  epdsScore: {
    type: Number,
    default: 0,
  },

  // Risk flags
  isHypertension: {
    type: Boolean,
    default: false,
  },

  isAnemia: {
    type: Boolean,
    default: false,
  },

  isDepression: {
    type: Boolean,
    default: false,
  },

  // Overall risk level
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },

  notes: {
    type: String,
  },

}, { timestamps: true });

module.exports = mongoose.model('RiskAssessment', riskAssessmentSchema);