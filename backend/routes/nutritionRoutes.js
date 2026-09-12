const express = require('express');
const router = express.Router();
const {
  createNutritionRecord,
  updateNutritionRecord,
  getNutritionByMother,
  getAllNutritionRecords,
} = require('../controllers/nutritionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('moh_officer', 'midwife'), createNutritionRecord);
router.put('/:id', protect, authorize('moh_officer', 'midwife'), updateNutritionRecord);
router.get('/mother/:motherId', protect, getNutritionByMother);
router.get('/', protect, authorize('moh_officer'), getAllNutritionRecords);

module.exports = router;