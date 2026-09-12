const mongoose = require('mongoose');

const growthRecordSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  ageInMonths: { type: Number, required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  headCircumference: { type: Number },
  notes: { type: String },
}, { _id: false });

const clinicVisitSchema = new mongoose.Schema({
  visitDate: { type: Date, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  weight: { type: Number },
  height: { type: Number },
  notes: { type: String },
  nextVisitDate: { type: Date },
}, { _id: true, timestamps: true });

const childSchema = new mongoose.Schema({
  childId: {
    type: String,
    unique: true,
  },
  mother: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mother',
    required: true,
  },
  motherNic: {
    type: String,
  },
  childNumber: {
    type: Number,
    default: 1,
  },
  name: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
  birthWeight: {
    type: Number,
    required: true,
  },
  birthHeight: {
    type: Number,
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  },
  multipleBirthType: {
    type: String,
    enum: ['single', 'twin', 'triplet', 'multiple'],
    default: 'single',
  },
  birthOrder: {
    type: Number,
    default: 1,
  },
  multipleBirthGroupId: {
    type: String,
    default: null,
    index: true,
  },
  tempLabel: {
    type: String,
    trim: true,
  },
  growthRecords: [growthRecordSchema],
  clinicVisits: [clinicVisitSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });


// Auto-generate unique childId before saving
childSchema.pre('save', async function() {
  const doc = this;

  // Skip if not a new document
  if (!doc.isNew) {
    return;
  }

  // Skip if childId already exists
  if (doc.childId) {
    return;
  }

  const count = await mongoose.model('Child').countDocuments({
    mother: doc.mother
  });

  doc.childNumber = count + 1;

  doc.childId =
    `CHD-${doc.motherNic || 'UNK'}-${doc.childNumber}-${Date.now()}`;
});


// Virtual: friendly display name
childSchema.virtual('displayName').get(function() {
  if (this.name) return this.name;
  if (this.tempLabel) return this.tempLabel;
  if (this.multipleBirthType !== 'single') return `Baby ${this.birthOrder}`;
  return `Child ${this.childNumber}`;
});

childSchema.set('toJSON', { virtuals: true });
childSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Child', childSchema);