const mongoose = require('mongoose');

const motherSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // 1. Personal & Contact Information
  fullName: { type: String },
  nic: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date, required: true },
  phone: { type: String },
  email: { type: String },
  address: { type: String, required: true },
  ethnicity: { type: String },
  preferredLanguage: { type: String },
  emergencyContactName: { type: String },
  emergencyContactRelationship: { type: String },
  emergencyContactPhone: { type: String },

  // 2. Current Pregnancy Details
  lmpDate: { type: Date },
  edd: { type: Date },
  conceptionType: { type: String, enum: ['natural', 'ivf', 'other'], default: 'natural' },
  currentSymptoms: { type: String },

  // 3. Obstetric History
  pregnancyNumber: { type: Number, default: 1 },
  previousMiscarriages: { type: Number, default: 0 },
  previousTerminations: { type: Number, default: 0 },
  previousEctopic: { type: Number, default: 0 },
  previousDeliveries: { type: Number, default: 0 },
  deliveryTypes: { type: String },
  pastComplications: { type: String },

  // 4. Medical & Surgical History
  chronicConditions: { type: String },
  surgeries: { type: String },
  currentMedications: { type: String },
  allergies: { type: String },

  // 5. Family Medical History
  familyGeneticConditions: { type: String },
  familyChronicIllnesses: { type: String },

  // 6. Mental Health
  mentalHealthHistory: { type: String },
  supportSystem: { type: String },

  // 7. Lifestyle
  smokingStatus: { type: String, enum: ['never', 'former', 'current'], default: 'never' },
  alcoholIntake: { type: String, enum: ['none', 'occasional', 'regular'], default: 'none' },
  recreationalDrugs: { type: Boolean, default: false },
  occupation: { type: String },

  // Clinic Info
  mohArea: { type: String, required: true },
  midwifeArea: { type: String, required: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },

  // System fields
  barcodeId: { type: String, unique: true },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  status: { type: String, enum: ['pregnant', 'delivered', 'postnatal'], default: 'pregnant' },

}, { timestamps: true });

module.exports = mongoose.model('Mother', motherSchema);