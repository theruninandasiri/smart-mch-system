const mongoose = require('mongoose');

const vaccineEntrySchema = new mongoose.Schema({
  vaccineName: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  givenDate: { type: Date },
  givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  batchNumber: { type: String },
  status: {
    type: String,
    enum: ['scheduled', 'given', 'missed', 'deferred'],
    default: 'scheduled',
  },
  notes: { type: String },
}, { timestamps: true });

const vaccinationSchema = new mongoose.Schema({
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true,
  },
  vaccines: [vaccineEntrySchema],
}, { timestamps: true });

module.exports = mongoose.model('Vaccination', vaccinationSchema);