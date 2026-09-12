const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  mother: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mother',
    required: true,
  },
  month: {
    type: Number,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  thriposhaSent: {
    type: Boolean,
    default: false,
  },
  thriposhaSentDate: {
    type: Date,
  },
  thriposhaQuantity: {
    type: Number,
    default: 0,
  },
  isEligible: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Nutrition', nutritionSchema);