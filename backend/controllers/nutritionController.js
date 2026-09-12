const Nutrition = require('../models/Nutrition');
const Mother = require('../models/Mother');

// @desc    Create or update nutrition record for a mother (month/year)
// @route   POST /api/nutrition
const createNutritionRecord = async (req, res) => {
  try {
    const { motherId, month, year, thriposhaSent, thriposhaSentDate, thriposhaQuantity, isEligible, notes } = req.body;

    const mother = await Mother.findById(motherId);
    if (!mother) return res.status(404).json({ message: 'Mother not found' });

    // Prevent duplicate record for same mother/month/year
    const existing = await Nutrition.findOne({ mother: motherId, month, year });
    if (existing) {
      return res.status(400).json({ message: 'Record already exists for this month. Use update instead.' });
    }

    const record = await Nutrition.create({
      mother: motherId,
      month,
      year,
      thriposhaSent,
      thriposhaSentDate,
      thriposhaQuantity,
      isEligible,
      notes,
    });

    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update a nutrition record
// @route   PUT /api/nutrition/:id
const updateNutritionRecord = async (req, res) => {
  try {
    const record = await Nutrition.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    return res.json(record);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all nutrition records for a mother
// @route   GET /api/nutrition/mother/:motherId
const getNutritionByMother = async (req, res) => {
  try {
    const records = await Nutrition.find({ mother: req.params.motherId }).sort({ year: -1, month: -1 });
    return res.json(records);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get all nutrition records (for MOH overview)
// @route   GET /api/nutrition
const getAllNutritionRecords = async (req, res) => {
  try {
    const records = await Nutrition.find({}).populate('mother', 'nic mohArea midwifeArea').sort({ createdAt: -1 });
    return res.json(records);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createNutritionRecord, updateNutritionRecord, getNutritionByMother, getAllNutritionRecords };